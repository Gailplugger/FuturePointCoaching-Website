'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Upload,
  FileText,
  Users,
  LogOut,
  Home,
  LayoutDashboard,
  Shield,
  Clock,
  TrendingUp,
} from 'lucide-react';
import { UploadCard } from '@/components/admin/UploadCard';
import { AdminLogsTerminal } from '@/components/admin/AdminLogsTerminal';
import { ServerMaintenancePopup } from '@/components/admin/ServerMaintenancePopup';
import { PageTransition, SlideUp, StaggerContainer, StaggerItem } from '@/components/motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageLoader } from '@/components/ui/Loading';
import { adminLogout, listNotes, type User, type NotesFile } from '@/lib/api';
import { logLogout, logSystem, logSession } from '@/lib/adminLogs';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [githubToken, setGithubToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [recentNotes, setRecentNotes] = useState<NotesFile[]>([]);
  const [stats, setStats] = useState({
    totalNotes: 0,
    class10: 0,
    class11: 0,
    class12: 0,
  });

  useEffect(() => {
    // Check authentication
    const token = sessionStorage.getItem('github_token');
    const userData = sessionStorage.getItem('admin_user');

    if (!token || !userData) {
      router.push('/admin/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    setGithubToken(token);
    setUser(parsedUser);
    
    // Log session resume if returning to dashboard
    const loginTime = sessionStorage.getItem('fp_login_time');
    if (loginTime && Date.now() - parseInt(loginTime, 10) > 5000) {
      // Only log resume if more than 5 seconds since login (avoid double logging)
      logSession('resume', parsedUser.username);
    }
    
    fetchDashboardData();
    setLoading(false);
  }, [router]);

  async function fetchDashboardData() {
    try {
      const response = await listNotes();
      setRecentNotes(response.files.slice(0, 5));
      
      const class10 = response.files.filter((f) => f.classNo === '10').length;
      const class11 = response.files.filter((f) => f.classNo === '11').length;
      const class12 = response.files.filter((f) => f.classNo === '12').length;

      setStats({
        totalNotes: response.total,
        class10,
        class11,
        class12,
      });
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    }
  }

  const handleLogout = async () => {
    try {
      if (user?.username) {
        logLogout(user.username);
      }
      await adminLogout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      sessionStorage.removeItem('github_token');
      sessionStorage.removeItem('admin_user');
      router.push('/admin/login');
    }
  };

  if (loading) {
    return <PageLoader />;
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-navy-900">
        {/* Admin Header */}
        <header className="bg-navy-800/50 border-b border-white/10 sticky top-20 z-40">
          <div className="container py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-accent-orange/20 flex items-center justify-center">
                  <LayoutDashboard className="w-5 h-5 text-accent-orange" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">
                      Welcome, {user?.username}
                    </span>
                    {user?.isSuperAdmin && (
                      <Badge variant="warning">
                        <Shield className="w-3 h-3 mr-1" />
                        Super Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="ghost" size="sm">
                    <Home className="w-4 h-4 mr-2" />
                    Home
                  </Button>
                </Link>
                {user?.isSuperAdmin && (
                  <Link href="/admin/users">
                    <Button variant="secondary" size="sm">
                      <Users className="w-4 h-4 mr-2" />
                      Manage Admins
                    </Button>
                  </Link>
                )}
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="container py-8">
          {/* Stats Grid */}
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: 'Total Notes',
                value: stats.totalNotes,
                icon: FileText,
                color: 'text-accent-orange',
                bg: 'bg-accent-orange/20',
              },
              {
                label: 'Class 10 Notes',
                value: stats.class10,
                icon: TrendingUp,
                color: 'text-green-400',
                bg: 'bg-green-500/20',
              },
              {
                label: 'Class 11 Notes',
                value: stats.class11,
                icon: TrendingUp,
                color: 'text-blue-400',
                bg: 'bg-blue-500/20',
              },
              {
                label: 'Class 12 Notes',
                value: stats.class12,
                icon: TrendingUp,
                color: 'text-purple-400',
                bg: 'bg-purple-500/20',
              },
            ].map((stat) => (
              <StaggerItem key={stat.label}>
                <Card>
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className={`w-12 h-12 ${stat.bg} rounded-xl flex items-center justify-center`}>
                      <stat.icon className={`w-6 h-6 ${stat.color}`} />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                  </CardContent>
                </Card>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upload Card - 2 columns */}
            <div className="lg:col-span-2">
              <SlideUp>
                <UploadCard githubToken={githubToken} />
              </SlideUp>
            </div>

            {/* Recent Notes - 1 column */}
            <div>
              <SlideUp delay={0.1}>
                <Card className="h-full">
                  <CardHeader>
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                      <Clock className="w-5 h-5 text-accent-orange" />
                      Recent Uploads
                    </h2>
                  </CardHeader>
                  <CardContent>
                    {recentNotes.length === 0 ? (
                      <p className="text-gray-400 text-center py-8">
                        No notes uploaded yet.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {recentNotes.map((note) => (
                          <motion.div
                            key={note.path}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex items-center gap-3 p-3 bg-navy-800/50 rounded-lg"
                          >
                            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">
                                {note.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Class {note.classNo} • {note.stream}
                              </p>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}

                    <Link href="/notes" className="block mt-4">
                      <Button variant="ghost" className="w-full">
                        View All Notes
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </SlideUp>
            </div>
          </div>

          {/* Quick Actions */}
          <SlideUp delay={0.2}>
            <Card className="mt-8">
              <CardHeader>
                <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <Link href="/admin/notes">
                    <Button variant="primary">
                      <FileText className="w-4 h-4 mr-2" />
                      Manage Notes
                    </Button>
                  </Link>
                  <Link href="/notes">
                    <Button variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      View Public Notes
                    </Button>
                  </Link>
                  {user?.isSuperAdmin && (
                    <Link href="/admin/users">
                      <Button variant="secondary">
                        <Users className="w-4 h-4 mr-2" />
                        Manage Admins
                      </Button>
                    </Link>
                  )}
                  <a
                    href={`https://github.com/${process.env.NEXT_PUBLIC_GH_USER}/${process.env.NEXT_PUBLIC_GH_REPO}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="ghost">View Repository</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          </SlideUp>

          {/* Admin Logs Terminal */}
          <SlideUp delay={0.3}>
            <div className="mt-8">
              <AdminLogsTerminal />
            </div>
          </SlideUp>
        </main>

        {/* Server Maintenance Popup */}
        <ServerMaintenancePopup delayMs={5000} />
      </div>
    </PageTransition>
  );
}
