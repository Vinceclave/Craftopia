import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { healthCheck } from '@/lib/api';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiHealthy, setApiHealthy] = useState<boolean | null>(null);
  const { login, loading, error } = useAuth();

  useEffect(() => {
    healthCheck().then(setApiHealthy);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      alert('Please enter both email and password');
      return;
    }
    
    await login(email, password);
  };

  const inputProps = {
    required: true,
    disabled: loading,
    className: "border border-gray-200 focus:border-gray-900"
  };

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
      
        {/* Login Card */}
        <Card className="border border-gray-100 shadow-sm">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {error && (
                <Alert variant="destructive" className="bg-rose-50 border-rose-200 text-rose-700">
                  <AlertDescription className="text-sm">{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-3">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
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

              <div className="flex flex-col gap-3">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
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

              <Button 
                type="submit" 
                className="w-full bg-gray-900 hover:bg-gray-800 text-white mt-2" 
                disabled={loading || apiHealthy === false}
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

              <div className="text-center text-xs text-gray-400 mt-4">
                Restricted access. Authorized personnel only.
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-xs text-gray-400">
          © 2025 Craftopia
        </div>
      </div>
    </div>
  );
}