import { getKnowledgeItemNames, getLayers } from '../utils/dataGenerator';
import type { EducationLayer } from '../types';

export type TimeframeFilter = 'Vandaag' | '10 Dagen' | 'Maand' | 'Alles';

interface DashboardFiltersProps {
  timeframe: TimeframeFilter;
  setTimeframe: (tf: TimeframeFilter) => void;
  layerFilter: EducationLayer | 'Alle';
  setLayerFilter: (layer: EducationLayer | 'Alle') => void;
  itemFilter: string;
  setItemFilter: (item: string) => void;
}

export default function DashboardFilters({
  timeframe, setTimeframe,
  layerFilter, setLayerFilter,
  itemFilter, setItemFilter
}: DashboardFiltersProps) {
  const layers = getLayers();
  const items = getKnowledgeItemNames();

  const timeframes: TimeframeFilter[] = ['Vandaag', '10 Dagen', 'Maand', 'Alles'];

  return (
    <div className="glass-panel mb-6 flex flex-col gap-4">
      <h3 className="text-secondary" style={{ fontSize: '0.875rem', marginBottom: '-0.5rem' }}>Filters</h3>
      
      <div className="flex gap-6 items-end">
        {/* Timeframe Toggles */}
        <div className="flex gap-2">
          {timeframes.map(tf => (
            <button
              key={tf}
              className={`btn ${timeframe === tf ? 'btn-primary' : ''}`}
              onClick={() => setTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

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
