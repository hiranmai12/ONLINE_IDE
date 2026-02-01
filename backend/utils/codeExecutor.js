const { VM } = require('vm2');
const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const os = require('os');

// Use OS temp dir instead of hardcoded /tmp (works on Windows, Linux, Mac)
const BASE_TMP_DIR = path.join(os.tmpdir(), 'cloud_ide');

async function ensureDir(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
  } catch (e) {
    // ignore if already exists
  }
}

/**
 * JavaScript execution using vm2 sandbox
 */
async function executeJavaScript(code) {
  try {
    const vm = new VM({
      timeout: 1000,
      sandbox: {}
    });

    const sandboxedCode = `
      const __output__ = [];
      const console = {
        log: (...args) => {
          __output__.push(
            args.map(arg =>
              typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
            ).join(' ')
          );
        }
      };
      ${code}
      __output__.join('\\n');
    `;

    const output = vm.run(sandboxedCode);
    return { success: true, output: output || 'Code executed successfully' };
  } catch (error) {
    return { success: false, output: error.message };
  }
}

/**
 * Python execution
 */
async function executePython(code) {
  const tempDir = path.join(BASE_TMP_DIR, 'python');
  await ensureDir(tempDir);

  const tempFile = path.join(tempDir, `code_${Date.now()}.py`);

  try {
    await fs.writeFile(tempFile, code);

    return new Promise((resolve) => {
      // If your system uses "python3", change python -> python3
      exec(`python "${tempFile}"`, { timeout: 5000 }, async (error, stdout, stderr) => {
        await fs.unlink(tempFile).catch(() => {});

        if (error) {
          if (error.killed) {
            resolve({ success: false, output: 'Execution timeout (5 seconds limit)' });
          } else {
            resolve({ success: false, output: stderr || error.message });
          }
        } else {
          resolve({ success: true, output: stdout || 'Code executed successfully' });
        }
      });
    });
  } catch (error) {
    await fs.unlink(tempFile).catch(() => {});
    return { success: false, output: error.message };
  }
}

/**
 * Java execution
 */
async function executeJava(code) {
  const className = extractJavaClassName(code);
  if (!className) {
    return {
      success: false,
      output: 'Error: Could not find public class name. Make sure your code contains a public class.'
    };
  }

  const packageName = extractJavaPackageName(code); // may be null
  const tempDir = path.join(
    BASE_TMP_DIR,
    `java_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );

  const javaFile = path.join(tempDir, `${className}.java`);

  try {
    await ensureDir(tempDir);
    await fs.writeFile(javaFile, code);

    // 1) Compile
    const compileResult = await new Promise((resolve) => {
      // cwd = tempDir, so we can just use the file name
      exec(`javac "${className}.java"`, { timeout: 5000, cwd: tempDir }, async (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, output: stderr || error.message });
        } else {
          resolve({ success: true });
        }
      });
    });

    if (!compileResult.success) {
      await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
      return compileResult;
    }

    // 2) Build the run target: either "Main" or "mypkg.Main"
    const runTarget = packageName ? `${packageName}.${className}` : className;

    // 3) Run with explicit classpath "."
    return new Promise((resolve) => {
      exec(
        `java -cp . ${runTarget}`,
        { timeout: 5000, cwd: tempDir },
        async (error, stdout, stderr) => {
          await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});

          if (error) {
            if (error.killed) {
              resolve({ success: false, output: 'Execution timeout (5 seconds limit)' });
            } else {
              resolve({ success: false, output: stderr || error.message });
            }
          } else {
            resolve({ success: true, output: stdout || 'Code executed successfully' });
          }
        }
      );
    });
  } catch (error) {
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    return { success: false, output: error.message };
  }
}

/**
 * C execution
 */
async function executeC(code) {
  const tempDir = path.join(BASE_TMP_DIR, 'c');
  await ensureDir(tempDir);

  const baseName = `main_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const cFileName = `${baseName}.c`;
  const exeName = baseName;
  const cFile = path.join(tempDir, cFileName);
  const exeFile = path.join(tempDir, exeName);

  try {
    await fs.writeFile(cFile, code);

    // 1) Compile: gcc main.c -o main
    const compileCmd = `gcc "${cFileName}" -o "${exeName}"`;
    const compileResult = await new Promise((resolve) => {
      exec(compileCmd, { timeout: 5000, cwd: tempDir }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, output: stderr || error.message });
        } else {
          resolve({ success: true });
        }
      });
    });

    if (!compileResult.success) {
      return compileResult;
    }

    // 2) Run
    const runCmd =
      process.platform === 'win32'
        ? `"${exeName}.exe"`
        : `"./${exeName}"`;

    return new Promise((resolve) => {
      exec(runCmd, { timeout: 5000, cwd: tempDir }, async (error, stdout, stderr) => {
        await fs.unlink(cFile).catch(() => {});
        await fs
          .unlink(process.platform === 'win32' ? path.join(tempDir, `${exeName}.exe`) : exeFile)
          .catch(() => {});

        if (error) {
          if (error.killed) {
            resolve({ success: false, output: 'Execution timeout (5 seconds limit)' });
          } else {
            resolve({ success: false, output: stderr || error.message });
          }
        } else {
          resolve({ success: true, output: stdout || 'Code executed successfully' });
        }
      });
    });
  } catch (error) {
    return { success: false, output: error.message };
  }
}

/**
 * C++ execution
 */
async function executeCpp(code) {
  const tempDir = path.join(BASE_TMP_DIR, 'cpp');
  await ensureDir(tempDir);

  const baseName = `main_${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const cppFileName = `${baseName}.cpp`;
  const exeName = baseName;
  const cppFile = path.join(tempDir, cppFileName);
  const exeFile = path.join(tempDir, exeName);

  try {
    await fs.writeFile(cppFile, code);

    // 1) Compile: g++ main.cpp -o main
    const compileCmd = `g++ "${cppFileName}" -o "${exeName}"`;
    const compileResult = await new Promise((resolve) => {
      exec(compileCmd, { timeout: 5000, cwd: tempDir }, (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, output: stderr || error.message });
        } else {
          resolve({ success: true });
        }
      });
    });

    if (!compileResult.success) {
      return compileResult;
    }

    // 2) Run
    const runCmd =
      process.platform === 'win32'
        ? `"${exeName}.exe"`
        : `"./${exeName}"`;

    return new Promise((resolve) => {
      exec(runCmd, { timeout: 5000, cwd: tempDir }, async (error, stdout, stderr) => {
        await fs.unlink(cppFile).catch(() => {});
        await fs
          .unlink(process.platform === 'win32' ? path.join(tempDir, `${exeName}.exe`) : exeFile)
          .catch(() => {});

        if (error) {
          if (error.killed) {
            resolve({ success: false, output: 'Execution timeout (5 seconds limit)' });
          } else {
            resolve({ success: false, output: stderr || error.message });
          }
        } else {
          resolve({ success: true, output: stdout || 'Code executed successfully' });
        }
      });
    });
  } catch (error) {
    return { success: false, output: error.message };
  }
}


/**
 * Helper to extract public class name from Java code
 */
function extractJavaClassName(code) {
  const match = code.match(/public\s+class\s+(\w+)/);
  return match ? match[1] : null;
}

/**
 * Helper to extract package name (if any)
 */
function extractJavaPackageName(code) {
  const match = code.match(/package\s+([\w.]+)\s*;/);
  return match ? match[1] : null;
}

module.exports = {
  executeJavaScript,
  executePython,
  executeJava,
  executeC,
  executeCpp,
};

