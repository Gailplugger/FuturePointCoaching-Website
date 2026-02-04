'use client';

export interface AdminLog {
  id: string;
  timestamp: Date;
  type: 'info' | 'success' | 'warning' | 'error' | 'critical';
  action: 'LOGIN' | 'LOGOUT' | 'UPLOAD' | 'DELETE' | 'ADMIN_ADD' | 'ADMIN_REMOVE' | 'SYSTEM' | 'SESSION' | 'ACCESS' | 'SECURITY' | 'API' | 'ERROR';
  message: string;
  user?: string;
  details?: string;
  metadata?: {
    ip?: string;
    ipv6?: string;
    userAgent?: string;
    browser?: string;
    browserVersion?: string;
    os?: string;
    osVersion?: string;
    device?: string;
    deviceType?: string;
    location?: string;
    country?: string;
    city?: string;
    timezone?: string;
    language?: string;
    screenResolution?: string;
    colorDepth?: string;
    cookiesEnabled?: boolean;
    javaEnabled?: boolean;
    platform?: string;
    vendor?: string;
    connection?: string;
    memory?: string;
    cpuCores?: number;
    touchSupport?: boolean;
    fileName?: string;
    fileSize?: string;
    fileType?: string;
    classNo?: string;
    subject?: string;
    path?: string;
    sha?: string;
    commitUrl?: string;
    sessionId?: string;
    duration?: string;
    statusCode?: number;
    method?: string;
    endpoint?: string;
    responseTime?: string;
    requestId?: string;
    errorStack?: string;
    referrer?: string;
    pageUrl?: string;
    isSuperAdmin?: boolean;
    role?: string;
    loginMethod?: string;
    tokenExpiry?: string;
    lastActivity?: string;
  };
}

const MAX_LOGS = 500;

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
    logs = logs.slice(-250);
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

