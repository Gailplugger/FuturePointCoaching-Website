'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Trash2, Download, ChevronDown, ChevronUp, Maximize2, Minimize2, Monitor, Smartphone, Tablet, Globe, Clock, User, Server } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { 
  type AdminLog, 
  getLogs, 
  clearLogs, 
  loadLogs 
} from '@/lib/adminLogs';

interface AdminLogsTerminalProps {
  className?: string;
  defaultExpanded?: boolean;
}

export function AdminLogsTerminal({ className = '', defaultExpanded = true }: AdminLogsTerminalProps) {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const terminalRef = useRef<HTMLDivElement>(null);

  // Load logs on mount and listen for updates
  useEffect(() => {
    loadLogs();
    setLogs(getLogs());

    const handleLogAdded = (event: CustomEvent<AdminLog>) => {
      setLogs(getLogs());
      if (terminalRef.current) {
        setTimeout(() => {
          terminalRef.current?.scrollTo({
            top: 0,
            behavior: 'smooth'
          });
        }, 100);
      }
    };

    const handleLogsCleared = () => {
      setLogs([]);
      setSelectedLog(null);
    };

    window.addEventListener('adminLogAdded', handleLogAdded as EventListener);
    window.addEventListener('adminLogsCleared', handleLogsCleared);

    return () => {
      window.removeEventListener('adminLogAdded', handleLogAdded as EventListener);
      window.removeEventListener('adminLogsCleared', handleLogsCleared);
    };
  }, []);

  const handleClear = () => {
    if (confirm('Are you sure you want to clear all logs?')) {
      clearLogs();
    }
  };

  const handleExport = () => {
    const logText = logs.map((log: AdminLog) => {
      const meta = log.metadata;
      let entry = `[${log.timestamp.toISOString()}] [${log.type.toUpperCase()}] [${log.action}] ${log.message}`;
      if (log.user) entry += ` | User: ${log.user}`;
      if (log.details) entry += ` | ${log.details}`;
      if (meta?.ip) entry += ` | IP: ${meta.ip}`;
      if (meta?.browser) entry += ` | Browser: ${meta.browser}`;
      if (meta?.os) entry += ` | OS: ${meta.os}`;
      if (meta?.device) entry += ` | Device: ${meta.device}`;
      if (meta?.sessionId) entry += ` | Session: ${meta.sessionId}`;
      return entry;
    }).join('\n');
    
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getLogColor = (type: AdminLog['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-cyan-400';
    }
  };

  const getLogBg = (type: AdminLog['type']) => {
    switch (type) {
      case 'success': return 'bg-green-500/5 border-l-green-500';
      case 'error': return 'bg-red-500/5 border-l-red-500';
      case 'warning': return 'bg-yellow-500/5 border-l-yellow-500';
      default: return 'bg-cyan-500/5 border-l-cyan-500';
    }
  };

  const getActionIcon = (action: AdminLog['action']) => {
    switch (action) {
      case 'LOGIN': return '🔐';
      case 'LOGOUT': return '🚪';
      case 'UPLOAD': return '📤';
      case 'DELETE': return '🗑️';
      case 'ADMIN_ADD': return '👤+';
      case 'ADMIN_REMOVE': return '👤-';
      case 'SYSTEM': return '⚙️';
      case 'SESSION': return '🔄';
      case 'ACCESS': return '🌐';
      default: return '📋';
    }
  };

  const getDeviceIcon = (device?: string) => {
    switch (device) {
      case 'Mobile': return <Smartphone className="w-3 h-3" />;
      case 'Tablet': return <Tablet className="w-3 h-3" />;
      default: return <Monitor className="w-3 h-3" />;
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredLogs: AdminLog[] = filter === 'all' 
    ? logs 
    : logs.filter((log: AdminLog) => log.action === filter || log.type === filter);

  const containerClass = fullscreen 
    ? 'fixed inset-4 z-50 flex flex-col' 
    : className;

  return (
    <>
      {/* Fullscreen backdrop */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/80 z-40" onClick={() => setFullscreen(false)} />
      )}
      
      <Card className={`overflow-hidden ${containerClass}`}>
        <CardHeader className="py-2 px-3 bg-[#1a1b26] border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => !fullscreen && setExpanded(!expanded)}
            >
              {/* Terminal window buttons */}
              <div className="flex items-center gap-1.5 mr-2">
                <span className="w-3 h-3 rounded-full bg-red-500" />
                <span className="w-3 h-3 rounded-full bg-yellow-500" />
                <span className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              
              <Terminal className="w-4 h-4 text-green-400" />
              <h2 className="text-xs font-mono font-semibold text-gray-300">
                admin@futurepoint:~$ system.logs
              </h2>
              <span className="text-[10px] text-gray-600 font-mono">
                [{filteredLogs.length}/{logs.length}]
              </span>
              {!fullscreen && (
                expanded ? (
                  <ChevronUp className="w-3 h-3 text-gray-500" />
                ) : (
                  <ChevronDown className="w-3 h-3 text-gray-500" />
                )
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {/* Filter dropdown */}
              <select 
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-6 px-2 text-[10px] bg-navy-800 border border-white/10 rounded text-gray-400 font-mono"
              >
                <option value="all">All Logs</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="UPLOAD">Upload</option>
                <option value="DELETE">Delete</option>
                <option value="ADMIN_ADD">Admin Add</option>
                <option value="ADMIN_REMOVE">Admin Remove</option>
                <option value="SYSTEM">System</option>
                <option value="error">Errors</option>
                <option value="warning">Warnings</option>
              </select>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
                className="h-6 w-6 p-0"
                title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
              >
                {fullscreen ? (
                  <Minimize2 className="w-3 h-3 text-gray-400" />
                ) : (
                  <Maximize2 className="w-3 h-3 text-gray-400" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExport}
                className="h-6 w-6 p-0"
                title="Export logs"
              >
                <Download className="w-3 h-3 text-gray-400" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                className="h-6 w-6 p-0"
                title="Clear logs"
              >
                <Trash2 className="w-3 h-3 text-red-400" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <AnimatePresence>
          {(expanded || fullscreen) && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className={fullscreen ? 'flex-1 flex flex-col overflow-hidden' : ''}
            >
              <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
                <div className={`flex ${fullscreen ? 'flex-1' : ''}`}>
                  {/* Main logs area */}
                  <div 
                    ref={terminalRef}
                    className={`flex-1 bg-[#0d1117] font-mono text-[11px] overflow-y-auto p-2 space-y-1 ${
                      fullscreen ? 'max-h-full' : 'max-h-80 min-h-[200px]'
                    }`}
                  >
                    {filteredLogs.length === 0 ? (
                      <div className="text-gray-600 flex flex-col items-center gap-2 py-12 justify-center">
                        <Terminal className="w-8 h-8 opacity-50" />
                        <span>Waiting for system events...</span>
                        <span className="text-[10px]">Actions will be logged here in real-time</span>
                      </div>
                    ) : (
                      filteredLogs.map((log: AdminLog, index: number) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(index * 0.02, 0.5) }}
                          onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                          className={`border-l-2 pl-2 py-1.5 cursor-pointer transition-all hover:bg-white/5 rounded-r ${getLogBg(log.type)} ${
                            selectedLog?.id === log.id ? 'bg-white/10' : ''
                          }`}
                        >
                          {/* Main log line */}
                          <div className="flex items-start gap-2">
                            <span className="text-gray-600 select-none w-14 flex-shrink-0">
                              {formatTime(log.timestamp)}
                            </span>
                            <span className="select-none w-5 text-center">
                              {getActionIcon(log.action)}
                            </span>
                            <span className={`font-bold ${getLogColor(log.type)} w-14 flex-shrink-0`}>
                              {log.type.toUpperCase()}
                            </span>
                            <span className="text-purple-400 w-20 flex-shrink-0 truncate">
                              {log.action}
                            </span>
                            <span className="text-gray-300 flex-1 truncate">
                              {log.message}
                            </span>
                            {log.user && (
                              <span className="text-blue-400 flex-shrink-0">
                                @{log.user}
                              </span>
                            )}
                          </div>
                          
                          {/* Metadata line */}
                          {log.metadata && (
                            <div className="flex items-center gap-3 mt-1 ml-[76px] text-[10px] text-gray-500">
                              {log.metadata.ip && (
                                <span className="flex items-center gap-1">
                                  <Globe className="w-3 h-3" />
                                  {log.metadata.ip}
                                </span>
                              )}
                              {log.metadata.browser && (
                                <span className="flex items-center gap-1">
                                  {getDeviceIcon(log.metadata.device)}
                                  {log.metadata.browser}/{log.metadata.os}
                                </span>
                              )}
                              {log.metadata.sessionId && (
                                <span className="text-gray-600 truncate max-w-[100px]">
                                  {log.metadata.sessionId.slice(0, 15)}...
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Expanded details */}
                          <AnimatePresence>
                            {selectedLog?.id === log.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-2 ml-[76px] p-2 bg-black/30 rounded border border-white/5 text-[10px] space-y-1"
                              >
                                <div className="grid grid-cols-2 gap-x-4 gap-y-1">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3 text-gray-500" />
                                    <span className="text-gray-500">Timestamp:</span>
                                    <span className="text-gray-300">{log.timestamp.toISOString()}</span>
                                  </div>
                                  {log.user && (
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-500">User:</span>
                                      <span className="text-blue-400">{log.user}</span>
                                    </div>
                                  )}
                                  {log.metadata?.ip && (
                                    <div className="flex items-center gap-2">
                                      <Globe className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-500">IP Address:</span>
                                      <span className="text-green-400">{log.metadata.ip}</span>
                                    </div>
                                  )}
                                  {log.metadata?.browser && (
                                    <div className="flex items-center gap-2">
                                      <Monitor className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-500">Browser:</span>
                                      <span className="text-gray-300">{log.metadata.browser}</span>
                                    </div>
                                  )}
                                  {log.metadata?.os && (
                                    <div className="flex items-center gap-2">
                                      <Server className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-500">OS:</span>
                                      <span className="text-gray-300">{log.metadata.os}</span>
                                    </div>
                                  )}
                                  {log.metadata?.device && (
                                    <div className="flex items-center gap-2">
                                      {getDeviceIcon(log.metadata.device)}
                                      <span className="text-gray-500">Device:</span>
                                      <span className="text-gray-300">{log.metadata.device}</span>
                                    </div>
                                  )}
                                  {log.metadata?.fileName && (
                                    <div className="flex items-center gap-2 col-span-2">
                                      <span className="text-gray-500">File:</span>
                                      <span className="text-orange-400">{log.metadata.fileName}</span>
                                      {log.metadata.fileSize && (
                                        <span className="text-gray-500">({log.metadata.fileSize})</span>
                                      )}
                                    </div>
                                  )}
                                  {log.metadata?.path && (
                                    <div className="flex items-center gap-2 col-span-2">
                                      <span className="text-gray-500">Path:</span>
                                      <span className="text-gray-400 font-mono">{log.metadata.path}</span>
                                    </div>
                                  )}
                                  {log.metadata?.sessionId && (
                                    <div className="flex items-center gap-2 col-span-2">
                                      <span className="text-gray-500">Session ID:</span>
                                      <span className="text-gray-400 font-mono">{log.metadata.sessionId}</span>
                                    </div>
                                  )}
                                  {log.metadata?.statusCode && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-gray-500">Status:</span>
                                      <span className={log.metadata.statusCode < 400 ? 'text-green-400' : 'text-red-400'}>
                                        {log.metadata.statusCode}
                                      </span>
                                    </div>
                                  )}
                                </div>
                                {log.details && (
                                  <div className="pt-1 border-t border-white/5 mt-2">
                                    <span className="text-gray-500">Details: </span>
                                    <span className="text-gray-400">{log.details}</span>
                                  </div>
                                )}
                                {log.metadata?.userAgent && (
                                  <div className="pt-1 border-t border-white/5">
                                    <span className="text-gray-500">User Agent: </span>
                                    <span className="text-gray-600 text-[9px] break-all">{log.metadata.userAgent}</span>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    )}
                    
                    {/* Terminal cursor line */}
                    <div className="flex items-center gap-2 mt-2 text-green-400 pt-2 border-t border-white/5">
                      <span className="text-gray-500">root@server:~$</span>
                      <span className="animate-pulse">▋</span>
                    </div>
                  </div>
                </div>
                
                {/* Status bar */}
                <div className="bg-[#1a1b26] border-t border-white/10 px-3 py-1 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      LIVE
                    </span>
                    <span>{filteredLogs.length} entries</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>{formatDate(new Date())}</span>
                    <span>{formatTime(new Date())}</span>
                  </div>
                </div>
              </CardContent>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </>
  );
}
