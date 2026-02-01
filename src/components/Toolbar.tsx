import { Play, Moon, Sun } from 'lucide-react';

interface ToolbarProps {
  onRun: () => void;
  onAskAI: () => void;
  onThemeToggle: () => void;
  theme: 'vs-dark' | 'light';
  isRunning: boolean;
  language: string | null;
}

export default function Toolbar({
  onRun,
  onAskAI,
  onThemeToggle,
  theme,
  isRunning,
  language,
}: ToolbarProps) {

  const getLanguageLabel = (lang?: string | null) => {
    switch (lang) {
      case 'javascript': return 'JavaScript';
      case 'python': return 'Python';
      case 'java': return 'Java';
      case 'c': return 'C';
      case 'cpp': return 'C++';
      default: return 'Plain File';
    }
  };

  return (
    <div className="h-12 bg-gray-800 border-b border-gray-700 flex items-center justify-between px-4">

      {/* LEFT */}
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold text-white">Online IDE</h1>
        {language && (
          <div className="text-sm text-gray-400">
            Current: {getLanguageLabel(language)}
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-2">

        {/* RUN */}
        <button
          onClick={onRun}
          disabled={isRunning}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm transition-colors ${
            isRunning
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <Play size={14} />
          {isRunning ? 'Running...' : 'Run'}
        </button>

        {/* ASK AI */}
        <button
          onClick={onAskAI}
          className="flex items-center gap-2 px-3 py-1.5 rounded text-sm bg-blue-600 hover:bg-blue-700 text-white"
        >
          Ask AI
        </button>

        {/* THEME */}
        <button
          onClick={onThemeToggle}
          className="p-2 hover:bg-gray-700 rounded text-gray-300 hover:text-white transition-colors"
          title="Toggle theme"
        >
          {theme === 'vs-dark' ? <Sun size={16} /> : <Moon size={16} />}
        </button>

      </div>
    </div>
  );
}
