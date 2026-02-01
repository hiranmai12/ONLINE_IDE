const express = require('express');
const router = express.Router();
const File = require('../models/File');
const Workspace = require('../models/Workspace');

router.get('/', async (req, res) => {
  try {
    const { workspaceId } = req.query;
    if (!workspaceId) {
      return res.status(400).json({ error: 'Workspace ID is required' });
    }
    const files = await File.find({ workspaceId }).sort({ createdAt: 1 });
    res.json(files);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, language, workspaceId } = req.body;

    if (!name || !language || !workspaceId) {
      return res.status(400).json({ error: 'Name, language, and workspaceId are required' });
    }

    const file = new File({
      name,
      language,
      workspaceId,
      content: getDefaultContent(language),
    });

    await file.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { name, content, language } = req.body;
    const updateData = {};

    if (name !== undefined) updateData.name = name;
    if (content !== undefined) updateData.content = content;
    if (language !== undefined) updateData.language = language;

    const file = await File.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }

    res.json(file);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const file = await File.findByIdAndDelete(req.params.id);
    if (!file) {
      return res.status(404).json({ error: 'File not found' });
    }
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
