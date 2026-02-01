import { useState } from 'react';
import { FileType } from '../types';
import { FileText, Plus, Edit2, Trash2, X, Check } from 'lucide-react';

interface FileExplorerProps {
  files: FileType[];
  activeFileId: string | null;
  onFileSelect: (file: FileType) => void;
  onFileCreate: (name: string, language: 'javascript' | 'python' | 'java' | 'c' | 'cpp') => void;
  onFileRename: (id: string, newName: string) => void;
  onFileDelete: (id: string) => void;
}

export default function FileExplorer({
  files,
  activeFileId,
  onFileSelect,
  onFileCreate,
  onFileRename,
  onFileDelete,
}: FileExplorerProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFileLanguage, setNewFileLanguage] = useState<'javascript' | 'python' | 'java' | 'c' | 'cpp'>('javascript');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  const handleCreate = () => {
    if (newFileName.trim()) {
      onFileCreate(newFileName, newFileLanguage);
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const handleRename = (id: string) => {
    if (editingName.trim()) {
      onFileRename(id, editingName);
      setEditingId(null);
      setEditingName('');
    }
  };

  const startRename = (file: FileType) => {
    setEditingId(file._id);
    setEditingName(file.name);
  };

  const getFileExtension = (language: string) => {
    switch (language) {
      case 'javascript': return '.js';
      case 'python': return '.py';
      case 'java': return '.java';
      case 'c': return '.c';
      case 'cpp': return '.cpp';
      default: return '';
    }
  };

  return (
    <div className="w-64 bg-gray-900 text-gray-200 flex flex-col h-full border-r border-gray-800">
      <div className="p-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="font-semibold text-sm uppercase tracking-wide">Explorer</h2>
        <button
          onClick={() => setIsCreating(true)}
          className="p-1 hover:bg-gray-800 rounded transition-colors"
          title="New File"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto">
        {isCreating && (
          <div className="p-2 bg-gray-800 border-b border-gray-700">
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="File name"
              className="w-full px-2 py-1 mb-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-blue-500"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewFileName('');
                }
              }}
            />
            <select
              value={newFileLanguage}
              onChange={(e) => setNewFileLanguage(e.target.value as any)}
              className="w-full px-2 py-1 mb-2 bg-gray-700 text-white text-sm rounded border border-gray-600 focus:outline-none focus:border-blue-500"
            >
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
              <option value="java">Java</option>
              <option value="c">C</option>
              <option value="cpp">C++</option>
            </select>
            <div className="flex gap-2">
              <button
                onClick={handleCreate}
                className="flex-1 px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
              >
                <Check size={14} className="inline mr-1" />
                Create
              </button>
              <button
                onClick={() => {
                  setIsCreating(false);
                  setNewFileName('');
                }}
                className="flex-1 px-2 py-1 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
              >
                <X size={14} className="inline mr-1" />
                Cancel
              </button>
            </div>
          </div>
        )}

        <div className="p-2">
          {files.map((file) => (
            <div
              key={file._id}
              className={`group flex items-center gap-2 px-2 py-1.5 rounded cursor-pointer transition-colors ${
                activeFileId === file._id ? 'bg-gray-700' : 'hover:bg-gray-800'
              }`}
            >
              {editingId === file._id ? (
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  className="flex-1 px-1 py-0.5 bg-gray-700 text-white text-sm rounded border border-blue-500 focus:outline-none"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(file._id);
                    if (e.key === 'Escape') {
                      setEditingId(null);
                      setEditingName('');
                    }
                  }}
                  onBlur={() => handleRename(file._id)}
                />
              ) : (
                <>
                  <FileText size={16} className="flex-shrink-0 text-blue-400" />
                  <span
                    onClick={() => onFileSelect(file)}
                    className="flex-1 text-sm truncate"
                  >
                    {file.name}{getFileExtension(file.language)}
                  </span>
                  <div className="hidden group-hover:flex gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startRename(file);
                      }}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                      title="Rename"
                    >
                      <Edit2 size={12} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete ${file.name}?`)) {
                          onFileDelete(file._id);
                        }
                      }}
                      className="p-1 hover:bg-red-600 rounded transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
