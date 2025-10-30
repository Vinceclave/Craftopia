// apps/web/src/pages/admin/Login.tsx
// -----------------------------------------------------------------------------
// Modern Brand-Level Admin Login
// Clean, minimalist, and professional design — inspired by top SaaS dashboards.
// -----------------------------------------------------------------------------

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error, isInitializing } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    await login(email, password);
  };

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white">
        <Loader2 className="w-6 h-6 animate-spin text-[#6CAC73]" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white relative overflow-hidden">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
            style={{
              left: `${15 + i * 20}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md p-8 sm:p-10 relative z-10">
        {/* Logo / Brand Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
          </div>
          <h1 className="text-2xl font-bold text-[#2B4A2F] font-poppins">Craftopia Admin</h1>
          <p className="text-gray-600 text-sm font-nunito mt-1">Sign in to your dashboard</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-700 text-sm rounded-xl">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div>
            <Label htmlFor="email" className="text-[#2B4A2F] text-sm font-medium font-poppins">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              placeholder="admin@craftopia.com"
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              required
              className="mt-2 font-nunito border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 rounded-lg transition-all duration-200"
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-[#2B4A2F] text-sm font-medium font-poppins">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              placeholder="••••••••"
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              required
              className="mt-2 font-nunito border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10 rounded-lg transition-all duration-200"
            />
          </div>

          <Button
            type="submit"
            disabled={loading || !email.trim() || !password.trim()}
            className="w-full bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white font-poppins rounded-lg py-2.5 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </div>
            ) : (
              'Sign In'
            )}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500 font-nunito flex items-center justify-center gap-1">
            <Sparkles className="w-3 h-3" />
            © 2025 Craftopia • Secure Admin Access
          </p>
        </div>
      </div>
    </div>
  );
}