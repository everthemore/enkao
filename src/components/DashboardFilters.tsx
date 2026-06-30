import { getKnowledgeItemNames, getLayers } from '../utils/dataGenerator';
import type { EducationLayer } from '../types';

export type TimeframeFilter = 'Vandaag' | '10 Dagen' | 'Maand' | 'Aangepaste Periode' | 'Alles';

interface DashboardFiltersProps {
  timeframe: TimeframeFilter;
  setTimeframe: (tf: TimeframeFilter) => void;
  layerFilter: EducationLayer | 'Alle';
  setLayerFilter: (layer: EducationLayer | 'Alle') => void;
  itemFilter: string;
  setItemFilter: (item: string) => void;
  customStartDate: string;
  setCustomStartDate: (date: string) => void;
  customEndDate: string;
  setCustomEndDate: (date: string) => void;
}

export default function DashboardFilters({
  timeframe, setTimeframe,
  layerFilter, setLayerFilter,
  itemFilter, setItemFilter,
  customStartDate, setCustomStartDate,
  customEndDate, setCustomEndDate
}: DashboardFiltersProps) {
  const layers = getLayers();
  const items = getKnowledgeItemNames();

  const timeframes: TimeframeFilter[] = ['Vandaag', '10 Dagen', 'Maand', 'Aangepaste Periode', 'Alles'];

  return (
    <div className="glass-panel mb-6 flex flex-col gap-4">
      <h3 className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '-0.5rem' }}>Filters</h3>
      
      <div className="flex gap-6 items-end flex-wrap">
        {/* Timeframe Dropdown */}
        <div className="flex flex-col gap-2" style={{ minWidth: '180px' }}>
          <label className="text-secondary" style={{ fontSize: '0.75rem' }}>Periode</label>
          <select 
            className="select" 
            value={timeframe} 
            onChange={(e) => setTimeframe(e.target.value as TimeframeFilter)}
          >
            {timeframes.map(tf => (
              <option key={tf} value={tf}>{tf}</option>
            ))}
          </select>
        </div>

        {/* Custom Range Inputs */}
        {timeframe === 'Aangepaste Periode' && (
          <div className="flex gap-4 p-3 rounded-lg border border-[var(--border)]" style={{ backgroundColor: 'var(--surface-hover)' }}>
            <div className="flex flex-col gap-1">
              <label className="text-secondary" style={{ fontSize: '0.75rem' }}>Van</label>
              <input 
                type="date" 
                className="input" 
                style={{ padding: '0.25rem 0.5rem' }}
                value={customStartDate}
                onChange={e => setCustomStartDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-secondary" style={{ fontSize: '0.75rem' }}>Tot en met</label>
              <input 
                type="date" 
                className="input" 
                style={{ padding: '0.25rem 0.5rem' }}
                value={customEndDate}
                onChange={e => setCustomEndDate(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Layer Dropdown */}
        <div className="flex flex-col gap-2" style={{ minWidth: '150px' }}>
          <label className="text-secondary" style={{ fontSize: '0.75rem' }}>Onderwijslaag</label>
          <select 
            className="select" 
            value={layerFilter} 
            onChange={(e) => setLayerFilter(e.target.value as EducationLayer | 'Alle')}
          >
            <option value="Alle">Alle Lagen</option>
            {layers.map(l => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
        </div>

        {/* Item Dropdown */}
        <div className="flex flex-col gap-2" style={{ minWidth: '200px' }}>
          <label className="text-secondary" style={{ fontSize: '0.75rem' }}>Kennisitem</label>
          <select 
            className="select" 
            value={itemFilter} 
            onChange={(e) => setItemFilter(e.target.value)}
          >
            <option value="Alle">Alle Items</option>
            {items.map(i => (
              <option key={i} value={i}>{i}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
