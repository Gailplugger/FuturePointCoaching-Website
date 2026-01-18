import { getApiUrl } from './utils';

const apiUrl = getApiUrl();
const GH_USER = process.env.NEXT_PUBLIC_GH_USER || 'Gailplugger';
const GH_REPO = process.env.NEXT_PUBLIC_GH_REPO || 'FuturePointCoaching-Website';

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
  sha: string;
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
  // Sanitize filename and subject
  const sanitize = (str: string) => str.replace(/[^a-zA-Z0-9._-]/g, '_').replace(/__+/g, '_').toLowerCase();
  const sanitizedSubject = sanitize(subject);
  const sanitizedFileName = sanitize(fileName);
  const filePath = `notes/class-${classNo}/${stream.toLowerCase()}/${sanitizedSubject}/${sanitizedFileName}`;

  // Check if file exists (to get SHA for update)
  let existingSha: string | undefined;
  try {
    const existingResponse = await fetch(
      `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${filePath}`,
      {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: 'application/vnd.github.v3+json',
          'User-Agent': 'FuturePointCoaching-Admin',
        },
      }
    );
    if (existingResponse.ok) {
      const existingFile = await existingResponse.json();
      existingSha = existingFile.sha;
    }
  } catch {
    // File doesn't exist, that's fine
  }

  // Upload directly to GitHub
  const payload: Record<string, string> = {
    message: commitMessage || `Upload ${fileName}`,
    content: fileBase64,
    branch: 'main',
  };
  if (existingSha) {
    payload.sha = existingSha;
  }

  const uploadResponse = await fetch(
    `https://api.github.com/repos/${GH_USER}/${GH_REPO}/contents/${filePath}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'User-Agent': 'FuturePointCoaching-Admin',
      },
      body: JSON.stringify(payload),
    }
  );

  if (!uploadResponse.ok) {
    const errorData = await uploadResponse.json();
    throw new Error(errorData.message || 'Failed to upload file to GitHub');
  }

  const result = await uploadResponse.json();

  return {
    success: true,
    message: existingSha ? 'File updated successfully' : 'File uploaded successfully',
    file: {
      path: result.content.path,
      sha: result.content.sha,
      downloadUrl: result.content.download_url,
      htmlUrl: result.content.html_url,
    },
    commit: {
      sha: result.commit.sha,
      url: result.commit.html_url,
    },
  };
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

export async function deleteNote(
  filePath: string,
  fileSha: string,
  githubToken: string
): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${apiUrl}/delete-note`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ filePath, fileSha, githubToken }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to delete note');
  }

  return data;
}

export type { User, NotesFile, NotesResponse, AdminsData };
