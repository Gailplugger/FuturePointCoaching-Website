'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { Lock, Github, AlertCircle, Eye, EyeOff, ExternalLink, User, ShieldCheck } from 'lucide-react';
import { loginSchema, type LoginFormData } from '@/lib/validations';
import { adminLogin } from '@/lib/api';
import { PageTransition, SlideUp } from '@/components/motion';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function AdminLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await adminLogin(data.username, data.token);

      if (response.success) {
        // Store token in sessionStorage for subsequent API calls
        sessionStorage.setItem('github_token', data.token);
        sessionStorage.setItem('admin_user', JSON.stringify(response.user));

        router.push('/admin/dashboard');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageTransition>
      <section className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <SlideUp>
            <Card>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-accent-orange/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck className="w-8 h-8 text-accent-orange" />
                </div>
                <h1 className="text-2xl font-bold text-white">Admin Verification</h1>
                <p className="text-gray-400 mt-2">
                  Verify your identity with GitHub credentials
                </p>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  {/* GitHub Username Field */}
                  <div>
                    <Input
                      label="GitHub Username"
                      type="text"
                      placeholder="your-github-username"
                      error={errors.username?.message}
                      icon={<User className="w-5 h-5" />}
                      {...register('username')}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Enter your exact GitHub username (case-insensitive)
                    </p>
                  </div>

                  {/* GitHub PAT Field */}
                  <div className="relative">
                    <Input
                      label="GitHub Personal Access Token"
                      type={showToken ? 'text' : 'password'}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      error={errors.token?.message}
                      {...register('token')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-9 text-gray-400 hover:text-white transition-colors"
                      aria-label={showToken ? 'Hide token' : 'Show token'}
                    >
                      {showToken ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-start gap-3"
                    >
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                      <p className="text-red-400 text-sm">{error}</p>
                    </motion.div>
                  )}

                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="w-full"
                    size="lg"
                  >
                    <ShieldCheck className="w-5 h-5 mr-2" />
                    Verify & Sign In
                  </Button>
                </form>

                {/* Verification Info */}
                <div className="mt-6 p-4 bg-royal-500/10 border border-royal-500/30 rounded-lg">
                  <h4 className="text-sm font-semibold text-royal-400 flex items-center gap-2 mb-2">
                    <Github className="w-4 h-4" />
                    How Verification Works
                  </h4>
                  <ul className="text-xs text-gray-400 space-y-1">
                    <li>• Your GitHub username is verified against the token owner</li>
                    <li>• Token must have access to the repository</li>
                    <li>• Only authorized admins listed in the repo can access</li>
                    <li>• All uploads are committed to GitHub under your account</li>
                  </ul>
                </div>

                {/* Help Section */}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-3">
                    Need a Personal Access Token?
                  </h3>
                  <ol className="text-sm text-gray-400 space-y-2">
                    <li>1. Go to GitHub Settings → Developer settings</li>
                    <li>2. Click "Personal access tokens" → "Tokens (classic)"</li>
                    <li>3. Generate new token with <code className="text-accent-orange">repo</code> and <code className="text-accent-orange">read:user</code> scopes</li>
                    <li>4. Copy the token and paste it above</li>
                  </ol>
                  <a
                    href="https://github.com/settings/tokens/new"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 text-sm text-accent-orange hover:text-accent-orange-light transition-colors"
                  >
                    Create Token on GitHub
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                {/* Security Note */}
                <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-xs text-yellow-400">
                    <strong>Security Note:</strong> Your username and token are verified against GitHub API.
                    The token is used only for commits and is never stored permanently. All file uploads 
                    are tracked via Git commits under your verified identity.
                  </p>
                </div>
              </CardContent>
            </Card>
          </SlideUp>
        </div>
      </section>
    </PageTransition>
  );
}
