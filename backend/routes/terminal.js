// routes/terminal.js
const express = require('express');
const router = express.Router();
const { exec } = require('child_process');
const fs = require('fs').promises;
const fsSync = require('fs');
const path = require('path');
const os = require('os');

const BASE_RUN_DIR = path.join(os.tmpdir(), 'cloud_ide_runs');

// basic whitelist (first token must match)
const ALLOWED_CMDS = new Set(['python', 'python3', 'node', 'gcc', 'g++', 'java', 'javac']);

// max runtime & buffer
const EXEC_OPTIONS = { timeout: 15_000, maxBuffer: 5 * 1024 * 1024 }; // 15s, 5MB

// --- Startup checks (logs whether gcc/g++/java/python are available) ---
['gcc', 'g++', 'java', 'javac', 'python', 'node'].forEach((bin) => {
  exec(`${bin} --version`, (err, stdout, stderr) => {
    if (err) {
      console.warn(`[Startup] ${bin} not found or not in PATH: ${err.message}`);
    } else {
      const firstLine = (stdout || stderr || '').toString().split('\n')[0];
      console.log(`[Startup] ${bin} available: ${firstLine}`);
    }
  });
});

// ensure run directory exists
async function ensureRunDir(workspaceId) {
  const dir = path.join(BASE_RUN_DIR, workspaceId || 'default');
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

// simple helper: is command allowed?
function isAllowedCommand(command) {
  if (!command || typeof command !== 'string') return false;
  const parts = command.trim().split(/\s+/);
  const bin = parts[0];

  if (bin.startsWith('./')) {
    // ./exe allowed only if file is in workspace dir (we'll check later)
    return true;
  }
  return ALLOWED_CMDS.has(bin);
}

// sanitize and basic safety - do not allow shell metacharacters that are obviously dangerous
function looksUnsafe(command) {
  // very conservative: block usage of pipes, redirects to arbitrary paths, & ; rm, sudo, ssh, curl|wget to remote, etc.
  // You can expand or relax this as you understand security implications.
  const blacklist = [/;\s*/, /\|\s*/, />\s*/, /<\s*/, /\&\s*/, /\brm\b/, /\bsudo\b/, /\bssh\b/, /\bcurl\b/, /\bwget\b/];
  return blacklist.some((rx) => rx.test(command));
}

router.post('/exec', async (req, res) => {
  try {
    const { command, workspaceId } = req.body;
    if (!command || typeof command !== 'string') {
      return res.status(400).json({ success: false, output: 'Command required' });
    }

    if (looksUnsafe(command)) {
      return res.status(400).json({ success: false, output: 'Command contains disallowed tokens (pipes/redirects/rm/etc.)' });
    }

    if (!isAllowedCommand(command)) {
      return res.status(400).json({ success: false, output: 'Command not allowed' });
    }

    const cwd = await ensureRunDir(workspaceId);

    // If command uses ./exe - ensure executable exists under cwd
    const parts = command.trim().split(/\s+/);
    const bin = parts[0];
    if (bin.startsWith('./')) {
      const exePath = path.join(cwd, bin.slice(2)); // remove ./ and join
      // ensure path is inside cwd (prevent ../ trick)
      const resolved = path.resolve(exePath);
      if (!resolved.startsWith(path.resolve(cwd) + path.sep) && resolved !== path.resolve(cwd)) {
        return res.status(400).json({ success: false, output: 'Invalid executable path' });
      }
      if (!fsSync.existsSync(exePath)) {
        return res.status(400).json({ success: false, output: 'Executable not found in workspace run directory' });
      }
    }

    // Execute command in the workspace run directory
    exec(command, { cwd, ...EXEC_OPTIONS }, (err, stdout, stderr) => {
      if (err) {
        // return stderr or error message
        const out = (stderr || err.message || '').toString();
        return res.json({ success: false, output: out });
      }
      return res.json({ success: true, output: (stdout || '').toString() });
    });
  } catch (err) {
    console.error('Terminal exec error', err);
    res.status(500).json({ success: false, output: err.message || 'Server error' });
  }
});

module.exports = router;
