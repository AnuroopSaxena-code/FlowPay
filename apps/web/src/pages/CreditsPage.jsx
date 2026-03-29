import React from 'react';
import { Helmet } from 'react-helmet';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code2, Heart, Mail, User, Zap, Shield, Smartphone, Github, ExternalLink } from 'lucide-react';

const CreditsPage = () => {
  return (
    <>
      <Helmet>
        <title>About FlowPay</title>
      </Helmet>
      
      <div className="container mx-auto px-4 sm:px-8 py-12 max-w-5xl bg-background/95 backdrop-blur-3xl shadow-xl dark:shadow-none border-x border-border/20 dark:border-transparent min-h-[calc(100vh-4rem)]">
          
          {/* Hero Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
              About <span className="text-teal-600 dark:text-teal-400">FlowPay</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
              FlowPay is a modern, intelligent expense settlement platform designed to eliminate the friction of shared finances. Whether you're traveling with friends, managing household bills, or organizing group events, FlowPay ensures everyone pays their fair share with minimal transactions.
            </p>
          </motion.div>

          {/* Developer Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-16"
          >
            <Card className="overflow-hidden border-none shadow-lg bg-white dark:bg-slate-950">
              <div className="h-32 bg-gradient-to-r from-teal-500 to-cyan-600"></div>
              <CardContent className="relative pt-16 pb-8 px-8 text-center">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-24 h-24 bg-white dark:bg-slate-900 rounded-full p-2 shadow-xl">
                  <div className="w-full h-full bg-teal-100 dark:bg-teal-900/50 rounded-full flex items-center justify-center">
                    <User className="w-10 h-10 text-teal-600 dark:text-teal-400" />
                  </div>
                </div>
                
                <h2 className="text-2xl font-bold mb-2">Anuroop Saxena</h2>
                <div className="flex items-center justify-center gap-2 mb-6">
                  <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    ID: 24BDS0163
                  </Badge>
                  <Badge variant="secondary" className="bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300">
                    Lead Developer
                  </Badge>
                </div>
                
                <p className="text-slate-600 dark:text-slate-400 max-w-lg mx-auto mb-6">
                  Passionate software developer focused on creating intuitive, high-performance web applications that solve real-world problems through elegant code and thoughtful design.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <a 
                    href="mailto:anuroop.saxena1@gmail.com" 
                    className="inline-flex items-center gap-2 text-slate-600 hover:text-teal-600 dark:text-slate-400 dark:hover:text-teal-400 font-medium transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    anuroop.saxena1@gmail.com
                  </a>
                  <span className="hidden sm:block text-slate-300 dark:text-slate-700">|</span>
                  <a 
                    href="https://github.com/AnuroopSaxena-code/FlowPay" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300 font-medium transition-colors"
                  >
                    <Github className="w-5 h-5" />
                    GitHub Repository
                    <ExternalLink className="w-3 h-3 ml-0.5" />
                  </a>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Features & Tech Stack */}
          <div className="grid md:grid-cols-2 gap-8">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Zap className="w-6 h-6 text-amber-500" />
                Key Features
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'Smart Settlements', desc: 'Advanced algorithms minimize the number of transactions needed to settle debts.' },
                  { title: 'Simulation Mode', desc: 'Test payments and expenses before committing them to the group ledger.' },
                  { title: 'Automated Nudges', desc: 'Send professional email notifications to debtors with a single click via EmailJS.' },
                  { title: 'Visual Analytics', desc: 'Beautiful charts and graphs to understand spending patterns.' },
                  { title: 'Real-time Sync', desc: 'Instant updates across all devices for all group members.' }
                ].map((feature, i) => (
                  <div key={i} className="bg-white dark:bg-slate-950 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                    <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{feature.title}</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Code2 className="w-6 h-6 text-blue-500" />
                Technology Stack
              </h3>
              <div className="bg-white dark:bg-slate-950 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-800">
                <div className="space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Frontend</h4>
                    <div className="flex flex-wrap gap-2">
                      {['React 18', 'Vite', 'TailwindCSS', 'Framer Motion', 'Recharts', 'shadcn/ui'].map(tech => (
                        <Badge key={tech} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Backend & Database</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Firebase Auth', 'Cloud Firestore', 'EmailJS'].map(tech => (
                        <Badge key={tech} variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">Architecture</h4>
                    <div className="flex flex-wrap gap-2">
                      {['Context API', 'Protected Routes', 'Responsive Design'].map(tech => (
                        <Badge key={tech} variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
    </>
  );
};

export default CreditsPage;