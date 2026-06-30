import { format, parseISO } from 'date-fns';
import type { CalculatedAction } from '../types';

interface TimelineViewProps {
  actions: CalculatedAction[];
}

export default function TimelineView({ actions }: TimelineViewProps) {
  if (actions.length === 0) {
    return (
      <div className="glass-panel">
        <p className="text-secondary text-center py-8">
          Geen acties gevonden voor de huidige filters.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ maxHeight: '500px', overflowY: 'auto' }}>
      <h3 className="mb-4">Tijdlijn Acties</h3>
      <div className="flex flex-col gap-4">
        {actions.map(action => (
          <div 
            key={action.id} 
            className="flex items-start gap-4 p-4 rounded-lg"
            style={{ backgroundColor: 'var(--surface)' }}
          >
            <div className="flex flex-col items-center min-w-[80px]">
              <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                {format(parseISO(action.scheduledStartDate), 'MMM')}
              </span>
              <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>
                {format(parseISO(action.scheduledStartDate), 'dd')}
              </span>
            </div>
            
            <div style={{ flex: 1 }}>
              <div className="flex items-center gap-2 mb-1">
                <span className={`badge badge-${action.layer.toLowerCase()}`}>{action.layer}</span>
                <span style={{ fontWeight: 600 }}>{action.knowledgeItemName}</span>
              </div>
              <p style={{ color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{action.actionName}</p>
              <div className="flex gap-4 text-secondary" style={{ fontSize: '0.875rem' }}>
                <span>Duur: {action.durationDays} dagen</span>
                <span>Kosten: {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(action.cost)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
