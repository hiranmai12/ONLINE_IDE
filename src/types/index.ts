export interface FileType {
  _id: string;
  name: string;
  language: 'javascript' | 'python' | 'java' | 'c' | 'cpp';
  content: string;
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Workspace {
  _id: string;
  name: string;
  activeFileId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
}
