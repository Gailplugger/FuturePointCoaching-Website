'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
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

interface CommandOutput {
  id: string;
  command: string;
  output: string[];
  type: 'success' | 'error' | 'info' | 'warning';
  timestamp: Date;
}

export function AdminLogsTerminal({ className = '', defaultExpanded = true }: AdminLogsTerminalProps) {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [expanded, setExpanded] = useState(true); // Always expanded
  const [fullscreen, setFullscreen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [filter, setFilter] = useState<string>('all');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [commandInput, setCommandInput] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [commandOutputs, setCommandOutputs] = useState<CommandOutput[]>([]);
  const [showCommandMode, setShowCommandMode] = useState(true); // START IN COMMAND MODE
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Load logs on mount and listen for updates
  useEffect(() => {
    loadLogs();
    setLogs(getLogs());

    const handleLogAdded = () => {
      setLogs(getLogs());
      if (terminalRef.current) {
        setTimeout(() => {
          terminalRef.current?.scrollTo({
            top: terminalRef.current.scrollHeight,
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

  // Focus input when command mode is enabled - multiple attempts
  useEffect(() => {
    if (showCommandMode && inputRef.current) {
      // Multiple focus attempts to ensure it works
      const focusInput = () => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      };
      
      // Immediate focus
      focusInput();
      
      // Delayed focus attempts
      setTimeout(focusInput, 50);
      setTimeout(focusInput, 150);
      setTimeout(focusInput, 300);
    }
  }, [showCommandMode]);

  // Continuous focus check when in command mode
  useEffect(() => {
    if (!showCommandMode) return;
    
    const focusInput = () => {
      if (inputRef.current && document.activeElement !== inputRef.current) {
        inputRef.current.focus();
      }
    };
    
    // Check focus every 200ms
    const interval = setInterval(focusInput, 200);
    
    // Also focus on window focus
    window.addEventListener('focus', focusInput);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', focusInput);
    };
  }, [showCommandMode]);

  // Scroll to bottom when outputs change
  useEffect(() => {
    if (terminalRef.current && showCommandMode) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commandOutputs, showCommandMode]);

  const addCommandOutput = (command: string, output: string[], type: CommandOutput['type'] = 'info') => {
    const newOutput: CommandOutput = {
      id: Date.now().toString(),
      command,
      output,
      type,
      timestamp: new Date()
    };
    setCommandOutputs((prev: CommandOutput[]) => [...prev, newOutput]);
  };

  // Process terminal commands
  const processCommand = (cmd: string) => {
    const trimmedCmd = cmd.trim().toLowerCase();
    const parts = trimmedCmd.split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);

    // Add to history
    if (cmd.trim()) {
      setCommandHistory((prev: string[]) => [...prev, cmd]);
    }
    setHistoryIndex(-1);

    switch (command) {
      case 'help':
      case '?':
        addCommandOutput(cmd, [
          '╔══════════════════════════════════════════════════════════════╗',
          '║        🖥️  FUTURE POINT ADMIN TERMINAL - HELP               ║',
          '╠══════════════════════════════════════════════════════════════╣',
          '║  📋 LIST COMMANDS:                                           ║',
          '║  ──────────────────────────────────────────────────────────  ║',
          '║  ls / list          - List all recent activity               ║',
          '║  ls logins          - Show all login events                  ║',
          '║  ls uploads         - Show all upload events                 ║',
          '║  ls errors          - Show all error events                  ║',
          '║  ls users           - List all unique users                  ║',
          '║  ls ips             - List all unique IP addresses           ║',
          '║                                                              ║',
          '║  🔍 DETAIL COMMANDS:                                         ║',
          '║  ──────────────────────────────────────────────────────────  ║',
          '║  dir <username>     - Show details for specific user         ║',
          '║  dir <ip>           - Show details for specific IP           ║',
          '║  show <log_id>      - Show full details of a log entry       ║',
          '║                                                              ║',
          '║  📊 INFO COMMANDS:                                           ║',
          '║  ──────────────────────────────────────────────────────────  ║',
          '║  stats              - Show statistics summary                ║',
          '║  whoami             - Show current admin info                ║',
          '║  uptime             - Show session uptime                    ║',
          '║  date / time        - Show current date/time                 ║',
          '║                                                              ║',
          '║  🔎 SEARCH COMMANDS:                                         ║',
          '║  ──────────────────────────────────────────────────────────  ║',
          '║  find <keyword>     - Search logs for keyword                ║',
          '║  grep <pattern>     - Search logs with pattern               ║',
          '║  tail [n]           - Show last n logs (default: 10)         ║',
          '║  head [n]           - Show first n logs (default: 10)        ║',
          '║                                                              ║',
          '║  ⚙️  UTILITY COMMANDS:                                        ║',
          '║  ──────────────────────────────────────────────────────────  ║',
          '║  export             - Export all logs to file                ║',
          '║  clear / cls        - Clear terminal output                  ║',
          '║  clearall           - Clear all logs (requires confirm)      ║',
          '║  exit               - Exit command mode                      ║',
          '║  help / ?           - Show this help message                 ║',
          '╚══════════════════════════════════════════════════════════════╝',
        ], 'info');
        break;

      case 'ls':
      case 'list':
        if (args[0] === 'logins' || args[0] === 'login') {
          const logins = logs.filter((l: AdminLog) => l.action === 'LOGIN');
          if (logins.length === 0) {
            addCommandOutput(cmd, ['⚠️ No login events found.'], 'warning');
          } else {
            const output = [
              `🔐 Found ${logins.length} login event(s):`,
              '═'.repeat(75),
              '  #  │ TIME     │ USER            │ IP ADDRESS      │ LOCATION',
              '─'.repeat(75),
              ...logins.map((l: AdminLog, i: number) => 
                `  ${(i + 1).toString().padStart(2)} │ ${formatTime(l.timestamp)} │ @${(l.user || 'unknown').padEnd(14)} │ ${(l.metadata?.ip || 'N/A').padEnd(15)} │ ${l.metadata?.location || 'Unknown'}`
              ),
              '═'.repeat(75),
              `💡 Use "dir <username>" for detailed user info`
            ];
            addCommandOutput(cmd, output, 'success');
          }
        } else if (args[0] === 'uploads' || args[0] === 'upload') {
          const uploads = logs.filter((l: AdminLog) => l.action === 'UPLOAD');
          if (uploads.length === 0) {
            addCommandOutput(cmd, ['⚠️ No upload events found.'], 'warning');
          } else {
            const output = [
              `📤 Found ${uploads.length} upload event(s):`,
              '═'.repeat(80),
              '  #  │ TIME     │ USER            │ FILE NAME                    │ SIZE',
              '─'.repeat(80),
              ...uploads.map((l: AdminLog, i: number) => 
                `  ${(i + 1).toString().padStart(2)} │ ${formatTime(l.timestamp)} │ @${(l.user || 'unknown').padEnd(14)} │ ${(l.metadata?.fileName || 'N/A').substring(0, 28).padEnd(28)} │ ${l.metadata?.fileSize || 'N/A'}`
              ),
              '═'.repeat(80),
            ];
            addCommandOutput(cmd, output, 'success');
          }
        } else if (args[0] === 'errors' || args[0] === 'error') {
          const errors = logs.filter((l: AdminLog) => l.type === 'error');
          if (errors.length === 0) {
            addCommandOutput(cmd, ['✅ No errors found. System running smoothly!'], 'success');
          } else {
            const output = [
              `❌ Found ${errors.length} error(s):`,
              '═'.repeat(80),
              ...errors.map((l: AdminLog, i: number) => 
                `  [${i + 1}] ${formatTime(l.timestamp)} │ ${l.action.padEnd(12)} │ ${l.message.substring(0, 50)}...`
              ),
              '═'.repeat(80),
            ];
            addCommandOutput(cmd, output, 'error');
          }
        } else if (args[0] === 'users' || args[0] === 'user') {
          const users: string[] = Array.from(new Set(logs.filter((l: AdminLog) => l.user).map((l: AdminLog) => l.user as string)));
          if (users.length === 0) {
            addCommandOutput(cmd, ['⚠️ No users found in logs.'], 'warning');
          } else {
            const output = [
              `👥 Found ${users.length} unique user(s):`,
              '═'.repeat(65),
              '  #  │ USERNAME         │ ACTIONS │ LAST ACTIVITY',
              '─'.repeat(65),
              ...users.map((u: string, i: number) => {
                const userLogs = logs.filter((l: AdminLog) => l.user === u);
                const lastLog = userLogs[0];
                return `  ${(i + 1).toString().padStart(2)} │ @${(u || '').padEnd(15)} │ ${userLogs.length.toString().padStart(7)} │ ${formatFullTime(lastLog.timestamp)}`;
              }),
              '═'.repeat(65),
              `💡 Use "dir <username>" for detailed user info`
            ];
            addCommandOutput(cmd, output, 'success');
          }
        } else if (args[0] === 'ips' || args[0] === 'ip') {
          const ips: string[] = Array.from(new Set(logs.filter((l: AdminLog) => l.metadata?.ip).map((l: AdminLog) => l.metadata?.ip as string)));
          if (ips.length === 0) {
            addCommandOutput(cmd, ['⚠️ No IP addresses found in logs.'], 'warning');
          } else {
            const output = [
              `🌐 Found ${ips.length} unique IP address(es):`,
              '═'.repeat(70),
              '  #  │ IP ADDRESS       │ LOCATION                    │ REQUESTS',
              '─'.repeat(70),
              ...ips.map((ip: string, i: number) => {
                const ipLogs = logs.filter((l: AdminLog) => l.metadata?.ip === ip);
                const location = ipLogs.find((l: AdminLog) => l.metadata?.location)?.metadata?.location || 'Unknown';
                return `  ${(i + 1).toString().padStart(2)} │ ${(ip || '').padEnd(16)} │ ${location.substring(0, 27).padEnd(27)} │ ${ipLogs.length.toString().padStart(8)}`;
              }),
              '═'.repeat(70),
              `💡 Use "dir <ip_address>" for detailed IP info`
            ];
            addCommandOutput(cmd, output, 'success');
          }
        } else {
          // Default: list all recent logs
          const recentLogs = logs.slice(0, 20);
          if (recentLogs.length === 0) {
            addCommandOutput(cmd, ['⚠️ No logs found. System is idle.'], 'warning');
          } else {
            const output = [
              `📋 Recent Activity (${logs.length} total logs):`,
              '═'.repeat(90),
              '  STATUS │ TIME     │ ACTION       │ USER            │ MESSAGE',
              '─'.repeat(90),
              ...recentLogs.map((l) => {
                const statusIcon = l.type === 'error' ? '❌' : l.type === 'warning' ? '⚠️' : l.type === 'success' ? '✅' : 'ℹ️';
                return `  ${statusIcon}     │ ${formatTime(l.timestamp)} │ ${l.action.padEnd(12)} │ @${(l.user || 'system').padEnd(14)} │ ${l.message.substring(0, 30)}`;
              }),
              '═'.repeat(90),
              `📊 Showing ${recentLogs.length} of ${logs.length} total │ Use "ls logins", "ls uploads", "ls users" for filtered view`
            ];
            addCommandOutput(cmd, output, 'info');
          }
        }
        break;

      case 'dir':
      case 'info':
      case 'details':
        if (!args[0]) {
          addCommandOutput(cmd, [
            '⚠️ Usage: dir <username> or dir <ip_address>',
            '',
            'Examples:',
            '  dir Gailplugger     - Show details for user "Gailplugger"',
            '  dir 192.168.1.1     - Show details for IP "192.168.1.1"'
          ], 'warning');
        } else {
          const searchTerm = args.join(' ').toLowerCase();
          // Check if it's an IP address
          const isIP = /^\d{1,3}(\.\d{1,3}){3}$/.test(args[0]) || args[0].includes('.');
          
          let matchedLogs: AdminLog[];
          if (isIP) {
            matchedLogs = logs.filter((l: AdminLog) => l.metadata?.ip?.toLowerCase().includes(searchTerm));
          } else {
            matchedLogs = logs.filter((l: AdminLog) => l.user?.toLowerCase().includes(searchTerm));
          }

          if (matchedLogs.length === 0) {
            addCommandOutput(cmd, [`❌ No logs found for "${args[0]}"`], 'error');
          } else {
            const firstLog = matchedLogs[matchedLogs.length - 1]; // Oldest
            const lastLog = matchedLogs[0]; // Most recent
            const meta = lastLog.metadata || {};
            
            const output = [
              '╔══════════════════════════════════════════════════════════════════════╗',
              `║  ${isIP ? '🌐 IP ADDRESS' : '👤 USER'} DETAILS: ${args[0].toUpperCase().padEnd(45)}║`,
              '╠══════════════════════════════════════════════════════════════════════╣',
              `║  📊 OVERVIEW                                                          ║`,
              `║  ────────────────────────────────────────────────────────────────────║`,
              `║  Total Actions: ${matchedLogs.length.toString().padEnd(53)}║`,
              `║  First Seen: ${formatFullTime(firstLog.timestamp).padEnd(56)}║`,
              `║  Last Seen: ${formatFullTime(lastLog.timestamp).padEnd(57)}║`,
              '╠══════════════════════════════════════════════════════════════════════╣',
              '║  📍 LOCATION & NETWORK                                               ║',
              `║  ────────────────────────────────────────────────────────────────────║`,
              `║  IP Address: ${(meta.ip || 'N/A').padEnd(56)}║`,
              `║  Location: ${(meta.location || 'Unknown').padEnd(58)}║`,
              `║  Country: ${(meta.country || 'N/A').padEnd(59)}║`,
              `║  City: ${(meta.city || 'N/A').padEnd(62)}║`,
              `║  Timezone: ${(meta.timezone || 'N/A').padEnd(58)}║`,
              `║  Connection: ${(meta.connection || 'N/A').padEnd(56)}║`,
              '╠══════════════════════════════════════════════════════════════════════╣',
              '║  💻 DEVICE & SYSTEM                                                  ║',
              `║  ────────────────────────────────────────────────────────────────────║`,
              `║  Browser: ${(meta.browser ? `${meta.browser} ${meta.browserVersion || ''}` : 'N/A').padEnd(59)}║`,
              `║  OS: ${(meta.os ? `${meta.os} ${meta.osVersion || ''}` : 'N/A').padEnd(64)}║`,
              `║  Device: ${(meta.device || 'N/A').padEnd(60)}║`,
              `║  Device Type: ${(meta.deviceType || 'N/A').padEnd(55)}║`,
              `║  Screen: ${(meta.screenResolution || 'N/A').padEnd(60)}║`,
              `║  Platform: ${(meta.platform || 'N/A').padEnd(58)}║`,
              `║  CPU Cores: ${(meta.cpuCores?.toString() || 'N/A').padEnd(57)}║`,
              `║  Memory: ${(meta.memory ? `${meta.memory}GB` : 'N/A').padEnd(60)}║`,
              `║  Language: ${(meta.language || 'N/A').padEnd(58)}║`,
              '╠══════════════════════════════════════════════════════════════════════╣',
              '║  🎯 ACTIVITY BREAKDOWN                                               ║',
              `║  ────────────────────────────────────────────────────────────────────║`,
              `║  🔐 Logins: ${matchedLogs.filter((l: AdminLog) => l.action === 'LOGIN').length.toString().padEnd(57)}║`,
              `║  📤 Uploads: ${matchedLogs.filter((l: AdminLog) => l.action === 'UPLOAD').length.toString().padEnd(56)}║`,
              `║  🗑️  Deletes: ${matchedLogs.filter((l: AdminLog) => l.action === 'DELETE').length.toString().padEnd(55)}║`,
              `║  ❌ Errors: ${matchedLogs.filter((l: AdminLog) => l.type === 'error').length.toString().padEnd(57)}║`,
              `║  ⚠️  Warnings: ${matchedLogs.filter((l: AdminLog) => l.type === 'warning').length.toString().padEnd(54)}║`,
              '╠══════════════════════════════════════════════════════════════════════╣',
              '║  📜 RECENT ACTIVITY (Last 5)                                         ║',
              `║  ────────────────────────────────────────────────────────────────────║`,
              ...matchedLogs.slice(0, 5).map((l: AdminLog) => 
                `║  • ${formatTime(l.timestamp)} │ ${l.action.padEnd(12)} │ ${l.message.substring(0, 40).padEnd(40)}║`
              ),
              '╚══════════════════════════════════════════════════════════════════════╝',
            ];
            addCommandOutput(cmd, output, 'success');
          }
        }
        break;

      case 'show':
        if (!args[0]) {
          addCommandOutput(cmd, ['⚠️ Usage: show <log_id>', '💡 Get log ID from "ls" command'], 'warning');
        } else {
          const log = logs.find(l => l.id === args[0] || l.id.startsWith(args[0]));
          if (!log) {
            addCommandOutput(cmd, [`❌ Log with ID "${args[0]}" not found.`], 'error');
          } else {
            const meta = log.metadata || {};
            const output = [
              '═'.repeat(70),
              `📋 LOG ENTRY DETAILS`,
              '═'.repeat(70),
              `ID: ${log.id}`,
              `Timestamp: ${log.timestamp.toISOString()}`,
              `Type: ${log.type.toUpperCase()}`,
              `Action: ${log.action}`,
              `User: ${log.user || 'N/A'}`,
              `Message: ${log.message}`,
              log.details ? `Details: ${log.details}` : '',
              '─'.repeat(70),
              '📊 METADATA:',
              `  🌐 IP: ${meta.ip || 'N/A'}`,
              `  📍 Location: ${meta.location || 'N/A'}`,
              `  🏳️ Country: ${meta.country || 'N/A'}`,
              `  🏙️ City: ${meta.city || 'N/A'}`,
              `  🌐 Browser: ${meta.browser || 'N/A'} ${meta.browserVersion || ''}`,
              `  💻 OS: ${meta.os || 'N/A'} ${meta.osVersion || ''}`,
              `  📱 Device: ${meta.device || 'N/A'}`,
              `  🖥️ Screen: ${meta.screenResolution || 'N/A'}`,
              `  🔑 Session: ${meta.sessionId || 'N/A'}`,
              meta.userAgent ? `  🤖 User Agent: ${meta.userAgent}` : '',
              '═'.repeat(70),
            ].filter(Boolean);
            addCommandOutput(cmd, output, 'info');
          }
        }
        break;

      case 'stats':
      case 'statistics':
        const totalLogs = logs.length;
        const loginCount = logs.filter((l: AdminLog) => l.action === 'LOGIN').length;
        const uploadCount = logs.filter((l: AdminLog) => l.action === 'UPLOAD').length;
        const deleteCount = logs.filter((l: AdminLog) => l.action === 'DELETE').length;
        const errorCount = logs.filter((l: AdminLog) => l.type === 'error').length;
        const warningCount = logs.filter((l: AdminLog) => l.type === 'warning').length;
        const successCount = logs.filter((l: AdminLog) => l.type === 'success').length;
        const uniqueUsers = Array.from(new Set(logs.filter((l: AdminLog) => l.user).map((l: AdminLog) => l.user))).length;
        const uniqueIPs = Array.from(new Set(logs.filter((l: AdminLog) => l.metadata?.ip).map((l: AdminLog) => l.metadata?.ip))).length;
        
        const healthStatus = errorCount > 10 ? '🔴 CRITICAL' : errorCount > 5 ? '🟡 ATTENTION' : '🟢 HEALTHY';
        
        addCommandOutput(cmd, [
          '╔══════════════════════════════════════════════════════════════╗',
          '║                   📊 SYSTEM STATISTICS                       ║',
          '╠══════════════════════════════════════════════════════════════╣',
          '║  📈 OVERVIEW                                                 ║',
          '║  ──────────────────────────────────────────────────────────  ║',
          `║  Total Log Entries: ${totalLogs.toString().padEnd(39)}║`,
          `║  Unique Users: ${uniqueUsers.toString().padEnd(44)}║`,
          `║  Unique IP Addresses: ${uniqueIPs.toString().padEnd(37)}║`,
          '╠══════════════════════════════════════════════════════════════╣',
          '║  🎯 EVENTS BY TYPE                                           ║',
          '║  ──────────────────────────────────────────────────────────  ║',
          `║  ✅ Success: ${successCount.toString().padEnd(46)}║`,
          `║  ℹ️  Info: ${(totalLogs - successCount - errorCount - warningCount).toString().padEnd(49)}║`,
          `║  ⚠️  Warnings: ${warningCount.toString().padEnd(44)}║`,
          `║  ❌ Errors: ${errorCount.toString().padEnd(47)}║`,
          '╠══════════════════════════════════════════════════════════════╣',
          '║  📊 EVENTS BY ACTION                                         ║',
          '║  ──────────────────────────────────────────────────────────  ║',
          `║  🔐 Logins: ${loginCount.toString().padEnd(47)}║`,
          `║  📤 Uploads: ${uploadCount.toString().padEnd(46)}║`,
          `║  🗑️  Deletes: ${deleteCount.toString().padEnd(45)}║`,
          '╠══════════════════════════════════════════════════════════════╣',
          `║  System Status: ${healthStatus.padEnd(43)}║`,
          '╚══════════════════════════════════════════════════════════════╝',
        ], errorCount > 5 ? 'warning' : 'success');
        break;

      case 'whoami':
        try {
          const adminData = sessionStorage.getItem('admin_user');
          if (adminData) {
            const admin = JSON.parse(adminData);
            addCommandOutput(cmd, [
              '╔══════════════════════════════════════════════════════════════╗',
              '║                      👤 CURRENT USER                         ║',
              '╠══════════════════════════════════════════════════════════════╣',
              `║  Username: @${(admin.username || 'Unknown').padEnd(47)}║`,
              `║  Role: ${(admin.isSuperAdmin ? '👑 SUPER ADMIN' : '🔑 ADMIN').padEnd(52)}║`,
              `║  Status: ${'🟢 ACTIVE SESSION'.padEnd(51)}║`,
              `║  Avatar: ${(admin.avatar ? '✓ Loaded' : '✗ Not Set').padEnd(50)}║`,
              '╚══════════════════════════════════════════════════════════════╝',
            ], 'success');
          } else {
            addCommandOutput(cmd, ['❌ Not logged in or session expired.'], 'error');
          }
        } catch {
          addCommandOutput(cmd, ['❌ Unable to retrieve user information.'], 'error');
        }
        break;

      case 'uptime':
        try {
          const loginTime = sessionStorage.getItem('fp_login_time');
          if (loginTime) {
            const startTime = parseInt(loginTime);
            const uptimeMs = Date.now() - startTime;
            const hours = Math.floor(uptimeMs / (1000 * 60 * 60));
            const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000);
            addCommandOutput(cmd, [
              '╔══════════════════════════════════════════════════════════════╗',
              '║                      🕐 SESSION UPTIME                       ║',
              '╠══════════════════════════════════════════════════════════════╣',
              `║  Uptime: ${`${hours}h ${minutes}m ${seconds}s`.padEnd(50)}║`,
              `║  Session Started: ${new Date(startTime).toLocaleString().padEnd(41)}║`,
              `║  Current Time: ${new Date().toLocaleString().padEnd(44)}║`,
              '╚══════════════════════════════════════════════════════════════╝',
            ], 'info');
          } else {
            addCommandOutput(cmd, ['⚠️ Session start time not available.'], 'warning');
          }
        } catch {
          addCommandOutput(cmd, ['❌ Unable to calculate uptime.'], 'error');
        }
        break;

      case 'date':
      case 'time':
      case 'now':
        addCommandOutput(cmd, [
          '╔══════════════════════════════════════════════════════════════╗',
          '║                      📅 DATE & TIME                          ║',
          '╠══════════════════════════════════════════════════════════════╣',
          `║  📅 Date: ${currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }).padEnd(49)}║`,
          `║  🕐 Time: ${currentTime.toLocaleTimeString('en-US', { hour12: true }).padEnd(49)}║`,
          `║  🌍 Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone.padEnd(45)}║`,
          `║  📆 ISO: ${currentTime.toISOString().padEnd(50)}║`,
          `║  ⏱️ Unix: ${Math.floor(currentTime.getTime() / 1000).toString().padEnd(49)}║`,
          '╚══════════════════════════════════════════════════════════════╝',
        ], 'info');
        break;

      case 'find':
      case 'search':
        if (!args[0]) {
          addCommandOutput(cmd, ['⚠️ Usage: find <keyword>', 'Example: find login', 'Example: find error'], 'warning');
        } else {
          const keyword = args.join(' ').toLowerCase();
          const found = logs.filter((l: AdminLog) => 
            l.message.toLowerCase().includes(keyword) ||
            l.user?.toLowerCase().includes(keyword) ||
            l.action.toLowerCase().includes(keyword) ||
            l.details?.toLowerCase().includes(keyword)
          );
          if (found.length === 0) {
            addCommandOutput(cmd, [`❌ No logs found matching "${args.join(' ')}"`], 'warning');
          } else {
            addCommandOutput(cmd, [
              `🔍 Found ${found.length} log(s) matching "${args.join(' ')}":`,
              '═'.repeat(75),
              ...found.slice(0, 20).map((l: AdminLog, i: number) => 
                `  [${(i + 1).toString().padStart(2)}] ${formatTime(l.timestamp)} │ ${l.action.padEnd(12)} │ ${l.message.substring(0, 40)}...`
              ),
              found.length > 20 ? `  ... and ${found.length - 20} more results` : '',
              '═'.repeat(75),
            ].filter(Boolean), 'success');
          }
        }
        break;

      case 'grep':
        if (!args[0]) {
          addCommandOutput(cmd, ['⚠️ Usage: grep <pattern>', 'Example: grep error', 'Example: grep ^login'], 'warning');
        } else {
          try {
            const pattern = new RegExp(args.join(' '), 'i');
            const found = logs.filter((l: AdminLog) => 
              pattern.test(l.message) || 
              pattern.test(l.user || '') ||
              pattern.test(l.action)
            );
            if (found.length === 0) {
              addCommandOutput(cmd, [`❌ No logs matching pattern "${args.join(' ')}"`], 'warning');
            } else {
              addCommandOutput(cmd, [
                `🔍 grep: ${found.length} match(es) for /${args.join(' ')}/i`,
                '═'.repeat(70),
                ...found.slice(0, 15).map((l: AdminLog) => 
                  `  ${formatTime(l.timestamp)} │ ${l.action.padEnd(12)} │ ${l.message.substring(0, 45)}`
                ),
                found.length > 15 ? `  ... and ${found.length - 15} more` : '',
                '═'.repeat(70),
              ].filter(Boolean), 'success');
            }
          } catch {
            addCommandOutput(cmd, ['❌ Invalid regex pattern.'], 'error');
          }
        }
        break;

      case 'tail':
        const tailCount = parseInt(args[0]) || 10;
        const tailLogs = logs.slice(0, tailCount);
        addCommandOutput(cmd, [
          `📋 Last ${tailLogs.length} log(s):`,
          '═'.repeat(75),
          ...tailLogs.map(l => 
            `  ${formatTime(l.timestamp)} │ ${l.action.padEnd(12)} │ ${l.message.substring(0, 45)}`
          ),
          '═'.repeat(75),
        ], 'info');
        break;

      case 'head':
        const headCount = parseInt(args[0]) || 10;
        const headLogs = logs.slice(-headCount).reverse();
        addCommandOutput(cmd, [
          `📋 First ${headLogs.length} log(s):`,
          '═'.repeat(75),
          ...headLogs.map(l => 
            `  ${formatTime(l.timestamp)} │ ${l.action.padEnd(12)} │ ${l.message.substring(0, 45)}`
          ),
          '═'.repeat(75),
        ], 'info');
        break;

      case 'export':
        handleExport();
        addCommandOutput(cmd, ['✅ Logs exported successfully! Check your downloads folder.'], 'success');
        break;

      case 'clear':
      case 'cls':
        setCommandOutputs([]);
        break;

      case 'clearall':
        addCommandOutput(cmd, [
          '⚠️ WARNING: This will permanently delete ALL logs!',
          '',
          'Type "confirm clearall" to proceed.',
          'Type "cancel" to abort.'
        ], 'warning');
        break;

      case 'confirm':
        if (args[0] === 'clearall') {
          clearLogs();
          setCommandOutputs([]);
          addCommandOutput('clearall', ['✅ All logs have been cleared.'], 'success');
        }
        break;

      case 'cancel':
        addCommandOutput(cmd, ['Operation cancelled.'], 'info');
        break;

      case 'exit':
      case 'quit':
      case 'q':
        setShowCommandMode(false);
        setCommandOutputs([]);
        break;

      case '':
        break;

      default:
        addCommandOutput(cmd, [
          `❌ Unknown command: "${command}"`,
          '',
          '💡 Type "help" or "?" to see available commands.'
        ], 'error');
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      processCommand(commandInput);
      setCommandInput('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex < commandHistory.length - 1 ? historyIndex + 1 : historyIndex;
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCommandInput(commandHistory[commandHistory.length - 1 - newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCommandInput('');
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      // Tab completion
      const commands = ['help', 'ls', 'list', 'dir', 'show', 'stats', 'whoami', 'uptime', 'date', 'time', 'find', 'grep', 'tail', 'head', 'export', 'clear', 'cls', 'clearall', 'exit', 'quit'];
      const matching = commands.filter(c => c.startsWith(commandInput.toLowerCase()));
      if (matching.length === 1) {
        setCommandInput(matching[0]);
      } else if (matching.length > 1) {
        addCommandOutput(commandInput, [`Suggestions: ${matching.join(', ')}`], 'info');
      }
    } else if (e.key === 'Escape') {
      setShowCommandMode(false);
    }
  };

  const getActionEmoji = (action: AdminLog['action']) => {
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
        if (meta.location) entry += `📍 Location: ${meta.location}\n`;
        if (meta.country) entry += `🏳️ Country: ${meta.country}\n`;
        if (meta.city) entry += `🏙️ City: ${meta.city}\n`;
        if (meta.timezone) entry += `🕐 Timezone: ${meta.timezone}\n`;
        if (meta.browser) entry += `🌐 Browser: ${meta.browser} ${meta.browserVersion || ''}\n`;
        if (meta.os) entry += `💻 OS: ${meta.os} ${meta.osVersion || ''}\n`;
        if (meta.device) entry += `📱 Device: ${meta.device}\n`;
        if (meta.screenResolution) entry += `🖥️ Screen: ${meta.screenResolution}\n`;
        if (meta.platform) entry += `⚙️ Platform: ${meta.platform}\n`;
        if (meta.cpuCores) entry += `🔧 CPU Cores: ${meta.cpuCores}\n`;
        if (meta.memory) entry += `💾 Memory: ${meta.memory}GB\n`;
        if (meta.connection) entry += `📡 Connection: ${meta.connection}\n`;
        if (meta.sessionId) entry += `🔑 Session: ${meta.sessionId}\n`;
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
    success: logs.filter((l: AdminLog) => l.type === 'success').length,
    errors: logs.filter((l: AdminLog) => l.type === 'error').length,
    warnings: logs.filter((l: AdminLog) => l.type === 'warning').length,
    logins: logs.filter((l: AdminLog) => l.action === 'LOGIN').length,
    uploads: logs.filter((l: AdminLog) => l.action === 'UPLOAD').length,
  };

  const containerClass = fullscreen 
    ? 'fixed inset-4 z-50 flex flex-col' 
    : className;

  const getOutputColor = (type: CommandOutput['type']) => {
    switch (type) {
      case 'success': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'warning': return 'text-yellow-400';
      default: return 'text-gray-300';
    }
  };

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
                root@futurepoint:~$ {showCommandMode ? 'bash' : 'logs --watch'}
              </h2>
              <span className="text-[10px] text-green-400 font-mono bg-green-500/20 px-1.5 py-0.5 rounded">
                {showCommandMode ? 'CMD' : filteredLogs.length}
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
              {/* Command Mode Toggle - PROMINENT */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCommandMode(!showCommandMode)}
                className={`h-7 px-3 text-xs font-bold font-mono border ${
                  showCommandMode 
                    ? 'bg-green-500/40 text-green-300 border-green-500 ring-2 ring-green-500/50 animate-pulse' 
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/50 hover:bg-blue-500/30 hover:border-blue-400'
                }`}
                title={showCommandMode ? 'Exit command mode (ESC)' : 'Enter command mode'}
              >
                {showCommandMode ? '🖥️ EXIT CMD' : '🖥️ TERMINAL'}
              </Button>

              {/* Filter dropdown - only show in log view */}
              {!showCommandMode && (
                <select 
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="h-6 px-2 text-[10px] bg-navy-800 border border-white/10 rounded text-gray-400 font-mono focus:ring-1 focus:ring-green-500"
                >
                  <option value="all">📋 All ({logs.length})</option>
                  <option value="LOGIN">🔐 Login ({stats.logins})</option>
                  <option value="LOGOUT">🚪 Logout</option>
                  <option value="UPLOAD">📤 Upload ({stats.uploads})</option>
                  <option value="DELETE">🗑️ Delete</option>
                  <option value="SYSTEM">⚙️ System</option>
                  <option value="error">❌ Errors ({stats.errors})</option>
                  <option value="warning">⚠️ Warnings ({stats.warnings})</option>
                </select>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFullscreen(!fullscreen)}
                className="h-6 w-6 p-0"
                title={fullscreen ? "Exit fullscreen (ESC)" : "Fullscreen"}
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
                <div 
                  ref={terminalRef}
                  className={`flex-1 bg-[#0d1117] font-mono text-[11px] overflow-y-auto p-3 ${
                    fullscreen ? 'max-h-full' : 'max-h-[400px] min-h-[300px]'
                  } ${showCommandMode ? 'cursor-text' : ''}`}
                  onMouseDown={(e) => {
                    // Only focus if clicking on the terminal background, not on the input itself
                    if (showCommandMode && inputRef.current && e.target === e.currentTarget) {
                      setTimeout(() => inputRef.current?.focus(), 0);
                    }
                  }}
                >
                  {showCommandMode ? (
                    /* ═══════════════════════ COMMAND MODE ═══════════════════════ */
                    <div className="space-y-2">
                      {/* Welcome message */}
                      {commandOutputs.length === 0 && (
                        <div className="text-gray-400 space-y-1 pb-4">
                          <div className="text-green-400 text-sm">╔══════════════════════════════════════════════════════════════╗</div>
                          <div className="text-green-400 text-sm">║     🖥️  FUTURE POINT ADMIN TERMINAL v2.0                     ║</div>
                          <div className="text-green-400 text-sm">║                 Interactive Command Mode                     ║</div>
                          <div className="text-green-400 text-sm">╠══════════════════════════════════════════════════════════════╣</div>
                          <div className="text-cyan-400 text-sm">║  Type "help" or "?" to see all available commands            ║</div>
                          <div className="text-cyan-400 text-sm">║  Type "ls" to list all sessions and activity                 ║</div>
                          <div className="text-cyan-400 text-sm">║  Type "dir &lt;username&gt;" to see detailed user info             ║</div>
                          <div className="text-cyan-400 text-sm">║  Type "stats" to see system statistics                       ║</div>
                          <div className="text-cyan-400 text-sm">║  Press ESC or type "exit" to return to log view              ║</div>
                          <div className="text-green-400 text-sm">╚══════════════════════════════════════════════════════════════╝</div>
                          <div className="text-gray-600 mt-2">Ready for input...</div>
                        </div>
                      )}

                      {/* Command outputs */}
                      {commandOutputs.map((output) => (
                        <div key={output.id} className="space-y-1 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-green-500">root@futurepoint</span>
                            <span className="text-gray-500">:</span>
                            <span className="text-blue-400">~</span>
                            <span className="text-gray-500">$</span>
                            <span className="text-white">{output.command}</span>
                          </div>
                          <div className={`whitespace-pre-wrap ${getOutputColor(output.type)}`}>
                            {output.output.map((line, i) => (
                              <div key={i} className="leading-relaxed">{line}</div>
                            ))}
                          </div>
                        </div>
                      ))}

                      {/* Input line */}
                      <div 
                        className="flex items-center gap-2 pt-2 border-t border-white/5 sticky bottom-0 bg-[#0d1117] pb-2 z-50"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (inputRef.current) {
                            inputRef.current.focus();
                            inputRef.current.click();
                          }
                        }}
                      >
                        <span className="text-green-500 select-none pointer-events-none">root@futurepoint</span>
                        <span className="text-gray-500 select-none pointer-events-none">:</span>
                        <span className="text-blue-400 select-none pointer-events-none">~</span>
                        <span className="text-gray-500 select-none pointer-events-none">$</span>
                        <input
                          ref={inputRef}
                          type="text"
                          value={commandInput}
                          onChange={(e) => {
                            e.stopPropagation();
                            setCommandInput(e.target.value);
                          }}
                          onKeyDown={(e) => {
                            e.stopPropagation();
                            handleKeyDown(e);
                          }}
                          onFocus={(e) => {
                            e.stopPropagation();
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="flex-1 bg-transparent text-white placeholder-gray-600 font-mono text-[11px]"
                          placeholder="Type a command... (try 'help')"
                          autoFocus={true}
                          spellCheck={false}
                          autoComplete="off"
                          autoCapitalize="off"
                          autoCorrect="off"
                          data-lpignore="true"
                          data-form-type="other"
                          style={{ 
                            outline: 'none',
                            border: 'none',
                            boxShadow: 'none',
                            WebkitAppearance: 'none',
                            caretColor: '#22c55e',
                            minWidth: '100px',
                            width: '100%'
                          }}
                        />
                        <span className="animate-pulse text-green-400 select-none pointer-events-none">▋</span>
                      </div>
                    </div>
                  ) : (
                    /* ═══════════════════════ LOG VIEW MODE ═══════════════════════ */
                    <div className="space-y-1.5">
                      {filteredLogs.length === 0 ? (
                        <div className="text-gray-600 flex flex-col items-center gap-3 py-12 justify-center">
                          <Terminal className="w-12 h-12 opacity-40" />
                          <span className="text-gray-500 text-sm">Waiting for system events...</span>
                          <span className="text-[10px] text-gray-600">All admin actions will be logged here in real-time</span>
                          <div className="flex items-center gap-3 mt-2 text-[10px]">
                            <span className="flex items-center gap-1"><CheckCircle className="w-3 h-3 text-green-500" /> Success</span>
                            <span className="flex items-center gap-1"><XCircle className="w-3 h-3 text-red-500" /> Error</span>
                            <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-yellow-500" /> Warning</span>
                          </div>
                          <button 
                            onClick={() => setShowCommandMode(true)}
                            className="mt-4 px-4 py-2 bg-green-500/20 text-green-400 rounded-lg text-xs hover:bg-green-500/30 transition-colors flex items-center gap-2"
                          >
                            <Terminal className="w-4 h-4" />
                            Open Interactive Terminal
                          </button>
                        </div>
                      ) : (
                        <>
                          {filteredLogs.map((log: AdminLog, index: number) => (
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
                                  {getActionEmoji(log.action)}
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
                                <Eye className={`w-3 h-3 flex-shrink-0 ${selectedLog?.id === log.id ? 'text-white' : 'text-gray-600'}`} />
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
                                    </span>
                                  )}
                                  {log.metadata.isSuperAdmin !== undefined && (
                                    <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded ${log.metadata.isSuperAdmin ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                      {log.metadata.isSuperAdmin ? <Shield className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                                      {log.metadata.isSuperAdmin ? 'SUPER' : 'ADMIN'}
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
                                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                                      <Hash className="w-3 h-3 text-gray-500" />
                                      <span className="text-gray-500">ID:</span>
                                      <span className="text-gray-400 font-mono text-[9px]">{log.id}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                      <div className="flex items-center gap-2">
                                        <Calendar className="w-3 h-3 text-blue-400" />
                                        <span className="text-gray-500">Time:</span>
                                        <span className="text-blue-300">{formatFullTime(log.timestamp)}</span>
                                      </div>
                                      {log.user && (
                                        <div className="flex items-center gap-2">
                                          <User className="w-3 h-3 text-blue-400" />
                                          <span className="text-gray-500">User:</span>
                                          <span className="text-blue-400 font-semibold">@{log.user}</span>
                                        </div>
                                      )}
                                      {log.metadata?.ip && (
                                        <div className="flex items-center gap-2">
                                          <Globe className="w-3 h-3 text-green-400" />
                                          <span className="text-gray-500">IP:</span>
                                          <span className="text-green-400 font-mono">{log.metadata.ip}</span>
                                        </div>
                                      )}
                                      {log.metadata?.location && (
                                        <div className="flex items-center gap-2">
                                          <MapPin className="w-3 h-3 text-orange-400" />
                                          <span className="text-gray-500">Location:</span>
                                          <span className="text-orange-400">{log.metadata.location}</span>
                                        </div>
                                      )}
                                      {log.metadata?.browser && (
                                        <div className="flex items-center gap-2">
                                          <Monitor className="w-3 h-3 text-cyan-400" />
                                          <span className="text-gray-500">Browser:</span>
                                          <span className="text-gray-300">{log.metadata.browser} {log.metadata.browserVersion}</span>
                                        </div>
                                      )}
                                      {log.metadata?.os && (
                                        <div className="flex items-center gap-2">
                                          <Server className="w-3 h-3 text-emerald-400" />
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
                                      {log.metadata?.screenResolution && (
                                        <div className="flex items-center gap-2">
                                          <Monitor className="w-3 h-3 text-indigo-400" />
                                          <span className="text-gray-500">Screen:</span>
                                          <span className="text-indigo-400">{log.metadata.screenResolution}</span>
                                        </div>
                                      )}
                                    </div>
                                    {log.details && (
                                      <div className="pt-2 border-t border-white/5">
                                        <span className="text-gray-500">Details: </span>
                                        <span className="text-gray-300">{log.details}</span>
                                      </div>
                                    )}
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          ))}
                          
                          {/* Terminal prompt at bottom */}
                          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/10">
                            <span className="text-green-500">root@futurepoint</span>
                            <span className="text-gray-500">:</span>
                            <span className="text-blue-400">~</span>
                            <span className="text-gray-500">$</span>
                            <button 
                              onClick={() => setShowCommandMode(true)}
                              className="text-gray-500 hover:text-green-400 transition-colors text-[10px] underline decoration-dotted underline-offset-2"
                            >
                              Click here or press CMD button for interactive terminal
                            </button>
                            <span className="animate-pulse text-green-400">▋</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Status bar */}
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
                      {logs.length} logs
                    </span>
                    {showCommandMode && (
                      <span className="text-green-400 bg-green-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                        <Terminal className="w-3 h-3" />
                        INTERACTIVE
                      </span>
                    )}
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
