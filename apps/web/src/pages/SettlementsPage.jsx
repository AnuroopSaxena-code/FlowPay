import React, { useState, useEffect, useMemo } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router-dom';
import SettlementList from '@/components/SettlementList';
import SimulationPanel from '@/components/SimulationPanel';
import SimulationComparison from '@/components/SimulationComparison';
import SettlementComparison from '@/components/SettlementComparison';
import SimulationHistory from '@/components/SimulationHistory';
import { useGroup } from '@/contexts/GroupContext';
import { Button } from '@/components/ui/button';
import { FlaskConical, Save, XCircle, RotateCcw, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

const SettlementsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    currentGroupId, 
    simulationMode, 
    enterSimulationMode, 
    exitSimulationMode, 
    applySimulation, 
    discardSimulation, 
    members,
    expenses,
    settlements,
    calculateBalances
  } = useGroup();


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
        <title>Settlements - FlowPay</title>
      </Helmet>

      <AnimatePresence>
        {simulationMode && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-purple-600 text-white py-2 px-4 text-center font-medium text-sm shadow-inner flex items-center justify-center gap-2"
          >
            <FlaskConical className="w-4 h-4" />
            SIMULATION MODE - Changes are not saved until applied
          </motion.div>
        )}
      </AnimatePresence>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold">Settlements</h1>
          
          {!simulationMode ? (
            <Button onClick={enterSimulationMode} className="bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-lg transition-all">
              <FlaskConical className="w-4 h-4 mr-2" /> Enter Simulation Mode
            </Button>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button onClick={applySimulation} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                <Save className="w-4 h-4 mr-2" /> Apply Changes
              </Button>
              <Button onClick={discardSimulation} variant="outline" className="border-rose-200 text-rose-600 hover:bg-rose-50">
                <XCircle className="w-4 h-4 mr-2" /> Discard
              </Button>
              <Button onClick={exitSimulationMode} variant="ghost" className="text-slate-500 hover:text-slate-700">
                <LogOut className="w-4 h-4 mr-2" /> Exit Mode
              </Button>
            </div>
          )}
        </div>

        {simulationMode ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <SimulationPanel />
            
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Impact Analysis</h3>
              <SimulationComparison />
              <SettlementComparison />
            </div>

            <SimulationHistory />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <SettlementList />
          </motion.div>
        )}
      </div>
    </>
  );
};

export default SettlementsPage;