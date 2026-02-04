'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Trash2, Download, ChevronDown, ChevronUp, Maximize2, Minimize2, Monitor, Smartphone, Tablet, Globe, Clock, User, Server, Cpu, HardDrive, Wifi, MapPin, Shield, AlertTriangle, Info, CheckCircle, XCircle, Activity, Zap, Eye, Hash, Calendar, FileText, Lock, Unlock } from 'lucide-react';
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
  const [currentTime, setCurrentTime] = useState(new Date());
  const terminalRef = useRef<HTMLDivElement>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
      let entry = `════════════════════════════════════════════════════════════════\n`;
      entry += `📅 TIMESTAMP: ${log.timestamp.toISOString()}\n`;
      entry += `🏷️  TYPE: ${log.type.toUpperCase()}\n`;
      entry += `🎬 ACTION: ${log.action}\n`;
      entry += `📝 MESSAGE: ${log.message}\n`;
      if (log.user) entry += `👤 USER: ${log.user}\n`;
      if (log.details) entry += `📋 DETAILS: ${log.details}\n`;
      
      if (meta) {
        entry += `\n--- METADATA ---\n`;
        if (meta.ip) entry += `🌐 IP Address: ${meta.ip}\n`;
        if (meta.ipv6) entry += `🔗 IPv6: ${meta.ipv6}\n`;
        if (meta.location) entry += `📍 Location: ${meta.location}\n`;
        if (meta.country) entry += `🏳️ Country: ${meta.country}\n`;
        if (meta.city) entry += `🏙️ City: ${meta.city}\n`;
        if (meta.timezone) entry += `🕐 Timezone: ${meta.timezone}\n`;
        if (meta.browser) entry += `🌐 Browser: ${meta.browser} ${meta.browserVersion || ''}\n`;
        if (meta.os) entry += `💻 OS: ${meta.os} ${meta.osVersion || ''}\n`;
        if (meta.device) entry += `📱 Device: ${meta.device}\n`;
        if (meta.deviceType) entry += `📲 Device Type: ${meta.deviceType}\n`;
        if (meta.screenResolution) entry += `🖥️ Screen: ${meta.screenResolution}\n`;
        if (meta.colorDepth) entry += `🎨 Color Depth: ${meta.colorDepth}\n`;
        if (meta.language) entry += `🌍 Language: ${meta.language}\n`;
        if (meta.platform) entry += `⚙️ Platform: ${meta.platform}\n`;
        if (meta.vendor) entry += `🏭 Vendor: ${meta.vendor}\n`;
        if (meta.cpuCores) entry += `🔧 CPU Cores: ${meta.cpuCores}\n`;
        if (meta.memory) entry += `💾 Memory: ${meta.memory}GB\n`;
        if (meta.connection) entry += `📡 Connection: ${meta.connection}\n`;
        if (meta.touchSupport !== undefined) entry += `👆 Touch: ${meta.touchSupport ? 'Yes' : 'No'}\n`;
        if (meta.cookiesEnabled !== undefined) entry += `🍪 Cookies: ${meta.cookiesEnabled ? 'Enabled' : 'Disabled'}\n`;
        if (meta.sessionId) entry += `🔑 Session: ${meta.sessionId}\n`;
        if (meta.isSuperAdmin !== undefined) entry += `👑 Super Admin: ${meta.isSuperAdmin ? 'Yes' : 'No'}\n`;
        if (meta.role) entry += `🎭 Role: ${meta.role}\n`;
        if (meta.fileName) entry += `📄 File: ${meta.fileName}\n`;
        if (meta.fileSize) entry += `📏 Size: ${meta.fileSize}\n`;
        if (meta.fileType) entry += `📂 Type: ${meta.fileType}\n`;
        if (meta.path) entry += `📁 Path: ${meta.path}\n`;
        if (meta.statusCode) entry += `🔢 Status: ${meta.statusCode}\n`;
        if (meta.responseTime) entry += `⏱️ Response: ${meta.responseTime}\n`;
        if (meta.referrer) entry += `🔗 Referrer: ${meta.referrer}\n`;
        if (meta.pageUrl) entry += `📎 URL: ${meta.pageUrl}\n`;
        if (meta.userAgent) entry += `🤖 User Agent: ${meta.userAgent}\n`;
      }
      return entry;
    }).join('\n');
    
    const header = `╔══════════════════════════════════════════════════════════════════╗
║            FUTURE POINT COACHING - ADMIN SYSTEM LOGS             ║
║              Generated: ${new Date().toISOString()}             ║
╚══════════════════════════════════════════════════════════════════╝\n\n`;
    
    const blob = new Blob([header + logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FP-admin-logs-${new Date().toISOString().split('T')[0]}_${Date.now()}.txt`;
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
      case 'success': return 'bg-green-500/10 border-l-green-500 hover:bg-green-500/15';
      case 'error': return 'bg-red-500/10 border-l-red-500 hover:bg-red-500/15';
      case 'warning': return 'bg-yellow-500/10 border-l-yellow-500 hover:bg-yellow-500/15';
      default: return 'bg-cyan-500/10 border-l-cyan-500 hover:bg-cyan-500/15';
    }
  };

  const getTypeIcon = (type: AdminLog['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'error': return <XCircle className="w-3 h-3 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-3 h-3 text-yellow-400" />;
      default: return <Info className="w-3 h-3 text-cyan-400" />;
    }
  };

  const getActionIcon = (action: AdminLog['action']) => {
    switch (action) {
      case 'LOGIN': return '🔐';
      case 'LOGOUT': return '🚪';
      case 'UPLOAD': return '📤';
      case 'DELETE': return '🗑️';
      case 'ADMIN_ADD': return '👤';
      case 'ADMIN_REMOVE': return '🚫';
      case 'SYSTEM': return '⚙️';
      case 'SESSION': return '🔄';
      case 'ACCESS': return '🌐';
      case 'SECURITY': return '🛡️';
      case 'ERROR': return '❌';
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

  const formatFullTime = (date: Date) => {
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const filteredLogs: AdminLog[] = filter === 'all' 
    ? logs 
    : logs.filter((log: AdminLog) => log.action === filter || log.type === filter);

  // Stats
  const stats = {
    total: logs.length,
    success: logs.filter(l => l.type === 'success').length,
    errors: logs.filter(l => l.type === 'error').length,
    warnings: logs.filter(l => l.type === 'warning').length,
    logins: logs.filter(l => l.action === 'LOGIN').length,
    uploads: logs.filter(l => l.action === 'UPLOAD').length,
  };

  const containerClass = fullscreen 
    ? 'fixed inset-4 z-50 flex flex-col' 
    : className;

  return (
    <>
      {/* Fullscreen backdrop */}
      {fullscreen && (
        <div className="fixed inset-0 bg-black/90 z-40" onClick={() => setFullscreen(false)} />
      )}
      
      <Card className={`overflow-hidden ${containerClass}`}>
        <CardHeader className="py-2 px-3 bg-gradient-to-r from-[#1a1b26] to-[#24283b] border-b border-white/10 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div 
              className="flex items-center gap-2 cursor-pointer select-none"
              onClick={() => !fullscreen && setExpanded(!expanded)}
            >
              {/* Terminal window buttons */}
              <div className="flex items-center gap-1.5 mr-2">
                <span className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-400 transition-colors cursor-pointer" title="Close" />
                <span className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-400 transition-colors cursor-pointer" title="Minimize" />
                <span className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-400 transition-colors cursor-pointer" title="Maximize" />
              </div>
              
              <Terminal className="w-4 h-4 text-green-400" />
              <h2 className="text-xs font-mono font-semibold text-gray-300">
                root@futurepoint:~$ system.logs --verbose --realtime
              </h2>
              <span className="text-[10px] text-green-400 font-mono bg-green-500/20 px-1.5 py-0.5 rounded">
                {filteredLogs.length}
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
                className="h-6 px-2 text-[10px] bg-navy-800 border border-white/10 rounded text-gray-400 font-mono focus:ring-1 focus:ring-green-500"
              >
                <option value="all">📋 All Logs ({logs.length})</option>
                <option value="LOGIN">🔐 Login ({stats.logins})</option>
                <option value="LOGOUT">🚪 Logout</option>
                <option value="UPLOAD">📤 Upload ({stats.uploads})</option>
                <option value="DELETE">🗑️ Delete</option>
                <option value="ADMIN_ADD">👤 Admin Add</option>
                <option value="ADMIN_REMOVE">🚫 Admin Remove</option>
                <option value="SYSTEM">⚙️ System</option>
                <option value="SECURITY">🛡️ Security</option>
                <option value="success">✅ Success ({stats.success})</option>
                <option value="error">❌ Errors ({stats.errors})</option>
                <option value="warning">⚠️ Warnings ({stats.warnings})</option>
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
                    className={`flex-1 bg-[#0d1117] font-mono text-[11px] overflow-y-auto p-2 space-y-1.5 ${
                      fullscreen ? 'max-h-full' : 'max-h-96 min-h-[250px]'
                    }`}
                  >
                    {filteredLogs.length === 0 ? (
                      <div className="text-gray-600 flex flex-col items-center gap-2 py-12 justify-center">
                        <Terminal className="w-10 h-10 opacity-50" />
                        <span className="text-gray-500">Waiting for system events...</span>
                        <span className="text-[10px] text-gray-600">All admin actions will be logged here in real-time</span>
                        <div className="flex items-center gap-2 mt-2 text-[10px]">
                          <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Success</span>
                          <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500" /> Error</span>
                          <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-yellow-500" /> Warning</span>
                          <span className="flex items-center gap-1"><Info className="w-3 h-3 text-cyan-500" /> Info</span>
                        </div>
                      </div>
                    ) : (
                      filteredLogs.map((log: AdminLog, index: number) => (
                        <motion.div
                          key={log.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(index * 0.02, 0.5) }}
                          onClick={() => setSelectedLog(selectedLog?.id === log.id ? null : log)}
                          className={`border-l-2 pl-2 py-2 cursor-pointer transition-all rounded-r ${getLogBg(log.type)} ${
                            selectedLog?.id === log.id ? 'ring-1 ring-white/20' : ''
                          }`}
                        >
                          {/* Main log line */}
                          <div className="flex items-start gap-2">
                            <span className="text-gray-600 select-none flex-shrink-0 w-16 text-[10px]">
                              {formatTime(log.timestamp)}
                            </span>
                            <span className="select-none w-5 text-center">
                              {getActionIcon(log.action)}
                            </span>
                            {getTypeIcon(log.type)}
                            <span className={`font-bold ${getLogColor(log.type)} w-14 flex-shrink-0 text-[10px]`}>
                              [{log.type.toUpperCase()}]
                            </span>
                            <span className="text-purple-400 w-24 flex-shrink-0 truncate text-[10px] bg-purple-500/10 px-1 rounded">
                              {log.action}
                            </span>
                            <span className="text-gray-200 flex-1">
                              {log.message}
                            </span>
                            {log.user && (
                              <span className="text-blue-400 flex-shrink-0 bg-blue-500/20 px-1.5 rounded text-[10px]">
                                @{log.user}
                              </span>
                            )}
                            <Eye className={`w-3 h-3 ${selectedLog?.id === log.id ? 'text-white' : 'text-gray-600'}`} />
                          </div>
                          
                          {/* Quick metadata line */}
                          {log.metadata && (
                            <div className="flex items-center gap-2 mt-1.5 ml-[88px] text-[9px] text-gray-500 flex-wrap">
                              {log.metadata.ip && (
                                <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                                  <Globe className="w-2.5 h-2.5 text-green-400" />
                                  <span className="text-green-400">{log.metadata.ip}</span>
                                </span>
                              )}
                              {log.metadata.location && (
                                <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                                  <MapPin className="w-2.5 h-2.5 text-orange-400" />
                                  <span className="text-orange-400">{log.metadata.location}</span>
                                </span>
                              )}
                              {log.metadata.browser && (
                                <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                                  {getDeviceIcon(log.metadata.device)}
                                  <span>{log.metadata.browser}</span>
                                  {log.metadata.browserVersion && <span className="text-gray-600">v{log.metadata.browserVersion}</span>}
                                </span>
                              )}
                              {log.metadata.os && (
                                <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                                  <Server className="w-2.5 h-2.5" />
                                  <span>{log.metadata.os}</span>
                                </span>
                              )}
                              {log.metadata.isSuperAdmin !== undefined && (
                                <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${log.metadata.isSuperAdmin ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                  {log.metadata.isSuperAdmin ? <Shield className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                                  {log.metadata.isSuperAdmin ? 'SUPER ADMIN' : 'ADMIN'}
                                </span>
                              )}
                              {log.metadata.responseTime && (
                                <span className="flex items-center gap-1 bg-white/5 px-1.5 py-0.5 rounded">
                                  <Zap className="w-2.5 h-2.5 text-yellow-400" />
                                  <span className="text-yellow-400">{log.metadata.responseTime}</span>
                                </span>
                              )}
                            </div>
                          )}
                          
                          {/* Expanded details panel */}
                          <AnimatePresence>
                            {selectedLog?.id === log.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-3 ml-[88px] p-3 bg-black/50 rounded-lg border border-white/10 text-[10px] space-y-2"
                              >
                                {/* Header */}
                                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                                  <Hash className="w-3 h-3 text-gray-500" />
                                  <span className="text-gray-500">Log ID:</span>
                                  <span className="text-gray-400 font-mono">{log.id}</span>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                                  {/* Time & Date */}
                                  <div className="flex items-center gap-2">
                                    <Calendar className="w-3 h-3 text-blue-400" />
                                    <span className="text-gray-500">Full Timestamp:</span>
                                    <span className="text-blue-300">{formatFullTime(log.timestamp)}</span>
                                  </div>
                                  
                                  {/* User */}
                                  {log.user && (
                                    <div className="flex items-center gap-2">
                                      <User className="w-3 h-3 text-blue-400" />
                                      <span className="text-gray-500">User:</span>
                                      <span className="text-blue-400 font-semibold">@{log.user}</span>
                                    </div>
                                  )}

                                  {/* IP Address */}
                                  {log.metadata?.ip && (
                                    <div className="flex items-center gap-2">
                                      <Globe className="w-3 h-3 text-green-400" />
                                      <span className="text-gray-500">IP Address:</span>
                                      <span className="text-green-400 font-mono">{log.metadata.ip}</span>
                                    </div>
                                  )}

                                  {/* Location */}
                                  {log.metadata?.location && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-3 h-3 text-orange-400" />
                                      <span className="text-gray-500">Location:</span>
                                      <span className="text-orange-400">{log.metadata.location}</span>
                                    </div>
                                  )}

                                  {/* Country & City */}
                                  {log.metadata?.country && (
                                    <div className="flex items-center gap-2">
                                      <Globe className="w-3 h-3 text-purple-400" />
                                      <span className="text-gray-500">Country:</span>
                                      <span className="text-purple-400">{log.metadata.country}</span>
                                    </div>
                                  )}

                                  {log.metadata?.city && (
                                    <div className="flex items-center gap-2">
                                      <MapPin className="w-3 h-3 text-pink-400" />
                                      <span className="text-gray-500">City:</span>
                                      <span className="text-pink-400">{log.metadata.city}</span>
                                    </div>
                                  )}

                                  {/* Timezone */}
                                  {log.metadata?.timezone && (
                                    <div className="flex items-center gap-2">
                                      <Clock className="w-3 h-3 text-cyan-400" />
                                      <span className="text-gray-500">Timezone:</span>
                                      <span className="text-cyan-400">{log.metadata.timezone}</span>
                                    </div>
                                  )}

                                  {/* Browser */}
                                  {log.metadata?.browser && (
                                    <div className="flex items-center gap-2">
                                      <Monitor className="w-3 h-3 text-blue-400" />
                                      <span className="text-gray-500">Browser:</span>
                                      <span className="text-gray-300">{log.metadata.browser} {log.metadata.browserVersion && `v${log.metadata.browserVersion}`}</span>
                                    </div>
                                  )}

                                  {/* OS */}
                                  {log.metadata?.os && (
                                    <div className="flex items-center gap-2">
                                      <Server className="w-3 h-3 text-emerald-400" />
                                      <span className="text-gray-500">Operating System:</span>
                                      <span className="text-gray-300">{log.metadata.os} {log.metadata.osVersion || ''}</span>
                                    </div>
                                  )}

                                  {/* Device */}
                                  {log.metadata?.device && (
                                    <div className="flex items-center gap-2">
                                      {getDeviceIcon(log.metadata.device)}
                                      <span className="text-gray-500">Device:</span>
                                      <span className="text-gray-300">{log.metadata.device} {log.metadata.deviceType && `(${log.metadata.deviceType})`}</span>
                                    </div>
                                  )}

                                  {/* Screen Resolution */}
                                  {log.metadata?.screenResolution && (
                                    <div className="flex items-center gap-2">
                                      <Monitor className="w-3 h-3 text-indigo-400" />
                                      <span className="text-gray-500">Screen:</span>
                                      <span className="text-indigo-400">{log.metadata.screenResolution}</span>
                                    </div>
                                  )}

                                  {/* Language */}
                                  {log.metadata?.language && (
                                    <div className="flex items-center gap-2">
                                      <Globe className="w-3 h-3 text-teal-400" />
                                      <span className="text-gray-500">Language:</span>
                                      <span className="text-teal-400">{log.metadata.language}</span>
                                    </div>
                                  )}

                                  {/* Platform */}
                                  {log.metadata?.platform && (
                                    <div className="flex items-center gap-2">
                                      <Cpu className="w-3 h-3 text-rose-400" />
                                      <span className="text-gray-500">Platform:</span>
                                      <span className="text-rose-400">{log.metadata.platform}</span>
                                    </div>
                                  )}

                                  {/* CPU Cores */}
                                  {log.metadata?.cpuCores && (
                                    <div className="flex items-center gap-2">
                                      <Cpu className="w-3 h-3 text-amber-400" />
                                      <span className="text-gray-500">CPU Cores:</span>
                                      <span className="text-amber-400">{log.metadata.cpuCores}</span>
                                    </div>
                                  )}

                                  {/* Memory */}
                                  {log.metadata?.memory && (
                                    <div className="flex items-center gap-2">
                                      <HardDrive className="w-3 h-3 text-lime-400" />
                                      <span className="text-gray-500">Device Memory:</span>
                                      <span className="text-lime-400">{log.metadata.memory}GB</span>
                                    </div>
                                  )}

                                  {/* Connection */}
                                  {log.metadata?.connection && (
                                    <div className="flex items-center gap-2">
                                      <Wifi className="w-3 h-3 text-sky-400" />
                                      <span className="text-gray-500">Connection:</span>
                                      <span className="text-sky-400">{log.metadata.connection}</span>
                                    </div>
                                  )}

                                  {/* Touch Support */}
                                  {log.metadata?.touchSupport !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <Activity className="w-3 h-3 text-violet-400" />
                                      <span className="text-gray-500">Touch:</span>
                                      <span className={log.metadata.touchSupport ? 'text-green-400' : 'text-red-400'}>
                                        {log.metadata.touchSupport ? 'Supported' : 'Not Supported'}
                                      </span>
                                    </div>
                                  )}

                                  {/* Cookies */}
                                  {log.metadata?.cookiesEnabled !== undefined && (
                                    <div className="flex items-center gap-2">
                                      {log.metadata.cookiesEnabled ? <Unlock className="w-3 h-3 text-green-400" /> : <Lock className="w-3 h-3 text-red-400" />}
                                      <span className="text-gray-500">Cookies:</span>
                                      <span className={log.metadata.cookiesEnabled ? 'text-green-400' : 'text-red-400'}>
                                        {log.metadata.cookiesEnabled ? 'Enabled' : 'Disabled'}
                                      </span>
                                    </div>
                                  )}

                                  {/* Role */}
                                  {log.metadata?.role && (
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-3 h-3 text-yellow-400" />
                                      <span className="text-gray-500">Role:</span>
                                      <span className="text-yellow-400 font-semibold">{log.metadata.role}</span>
                                    </div>
                                  )}

                                  {/* Super Admin */}
                                  {log.metadata?.isSuperAdmin !== undefined && (
                                    <div className="flex items-center gap-2">
                                      <Shield className="w-3 h-3 text-yellow-400" />
                                      <span className="text-gray-500">Super Admin:</span>
                                      <span className={log.metadata.isSuperAdmin ? 'text-yellow-400 font-bold' : 'text-gray-400'}>
                                        {log.metadata.isSuperAdmin ? '✓ YES' : '✗ NO'}
                                      </span>
                                    </div>
                                  )}

                                  {/* Response Time */}
                                  {log.metadata?.responseTime && (
                                    <div className="flex items-center gap-2">
                                      <Zap className="w-3 h-3 text-yellow-400" />
                                      <span className="text-gray-500">Response Time:</span>
                                      <span className="text-yellow-400">{log.metadata.responseTime}</span>
                                    </div>
                                  )}

                                  {/* Status Code */}
                                  {log.metadata?.statusCode && (
                                    <div className="flex items-center gap-2">
                                      <Activity className="w-3 h-3" />
                                      <span className="text-gray-500">Status Code:</span>
                                      <span className={log.metadata.statusCode < 400 ? 'text-green-400' : 'text-red-400'}>
                                        {log.metadata.statusCode}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {/* File Info */}
                                {log.metadata?.fileName && (
                                  <div className="pt-2 border-t border-white/5 space-y-1">
                                    <div className="flex items-center gap-2">
                                      <FileText className="w-3 h-3 text-orange-400" />
                                      <span className="text-gray-500">File:</span>
                                      <span className="text-orange-400">{log.metadata.fileName}</span>
                                      {log.metadata.fileSize && (
                                        <span className="text-gray-500">({log.metadata.fileSize})</span>
                                      )}
                                      {log.metadata.fileType && (
                                        <span className="text-gray-600 bg-white/5 px-1 rounded">{log.metadata.fileType}</span>
                                      )}
                                    </div>
                                    {log.metadata.path && (
                                      <div className="flex items-center gap-2 text-[9px]">
                                        <span className="text-gray-500">Path:</span>
                                        <span className="text-gray-400 font-mono bg-black/30 px-1 rounded">{log.metadata.path}</span>
                                      </div>
                                    )}
                                  </div>
                                )}

                                {/* Session Info */}
                                {log.metadata?.sessionId && (
                                  <div className="pt-2 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                      <Hash className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-500">Session ID:</span>
                                      <span className="text-gray-400 font-mono text-[9px] bg-black/30 px-1 rounded">{log.metadata.sessionId}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Details */}
                                {log.details && (
                                  <div className="pt-2 border-t border-white/5">
                                    <span className="text-gray-500">📋 Details: </span>
                                    <span className="text-gray-300">{log.details}</span>
                                  </div>
                                )}

                                {/* User Agent */}
                                {log.metadata?.userAgent && (
                                  <div className="pt-2 border-t border-white/5">
                                    <span className="text-gray-500">🤖 User Agent: </span>
                                    <span className="text-gray-600 text-[8px] break-all font-mono">{log.metadata.userAgent}</span>
                                  </div>
                                )}

                                {/* Referrer */}
                                {log.metadata?.referrer && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-gray-500">🔗 Referrer:</span>
                                    <span className="text-gray-400 text-[9px]">{log.metadata.referrer}</span>
                                  </div>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      ))
                    )}
                    
                    {/* Terminal cursor line */}
                    <div className="flex items-center gap-2 mt-3 text-green-400 pt-3 border-t border-white/10">
                      <span className="text-green-500">root@futurepoint</span>
                      <span className="text-gray-500">:</span>
                      <span className="text-blue-400">~</span>
                      <span className="text-gray-500">$</span>
                      <span className="animate-pulse text-green-400">▋</span>
                    </div>
                  </div>
                </div>
                
                {/* Enhanced Status bar */}
                <div className="bg-gradient-to-r from-[#1a1b26] to-[#24283b] border-t border-white/10 px-3 py-1.5 flex items-center justify-between text-[10px] text-gray-500 font-mono">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                      </span>
                      <span className="text-green-400">LIVE</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Activity className="w-3 h-3" />
                      {filteredLogs.length} entries
                    </span>
                    <span className="hidden md:flex items-center gap-1 text-green-500">
                      <CheckCircle className="w-3 h-3" />
                      {stats.success}
                    </span>
                    <span className="hidden md:flex items-center gap-1 text-red-500">
                      <XCircle className="w-3 h-3" />
                      {stats.errors}
                    </span>
                    <span className="hidden md:flex items-center gap-1 text-yellow-500">
                      <AlertTriangle className="w-3 h-3" />
                      {stats.warnings}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="hidden md:block text-gray-600">{formatDate(currentTime)}</span>
                    <span className="text-cyan-400 tabular-nums">{formatTime(currentTime)}</span>
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
