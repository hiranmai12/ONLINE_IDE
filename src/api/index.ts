import { FileType, Workspace, ExecutionResult } from '../types';

const API_URL = 'http://localhost:5000/api';

interface AIResult {
  success: boolean;
  output: string;
}

export const api = {
  /* ================= WORKSPACES ================= */
  workspaces: {
    getAll: async (): Promise<Workspace[]> => {
      const res = await fetch(`${API_URL}/workspaces`);
      return res.json();
    },

    getById: async (id: string): Promise<Workspace> => {
      const res = await fetch(`${API_URL}/workspaces/${id}`);
      return res.json();
    },

    create: async (name?: string): Promise<Workspace> => {
      const res = await fetch(`${API_URL}/workspaces`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      return res.json();
    },

    update: async (id: string, data: Partial<Workspace>): Promise<Workspace> => {
      const res = await fetch(`${API_URL}/workspaces/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },
  },

  /* ================= FILES ================= */
  files: {
    getAll: async (workspaceId: string): Promise<FileType[]> => {
      const res = await fetch(`${API_URL}/files?workspaceId=${workspaceId}`);
      return res.json();
    },

    getById: async (id: string): Promise<FileType> => {
      const res = await fetch(`${API_URL}/files/${id}`);
      return res.json();
    },

    create: async (data: {
      name: string;
      language: string;
      workspaceId: string;
    }): Promise<FileType> => {
      const res = await fetch(`${API_URL}/files`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    update: async (id: string, data: Partial<FileType>): Promise<FileType> => {
      const res = await fetch(`${API_URL}/files/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      return res.json();
    },

    delete: async (id: string): Promise<void> => {
      await fetch(`${API_URL}/files/${id}`, { method: 'DELETE' });
    },
  },

  /* ================= CODE EXECUTION ================= */
  execute: async (code: string, language: string): Promise<ExecutionResult> => {
    const res = await fetch(`${API_URL}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, language }),
    });
    return res.json();
  },

  /* ================= AI FEATURES ================= */
 ai: {
  chat: async (question: string, code: string, language: string) => {
    const res = await fetch(`${API_URL}/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, code, language }),
    });
    return res.json();
  },
},


};
