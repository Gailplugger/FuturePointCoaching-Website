'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { FileText, Download, Search, Filter, X, FolderOpen, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SectionLoader } from '@/components/ui/Loading';
import { listNotes, type NotesFile } from '@/lib/api';
import { classes, streams } from '@/lib/constants';
import { formatFileSize } from '@/lib/utils';

export function NotesList() {
  const [notes, setNotes] = useState<NotesFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStream, setSelectedStream] = useState('');
  const [showFilters, setShowFilters] = useState(false);

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

  // Filter notes
  const filteredNotes = notes.filter((note) => {
    const matchesSearch =
      searchQuery === '' ||
      note.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === '' || note.classNo === selectedClass;
    const matchesStream =
      selectedStream === '' || note.stream.toLowerCase() === selectedStream.toLowerCase();

    return matchesSearch && matchesClass && matchesStream;
  });

  // Group by subject
  const groupedNotes = filteredNotes.reduce((acc, note) => {
    const key = `${note.classNo}-${note.stream}-${note.subject}`;
    if (!acc[key]) {
      acc[key] = {
        classNo: note.classNo,
        stream: note.stream,
        subject: note.subject,
        files: [],
      };
    }
    acc[key].files.push(note);
    return acc;
  }, {} as Record<string, { classNo: string; stream: string; subject: string; files: NotesFile[] }>);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedClass('');
    setSelectedStream('');
  };

  const hasActiveFilters = searchQuery || selectedClass || selectedStream;

  if (loading) {
    return <SectionLoader />;
  }

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
      {/* Search and Filters */}
      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:w-auto"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="success" className="ml-2">
                  Active
                </Badge>
              )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-white/10">
                  <Select
                    label="Class"
                    options={classes}
                    value={selectedClass}
                    onChange={(e) => setSelectedClass(e.target.value)}
                  />
                  <Select
                    label="Stream"
                    options={streams}
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(e.target.value)}
                  />
                  {hasActiveFilters && (
                    <div className="flex items-end">
                      <Button variant="ghost" onClick={clearFilters} className="w-full">
                        <X className="w-4 h-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-gray-400 text-sm">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} found
        </p>
        <Button variant="ghost" size="sm" onClick={fetchNotes}>
          Refresh
        </Button>
      </div>

      {/* Notes Grid */}
      {Object.keys(groupedNotes).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FolderOpen className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Notes Found</h3>
            <p className="text-gray-400">
              {hasActiveFilters
                ? 'Try adjusting your filters to find more notes.'
                : 'No notes have been uploaded yet. Check back later!'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.values(groupedNotes).map((group) => (
            <motion.div
              key={`${group.classNo}-${group.stream}-${group.subject}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="w-5 h-5 text-accent-orange" />
                      <h3 className="text-lg font-semibold text-white capitalize">
                        {group.subject}
                      </h3>
                    </div>
                    <div className="flex gap-2">
                      <Badge>Class {group.classNo}</Badge>
                      <Badge variant="info" className="capitalize">
                        {group.stream}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.files.map((file) => (
                      <motion.div
                        key={file.path}
                        whileHover={{ scale: 1.02 }}
                        className="p-4 bg-navy-800/50 rounded-lg border border-white/5 hover:border-accent-orange/30 transition-colors"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0">
                            <FileText className="w-5 h-5 text-red-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white truncate">
                              {file.name}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatFileSize(file.size)}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-3">
                          <a
                            href={file.downloadUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1"
                          >
                            <Button variant="primary" size="sm" className="w-full">
                              <Download className="w-4 h-4 mr-1" />
                              Download
                            </Button>
                          </a>
                          <a
                            href={file.htmlUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Button variant="ghost" size="sm">
                              <ExternalLink className="w-4 h-4" />
                            </Button>
                          </a>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
