import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PieChart, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const LoginPage = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate  = useNavigate();
  const location  = useLocation();
  const { toast } = useToast();
  const queryParams = new URLSearchParams(location.search);
  const redirectTo  = queryParams.get('redirectTo');
  const from = redirectTo || location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast({ title: 'Success', description: 'Logged in successfully' });
      navigate(from, { replace: true });
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login. Please check your credentials.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #020617 0%, #0a0f1e 50%, #0d1117 100%)' }}
    >
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="orb orb-1" style={{ width: '500px', height: '500px', top: '-120px', left: '-80px', background: 'radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)' }} />
        <div className="orb orb-2" style={{ width: '400px', height: '400px', bottom: '-100px', right: '-60px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
      </div>

      {/* Glass card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1     }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="relative w-full max-w-md"
        style={{ perspective: '1000px' }}
      >
        <div
          className="rounded-2xl p-8"
          style={{
            background: 'rgba(15,23,42,0.65)',
            backdropFilter: 'blur(28px) saturate(160%)',
            WebkitBackdropFilter: 'blur(28px) saturate(160%)',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.5), 0 0 50px rgba(20,184,166,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
          }}
        >
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shimmer logo-glow"
              style={{ background: 'linear-gradient(135deg, #0d9488, #2dd4bf)' }}
            >
              <PieChart className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-xl gradient-text-brand tracking-tight">FlowPay</span>
          </div>

          {/* Heading */}
          <header className="mb-6">
            <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
            <p className="text-sm text-slate-400">Sign in to continue to your dashboard</p>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-email" className="text-sm font-medium text-slate-300">Email</label>
              <Input
                id="login-email"
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-3d bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="text-sm font-medium text-slate-300">Password</label>
              <Input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-3d bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500/50"
              />
            </div>

            <Button
              type="submit"
              id="login-submit-btn"
              className="w-full btn-3d text-white font-semibold py-5 mt-2"
              style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 60%, #2dd4bf 100%)' }}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Sign In
              {!loading && <ArrowRight className="w-4 h-4 ml-2" />}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Or</span>
            <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
          </div>

          {/* Google */}
          <Button
            variant="outline"
            id="login-google-btn"
            className="w-full font-medium text-slate-300 hover:text-white transition-all duration-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
            }}
            disabled={loading}
            onClick={async () => {
              try {
                await loginWithGoogle();
                navigate(from, { replace: true });
              } catch {
                toast({ title: 'Error', description: 'Google login failed.', variant: 'destructive' });
              }
            }}
          >
            <svg className="w-4 h-4 mr-2 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.07-3.71 1.07-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.67-.35-1.39-.35-2.09s.13-1.42.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </Button>

          <p className="mt-5 text-center text-sm text-slate-500">
            Don&apos;t have an account?{' '}
            <Link to="/signup" className="text-teal-400 hover:text-teal-300 font-semibold transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;