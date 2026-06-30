import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import DashboardFilters from '../components/DashboardFilters';
import type { TimeframeFilter } from '../components/DashboardFilters';
import TimelineView from '../components/TimelineView';
import WorkloadChart from '../components/WorkloadChart';
import { isToday, isWithinInterval, addDays, parseISO, startOfDay, endOfDay, isAfter, isBefore } from 'date-fns';
import type { EducationLayer } from '../types';

export default function DashboardView() {
  const getCalculatedActions = useStore(state => state.getCalculatedActions);
  const allEvents = useStore(state => state.events);
  
  const allActions = getCalculatedActions();

  // Local filter state
  const [timeframe, setTimeframe] = useState<TimeframeFilter>('Alles');
  const [layerFilter, setLayerFilter] = useState<EducationLayer | 'Alle'>('Alle');
  const [itemFilter, setItemFilter] = useState<string>('Alle');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');

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
      const today = startOfDay(new Date());
      
      if (timeframe === 'Vandaag') {
        return isToday(actionDate);
      }
      
      if (timeframe === '10 Dagen') {
        return isWithinInterval(actionDate, { start: today, end: endOfDay(addDays(today, 10)) });
      }

      if (timeframe === 'Maand') {
        return isWithinInterval(actionDate, { start: today, end: endOfDay(addDays(today, 30)) });
      }

      if (timeframe === 'Aangepaste Periode') {
        if (!customStartDate && !customEndDate) return true;
        
        let inRange = true;
        if (customStartDate) {
          const start = startOfDay(parseISO(customStartDate));
          if (isBefore(actionDate, start)) inRange = false;
        }
        if (customEndDate) {
          const end = endOfDay(parseISO(customEndDate));
          if (isAfter(actionDate, end)) inRange = false;
        }
        return inRange;
      }

      return true;
    });
  }, [allActions, timeframe, layerFilter, itemFilter, customStartDate, customEndDate]);

  // Derived filtered events
  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      // 1. Layer Filter for Events
      if (layerFilter !== 'Alle') {
        // If event specifies layers, it must include the filtered layer.
        // If it specifies no layers (or all), it applies to all.
        if (event.layers && event.layers.length > 0 && !event.layers.includes(layerFilter)) {
          return false;
        }
      }
      
      // Note: itemFilter does not apply to events, so we skip it.

      // 2. Timeframe Filter
      if (timeframe === 'Alles') return true;
      
      const eStart = event.startDate || event.date;
      const eEnd = event.endDate || event.date;
      
      if (!eStart || !eEnd) return false;

      const eventStart = parseISO(eStart);
      const eventEnd = endOfDay(parseISO(eEnd));
      const today = startOfDay(new Date());
      
      if (timeframe === 'Vandaag') {
        return isWithinInterval(today, { start: eventStart, end: eventEnd });
      }
      
      if (timeframe === '10 Dagen') {
        const periodEnd = endOfDay(addDays(today, 10));
        return (isBefore(eventStart, periodEnd) || eventStart.getTime() === periodEnd.getTime()) && 
               (isAfter(eventEnd, today) || eventEnd.getTime() === today.getTime());
      }

      if (timeframe === 'Maand') {
        const periodEnd = endOfDay(addDays(today, 30));
        return (isBefore(eventStart, periodEnd) || eventStart.getTime() === periodEnd.getTime()) && 
               (isAfter(eventEnd, today) || eventEnd.getTime() === today.getTime());
      }

      if (timeframe === 'Aangepaste Periode') {
        if (!customStartDate && !customEndDate) return true;
        
        let inRange = true;
        if (customStartDate) {
          const start = startOfDay(parseISO(customStartDate));
          if (isBefore(eventEnd, start)) inRange = false; // Event ends before custom start
        }
        if (customEndDate) {
          const end = endOfDay(parseISO(customEndDate));
          if (isAfter(eventStart, end)) inRange = false; // Event starts after custom end
        }
        return inRange;
      }

      return true;
    });
  }, [allEvents, timeframe, layerFilter, customStartDate, customEndDate]);

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
        customStartDate={customStartDate}
        setCustomStartDate={setCustomStartDate}
        customEndDate={customEndDate}
        setCustomEndDate={setCustomEndDate}
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
          <TimelineView actions={filteredActions} events={filteredEvents} />
        </div>
        
        {/* Right column: Chart */}
        <div style={{ flex: 1.5 }}>
          <WorkloadChart actions={filteredActions} />
        </div>
      </div>
    </div>
  );
}
