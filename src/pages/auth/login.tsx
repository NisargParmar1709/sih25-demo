import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { auth } from '../../lib/api';
import { Shield } from 'lucide-react';

interface LoginPageProps {
  onLogin: (user: any) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await auth.login(email, password);
      localStorage.setItem('currentUser', JSON.stringify(user));
      onLogin(user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  // Demo users for easy testing
  const demoUsers = [
    { email: 'amit.sharma@skit.edu.in', role: 'Student' },
    { email: 'sunita.rao@skit.edu.in', role: 'Mentor' },
    { email: 'admin@gtu.edu.in', role: 'Admin' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-indigo-600" />
          <h2 className="mt-6 text-3xl font-bold text-slate-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <Input
                label="Email address"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@institution.edu.in"
              />
              
              <Input
                label="Password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />

              {error && (
                <div className="text-red-600 text-sm">{error}</div>
              )}

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Demo Users */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-sm text-blue-800">Demo Users</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {demoUsers.map((user) => (
              <Button
                key={user.email}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-blue-700 hover:bg-blue-100"
                onClick={() => {
                  setEmail(user.email);
                  setPassword('demo123');
                }}
              >
                <div className="text-left">
                  <div className="font-medium">{user.email}</div>
                  <div className="text-xs opacity-75">{user.role}</div>
                </div>
              </Button>
            ))}
            <div className="text-xs text-blue-600 mt-2">
              Password: demo123
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Link to="/" className="text-indigo-600 hover:text-indigo-500 text-sm font-medium">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  );
}