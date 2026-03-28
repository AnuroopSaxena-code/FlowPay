import React from 'react';
import { useGroup } from '@/contexts/GroupContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { History, RotateCcw, Trash2 } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const SimulationHistory = () => {
  const { simulationHistory, jumpToHistory, resetSimulation } = useGroup();

  if (simulationHistory.length === 0) return null;

  return (
    <Card className="border-purple-200 shadow-sm mt-6">
      <CardHeader className="bg-purple-50/30 border-b py-3 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-medium text-purple-800 flex items-center gap-2">
          <History className="w-4 h-4" />
          Simulation History
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={resetSimulation} className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-100">
          <Trash2 className="w-3 h-3 mr-1" /> Clear
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[200px]">
          <div className="p-4 space-y-4 relative before:absolute before:inset-0 before:ml-6 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-purple-200 before:to-transparent">
            {simulationHistory.map((item, index) => (
              <div key={item.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-purple-100 text-purple-600 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                  <span className="text-[10px] font-bold">{index + 1}</span>
                </div>
                <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-lg border border-purple-100 bg-white shadow-sm flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-800">{item.description}</p>
                    <p className="text-[10px] text-slate-400">{item.timestamp.toLocaleTimeString()}</p>
                  </div>
                  {index !== simulationHistory.length - 1 && (
                    <Button variant="ghost" size="icon" onClick={() => jumpToHistory(item)} title="Revert to this state" className="h-7 w-7 text-purple-500 hover:bg-purple-50">
                      <RotateCcw className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SimulationHistory;