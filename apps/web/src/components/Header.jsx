import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Moon, Sun, Menu, User, LogOut, LayoutDashboard, Receipt, PieChart, ArrowLeftRight, Info } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const Header = () => {
  const { currentUser, logout } = useAuth();
  const { groups, currentGroupId, switchGroup } = useGroup();
  const location = useLocation();
  const navigate = useNavigate();
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { path: '/dashboard',   label: 'Dashboard',   icon: LayoutDashboard },
    { path: '/expenses',    label: 'Expenses',     icon: Receipt         },
    { path: '/settlements', label: 'Settlements',  icon: ArrowLeftRight  },
    { path: '/analytics',   label: 'Analytics',    icon: PieChart        },
    { path: '/about',       label: 'About',        icon: Info            },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header
      className="sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        background: scrolled
          ? 'rgba(15, 23, 42, 0.85)'
          : 'rgba(15, 23, 42, 0.6)',
        backdropFilter: 'blur(24px) saturate(160%)',
        WebkitBackdropFilter: 'blur(24px) saturate(160%)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        boxShadow: scrolled
          ? '0 4px 32px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.07)'
          : '0 1px 0 rgba(255,255,255,0.05)',
      }}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo + Group selector */}
        <div className="flex items-center gap-5">
          <Link to="/" className="flex items-center gap-2.5 group" aria-label="FlowPay home">
            {/* 3D Logo icon */}
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shimmer logo-glow transition-all duration-300 group-hover:scale-110"
              style={{
                background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 50%, #2dd4bf 100%)',
              }}
            >
              <PieChart className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
            {/* Holographic gradient brand name */}
            <span className="font-extrabold text-xl hidden md:inline-block gradient-text-brand tracking-tight">
              FlowPay
            </span>
          </Link>

          {currentUser && groups.length > 0 && (
            <div className="hidden md:block w-44">
              <Select value={currentGroupId || ''} onValueChange={switchGroup}>
                <SelectTrigger
                  className="h-9 text-sm border-white/10 text-slate-300 focus:ring-teal-500/40"
                  style={{ background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(8px)' }}
                >
                  <SelectValue placeholder="Select Group" />
                </SelectTrigger>
                <SelectContent>
                  {groups.map(g => (
                    <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        {/* Right: Nav + controls */}
        <div className="flex items-center gap-1 md:gap-2">
          {currentUser ? (
            <>
              <nav className="hidden md:flex items-center gap-0.5" aria-label="Main navigation">
                {navLinks.map(({ path, label, icon: Icon }) => (
                  <Link key={path} to={path}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`gap-1.5 text-sm transition-all duration-200 rounded-lg px-3 ${
                        isActive(path)
                          ? 'text-teal-300 bg-teal-500/10 nav-glow-active'
                          : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {label}
                    </Button>
                  </Link>
                ))}
              </nav>

              {/* Theme toggle */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="text-slate-400 hover:text-slate-200 hover:bg-white/5 rounded-lg"
                aria-label="Toggle theme"
              >
                {isDark
                  ? <Sun  className="w-4 h-4" />
                  : <Moon className="w-4 h-4" />
                }
              </Button>

              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full text-slate-400 hover:text-slate-200 hover:bg-white/5"
                    aria-label="User menu"
                  >
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: 'linear-gradient(135deg, #0d9488, #7c3aed)',
                        boxShadow: '0 0 8px rgba(20,184,166,0.4)',
                      }}
                    >
                      <User className="w-3.5 h-3.5 text-white" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="glass-dark border-white/10 text-slate-200">
                  <div className="px-2 py-1.5 text-xs font-medium text-slate-400">
                    {currentUser.email}
                  </div>
                  <DropdownMenuItem onClick={handleLogout} className="text-red-400 cursor-pointer focus:text-red-300 focus:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile sheet */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="md:hidden text-slate-400 hover:text-slate-200" aria-label="Open menu">
                    <Menu className="w-5 h-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64 glass-dark border-l border-white/10">
                  <div className="flex flex-col gap-3 mt-8">
                    {groups.length > 0 && (
                      <Select value={currentGroupId || ''} onValueChange={switchGroup}>
                        <SelectTrigger className="border-white/10 text-slate-300" style={{ background: 'rgba(255,255,255,0.05)' }}>
                          <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map(g => (
                            <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {navLinks.map(({ path, label, icon: Icon }) => (
                      <Link key={path} to={path}>
                        <Button
                          variant="ghost"
                          className={`w-full justify-start gap-2 ${
                            isActive(path) ? 'text-teal-300 bg-teal-500/10' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                          }`}
                        >
                          <Icon className="w-4 h-4" />
                          {label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <nav className="hidden md:flex items-center gap-0.5 mr-1" aria-label="Public navigation">
                <Link to="/about">
                  <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-200 hover:bg-white/5">
                    About
                  </Button>
                </Link>
              </nav>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsDark(!isDark)}
                className="text-slate-400 hover:text-slate-200 hover:bg-white/5"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>

              <Link to="/login">
                <Button variant="ghost" className="text-slate-300 hover:text-white hover:bg-white/5">
                  Login
                </Button>
              </Link>

              <Link to="/signup">
                <Button
                  className="btn-3d text-white font-semibold px-5"
                  style={{
                    background: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 60%, #2dd4bf 100%)',
                  }}
                >
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;