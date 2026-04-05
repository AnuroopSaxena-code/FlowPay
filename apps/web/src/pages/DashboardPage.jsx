import React from 'react';
import { Helmet } from 'react-helmet';
import GroupManagement from '@/components/GroupManagement';
import MemberSetup from '@/components/MemberSetup';
import BalanceTable from '@/components/BalanceTable';
import { useGroup } from '@/contexts/GroupContext';
import { Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const DashboardPage = () => {
  const { currentGroupId, loading } = useGroup();

  return (
    <>
      <Helmet>
        <title>Dashboard - FlowPay</title>
        <meta name="description" content="Manage your group expenses and view balances on the FlowPay dashboard." />
      </Helmet>

      <div className="container mx-auto px-4 sm:px-8 py-8 md:py-12 max-w-6xl min-h-screen">
        {/* Page header */}
        <header className="mb-8 flex items-center gap-3">
          {loading ? (
            <Skeleton className="w-10 h-10 rounded-xl" />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
                boxShadow: '0 0 16px rgba(20,184,166,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              <Users className="w-5 h-5 text-white" />
            </div>
          )}
          <div className="space-y-2">
            {loading ? (
              <>
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
              </>
            ) : (
              <>
                <h1 className="text-3xl font-extrabold gradient-text leading-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground mt-0.5">Manage your group expenses and balances</p>
              </>
            )}
          </div>
        </header>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 min-w-0 space-y-6">
            {loading ? (
              <>
                <Skeleton className="h-[200px] w-full rounded-2xl" />
                <Skeleton className="h-[300px] w-full rounded-2xl" />
              </>
            ) : (
              <>
                <GroupManagement />
                {currentGroupId && <MemberSetup />}
              </>
            )}
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 min-w-0">
            {loading ? (
              <Skeleton className="h-[500px] w-full rounded-2xl" />
            ) : currentGroupId ? (
              <BalanceTable />
            ) : (
              <div
                className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-10 rounded-2xl"
                style={{
                  background: 'rgba(15,23,42,0.4)',
                  backdropFilter: 'blur(16px)',
                  border: '1px dashed rgba(255,255,255,0.1)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
                }}
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
                  style={{
                    background: 'rgba(20,184,166,0.1)',
                    border: '1px solid rgba(45,212,191,0.2)',
                    boxShadow: '0 0 20px rgba(20,184,166,0.1)',
                  }}
                >
                  <Users className="w-8 h-8 text-teal-400" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">No Group Selected</h3>
                <p className="text-muted-foreground text-sm max-w-xs leading-relaxed">
                  Create or select a group from the sidebar to view balances and manage members.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;