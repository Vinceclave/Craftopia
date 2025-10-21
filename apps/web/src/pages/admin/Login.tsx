// apps/web/src/pages/admin/Login.tsx - ENHANCED VERSION
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { healthCheck } from '@/lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const { login, loading, error, isInitializing, clearError } = useAuth();

  // ✅ Check API health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const healthy = await healthCheck();
      setApiHealthy(healthy);
    };
    checkHealth();
  }, []);

  // ✅ Clear error when user types
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, [email, password]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      return;
    }
    
    try {
      await login(email, password);
    } catch (err) {
      // Error is already set in useAuth
      console.error('Login failed:', err);
    }
  };

  const inputProps = {
    required: true,
    disabled: loading || isInitializing,
    className: "border border-gray-200 focus:border-gray-900"
  };

  // ✅ Show loading state while initializing
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-900" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4 sm:p-6">
      <div className="w-full max-w-sm sm:max-w-md">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gray-900 rounded-xl mb-3 sm:mb-4">
            <Shield className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Admin Portal</h1>
          <p className="text-gray-500 text-sm sm:text-base">Sign in to continue</p>
        </div>

        {/* API Health Status */}
        {apiHealthy !== null && (
          <div className="mb-4">
            <Alert 
              variant={apiHealthy ? "default" : "destructive"} 
              className={apiHealthy ? "bg-emerald-50 border-emerald-200" : "bg-rose-50 border-rose-200"}
            >
              <div className="flex items-center gap-2">
                {apiHealthy ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <AlertDescription className="text-sm text-emerald-700">
                      API Connected
                    </AlertDescription>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-rose-600" />
                    <AlertDescription className="text-sm text-rose-700">
                      Cannot connect to API. Please check if backend is running.
                    </AlertDescription>
                  </>
                )}
              </div>
            </Alert>
          </div>
        )}
      
        {/* Login Card */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Error Alert */}
              {error && (
                <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-700">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              {/* Email Input */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@craftopia.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  {...inputProps}
                />
              </div>

              {/* Password Input */}
              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                  {...inputProps}
                />
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white mt-2" 
                disabled={loading || apiHealthy === false || !email.trim() || !password.trim()}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Continue'
                )}
              </Button>

              {/* Info Text */}
              <div className="text-center text-xs text-gray-400 mt-4">
                Restricted access. Authorized personnel only.
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-400">© 2025 Craftopia</p>
          <p className="text-xs text-gray-300 mt-1">
            Secure admin authentication with refresh tokens
          </p>
        </div>
      </div>
    </div>
  );
}