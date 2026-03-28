import React from 'react';
import { Link } from 'react-router-dom';
import { PieChart, Mail, Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center shadow-sm">
                <PieChart className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-teal-700 dark:text-teal-400">FlowPay</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
              The ultimate dashboard for groups, roommates, and travelers to track shared expenses, calculate optimal settlements, and visualize spending habits.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/" className="text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Home</Link></li>
              <li><Link to="/about" className="text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">About FlowPay</Link></li>
              <li><Link to="/dashboard" className="text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">Dashboard</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-4">Contact</h4>
            <ul className="space-y-2">
              <li>
                <a href="mailto:anuroop.saxena1@gmail.com" className="flex items-center gap-2 text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors">
                  <Mail className="w-4 h-4" />
                  Email Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            &copy; {currentYear} FlowPay. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900 px-4 py-2 rounded-full border border-slate-100 dark:border-slate-800">
            <span>Made with</span>
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            <span>by</span>
            <span className="font-medium text-slate-900 dark:text-slate-100">Anuroop Saxena</span>
            <span className="text-xs text-slate-400 ml-1">(24BDS0163)</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;