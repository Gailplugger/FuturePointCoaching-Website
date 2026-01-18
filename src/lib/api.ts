import { getApiUrl } from './utils';

const apiUrl = getApiUrl();

interface ApiResponse<T = unknown> {
  success?: boolean;
  error?: string;
  errors?: string[];
  data?: T;
}

interface User {
  username: string;
  isSuperAdmin: boolean;
  avatar?: string;
}

interface LoginResponse {
  success: boolean;
  user: User;
}

interface UploadResponse {
  success: boolean;
  message: string;
  file: {
    path: string;
    sha: string;
    downloadUrl: string;
    htmlUrl: string;
  };
  commit: {
    sha: string;
    url: string;
  };
}

interface NotesFile {
  name: string;
  path: string;
  classNo: string;
  stream: string;
  subject: string;
  size: number;
  downloadUrl: string;
  htmlUrl: string;
}

interface NotesResponse {
  success: boolean;
  structure: Record<string, Record<string, Record<string, NotesFile[]>>>;
  files: NotesFile[];
  total: number;
  lastUpdated: string;
}

interface AdminsData {
  super_admins: string[];
  admins: string[];
}

interface AdminActionResponse {
  success: boolean;
  message: string;
  admins: AdminsData;
  commit: {
    sha: string;
    url: string;
  };
}

export async function adminLogin(username: string, token: string): Promise<LoginResponse> {
  const response = await fetch(`${apiUrl}/admin-login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, token }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.details || data.error || 'Login failed');
  }

  return data;
}

export async function adminLogout(): Promise<void> {
  const response = await fetch(`${apiUrl}/admin-logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Logout failed');
  }
}

export async function uploadPdf(
  fileBase64: string,
  fileName: string,
  classNo: string,
  stream: string,
  subject: string,
  commitMessage: string,
  githubToken: string
): Promise<UploadResponse> {
  const response = await fetch(`${apiUrl}/upload-pdf`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({
      fileBase64,
      fileName,
      classNo,
      stream,
      subject,
      commitMessage,
      githubToken,
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.errors?.join(', ') || 'Upload failed');
  }

  return data;
}

export async function listNotes(): Promise<NotesResponse> {
  const response = await fetch(`${apiUrl}/list-notes`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch notes');
  }

  return data;
}

export async function addAdmin(
  username: string,
  githubToken: string
): Promise<AdminActionResponse> {
  const response = await fetch(`${apiUrl}/add-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, githubToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to add admin');
  }

  return data;
}

export async function removeAdmin(
  username: string,
  githubToken: string
): Promise<AdminActionResponse> {
  const response = await fetch(`${apiUrl}/remove-admin`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ username, githubToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to remove admin');
  }

  return data;
}

export type { User, NotesFile, NotesResponse, AdminsData };
