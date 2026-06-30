import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import DashboardFilters from '../components/DashboardFilters';
import type { TimeframeFilter } from '../components/DashboardFilters';
import TimelineView from '../components/TimelineView';
import WorkloadChart from '../components/WorkloadChart';
import { isToday, isWithinInterval, addDays, parseISO } from 'date-fns';
import type { EducationLayer } from '../types';

export default function DashboardView() {
  const getCalculatedActions = useStore(state => state.getCalculatedActions);
  
  const allActions = getCalculatedActions();

  // Local filter state
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('Alles');
  const [layerFilter, setLayerFilter] = useState<EducationLayer | 'Alle'>('Alle');
  const [itemFilter, setItemFilter] = useState<string>('Alle');

  // Derived filtered actions
  const filteredActions = useMemo(() => {
    return allActions.filter(action => {
      // 1. Layer Filter
      if (layerFilter !== 'Alle' && action.layer !== layerFilter) return false;
      
      // 2. Item Filter
      if (itemFilter !== 'Alle' && action.knowledgeItemName !== itemFilter) return false;

      // 3. Timeframe Filter
      if (timeframe === 'Alles') return true;
      
      const actionDate = parseISO(action.scheduledStartDate);
      const today = new Date();
      
      if (timeframe === 'Vandaag') {
        return isToday(actionDate);
      }
      
      if (timeframe === '10 Dagen') {
        return isWithinInterval(actionDate, { start: today, end: addDays(today, 10) });
      }

      if (timeframe === 'Maand') {
        return isWithinInterval(actionDate, { start: today, end: addDays(today, 30) });
      }

      return true;
    });
  }, [allActions, timeframe, layerFilter, itemFilter]);

  const totalCost = filteredActions.reduce((acc, curr) => acc + curr.cost, 0);
  const totalDays = filteredActions.reduce((acc, curr) => acc + curr.durationDays, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2>Dashboard Overzicht</h2>
      </div>

      <DashboardFilters 
        timeframe={timeframe}
        setTimeframe={setTimeframe}
        layerFilter={layerFilter}
        setLayerFilter={setLayerFilter}
        itemFilter={itemFilter}
        setItemFilter={setItemFilter}
      />

      {/* Top stats for currently filtered view */}
      <div className="flex gap-4">
        <div className="glass-panel stat-card" style={{ flex: 1 }}>
          <span className="label">Getoonde Acties</span>
          <span className="value">{filteredActions.length}</span>
        </div>
        <div className="glass-panel stat-card" style={{ flex: 1 }}>
          <span className="label">Totale Kosten (gefilterd)</span>
          <span className="value">
            {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(totalCost)}
          </span>
        </div>
        <div className="glass-panel stat-card" style={{ flex: 1 }}>
          <span className="label">Totale Looptijd (dagen)</span>
          <span className="value">{totalDays}</span>
        </div>
      </div>

      {/* Main content grid */}
      <div className="flex gap-6 mt-2">
        {/* Left column: Timeline */}
        <div style={{ flex: 1 }}>
          <TimelineView actions={filteredActions} />
        </div>
        
        {/* Right column: Chart */}
        <div style={{ flex: 1.5 }}>
          <WorkloadChart actions={filteredActions} />
        </div>
      </div>
    </div>
  );
}
