'use client';

export interface AdminLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error';
  action: 'LOGIN' | 'LOGOUT' | 'UPLOAD' | 'DELETE' | 'ADMIN_ADD' | 'ADMIN_REMOVE' | 'SYSTEM' | 'SESSION' | 'ACCESS';
  message: string;
  user?: string;
  details?: string;
  metadata?: {
    ip?: string;
    userAgent?: string;
    browser?: string;
    os?: string;
    device?: string;
    location?: string;
    fileName?: string;
    fileSize?: string;
    classNo?: string;
    subject?: string;
    path?: string;
    sessionId?: string;
    duration?: string;
    statusCode?: number;
    method?: string;
    endpoint?: string;
  };
}

const MAX_LOGS = 200;

// In-memory logs storage (persisted to sessionStorage)
let logs: AdminLog[] = [];

export function getStorageKey(): string {
  return 'fp_admin_logs';
}

export function loadLogs(): AdminLog[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const stored = sessionStorage.getItem(getStorageKey());
    if (stored) {
      const parsed = JSON.parse(stored);
      logs = parsed.map((log: AdminLog) => ({
        ...log,
        timestamp: new Date(log.timestamp)
      }));
    }
  } catch {
    logs = [];
  }
  return logs;
}

export function saveLogs(): void {
  if (typeof window === 'undefined') return;
  
  try {
    sessionStorage.setItem(getStorageKey(), JSON.stringify(logs));
  } catch {
    // Storage full, clear old logs
    logs = logs.slice(-100);
    sessionStorage.setItem(getStorageKey(), JSON.stringify(logs));
  }
}

export function addLog(log: Omit<AdminLog, 'id' | 'timestamp'>): AdminLog {
  const newLog: AdminLog = {
    ...log,
    id: `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
  };
  
  logs = [newLog, ...logs].slice(0, MAX_LOGS);
  saveLogs();
  
  // Dispatch custom event for real-time updates
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adminLogAdded', { detail: newLog }));
  }
  
  return newLog;
}

export function getLogs(): AdminLog[] {
  if (logs.length === 0) {
    loadLogs();
  }
  return logs;
}

export function clearLogs(): void {
  logs = [];
  saveLogs();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('adminLogsCleared'));
  }
}

// Get browser/device info from user agent
export function parseUserAgent(userAgent?: string): { browser: string; os: string; device: string } {
  if (!userAgent) {
    userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  }

  let browser = 'Unknown';
  let os = 'Unknown';
  let device = 'Desktop';

  // Detect browser
  if (userAgent.includes('Firefox')) {
    browser = 'Firefox';
  } else if (userAgent.includes('Edg')) {
    browser = 'Edge';
  } else if (userAgent.includes('Chrome')) {
    browser = 'Chrome';
  } else if (userAgent.includes('Safari')) {
    browser = 'Safari';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR')) {
    browser = 'Opera';
  }

  // Detect OS
  if (userAgent.includes('Windows NT 10')) {
    os = 'Windows 10/11';
  } else if (userAgent.includes('Windows')) {
    os = 'Windows';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
  } else if (userAgent.includes('iOS') || userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
  }

  // Detect device type
  if (userAgent.includes('Mobile') || userAgent.includes('Android')) {
    device = 'Mobile';
  } else if (userAgent.includes('Tablet') || userAgent.includes('iPad')) {
    device = 'Tablet';
  }

  return { browser, os, device };
}

// Generate session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('fp_session_id');
  if (!sessionId) {
    sessionId = `sess_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('fp_session_id', sessionId);
  }
  return sessionId;
}

// Get client metadata
export function getClientMetadata(): Partial<AdminLog['metadata']> {
  if (typeof window === 'undefined') return {};
  
  const { browser, os, device } = parseUserAgent();
  
  return {
    userAgent: navigator.userAgent,
    browser,
    os,
    device,
    sessionId: getSessionId(),
  };
}

// Helper functions for common log types
export function logLogin(username: string, ip?: string, additionalMeta?: Partial<AdminLog['metadata']>): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: 'success',
    action: 'LOGIN',
    message: `Authentication successful for ${username}`,
    user: username,
    details: `Session initiated from ${ip || 'Unknown IP'}`,
    metadata: {
      ...clientMeta,
      ip: ip || 'Fetching...',
      ...additionalMeta,
    }
  });
}

export function logLoginAttempt(username: string, success: boolean, ip?: string, reason?: string): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: success ? 'success' : 'error',
    action: 'LOGIN',
    message: success ? `Login successful: ${username}` : `Login failed: ${username}`,
    user: username,
    details: reason || (success ? 'Credentials verified' : 'Authentication rejected'),
    metadata: {
      ...clientMeta,
      ip: ip || 'Unknown',
      statusCode: success ? 200 : 401,
    }
  });
}

