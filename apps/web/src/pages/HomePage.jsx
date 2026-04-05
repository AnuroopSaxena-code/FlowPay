import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { Button } from '@/components/ui/button';
import { ArrowRight, PieChart, Users, Receipt, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const features = [
  {
    icon: Receipt,
    title: 'Custom Splits',
    desc: 'Split expenses equally, by exact amounts, or by custom percentages. Built for any real-world scenario.',
    gradient: 'from-teal-500 to-emerald-500',
    glow: 'rgba(20,184,166,0.3)',
  },
  {
    icon: PieChart,
    title: 'Visual Analytics',
    desc: 'Understand where your money goes with beautiful, interactive charts and category breakdowns.',
    gradient: 'from-violet-500 to-indigo-500',
    glow: 'rgba(139,92,246,0.3)',
  },
  {
    icon: Users,
    title: 'Smart Settlements',
    desc: 'Our algorithm calculates the minimum number of transactions needed to settle all debts at once.',
    gradient: 'from-sky-500 to-blue-500',
    glow: 'rgba(56,189,248,0.3)',
  },
];

const HomePage = () => {
  const { currentUser } = useAuth();

  return (
    <>
      <Helmet>
        <title>FlowPay - Settle Expenses Without the Stress</title>
        <meta name="description" content="The ultimate dashboard for groups, roommates, and travelers to track shared expenses and calculate optimal settlements." />
      </Helmet>

      <div className="min-h-[calc(100vh-4rem)] flex flex-col">

        {/* ── Hero Section ────────────────────────────────────── */}
        <section className="relative flex-1 flex items-center justify-center overflow-hidden py-24 lg:py-36"
          style={{ background: 'linear-gradient(135deg, #020617 0%, #0a0f1e 40%, #0f172a 70%, #0d1117 100%)' }}
        >
          {/* 3D Perspective Grid */}
          <div className="absolute inset-0 z-0 flex items-end justify-center overflow-hidden pointer-events-none" aria-hidden="true">
            <div
              className="w-full h-[55%]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(45,212,191,0.08) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(45,212,191,0.08) 1px, transparent 1px)
                `,
                backgroundSize: '52px 52px',
                transform: 'perspective(600px) rotateX(50deg) scale(2.4)',
                transformOrigin: 'center top',
                maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
                WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, transparent 100%)',
              }}
            />
          </div>

          {/* Teal center glow */}
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            aria-hidden="true"
            style={{
              background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(20,184,166,0.15) 0%, transparent 70%)',
            }}
          />

          <div className="container relative z-10 px-4 mx-auto">
            <div className="max-w-4xl mx-auto text-center">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 mb-8"
              >
                <div
                  className="flex items-center gap-2 px-4 py-1.5 rounded-full shimmer"
                  style={{
                    background: 'rgba(20,184,166,0.12)',
                    border: '1px solid rgba(45,212,191,0.3)',
                    boxShadow: '0 0 20px rgba(20,184,166,0.15), inset 0 1px 0 rgba(255,255,255,0.08)',
                  }}
                >
                  <Zap className="w-3.5 h-3.5 text-teal-400" />
                  <span className="text-xs font-semibold text-teal-300 tracking-widest uppercase">
                    Smart Group Finance
                  </span>
                </div>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.1 }}
                className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 text-white leading-[1.05]"
              >
                Settle Expenses
                <br />
                <span className="gradient-text">Without the Stress</span>
              </motion.h1>

              {/* Sub-heading */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.2 }}
                className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed"
              >
                The ultimate dashboard for groups, roommates, and travelers to track shared expenses,
                calculate optimal settlements, and visualize spending habits.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, delay: 0.3 }}
                className="flex flex-wrap gap-4 justify-center"
              >
                {currentUser ? (
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className="btn-3d text-white font-bold px-8 py-6 text-base rounded-full"
                      style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 60%, #2dd4bf 100%)' }}
                      id="hero-dashboard-btn"
                    >
                      Go to Dashboard
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link to="/signup">
                      <Button
                        size="lg"
                        className="btn-3d text-white font-bold px-8 py-6 text-base rounded-full"
                        style={{ background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 60%, #2dd4bf 100%)' }}
                        id="hero-signup-btn"
                      >
                        Get Started Free
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </Link>
                    <Link to="/login">
                      <Button
                        size="lg"
                        variant="outline"
                        className="px-8 py-6 text-base rounded-full font-semibold text-slate-300 transition-all duration-200 hover:text-white"
                        style={{
                          border: '1px solid rgba(255,255,255,0.15)',
                          background: 'rgba(255,255,255,0.04)',
                          backdropFilter: 'blur(8px)',
                        }}
                        id="hero-login-btn"
                      >
                        Sign In
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>

            </div>
          </div>
        </section>

        {/* ── Features Section ─────────────────────────────────── */}
        <section className="py-28 relative overflow-hidden" style={{ background: 'hsl(var(--background))' }}>
          {/* Subtle top gradient */}
          <div className="absolute top-0 inset-x-0 h-px" style={{ background: 'linear-gradient(90deg, transparent, rgba(45,212,191,0.3), transparent)' }} aria-hidden="true" />

          <div className="container mx-auto px-4 relative z-10">
            <div className="text-center mb-16">
              <motion.h2
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-4xl md:text-5xl font-extrabold mb-4"
              >
                Everything you need to{' '}
                <span className="gradient-text">manage group finances</span>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-muted-foreground text-lg max-w-xl mx-auto"
              >
                Powerful tools designed to make splitting bills transparent, fair, and incredibly simple.
              </motion.p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {features.map((feature, i) => (
                <motion.article
                  key={i}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.12 }}
                  whileHover={
                    window.matchMedia('(prefers-reduced-motion: no-preference)').matches
                      ? { y: -6, rotateX: 2, scale: 1.02 }
                      : {}
                  }
                  className="card-3d p-7 rounded-2xl bg-card cursor-default"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Icon orb */}
                  <div
                    className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6`}
                    style={{ boxShadow: `0 0 20px ${feature.glow}, inset 0 1px 0 rgba(255,255,255,0.25)` }}
                  >
                    <feature.icon className="w-6 h-6 text-white drop-shadow-sm" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-sm">{feature.desc}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default HomePage;