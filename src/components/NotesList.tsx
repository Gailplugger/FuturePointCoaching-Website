'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Download, Search, Filter, X, FolderOpen, Trash2, RefreshCw, ExternalLink, Share2, Check, Copy } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLoader } from '@/components/ui/Loading';
import { listNotes, deleteNote, type NotesFile } from '@/lib/api';
import { classes, subjectsByClass } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils';

interface NotesListProps {
  isAdmin?: boolean;
  onNoteDeleted?: () => void;
}

export function NotesList({ isAdmin = false, onNoteDeleted }: NotesListProps) {
  const [notes, setNotes] = useState<NotesFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [deletingPath, setDeletingPath] = useState<string | null>(null);
  const [copiedPath, setCopiedPath] = useState<string | null>(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  async function fetchNotes() {
    try {
      setLoading(true);
      setError(null);
      const response = await listNotes();
      setNotes(response.files);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  }

  const copyShareLink = async (note: NotesFile) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const shareLink = `${baseUrl}/notes?file=${encodeURIComponent(note.path)}`;
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopiedPath(note.path);
      setTimeout(() => setCopiedPath(null), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareLink;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedPath(note.path);
      setTimeout(() => setCopiedPath(null), 2000);
    }
  };

  // Get subjects based on selected class
  const availableSubjects = useMemo(() => {
    if (selectedClass && subjectsByClass[selectedClass]) {
      return subjectsByClass[selectedClass];
    }
    const allSubjects = new Set<string>();
    Object.values(subjectsByClass).forEach(subjects => {
      subjects.forEach(s => allSubjects.add(s.value));
    });
    return Array.from(allSubjects).map(s => ({ value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }));
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass) {
      const classSubjects = subjectsByClass[selectedClass];
      if (classSubjects && !classSubjects.some(s => s.value === selectedSubject)) {
        setSelectedSubject('');
      }
    }
  }, [selectedClass, selectedSubject]);

  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === '' ||
      note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === '' || note.classNo === selectedClass;
    const matchesSubject =
      selectedSubject === '' || note.subject.toLowerCase() === selectedSubject.toLowerCase();
    return matchesSearch && matchesClass && matchesSubject;
  });

  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const key = `Class ${note.classNo} - ${note.subject}`;
    if (!acc[key]) {
      acc[key] = { classNo: note.classNo, subject: note.subject, files: [] };
    }
    acc[key].files.push(note);
    return acc;
  }, {} as Record<string, { classNo: string; subject: string; files: NotesFile[] }>);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClass('');
    setSelectedSubject('');
  };

  const handleDelete = async (note: NotesFile) => {
    if (!confirm(`Are you sure you want to delete "${note.name}"?`)) return;
    const githubToken = sessionStorage.getItem('github_token');
    if (!githubToken) {
      alert('Please login again to delete notes');
      return;
    }
    try {
      setDeletingPath(note.path);
      await deleteNote(note.path, note.sha, githubToken);
      setNotes(prev => prev.filter(n => n.path !== note.path));
      onNoteDeleted?.();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete note');
    } finally {
      setDeletingPath(null);
    }
  };

  const hasActiveFilters = searchQuery || selectedClass || selectedSubject;

  if (loading) return <SectionLoader />;

  if (error) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <p className="text-red-400 mb-4">{error}</p>
          <Button onClick={fetchNotes}>Try Again</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && <Badge variant="success" className="ml-2">Active</Badge>}
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchNotes} title="Refresh">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select label="Class" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                    <option value="">All Classes</option>
                    {classes.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </Select>
                  <Select label="Subject" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                    <option value="">All Subjects</option>
                    {availableSubjects.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                  </Select>
                </div>
                {hasActiveFilters && (
                  <div className="mt-4 flex justify-end">
                    <Button variant="ghost" onClick={clearFilters}><X className="w-4 h-4 mr-2" />Clear Filters</Button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Class Pills */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedClass('')}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedClass === '' ? 'bg-accent-orange text-white' : 'bg-navy-800 text-gray-300 hover:bg-navy-700'}`}
        >All Classes</button>
        {classes.map((c) => (
          <button
            key={c.value}
            onClick={() => setSelectedClass(c.value)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${selectedClass === c.value ? 'bg-accent-orange text-white' : 'bg-navy-800 text-gray-300 hover:bg-navy-700'}`}
          >{c.label}</button>
        ))}
      </div>

      {/* Subject Pills */}
      {selectedClass && subjectsByClass[selectedClass] && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSubject('')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSubject === '' ? 'bg-royal-500 text-white' : 'bg-navy-800 text-gray-300 hover:bg-navy-700'}`}
          >All Subjects</button>
          {subjectsByClass[selectedClass].map((s) => (
            <button
              key={s.value}
              onClick={() => setSelectedSubject(s.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${selectedSubject === s.value ? 'bg-royal-500 text-white' : 'bg-navy-800 text-gray-300 hover:bg-navy-700'}`}
            >{s.label}</button>
          ))}
        </div>
      )}

      {/* Notes */}
      {filteredNotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Notes Found</h3>
            <p className="text-gray-400">{hasActiveFilters ? 'Try adjusting your filters.' : 'No notes uploaded yet.'}</p>
            {hasActiveFilters && <Button variant="outline" onClick={clearFilters} className="mt-4">Clear Filters</Button>}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNotes).sort(([a], [b]) => a.localeCompare(b)).map(([key, group]) => (
            <Card key={key}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent-orange/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-accent-orange" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white capitalize">{key}</h3>
                    <p className="text-sm text-gray-400">{group.files.length} file{group.files.length !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.files.map((note) => (
                    <motion.div
                      key={note.path}
                      whileHover={{ scale: 1.02 }}
                      className="p-4 bg-navy-800/50 rounded-lg border border-white/5 hover:border-accent-orange/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-red-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-white truncate">{note.name}</h4>
                          <p className="text-xs text-gray-500 mt-1">{formatFileSize(note.size)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-3">
                        <a href={note.downloadUrl} target="_blank" rel="noopener noreferrer" className="flex-1">
                          <Button variant="primary" size="sm" className="w-full">
                            <Download className="w-4 h-4 mr-1" />Download
                          </Button>
                        </a>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => copyShareLink(note)}
                          title="Copy share link"
                          className="text-blue-400 hover:text-blue-500 hover:bg-blue-500/10"
                        >
                          {copiedPath === note.path ? <Check className="w-4 h-4 text-green-400" /> : <Share2 className="w-4 h-4" />}
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(note)}
                            disabled={deletingPath === note.path}
                            className="text-red-400 hover:text-red-500 hover:bg-red-500/10"
                          >
                            {deletingPath === note.path ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredNotes.length > 0 && (
        <p className="text-center text-gray-400 text-sm">Showing {filteredNotes.length} of {notes.length} notes</p>
      )}
    </div>
  );
}
