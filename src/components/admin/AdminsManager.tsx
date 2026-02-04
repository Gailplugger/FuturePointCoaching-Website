'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, UserMinus, Shield, User, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { addAdminSchema, type AddAdminFormData } from '@/lib/validations';
import { addAdmin, removeAdmin, type AdminsData } from '@/lib/api';
import { logAdminAdd, logAdminRemove } from '@/lib/adminLogs';

interface AdminsManagerProps {
  admins: AdminsData;
  githubToken: string;
  onUpdate: () => void;
}

// Helper to get current user
function getCurrentUser(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const userData = sessionStorage.getItem('admin_user');
  return userData ? JSON.parse(userData).username : 'Unknown';
}

export function AdminsManager({ admins, githubToken, onUpdate }: AdminsManagerProps) {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [removingUser, setRemovingUser] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AddAdminFormData>({
    resolver: zodResolver(addAdminSchema),
  });

  const onAddAdmin = async (data: AddAdminFormData) => {
    try {
      setLoading(true);
      setResult(null);

      const response = await addAdmin(data.username, githubToken);

      setResult({
        success: true,
        message: response.message,
      });

      // Log admin addition
      logAdminAdd(getCurrentUser(), data.username, false);

      reset();
      onUpdate();
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to add admin',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRemoveAdmin = async (username: string) => {
    if (!confirm(`Are you sure you want to remove ${username} as an admin?`)) {
      return;
    }

    try {
      setRemovingUser(username);
      setResult(null);

      const response = await removeAdmin(username, githubToken);

      setResult({
        success: true,
        message: response.message,
      });

      // Log admin removal
      logAdminRemove(getCurrentUser(), username);

      onUpdate();
    } catch (err) {
      setResult({
        success: false,
        message: err instanceof Error ? err.message : 'Failed to remove admin',
      });
    } finally {
      setRemovingUser(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Admin Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-accent-orange" />
            Add New Admin
          </h2>
          <p className="text-gray-400 text-sm mt-1">
            Add a GitHub user as an admin. They will need a GitHub Personal Access Token to login.
          </p>
        </CardHeader>

        <form onSubmit={handleSubmit(onAddAdmin)}>
          <CardContent className="space-y-4">
            <Input
              label="GitHub Username"
              placeholder="Enter GitHub username"
              error={errors.username?.message}
              {...register('username')}
            />

            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    result.success
                      ? 'bg-green-500/20 border border-green-500/30'
                      : 'bg-red-500/20 border border-red-500/30'
                  }`}
                >
                  {result.success ? (
                    <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                  )}
                  <p className={result.success ? 'text-green-400' : 'text-red-400'}>
                    {result.message}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <Button type="submit" isLoading={loading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Add Admin
            </Button>
          </CardContent>
        </form>
      </Card>

      {/* Current Admins Card */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent-orange" />
            Current Admins
          </h2>
        </CardHeader>

        <CardContent>
          {/* Super Admins */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Super Admins
            </h3>
            <div className="space-y-2">
              {admins.super_admins?.map((username) => (
                <div
                  key={username}
                  className="flex items-center justify-between p-3 bg-navy-800/50 rounded-lg border border-white/5"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-accent-orange/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-accent-orange" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{username}</p>
                      <Badge variant="warning" className="mt-1">
                        Super Admin
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regular Admins */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Admins
            </h3>
            {admins.admins?.length === 0 ? (
              <p className="text-gray-500 text-sm py-4 text-center">
                No regular admins added yet.
              </p>
            ) : (
              <div className="space-y-2">
                {admins.admins?.map((username) => (
                  <motion.div
                    key={username}
                    layout
                    className="flex items-center justify-between p-3 bg-navy-800/50 rounded-lg border border-white/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-royal-500/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-royal-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{username}</p>
                        <Badge variant="info" className="mt-1">
                          Admin
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onRemoveAdmin(username)}
                      isLoading={removingUser === username}
                      disabled={removingUser !== null}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
