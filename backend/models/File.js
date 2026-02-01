const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  language: {
    type: String,
    required: true,
    enum: [
      'javascript',
      'python',
      'java',
      'c',
      'cpp',     // C++
    ],
  },
  content: {
    type: String,
    default: '',
  },
  workspaceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Workspace',
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('File', fileSchema);
