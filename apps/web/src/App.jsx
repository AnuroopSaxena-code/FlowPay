import React from 'react';
import { Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { GroupProvider } from '@/contexts/GroupContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ScrollToTop from '@/components/ScrollToTop';
import { Toaster } from '@/components/ui/toaster';
import InteractiveBackground from '@/components/InteractiveBackground';

// Pages
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/LoginPage';
import SignupPage from '@/pages/SignupPage';
import DashboardPage from '@/pages/DashboardPage';
import ExpensesPage from '@/pages/ExpensesPage';
import SettlementsPage from '@/pages/SettlementsPage';
import AnalyticsPage from '@/pages/AnalyticsPage';
import CreditsPage from '@/pages/CreditsPage';
import JoinGroupPage from '@/pages/JoinGroupPage';

function App() {
  return (
    <AuthProvider>
      <GroupProvider>
        <Router>
          <ScrollToTop />
          {/* Fixed background layer — particles + ambient orbs */}
          <InteractiveBackground />

          {/* Page shell */}
          <div className="min-h-screen flex flex-col text-foreground relative z-10">
            <Header />

            <main className="flex-1 flex flex-col w-full transition-all duration-300">
              <Routes>
                <Route path="/"    element={<HomePage />} />
                <Route path="/login"  element={<LoginPage />} />
                <Route path="/signup" element={<SignupPage />} />
                <Route path="/about"  element={<CreditsPage />} />
                <Route path="/join/:inviteCode" element={<JoinGroupPage />} />

                {/* Protected Routes */}
                <Route path="/dashboard"   element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
                <Route path="/expenses"    element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
                <Route path="/settlements" element={<ProtectedRoute><SettlementsPage /></ProtectedRoute>} />
                <Route path="/analytics"   element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
              </Routes>
            </main>

            <Footer />
          </div>

          <Toaster />
        </Router>
      </GroupProvider>
    </AuthProvider>
  );
}

export default App;