const express = require('express');
const router = express.Router();
const Workspace = require('../models/Workspace');
const File = require('../models/File');

router.get('/', async (req, res) => {
  try {
    const workspaces = await Workspace.find().sort({ createdAt: -1 });
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }
    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, language, defaultFileName } = req.body;

    // create workspace
    const workspace = new Workspace({ name: name || 'My Workspace' });
    await workspace.save();

    const defaultLanguage = language || 'javascript';

    const fileName =
      defaultFileName && defaultFileName.trim()
        ? defaultFileName.trim()
        : getDefaultFileName(defaultLanguage);

    const defaultFile = new File({
      name: fileName,               // any name: file.c, test.cpp, hello.java, etc.
      language: defaultLanguage,
      workspaceId: workspace._id,
      content: getDefaultContent(defaultLanguage),
    });

    await defaultFile.save();

    workspace.activeFileId = defaultFile._id;
    await workspace.save();

    res.status(201).json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, activeFileId } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (activeFileId !== undefined) updateData.activeFileId = activeFileId;

    const workspace = await Workspace.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!workspace) {
      return res.status(404).json({ error: 'Workspace not found' });
    }

    res.json(workspace);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/* ---------- helpers ---------- */

function getDefaultFileName(language) {
  switch (language) {
    case 'python':
      return 'file.py';
    case 'java':
      return 'Main.java'; // Java still needs class name == file name if public
    case 'c':
      return 'file.c';
    case 'cpp':
      return 'file.cpp';
    case 'javascript':
    default:
      return 'file.js';
  }
}

function getDefaultContent(language) {
  const defaults = {
    javascript: `console.log("Hello, World!");`,
    python: `print("Hello, World!")`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}`,
    c: `#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    return 0;
}`,
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello, World!" << endl;
    return 0;
}`,
  };

  return defaults[language] || '';
}

module.exports = router;
