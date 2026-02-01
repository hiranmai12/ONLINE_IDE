import { useState } from 'react';
import { X, Send, Bot, User, AlertTriangle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface AISidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onAsk: (question: string) => Promise<void>;
  messages: {
    role: 'user' | 'ai';
    text: string;
    isError?: boolean;
  }[];
}

export default function AISidebar({
  isOpen,
  onClose,
  onAsk,
  messages,
}: AISidebarProps) {
  const [input, setInput] = useState('');

  if (!isOpen) return null;

  return (
    <div className="h-full flex flex-col bg-gray-900 text-white border-l border-gray-800">

      {/* HEADER */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <h2 className="font-semibold flex items-center gap-2">
          <Bot size={18} /> Ask AI
        </h2>
        <button onClick={onClose}>
          <X size={18} className="text-gray-400 hover:text-white" />
        </button>
      </div>

      {/* CHAT */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-gray-400 text-sm">
            Ask anything about your code…
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className="flex gap-2 items-start">

            {/* ICON */}
            <div className="mt-1">
              {m.role === 'user' ? (
                <User size={16} className="text-blue-400" />
              ) : m.isError ? (
                <AlertTriangle size={16} className="text-red-400" />
              ) : (
                <Bot size={16} className="text-green-400" />
              )}
            </div>

            {/* MESSAGE */}
            <div
              className={`max-w-[85%] px-4 py-3 rounded text-sm leading-relaxed ${
                m.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : m.isError
                  ? 'bg-red-900/40 text-red-300 border border-red-700'
                  : 'bg-gray-800 text-gray-200'
              }`}
            >
              {m.role === 'ai' ? (
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    code({ inline, children }) {
                      return inline ? (
                        <code className="bg-gray-700 px-1 rounded">
                          {children}
                        </code>
                      ) : (
                        <pre className="bg-black p-3 rounded overflow-x-auto">
                          <code>{children}</code>
                        </pre>
                      );
                    },
                  }}
                >
                  {m.text}
                </ReactMarkdown>
              ) : (
                m.text
              )}
            </div>
          </div>
        ))}
      </div>

      {/* INPUT */}
      <div className="border-t border-gray-800 p-3 flex gap-2">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask something about your code..."
          className="flex-1 bg-gray-800 text-white px-3 py-2 rounded border border-gray-700 focus:outline-none focus:border-blue-500"
          onKeyDown={async e => {
            if (e.key === 'Enter' && input.trim()) {
              await onAsk(input);
              setInput('');
            }
          }}
        />
        <button
          onClick={async () => {
            if (!input.trim()) return;
            await onAsk(input);
            setInput('');
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded"
        >
          <Send size={14} />
        </button>
      </div>
    </div>
  );
}
