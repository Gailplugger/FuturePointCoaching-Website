import { z } from 'zod';

export const loginSchema = z.object({
  username: z
    .string()
    .min(1, 'GitHub username is required')
    .max(39, 'Invalid GitHub username')
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, 'Invalid GitHub username format'),
  token: z
    .string()
    .min(1, 'GitHub Personal Access Token is required')
    .regex(/^gh[ps]_[a-zA-Z0-9]{36,}$|^[a-f0-9]{40}$/, 'Invalid token format'),
});

export const uploadSchema = z.object({
  classNo: z.enum(['10', '11', '12'], {
    errorMap: () => ({ message: 'Class must be 10, 11, or 12' }),
  }),
  subject: z
    .string()
    .min(1, 'Subject is required')
    .max(50, 'Subject name too long'),
  commitMessage: z
    .string()
    .max(200, 'Commit message too long')
    .optional(),
});

export const addAdminSchema = z.object({
  username: z
    .string()
    .min(1, 'GitHub username is required')
    .max(39, 'Invalid GitHub username')
    .regex(/^[a-zA-Z0-9](?:[a-zA-Z0-9]|-(?=[a-zA-Z0-9])){0,38}$/, 'Invalid GitHub username format'),
});

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type UploadFormData = z.infer<typeof uploadSchema>;
export type AddAdminFormData = z.infer<typeof addAdminSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
