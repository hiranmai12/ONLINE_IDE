import { useState, useEffect, useCallback } from 'react';
import FileExplorer from './components/FileExplorer';
import Editor from './components/Editor';
import OutputTerminal from './components/OutputTerminal';
import Toolbar from './components/Toolbar';
import Toast from './components/Toast';
import AISidebar from './components/AISidebar';
import { api } from './api';
import { FileType, Workspace } from './types';

/* ---------- CODING QUESTION CHECK ---------- */
const isCodingQuestion = (text: string) => {
  const keywords = [
    'code', 'program', 'error', 'bug', 'function', 'variable',
    'loop', 'array', 'string', 'class', 'object',
    'javascript', 'python', 'java', 'c++', 'c',
    'algorithm', 'sql', 'react', 'node'
  ];
  return keywords.some(k => text.toLowerCase().includes(k));
};

function App() {
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [files, setFiles] = useState<FileType[]>([]);
  const [activeFile, setActiveFile] = useState<FileType | null>(null);

  const [theme, setTheme] = useState<'vs-dark' | 'light'>('vs-dark');
  const [output, setOutput] = useState('');
  const [isError, setIsError] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [pendingSave, setPendingSave] = useState(false);

  const [toast, setToast] =
    useState<{ message: string; type: 'success' | 'error' } | null>(null);

  /* ---------- AI SIDEBAR ---------- */
  const [aiOpen, setAiOpen] = useState(false);
  const [aiMessages, setAiMessages] = useState<
    { role: 'user' | 'ai'; text: string }[]
  >([]);

  /* ---------- INIT ---------- */
  useEffect(() => {
    initializeWorkspace();
  }, []);

  const initializeWorkspace = async () => {
    try {
      const workspaces = await api.workspaces.getAll();
      const ws = workspaces.length
        ? workspaces[0]
        : await api.workspaces.create('My Workspace');

      setWorkspace(ws);
      await loadFiles(ws._id);
    } catch {
      showToast('Failed to initialize workspace', 'error');
    }
  };

  const loadFiles = async (workspaceId: string) => {
    const loadedFiles = await api.files.getAll(workspaceId);
    setFiles(loadedFiles);
    if (loadedFiles.length) setActiveFile(loadedFiles[0]);
  };

  /* ---------- FILE OPS ---------- */
  const handleFileSelect = (file: FileType) => setActiveFile(file);

  const handleFileCreate = async (
    name: string,
    language: 'javascript' | 'python' | 'java' | 'c' | 'cpp'
  ) => {
    if (!workspace) return;
    const newFile = await api.files.create({
      name,
      language,
      workspaceId: workspace._id,
    });
    setFiles(prev => [...prev, newFile]);
    setActiveFile(newFile);
    showToast('File created', 'success');
  };

  const handleFileRename = async (id: string, name: string) => {
    const updated = await api.files.update(id, { name });
    setFiles(files.map(f => (f._id === id ? updated : f)));
    if (activeFile?._id === id) setActiveFile(updated);
  };

  const handleFileDelete = async (id: string) => {
    await api.files.delete(id);
    const remaining = files.filter(f => f._id !== id);
    setFiles(remaining);
    if (activeFile?._id === id) setActiveFile(remaining[0] || null);
  };

  /* ---------- EDITOR ---------- */
  const handleEditorChange = useCallback(
    (value: string) => {
      if (!activeFile) return;
      setActiveFile({ ...activeFile, content: value });
      setPendingSave(true);
    },
    [activeFile]
  );

  useEffect(() => {
    if (!pendingSave || !activeFile) return;

    const timer = setTimeout(async () => {
      await api.files.update(activeFile._id, {
        content: activeFile.content,
      });
      setFiles(files.map(f => (f._id === activeFile._id ? activeFile : f)));
      setPendingSave(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, [pendingSave, activeFile, files]);

  /* ---------- RUN CODE ---------- */
  const handleRunCode = async () => {
    if (!activeFile) return;
    setIsRunning(true);
    setOutput('Running...');
    setIsError(false);

    try {
      const res = await api.execute(activeFile.content, activeFile.language);
      setOutput(res.output);
      setIsError(!res.success);
    } catch {
      setOutput('Execution failed');
      setIsError(true);
    } finally {
      setIsRunning(false);
    }
  };

  /* ---------- ASK AI ---------- */
  const handleAskAI = () => setAiOpen(true);

  const handleSendToAI = async (question: string) => {
    if (!activeFile) return;

    setAiMessages(prev => [...prev, { role: 'user', text: question }]);

    // 🚫 Non-coding question
    if (!isCodingQuestion(question)) {
      setAiMessages(prev => [
        ...prev,
        {
          role: 'ai',
          text: 'Sorry, I can only answer programming and coding-related questions.',
        },
      ]);
      return;
    }

    try {
      const res = await api.ai.chat(
        question,
        activeFile.content,
        activeFile.language
      );

      setAiMessages(prev => [...prev, { role: 'ai', text: res.output }]);
    } catch {
      setAiMessages(prev => [
        ...prev,
        { role: 'ai', text: 'AI failed to respond.' },
      ]);
    }
  };

  /* ---------- UI ---------- */
  const handleThemeToggle = () =>
    setTheme(prev => (prev === 'vs-dark' ? 'light' : 'vs-dark'));

  const handleClearOutput = () => {
    setOutput('');
    setIsError(false);
  };

  const showToast = (message: string, type: 'success' | 'error') =>
    setToast({ message, type });

  return (
    <div className="h-screen flex flex-col bg-gray-900">
      <Toolbar
        onRun={handleRunCode}
        onAskAI={handleAskAI}
        onThemeToggle={handleThemeToggle}
        theme={theme}
        isRunning={isRunning}
        language={activeFile?.language || null}
      />

      <div className="flex flex-1 overflow-hidden">
        <FileExplorer
          files={files}
          activeFileId={activeFile?._id || null}
          onFileSelect={handleFileSelect}
          onFileCreate={handleFileCreate}
          onFileRename={handleFileRename}
          onFileDelete={handleFileDelete}
        />

        {/* EDITOR */}
        <div
          className={`flex flex-col transition-all duration-300 ${
            aiOpen ? 'w-[60%]' : 'flex-1'
          }`}
        >
          <Editor file={activeFile} theme={theme} onChange={handleEditorChange} />
          <OutputTerminal
            output={output}
            isError={isError}
            onClear={handleClearOutput}
            allowInput
            onExecuteCommand={async () => {}}
          />
        </div>

        {/* AI SIDEBAR */}
        {aiOpen && (
          <div className="w-[40%] border-l border-gray-800">
            <AISidebar
              isOpen={aiOpen}
              onClose={() => setAiOpen(false)}
              onAsk={handleSendToAI}
              messages={aiMessages}
            />
          </div>
        )}
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}

export default App;
