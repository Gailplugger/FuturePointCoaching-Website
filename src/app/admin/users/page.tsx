'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { AdminsManager } from '@/components/admin/AdminsManager';
import { PageTransition, SlideUp } from '@/components/motion';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { PageLoader } from '@/components/ui/Loading';
import { type User, type AdminsData } from '@/lib/api';

export default function AdminUsersPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [githubToken, setGithubToken] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [admins, setAdmins] = useState<AdminsData>({
    super_admins: [],
    admins: [],
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
    
    // Only super admins can access this page
    if (!parsedUser.isSuperAdmin) {
      router.push('/admin/dashboard');
      return;
    }

    setGithubToken(token);
    setUser(parsedUser);
    fetchAdmins(token);
    setLoading(false);
  }, [router]);

  async function fetchAdmins(token: string) {
    try {
      const repoOwner = process.env.NEXT_PUBLIC_GH_USER;
      const repoName = process.env.NEXT_PUBLIC_GH_REPO;

      const response = await fetch(
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/admins/admins.json`,
        {
          headers: {
            Authorization: `token ${token}`,
            Accept: 'application/vnd.github.v3+json',
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const content = JSON.parse(atob(data.content));
        setAdmins(content);
      }
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    }
  }

  if (loading) {
    return <PageLoader />;
  }

  if (!user?.isSuperAdmin) {
    return (
      <PageTransition>
        <div className="min-h-screen flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardContent className="text-center py-12">
              <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-white mb-2">Access Denied</h1>
              <p className="text-gray-400 mb-6">
                Only super admins can manage users.
              </p>
              <Link href="/admin/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </PageTransition>
    );
  }

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
                    <Shield className="w-5 h-5 text-accent-orange" />
                    Manage Admins
                  </h1>
                  <p className="text-sm text-gray-400">
                    Add or remove admin access
                  </p>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="container py-8">
          <div className="max-w-2xl mx-auto">
            {/* Warning Notice */}
            <SlideUp>
              <Card className="mb-8 border-yellow-500/30 bg-yellow-500/10">
                <CardContent className="flex items-start gap-4 py-4">
                  <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold text-yellow-400 mb-1">
                      Super Admin Area
                    </h3>
                    <p className="text-sm text-yellow-400/80">
                      Changes made here will be committed to the repository and affect
                      who can access the admin panel. Use caution when adding or
                      removing admins.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </SlideUp>

            {/* Admins Manager */}
            <SlideUp delay={0.1}>
              <AdminsManager
                admins={admins}
                githubToken={githubToken}
                onUpdate={() => fetchAdmins(githubToken)}
              />
            </SlideUp>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}
