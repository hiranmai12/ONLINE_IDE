import { useState } from 'react';

export default function AskAI({ onSend }: { onSend: (msg: string) => void }) {
  const [msg, setMsg] = useState('');

  return (
    <div className="bg-gray-900 border border-gray-700 p-3 rounded">
      <textarea
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="Ask AI about your code..."
        className="w-full bg-gray-800 text-white p-2 rounded"
      />
      <button
        onClick={() => {
          onSend(msg);
          setMsg('');
        }}
        className="mt-2 bg-blue-600 px-3 py-1 rounded text-white"
      >
        Send
      </button>
    </div>
  );
}
