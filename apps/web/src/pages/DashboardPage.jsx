import React from 'react';
import { Helmet } from 'react-helmet';
import GroupManagement from '@/components/GroupManagement';
import MemberSetup from '@/components/MemberSetup';
import BalanceTable from '@/components/BalanceTable';
import { useGroup } from '@/contexts/GroupContext';

const DashboardPage = () => {
  const { currentGroupId } = useGroup();

  return (
    <>
      <Helmet>
        <title>Dashboard - FlowPay</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            <GroupManagement />
            {currentGroupId && <MemberSetup />}
          </div>
          
          <div className="lg:col-span-2">
            {currentGroupId ? (
              <BalanceTable />
            ) : (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-center p-8 border-2 border-dashed rounded-xl bg-muted/10">
                <h3 className="text-xl font-semibold mb-2">No Group Selected</h3>
                <p className="text-muted-foreground">Create or select a group from the sidebar to view balances and manage members.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;