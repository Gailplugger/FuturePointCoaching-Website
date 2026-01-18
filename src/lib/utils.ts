import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function sanitizeFilename(filename: string): string {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/__+/g, '_')
    .toLowerCase();
}

export function getBaseUrl(): string {
  if (typeof window !== 'undefined') {
    return '';
  }
  if (process.env.NETLIFY) {
    return `https://${process.env.URL}`;
  }
  return 'http://localhost:3000';
}

export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    // Use Next.js API routes in development, Netlify functions in production
    if (process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') {
      return '/api';
    }
    return '/.netlify/functions';
  }
  return process.env.NEXT_PUBLIC_API_URL || '/api';
}
