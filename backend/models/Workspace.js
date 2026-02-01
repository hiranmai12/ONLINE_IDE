const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'My Workspace',
  },
  activeFileId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Workspace', workspaceSchema);