// Comprehensive browser/device info from user agent
export function parseUserAgent(userAgent?: string): { 
  browser: string; 
  browserVersion: string;
  os: string; 
  osVersion: string;
  device: string;
  deviceType: string;
} {
  if (!userAgent) {
    userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown';
  }

  let browser = 'Unknown';
  let browserVersion = '';
  let os = 'Unknown';
  let osVersion = '';
  let device = 'Unknown';
  let deviceType = 'Desktop';

  // Detect browser and version
  if (userAgent.includes('Firefox/')) {
    browser = 'Mozilla Firefox';
    browserVersion = userAgent.match(/Firefox\/(\d+\.?\d*)/)?.[1] || '';
  } else if (userAgent.includes('Edg/')) {
    browser = 'Microsoft Edge';
    browserVersion = userAgent.match(/Edg\/(\d+\.?\d*)/)?.[1] || '';
  } else if (userAgent.includes('Chrome/')) {
    browser = 'Google Chrome';
    browserVersion = userAgent.match(/Chrome\/(\d+\.?\d*)/)?.[1] || '';
  } else if (userAgent.includes('Safari/') && !userAgent.includes('Chrome')) {
    browser = 'Apple Safari';
    browserVersion = userAgent.match(/Version\/(\d+\.?\d*)/)?.[1] || '';
  } else if (userAgent.includes('Opera') || userAgent.includes('OPR/')) {
    browser = 'Opera';
    browserVersion = userAgent.match(/(?:Opera|OPR)\/(\d+\.?\d*)/)?.[1] || '';
  }

  // Detect OS and version
  if (userAgent.includes('Windows NT 10')) {
    os = 'Windows';
    osVersion = '10/11';
  } else if (userAgent.includes('Windows NT 6.3')) {
    os = 'Windows';
    osVersion = '8.1';
  } else if (userAgent.includes('Windows NT 6.2')) {
    os = 'Windows';
    osVersion = '8';
  } else if (userAgent.includes('Windows NT 6.1')) {
    os = 'Windows';
    osVersion = '7';
  } else if (userAgent.includes('Mac OS X')) {
    os = 'macOS';
    osVersion = userAgent.match(/Mac OS X (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
  } else if (userAgent.includes('Linux')) {
    os = 'Linux';
    if (userAgent.includes('Ubuntu')) osVersion = 'Ubuntu';
    else if (userAgent.includes('Fedora')) osVersion = 'Fedora';
  } else if (userAgent.includes('Android')) {
    os = 'Android';
    osVersion = userAgent.match(/Android (\d+\.?\d*)/)?.[1] || '';
  } else if (userAgent.includes('iPhone') || userAgent.includes('iPad')) {
    os = 'iOS';
    osVersion = userAgent.match(/OS (\d+[._]\d+)/)?.[1]?.replace('_', '.') || '';
  }

  // Detect device type and name
  if (userAgent.includes('iPhone')) {
    device = 'iPhone';
    deviceType = 'Mobile';
  } else if (userAgent.includes('iPad')) {
    device = 'iPad';
    deviceType = 'Tablet';
  } else if (userAgent.includes('Android')) {
    if (userAgent.includes('Mobile')) {
      device = 'Android Phone';
      deviceType = 'Mobile';
    } else {
      device = 'Android Tablet';
      deviceType = 'Tablet';
    }
  } else if (userAgent.includes('Windows')) {
    device = 'Windows PC';
    deviceType = 'Desktop';
  } else if (userAgent.includes('Macintosh')) {
    device = 'Mac';
    deviceType = 'Desktop';
  } else if (userAgent.includes('Linux')) {
    device = 'Linux PC';
    deviceType = 'Desktop';
  }

  return { browser, browserVersion, os, osVersion, device, deviceType };
}

// Generate session ID
export function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('fp_session_id');
  if (!sessionId) {
    sessionId = `SID_${Date.now().toString(36).toUpperCase()}_${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    sessionStorage.setItem('fp_session_id', sessionId);
  }
  return sessionId;
}

// Get comprehensive client metadata
export function getClientMetadata(): Partial<AdminLog['metadata']> {
  if (typeof window === 'undefined') return {};
  
  const { browser, browserVersion, os, osVersion, device, deviceType } = parseUserAgent();
  const nav = navigator as Navigator & { 
    deviceMemory?: number; 
    hardwareConcurrency?: number;
    connection?: { effectiveType?: string };
  };
  
  return {
    userAgent: navigator.userAgent,
    browser,
    browserVersion,
    os,
    osVersion,
    device,
    deviceType,
    sessionId: getSessionId(),
    language: navigator.language,
    platform: navigator.platform,
    vendor: navigator.vendor,
    cookiesEnabled: navigator.cookieEnabled,
    screenResolution: `${screen.width}x${screen.height}`,
    colorDepth: `${screen.colorDepth}-bit`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    memory: nav.deviceMemory ? `${nav.deviceMemory}GB` : undefined,
    cpuCores: nav.hardwareConcurrency,
    connection: nav.connection?.effectiveType,
    touchSupport: 'ontouchstart' in window,
    referrer: document.referrer || 'Direct',
    pageUrl: window.location.href,
  };
}

// Helper functions for common log types
export function logLogin(
  username: string, 
  ip?: string, 
  isSuperAdmin?: boolean,
  additionalMeta?: Partial<AdminLog['metadata']>
): AdminLog {
  const clientMeta = getClientMetadata();
  const role = isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN';
  
  return addLog({
    type: 'success',
    action: 'LOGIN',
    message: `🔐 AUTHENTICATION SUCCESSFUL`,
    user: username,
    details: `User "${username}" authenticated as ${role} from ${ip || 'Unknown IP'}`,
    metadata: {
      ...clientMeta,
      ip: ip || 'Fetching...',
      isSuperAdmin,
      role,
      loginMethod: 'GitHub PAT',
      tokenExpiry: '2 hours',
      ...additionalMeta,
    }
  });
}

export function logLoginAttempt(username: string, success: boolean, ip?: string, reason?: string): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: success ? 'success' : 'error',
    action: success ? 'LOGIN' : 'SECURITY',
    message: success ? `✅ LOGIN SUCCESSFUL` : `❌ LOGIN FAILED`,
    user: username,
    details: reason || (success ? 'Credentials verified successfully' : 'Authentication rejected'),
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
    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    if (hours > 0) {
      duration = `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      duration = `${minutes}m ${seconds % 60}s`;
    } else {
      duration = `${seconds}s`;
    }
  }
  
  return addLog({
    type: 'info',
    action: 'LOGOUT',
    message: `🚪 SESSION TERMINATED`,
    user: username,
    details: `User "${username}" logged out | Session Duration: ${duration}`,
    metadata: {
      ...clientMeta,
      duration,
      lastActivity: new Date().toISOString(),
    }
  });
}

