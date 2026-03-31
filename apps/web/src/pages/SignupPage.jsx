import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PieChart, ArrowRight, MailCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const SignupPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '', passwordConfirm: '', name: '' });
  const [loading, setLoading]   = useState(false);
  const [isSent, setIsSent]     = useState(false);
  const { signup, loginWithGoogle } = useAuth();
  const navigate  = useNavigate();
  const { toast } = useToast();
  const location  = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const redirectTo  = queryParams.get('redirectTo');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.name || e.target.name]: e.value || e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.passwordConfirm) {
      return toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
    }
    setLoading(true);
    try {
      await signup(formData);
      setIsSent(true);
      toast({ title: 'Success', description: 'Account created! Please check your email.' });
    } catch (error) {
      toast({ title: 'Error', description: error.message || 'Failed to create account.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const pageBackground = {
    background: 'linear-gradient(135deg, #020617 0%, #0a0f1e 50%, #0d1117 100%)',
  };

  const cardStyle = {
    background: 'rgba(15,23,42,0.65)',
    backdropFilter: 'blur(28px) saturate(160%)',
    WebkitBackdropFilter: 'blur(28px) saturate(160%)',
    border: '1px solid rgba(255,255,255,0.1)',
    boxShadow: '0 0 0 1px rgba(255,255,255,0.04), 0 24px 64px rgba(0,0,0,0.5), 0 0 50px rgba(139,92,246,0.08), inset 0 1px 0 rgba(255,255,255,0.1)',
  };

  if (isSent) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden" style={pageBackground}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
          <div className="orb orb-1" style={{ width: '500px', height: '500px', top: '-120px', left: '-80px', background: 'radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)' }} />
          <div className="orb orb-2" style={{ width: '400px', height: '400px', bottom: '-100px', right: '-60px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
        </div>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative w-full max-w-md text-center rounded-2xl p-10"
          style={cardStyle}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #0d9488, #2dd4bf)', boxShadow: '0 0 24px rgba(20,184,166,0.4)' }}
          >
            <MailCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Check your email!</h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-6">
            We've sent a verification link to{' '}
            <strong className="text-teal-300">{formData.email}</strong>.<br /><br />
            Click the link in that email to activate your account.
          </p>
          <Button
            variant="outline"
            className="w-full text-slate-300 hover:text-white transition-all"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}
            onClick={() => navigate(redirectTo ? `/login?redirectTo=${redirectTo}` : '/login')}
            id="signup-return-btn"
          >
            Return to Sign In
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 relative overflow-hidden" style={pageBackground}>
      {/* Ambient orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="orb orb-1" style={{ width: '500px', height: '500px', top: '-120px', left: '-80px', background: 'radial-gradient(circle, rgba(20,184,166,0.18) 0%, transparent 70%)' }} />
        <div className="orb orb-2" style={{ width: '450px', height: '450px', bottom: '-100px', right: '-60px', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1     }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 100 }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-2xl p-8" style={cardStyle}>
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
            <h1 className="text-2xl font-bold text-white mb-1">Create an account</h1>
            <p className="text-sm text-slate-400">Enter your details to get started for free</p>
          </header>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="signup-name" className="text-sm font-medium text-slate-300">Name</label>
              <Input
                id="signup-name"
                name="name"
                placeholder="John Doe"
                value={formData.name}
                onChange={handleChange}
                required
                className="input-3d bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="signup-email" className="text-sm font-medium text-slate-300">Email</label>
              <Input
                id="signup-email"
                name="email"
                type="email"
                placeholder="m@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                className="input-3d bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="signup-password" className="text-sm font-medium text-slate-300">Password</label>
              <Input
                id="signup-password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="input-3d bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500/50"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="signup-confirm" className="text-sm font-medium text-slate-300">Confirm Password</label>
              <Input
                id="signup-confirm"
                name="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                required
                minLength={8}
                className="input-3d bg-white/5 border-white/10 text-white placeholder:text-slate-500 focus:border-teal-500/50"
              />
            </div>

            <Button
              type="submit"
              id="signup-submit-btn"
              className="w-full btn-3d text-white font-semibold py-5 mt-2"
              style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 60%, #2dd4bf 100%)' }}
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Create Account
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
            id="signup-google-btn"
            className="w-full font-medium text-slate-300 hover:text-white transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(8px)' }}
            disabled={loading}
            onClick={async () => {
              try {
                await loginWithGoogle();
                navigate(redirectTo || '/dashboard');
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
            Already have an account?{' '}
            <Link
              to={redirectTo ? `/login?redirectTo=${redirectTo}` : '/login'}
              className="text-teal-400 hover:text-teal-300 font-semibold transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;