import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Mail, Github, ArrowRight } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        background: 'rgba(7, 12, 26, 0.85)',
        backdropFilter: 'blur(20px) saturate(140%)',
        WebkitBackdropFilter: 'blur(20px) saturate(140%)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      {/* Top gradient divider */}
      <div
        style={{
          height: '1px',
          background: 'linear-gradient(90deg, transparent 0%, rgba(45,212,191,0.35) 30%, rgba(139,92,246,0.25) 70%, transparent 100%)',
          marginBottom: '-1px',
          position: 'relative',
          zIndex: 1,
        }}
        aria-hidden="true"
      />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">

          {/* Brand column */}
          <div className="md:col-span-2">
            <Link to="/" className="inline-flex items-center gap-2.5 mb-4 group" aria-label="FlowPay home">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shimmer logo-glow transition-all duration-300 group-hover:scale-110"
                style={{ background: 'linear-gradient(135deg, #0d9488, #2dd4bf)' }}
              >
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-xl gradient-text-brand tracking-tight">FlowPay</span>
            </Link>
            <p className="text-slate-400 max-w-sm leading-relaxed text-sm">
              The ultimate dashboard for groups, roommates, and travelers to track shared expenses,
              calculate optimal settlements, and visualize spending habits.
            </p>
          </div>

          {/* Navigation column */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-4 text-sm uppercase tracking-wider">Navigation</h4>
            <ul className="space-y-2.5">
              {[
                { href: '/',          label: 'Home'         },
                { href: '/about',     label: 'About FlowPay' },
                { href: '/dashboard', label: 'Dashboard'     },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="group flex items-center gap-1.5 text-slate-400 hover:text-teal-300 text-sm transition-colors duration-200"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" aria-hidden="true" />
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href="https://github.com/AnuroopSaxena-code/FlowPay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-1.5 text-slate-400 hover:text-teal-300 text-sm transition-colors duration-200"
                >
                  <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" aria-hidden="true" />
                  GitHub Repo
                </a>
              </li>
            </ul>
          </div>

          {/* Support column */}
          <div>
            <h4 className="font-semibold text-slate-200 mb-4 text-sm uppercase tracking-wider">Support</h4>
            <ul className="space-y-2.5">
              <li>
                <a
                  href="mailto:anuroop.saxena1@gmail.com"
                  className="flex items-center gap-2 text-slate-400 hover:text-teal-300 text-sm transition-colors duration-200"
                >
                  <Mail className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  Email Support
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/AnuroopSaxena-code/FlowPay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-slate-400 hover:text-teal-300 text-sm transition-colors duration-200"
                >
                  <Github className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" />
                  GitHub Repository
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <p className="text-xs text-slate-500">
            &copy; {currentYear} FlowPay. All rights reserved.
          </p>

          {/* Credit pill with shimmer */}
          <div
            className="shimmer flex items-center gap-1.5 text-xs text-slate-400 px-4 py-2 rounded-full"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
            }}
          >
            <span>Made with</span>
            <span
              className="text-transparent bg-clip-text font-bold"
              style={{ background: 'linear-gradient(90deg, #2dd4bf, #a78bfa)', WebkitBackgroundClip: 'text' }}
            >
              ♥
            </span>
            <span>by</span>
            <span className="font-semibold text-slate-200">Anuroop Saxena</span>
            <span className="text-slate-600">(24BDS0163)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;