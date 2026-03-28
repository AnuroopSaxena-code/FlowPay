import React from 'react';
import { Helmet } from 'react-helmet';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { useGroup } from '@/contexts/GroupContext';

const AnalyticsPage = () => {
  const { currentGroupId } = useGroup();

  if (!currentGroupId) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-2">No Group Selected</h2>
        <p className="text-muted-foreground">Please select or create a group from the Dashboard first.</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Analytics - FlowPay</title>
      </Helmet>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8">Analytics</h1>
        <AnalyticsDashboard />
      </div>
    </>
  );
};

export default AnalyticsPage;