export function logUpload(
  username: string, 
  fileName: string, 
  classNo: string, 
  subject: string, 
  fileSize?: number,
  commitUrl?: string
): AdminLog {
  const clientMeta = getClientMetadata();
  const fileSizeStr = fileSize ? formatBytes(fileSize) : 'Unknown';
  const fileType = fileName.split('.').pop()?.toUpperCase() || 'Unknown';
  
  return addLog({
    type: 'success',
    action: 'UPLOAD',
    message: `📤 FILE UPLOADED SUCCESSFULLY`,
    user: username,
    details: `"${fileName}" uploaded to Class ${classNo}/${subject}`,
    metadata: {
      ...clientMeta,
      fileName,
      fileSize: fileSizeStr,
      fileType,
      classNo,
      subject,
      path: `notes/class-${classNo}/${subject.toLowerCase()}/${fileName}`,
      commitUrl,
    }
  });
}

export function logUploadError(username: string, fileName: string, error: string, fileSize?: number): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: 'error',
    action: 'ERROR',
    message: `❌ UPLOAD FAILED`,
    user: username,
    details: `Failed to upload "${fileName}" - ${error}`,
    metadata: {
      ...clientMeta,
      fileName,
      fileSize: fileSize ? formatBytes(fileSize) : 'Unknown',
      statusCode: 500,
      errorStack: error,
    }
  });
}

export function logDelete(username: string, fileName: string, path?: string, classNo?: string, subject?: string): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: 'warning',
    action: 'DELETE',
    message: `🗑️ FILE DELETED`,
    user: username,
    details: `"${fileName}" permanently removed from repository`,
    metadata: {
      ...clientMeta,
      fileName,
      path,
      classNo,
      subject,
    }
  });
}

export function logAdminAdd(username: string, addedUser: string, isSuperAdmin: boolean): AdminLog {
  const clientMeta = getClientMetadata();
  const role = isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN';
  return addLog({
    type: 'success',
    action: 'ADMIN_ADD',
    message: `👤 NEW ${role} ADDED`,
    user: username,
    details: `"${addedUser}" granted ${role} privileges by "${username}"`,
    metadata: {
      ...clientMeta,
      isSuperAdmin,
      role,
    }
  });
}

export function logAdminRemove(username: string, removedUser: string): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: 'warning',
    action: 'ADMIN_REMOVE',
    message: `👤 ADMIN ACCESS REVOKED`,
    user: username,
    details: `"${removedUser}" admin privileges revoked by "${username}"`,
    metadata: {
      ...clientMeta,
    }
  });
}

export function logSystem(message: string, type: AdminLog['type'] = 'info', details?: string, meta?: Partial<AdminLog['metadata']>): AdminLog {
  const clientMeta = getClientMetadata();
  const icons: Record<string, string> = {
    info: 'ℹ️',
    success: '✅',
    warning: '⚠️',
    error: '❌',
    critical: '🚨',
  };
  return addLog({
    type,
    action: 'SYSTEM',
    message: `${icons[type] || '📋'} ${message}`,
    details: details || `System event recorded at ${new Date().toLocaleString()}`,
    metadata: {
      ...clientMeta,
      ...meta,
    }
  });
}

