'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FileText,
  Trash2,
  Edit,
  Search,
  Filter,
  Home,
  LayoutDashboard,
  RefreshCw,
  Download,
  Share2,
  Copy,
  Check,
  ArrowLeft,
} from 'lucide-react';
import { PageTransition, SlideUp, StaggerContainer, StaggerItem } from '@/components/motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader, SectionLoader } from '@/components/ui/Loading';
import { listNotes, deleteNote, type NotesFile } from '@/lib/api';
import { classes, subjectsByClass } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils';

export default function AdminNotesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<NotesFile[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<NotesFile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [githubToken, setGithubToken] = useState('');
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  useEffect(() => {
    const token = sessionStorage.getItem('github_token');
    const userData = sessionStorage.getItem('admin_user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    setGithubToken(token);
    fetchNotes();
  }, [router]);

  useEffect(() => {
    let filtered = notes;

    if (searchQuery) {
      filtered = filtered.filter(
        (n) =>
          n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.subject.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedClass) {
      filtered = filtered.filter((n) => n.classNo === selectedClass);
    }

    if (selectedSubject) {
      filtered = filtered.filter(
        (n) => n.subject.toLowerCase() === selectedSubject.toLowerCase()
      );
    }

    setFilteredNotes(filtered);
  }, [notes, searchQuery, selectedClass, selectedSubject]);

  async function fetchNotes() {
    try {
      setLoading(true);
      const response = await listNotes();
      setNotes(response.files);
      setFilteredNotes(response.files);
    } catch (err) {
      console.error('Failed to fetch notes:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleDelete = async (note: NotesFile) => {
    if (!confirm(`Are you sure you want to delete "${note.name}"?`)) return;

    try {
      setDeletingPath(note.path);
      await deleteNote(note.path, note.sha, githubToken);
      setNotes((prev) => prev.filter((n) => n.path !== note.path));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setDeletingPath(null);
    }
  };

  const generateShareLink = (note: NotesFile) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/notes?file=${encodeURIComponent(note.path)}`;
  };

  const copyShareLink = async (note: NotesFile) => {
    const link = generateShareLink(note);
    try {
      await navigator.clipboard.writeText(link);
      setCopiedPath(note.path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (err) {
      alert('Failed to copy link');
    }
  };

  const availableSubjects =
    selectedClass && subjectsByClass[selectedClass]
      ? subjectsByClass[selectedClass]
      : [];

  if (loading) return <PageLoader />;

  return (
    <PageTransition>
      <div className="min-h-screen bg-navy-900">
        {/* Header */}
        <header className="bg-navy-800/50 border-b border-white/10 sticky top-20 z-40">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/admin/dashboard">
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back
                  </Button>
                </Link>
                <div>
                  <h1 className="text-lg font-semibold text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-accent-orange" />
                    Manage Notes
                  </h1>
                  <p className="text-sm text-gray-400">{notes.length} total notes</p>
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={fetchNotes}>
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="container py-6">
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Search notes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setSelectedSubject('');
                  }}
                >
                  <option value="">All Classes</option>
                  {classes.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </Select>
                <Select
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  disabled={!selectedClass}
                >
                  <option value="">All Subjects</option>
                  {availableSubjects.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Notes Table */}
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-navy-800/50 border-b border-white/10">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">
                        File Name
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">
                        Class
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">
                        Subject
                      </th>
                      <th className="text-left p-4 text-sm font-medium text-gray-400">
                        Size
                      </th>
                      <th className="text-right p-4 text-sm font-medium text-gray-400">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredNotes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-gray-400">
                          No notes found
                        </td>
                      </tr>
                    ) : (
                      filteredNotes.map((note) => (
                        <motion.tr
                          key={note.path}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="border-b border-white/5 hover:bg-white/5 transition-colors"
                        >
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                                <FileText className="w-5 h-5 text-red-400" />
                              </div>
                              <span className="text-white font-medium truncate max-w-[200px]">
                                {note.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge>Class {note.classNo}</Badge>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-300 capitalize">{note.subject}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-gray-400">{formatFileSize(note.size)}</span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-end gap-2">
                              {/* Share */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => copyShareLink(note)}
                                title="Copy share link"
                              >
                                {copiedPath === note.path ? (
                                  <Check className="w-4 h-4 text-green-400" />
                                ) : (
                                  <Share2 className="w-4 h-4" />
                                )}
                              </Button>

                              {/* Download */}
                              <a href={note.downloadUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="ghost" size="sm" title="Download">
                                  <Download className="w-4 h-4" />
                                </Button>
                              </a>

                              {/* Delete */}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(note)}
                                disabled={deletingPath === note.path}
                                className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                                title="Delete"
                              >
                                {deletingPath === note.path ? (
                                  <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Trash2 className="w-4 h-4" />
                                )}
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {filteredNotes.length > 0 && (
            <p className="text-center text-gray-400 text-sm mt-4">
              Showing {filteredNotes.length} of {notes.length} notes
            </p>
          )}
        </div>
      </div>
    </PageTransition>
  );
}
