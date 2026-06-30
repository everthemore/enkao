import { format, parseISO } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import type { CalculatedAction, AppEvent } from '../types';
import { getLayers } from '../utils/dataGenerator';

interface TimelineViewProps {
  actions: CalculatedAction[];
  events?: AppEvent[];
}

type TimelineItem = 
  | { type: 'action'; data: CalculatedAction; date: string }
  | { type: 'event'; data: AppEvent; date: string };

export default function TimelineView({ actions, events = [] }: TimelineViewProps) {
  const availableLayers = getLayers();

  const timelineItems: TimelineItem[] = [
    ...actions.map(a => ({ type: 'action' as const, data: a, date: a.scheduledStartDate })),
    ...events.map(e => ({ type: 'event' as const, data: e, date: e.startDate || e.date || '' }))
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (timelineItems.length === 0) {
    return (
      <div className="glass-panel">
        <p className="text-secondary text-center py-8">
          Geen acties of evenementen gevonden voor de huidige filters.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-panel" style={{ maxHeight: '500px', overflowY: 'auto' }}>
      <h3 className="mb-4">Tijdlijn Acties & Evenementen</h3>
      <div className="flex flex-col gap-4">
        {timelineItems.map((item, index) => {
          if (item.type === 'action') {
            const action = item.data;
            return (
              <div 
                key={`action-${action.id}-${index}`} 
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
            );
          } else {
            const event = item.data;
            const eStart = event.startDate || event.date;
            const eEnd = event.endDate || event.date;
            const isMultiDay = eStart !== eEnd;
            
            return (
              <div 
                key={`event-${event.id}-${index}`} 
                className="flex items-start gap-4 p-4 rounded-lg border border-[var(--border)]"
                style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
              >
                <div className="flex flex-col items-center min-w-[80px]">
                  <span className="text-secondary" style={{ fontSize: '0.75rem', textTransform: 'uppercase' }}>
                    {format(parseISO(eStart!), 'MMM')}
                  </span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {format(parseISO(eStart!), 'dd')}
                  </span>
                  {isMultiDay && (
                    <span className="text-secondary mt-1" style={{ fontSize: '0.75rem' }}>
                      t/m {format(parseISO(eEnd!), 'dd MMM')}
                    </span>
                  )}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2 mb-1">
                    <CalendarDays size={16} className="text-secondary" />
                    <span style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Evenement</span>
                  </div>
                  <p style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>{event.description}</p>
                  <div className="flex gap-1 flex-wrap">
                    {(event.layers || []).length === availableLayers.length || (event.layers || []).length === 0
                      ? <span className="badge" style={{ fontSize: '0.7rem' }}>Alle Lagen</span>
                      : (event.layers || []).map(l => (
                        <span key={l} className={`badge badge-${l.toLowerCase()}`} style={{ fontSize: '0.7rem' }}>{l}</span>
                      ))
                    }
                  </div>
                </div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
}