export function logSession(action: 'start' | 'resume' | 'expire' | 'active', username: string): AdminLog {
  const clientMeta = getClientMetadata();
  
  if (action === 'start') {
    sessionStorage.setItem('fp_login_time', Date.now().toString());
  }
  
  const messages = {
    start: `🟢 SESSION STARTED`,
    resume: `🔄 SESSION RESUMED`,
    expire: `🔴 SESSION EXPIRED`,
    active: `💚 SESSION ACTIVE`,
  };

  const details = {
    start: `New session initiated for "${username}"`,
    resume: `Existing session resumed for "${username}"`,
    expire: `Session timed out for "${username}"`,
    active: `Session heartbeat for "${username}"`,
  };
  
  return addLog({
    type: action === 'expire' ? 'warning' : 'info',
    action: 'SESSION',
    message: messages[action],
    user: username,
    details: `${details[action]} | Session: ${clientMeta?.sessionId || 'N/A'}`,
    metadata: {
      ...clientMeta,
    }
  });
}

export function logAccess(endpoint: string, method: string, statusCode: number, username?: string, responseTime?: number): AdminLog {
  const clientMeta = getClientMetadata();
  const isSuccess = statusCode >= 200 && statusCode < 300;
  
  return addLog({
    type: isSuccess ? 'info' : 'error',
    action: 'API',
    message: `🌐 API ${method} ${endpoint} → ${statusCode}`,
    user: username,
    details: `${isSuccess ? 'Request completed' : 'Request failed'} in ${responseTime || 0}ms`,
    metadata: {
      ...clientMeta,
      endpoint,
      method,
      statusCode,
      responseTime: responseTime ? `${responseTime}ms` : undefined,
      requestId: `REQ_${Date.now().toString(36).toUpperCase()}`,
    }
  });
}

export function logSecurity(event: string, username?: string, details?: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): AdminLog {
  const clientMeta = getClientMetadata();
  const severityIcons = {
    low: '🟡',
    medium: '🟠', 
    high: '🔴',
    critical: '🚨',
  };
  
  return addLog({
    type: severity === 'critical' ? 'critical' : severity === 'high' ? 'error' : 'warning',
    action: 'SECURITY',
    message: `${severityIcons[severity]} SECURITY: ${event}`,
    user: username,
    details: details || `Security event detected`,
    metadata: {
      ...clientMeta,
    }
  });
}

export function logError(error: string, stack?: string, username?: string): AdminLog {
  const clientMeta = getClientMetadata();
  return addLog({
    type: 'error',
    action: 'ERROR',
    message: `🚨 ERROR: ${error}`,
    user: username,
    details: stack || error,
    metadata: {
      ...clientMeta,
      errorStack: stack,
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

// Fetch IP address and location from external service
export async function fetchClientIP(): Promise<{ ip: string; location?: string; country?: string; city?: string; timezone?: string }> {
  try {
    // Try to get detailed IP info
    const response = await fetch('https://ipapi.co/json/');
    if (response.ok) {
      const data = await response.json();
      return {
        ip: data.ip,
        location: `${data.city}, ${data.region}, ${data.country_name}`,
        country: data.country_name,
        city: data.city,
        timezone: data.timezone,
      };
    }
  } catch {
    // Fallback to simple IP
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return { ip: data.ip };
    } catch {
      return { ip: 'Unable to fetch' };
    }
  }
  return { ip: 'Unable to fetch' };
}

// Initialize system log on load
export function initializeLogs(username?: string): void {
  loadLogs();
  if (username) {
    logSystem('ADMIN PANEL INITIALIZED', 'info', `System ready for ${username}`, {
      pageUrl: typeof window !== 'undefined' ? window.location.href : undefined,
    });
  }
}

