import { X, Terminal } from 'lucide-react';

interface OutputTerminalProps {
  output: string;
  isError: boolean;
  onClear: () => void;
}

export default function OutputTerminal({ output, isError, onClear }: OutputTerminalProps) {
  return (
    <div className="h-64 bg-gray-950 border-t border-gray-800 flex flex-col">
      <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-300 text-sm">
          <Terminal size={16} />
          <span>Output</span>
        </div>
        <button
          onClick={onClear}
          className="p-1 hover:bg-gray-800 rounded text-gray-400 hover:text-gray-200 transition-colors"
          title="Clear output"
        >
          <X size={16} />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-sm">
        {output ? (
          <pre className={`whitespace-pre-wrap ${isError ? 'text-red-400' : 'text-green-400'}`}>
            {output}
          </pre>
        ) : (
          <div className="text-gray-500 text-sm">
            Run your code to see output here...
          </div>
        )}
      </div>
    </div>
  );
}