export function logLogout(username: string): AdminLog {
  const clientMeta = getClientMetadata();
  const sessionStart = sessionStorage.getItem('fp_login_time');
  let duration = 'Unknown';
  
  if (sessionStart) {
    const durationMs = Date.now() - parseInt(sessionStart, 10);
    const minutes = Math.floor(durationMs / 60000);
    const hours = Math.floor(minutes / 60);
    duration = hours > 0 ? `${hours}h ${minutes % 60}m` : `${minutes}m`;
  }
  
  return addLog({
    type: 'info',
    action: 'LOGOUT',
    message: `Session terminated for ${username}`,
    user: username,
    details: `Session duration: ${duration}`,
    metadata: {
      ...clientMeta,
      duration,
    }
  });
}

export function logUpload(username: string, fileName: string, classNo: string, subject: string, fileSize?: number): AdminLog {
  const clientMeta = getClientMetadata();
  const fileSizeStr = fileSize ? formatBytes(fileSize) : 'Unknown';
  
  return addLog({
    type: 'success',
    action: 'UPLOAD',
    message: `File uploaded: ${fileName}`,
    user: username,
    details: `Class ${classNo} • ${subject} • Size: ${fileSizeStr}`,
    metadata: {
      ...clientMeta,
      fileName,
      fileSize: fileSizeStr,
      classNo,
      subject,
      path: `notes/class-${classNo}/${subject}/${fileName}`,
    }
  });
}

export function logUploadError(username: string, fileName: string, error: string, fileSize?: number): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: 'error',
    action: 'UPLOAD',
    message: `Upload failed: ${fileName}`,
    user: username,
    details: error,
    metadata: {
      ...clientMeta,
      fileName,
      fileSize: fileSize ? formatBytes(fileSize) : 'Unknown',
      statusCode: 500,
    }
  });
}

export function logDelete(username: string, fileName: string, path?: string): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: 'warning',
    action: 'DELETE',
    message: `File deleted: ${fileName}`,
    user: username,
    details: path ? `Path: ${path}` : 'Removed from repository',
    metadata: {
      ...clientMeta,
      fileName,
      path,
    }
  });
}

export function logAdminAdd(username: string, addedUser: string, isSuperAdmin: boolean): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: 'success',
    action: 'ADMIN_ADD',
    message: `New ${isSuperAdmin ? 'Super Admin' : 'Admin'} added: ${addedUser}`,
    user: username,
    details: `Granted by ${username} at ${new Date().toLocaleString()}`,
    metadata: {
      ...clientMeta,
    }
  });
}

export function logAdminRemove(username: string, removedUser: string): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: 'warning',
    action: 'ADMIN_REMOVE',
    message: `Admin access revoked: ${removedUser}`,
    user: username,
    details: `Revoked by ${username}`,
    metadata: {
      ...clientMeta,
    }
  });
}

export function logSystem(message: string, type: AdminLog['type'] = 'info', details?: string): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type,
    action: 'SYSTEM',
    message,
    details: details || `System event at ${new Date().toLocaleString()}`,
    metadata: {
      ...clientMeta,
    }
  });
}

export function logSession(action: 'start' | 'resume' | 'expire', username: string): AdminLog {
  const clientMeta = getClientMetadata();
  
  if (action === 'start') {
    sessionStorage.setItem('fp_login_time', Date.now().toString());
  }
  
  const messages = {
    start: `Session started for ${username}`,
    resume: `Session resumed for ${username}`,
    expire: `Session expired for ${username}`,
  };
  
  return addLog({
    type: action === 'expire' ? 'warning' : 'info',
    action: 'SESSION',
    message: messages[action],
    user: username,
    details: `Session ID: ${clientMeta?.sessionId || 'N/A'}`,
    metadata: {
      ...clientMeta,
    }
  });
}

export function logAccess(endpoint: string, method: string, statusCode: number, username?: string): AdminLog {
  const clientMeta = getClientMetadata();
  const isSuccess = statusCode >= 200 && statusCode < 300;
  
  return addLog({
    type: isSuccess ? 'info' : 'error',
    action: 'ACCESS',
    message: `${method} ${endpoint} → ${statusCode}`,
    user: username,
    details: `API request ${isSuccess ? 'completed' : 'failed'}`,
    metadata: {
      ...clientMeta,
      endpoint,
      method,
      statusCode,
    }
  });
}

// Utility function to format bytes
function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Fetch IP address from external service
export async function fetchClientIP(): Promise<string> {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip;
  } catch {
    return 'Unable to fetch';
  }
}

