'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, X, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { uploadSchema, type UploadFormData } from '@/lib/validations';
import { uploadPdf } from '@/lib/api';
import { classes, streams } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils';

interface UploadCardProps {
  githubToken: string;
}

export function UploadCard({ githubToken }: UploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
    commitUrl?: string;
  } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<UploadFormData>({
    resolver: zodResolver(uploadSchema),
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];
    if (selectedFile) {
      if (!selectedFile.name.toLowerCase().endsWith('.pdf')) {
        setUploadResult({
          success: false,
          message: 'Only PDF files are allowed',
        });
        return;
      }

      if (selectedFile.size > 20 * 1024 * 1024) {
        setUploadResult({
          success: false,
          message: 'File size must be less than 20MB',
        });
        return;
      }

      setFile(selectedFile);
      setUploadResult(null);

      // Convert to base64
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix
        const base64 = result.split(',')[1];
        setFileBase64(base64);
      };
      reader.readAsDataURL(selectedFile);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
  });

  const removeFile = () => {
    setFile(null);
    setFileBase64('');
    setUploadResult(null);
  };

  const onSubmit = async (data: UploadFormData) => {
    if (!file || !fileBase64) {
      setUploadResult({
        success: false,
        message: 'Please select a file to upload',
      });
      return;
    }

    try {
      setUploading(true);
      setUploadResult(null);

      const result = await uploadPdf(
        fileBase64,
        file.name,
        data.classNo,
        data.stream,
        data.subject,
        data.commitMessage || `Upload ${file.name}`,
        githubToken
      );

      setUploadResult({
        success: true,
        message: result.message,
        commitUrl: result.commit.url,
      });

      // Reset form
      setFile(null);
      setFileBase64('');
      reset();
    } catch (err) {
      setUploadResult({
        success: false,
        message: err instanceof Error ? err.message : 'Upload failed',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Upload className="w-6 h-6 text-accent-orange" />
          Upload PDF Notes
        </h2>
        <p className="text-gray-400 text-sm mt-1">
          Upload study materials for students. Files will be committed to the repository.
        </p>
      </CardHeader>

      <form onSubmit={handleSubmit(onSubmit)}>
        <CardContent className="space-y-6">
          {/* Dropzone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-accent-orange bg-accent-orange/10'
                : file
                ? 'border-green-500 bg-green-500/10'
                : 'border-white/20 hover:border-white/40'
            }`}
          >
            <input {...getInputProps()} />
            {file ? (
              <div className="flex items-center justify-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                  <FileText className="w-6 h-6 text-red-400" />
                </div>
                <div className="text-left">
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile();
                  }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-white font-medium mb-1">
                  {isDragActive ? 'Drop your PDF here' : 'Drag & drop a PDF file'}
                </p>
                <p className="text-gray-400 text-sm">or click to browse (max 20MB)</p>
              </>
            )}
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Class"
              options={classes}
              error={errors.classNo?.message}
              {...register('classNo')}
            />
            <Select
              label="Stream"
              options={streams}
              error={errors.stream?.message}
              {...register('stream')}
            />
          </div>

          <Input
            label="Subject"
            placeholder="e.g., Mathematics, Physics, Biology"
            error={errors.subject?.message}
            {...register('subject')}
          />

          <Input
            label="Commit Message (optional)"
            placeholder="e.g., Added Chapter 5 notes"
            error={errors.commitMessage?.message}
            {...register('commitMessage')}
          />

          {/* Upload Result */}
          <AnimatePresence>
            {uploadResult && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  uploadResult.success
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-red-500/20 border border-red-500/30'
                }`}
              >
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <p
                    className={
                      uploadResult.success ? 'text-green-400' : 'text-red-400'
                    }
                  >
                    {uploadResult.message}
                  </p>
                  {uploadResult.commitUrl && (
                    <a
                      href={uploadResult.commitUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 mt-2"
                    >
                      View Commit
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>

        <CardFooter>
          <Button
            type="submit"
            isLoading={uploading}
            disabled={!file || uploading}
            className="w-full sm:w-auto"
          >
            <Upload className="w-4 h-4 mr-2" />
            {uploading ? 'Uploading...' : 'Upload PDF'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
