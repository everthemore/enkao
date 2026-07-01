import { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { 
  format, 
  parseISO, 
  startOfWeek, 
  addWeeks, 
  subWeeks, 
  addDays, 
  isSameDay, 
  isWithinInterval, 
  getISOWeek, 
  isToday,
  endOfDay,
  startOfDay
} from 'date-fns';
import { nl } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Info, X, CalendarDays } from 'lucide-react';
import type { EducationLayer } from '../types';
import { getLayers } from '../utils/dataGenerator';

export default function CalendarView() {
  const getCalculatedActions = useStore(state => state.getCalculatedActions);
  const allEvents = useStore(state => state.events);
  const allActions = getCalculatedActions();
  const availableLayers = getLayers();

  // Navigation state (start of week, Monday = 1)
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [layerFilter, setLayerFilter] = useState<EducationLayer | 'Alle'>('Alle');
  
  // Modal state for selected day details
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Generate the 7 days of the current week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(currentWeekStart, i));
  }, [currentWeekStart]);

  const weekNumber = getISOWeek(currentWeekStart);
  const monthYearStr = format(currentWeekStart, 'MMMM yyyy', { locale: nl });

  // Filter actions and events
  const filteredActions = useMemo(() => {
    return allActions.filter(action => {
      if (layerFilter !== 'Alle' && action.layer !== layerFilter) return false;
      return true;
    });
  }, [allActions, layerFilter]);

  const filteredEvents = useMemo(() => {
    return allEvents.filter(event => {
      if (layerFilter !== 'Alle') {
        if (event.layers && event.layers.length > 0 && !event.layers.includes(layerFilter)) {
          return false;
        }
      }
      return true;
    });
  }, [allEvents, layerFilter]);

  // Helper to get items for a specific day
  const getItemsForDay = (day: Date) => {
    const dayStart = startOfDay(day);
    const dayEnd = endOfDay(day);

    const dayActions = filteredActions.filter(action => {
      const start = parseISO(action.scheduledStartDate);
      const end = endOfDay(parseISO(action.scheduledEndDate));
      return isWithinInterval(dayStart, { start, end }) || isWithinInterval(end, { start: dayStart, end: dayEnd }) || (start <= dayStart && end >= dayEnd);
    });

    const dayEvents = filteredEvents.filter(event => {
      const eStart = event.startDate || event.date || '';
      const eEnd = event.endDate || event.date || '';
      if (!eStart || !eEnd) return false;
      const start = startOfDay(parseISO(eStart));
      const end = endOfDay(parseISO(eEnd));
      return isWithinInterval(dayStart, { start, end }) || (start <= dayStart && end >= dayEnd);
    });

    return { dayActions, dayEvents };
  };

  const selectedDayItems = useMemo(() => {
    if (!selectedDay) return { dayActions: [], dayEvents: [] };
    return getItemsForDay(selectedDay);
  }, [selectedDay, filteredActions, filteredEvents]);

  return (
    <div className="flex flex-col gap-6" style={{ height: 'calc(100vh - 120px)' }}>
      {/* Top Header & Controls */}
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold" style={{ backgroundColor: 'var(--primary)', color: '#fff', fontSize: '1.1rem' }}>
            <CalendarIcon size={20} />
            <span>Week {weekNumber}</span>
          </div>
          <h2 style={{ textTransform: 'capitalize', margin: 0 }}>{monthYearStr}</h2>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          {/* Layer Filter */}
          <div className="flex items-center gap-1 bg-[var(--surface)] p-1 rounded-lg border border-[var(--border)]">
            <button 
              onClick={() => setLayerFilter('Alle')}
              className={`px-3 py-1 rounded text-sm font-medium transition-all ${layerFilter === 'Alle' ? 'bg-[var(--primary)] text-white' : 'text-secondary hover:text-white'}`}
            >
              Alle
            </button>
            {availableLayers.map(layer => (
              <button 
                key={layer}
                onClick={() => setLayerFilter(layer)}
                className={`px-3 py-1 rounded text-sm font-medium transition-all ${layerFilter === layer ? 'bg-[var(--primary)] text-white' : 'text-secondary hover:text-white'}`}
              >
                {layer}
              </button>
            ))}
          </div>

          {/* Navigation buttons */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setCurrentWeekStart(subWeeks(currentWeekStart, 1))}
              className="btn btn-secondary" 
              style={{ padding: '0.5rem' }}
              title="Vorige week"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={() => setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}
              className="btn btn-secondary font-medium" 
              style={{ padding: '0.5rem 1rem' }}
            >
              Vandaag
            </button>
            <button 
              onClick={() => setCurrentWeekStart(addWeeks(currentWeekStart, 1))}
              className="btn btn-secondary" 
              style={{ padding: '0.5rem' }}
              title="Volgende week"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 7-Column Weekly Calendar Grid */}
      <div className="grid grid-cols-7 gap-3 flex-1 min-h-[500px]">
        {weekDays.map(day => {
          const { dayActions, dayEvents } = getItemsForDay(day);
          const today = isToday(day);
          const dayNameStr = format(day, 'EEEE', { locale: nl });
          const dayNumStr = format(day, 'd MMM');

          return (
            <div 
              key={day.toISOString()} 
              onClick={() => setSelectedDay(day)}
              className="glass-panel flex flex-col gap-2 transition-all hover:border-[var(--primary)] cursor-pointer"
              style={{ 
                padding: '0.75rem', 
                borderColor: today ? 'var(--primary)' : 'var(--border)',
                backgroundColor: today ? 'rgba(0, 102, 204, 0.05)' : 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                overflowY: 'auto'
              }}
            >
              {/* Column Header */}
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-2 mb-1">
                <span className="font-semibold text-secondary" style={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>
                  {dayNameStr}
                </span>
                <span className={`font-bold px-2 py-0.5 rounded ${today ? 'bg-[var(--primary)] text-white' : 'text-primary'}`} style={{ fontSize: '0.85rem' }}>
                  {dayNumStr}
                </span>
              </div>

              {/* Events inside Column */}
              {dayEvents.map(ev => (
                <div 
                  key={ev.id} 
                  className="p-2 rounded text-xs border border-dashed border-secondary flex items-center gap-1.5"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.03)', color: 'var(--text-secondary)' }}
                  title={ev.description}
                >
                  <CalendarDays size={12} className="shrink-0" />
                  <span className="truncate font-medium">{ev.description}</span>
                </div>
              ))}

              {/* Actions inside Column */}
              {dayActions.map(action => {
                const isStartDay = isSameDay(parseISO(action.scheduledStartDate), day);
                return (
                  <div 
                    key={action.id}
                    className="p-2 rounded text-xs flex flex-col gap-1 border border-[var(--border)] transition-all hover:scale-[1.02]"
                    style={{ 
                      backgroundColor: 'rgba(0, 0, 0, 0.2)',
                      borderLeft: `3px solid var(--primary)`
                    }}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`badge badge-${action.layer.toLowerCase()}`} style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem' }}>
                        {action.layer}
                      </span>
                      {action.shiftedDays > 0 && isStartDay && (
                        <span className="badge" style={{ fontSize: '0.65rem', padding: '0.1rem 0.3rem', backgroundColor: '#e65100', color: '#fff', fontWeight: 'bold' }}>
                          +{action.shiftedDays}d
                        </span>
                      )}
                    </div>
                    
                    <span className="font-semibold text-white truncate" title={action.knowledgeItemName}>
                      {action.knowledgeItemName}
                    </span>
                    <span className="text-secondary truncate" title={action.actionName}>
                      {action.actionName}
                    </span>
                  </div>
                );
              })}

              {dayActions.length === 0 && dayEvents.length === 0 && (
                <div className="flex-1 flex items-center justify-center text-secondary" style={{ fontSize: '0.75rem', opacity: 0.5 }}>
                  Geen items
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Detail Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel max-w-xl w-full max-h-[80vh] flex flex-col" style={{ backgroundColor: '#181b24', border: '1px solid var(--border)' }}>
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b border-[var(--border)] pb-4 mb-4">
              <div>
                <span className="text-secondary uppercase text-xs font-semibold">Overzicht voor dag</span>
                <h3 className="text-xl font-bold capitalize mt-0.5" style={{ margin: 0 }}>
                  {format(selectedDay, 'EEEE d MMMM yyyy', { locale: nl })}
                </h3>
              </div>
              <button onClick={() => setSelectedDay(null)} className="btn btn-secondary p-1.5 rounded-full">
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col gap-6 overflow-y-auto pr-1">
              {/* Events section */}
              <div>
                <h4 className="text-sm uppercase text-secondary font-semibold mb-2 flex items-center gap-2">
                  <CalendarDays size={16} /> Feestdagen & Evenementen
                </h4>
                {selectedDayItems.dayEvents.length === 0 ? (
                  <p className="text-sm text-secondary italic">Geen evenementen op deze dag.</p>
                ) : (
                  <div className="flex flex-col gap-2">
                    {selectedDayItems.dayEvents.map(ev => (
                      <div key={ev.id} className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex justify-between items-center">
                        <span className="font-medium">{ev.description}</span>
                        <div className="flex gap-1">
                          {(ev.layers || []).length === availableLayers.length ? (
                            <span className="badge">Alle Lagen</span>
                          ) : (
                            ev.layers.map(l => <span key={l} className={`badge badge-${l.toLowerCase()}`}>{l}</span>)
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions section */}
              <div>
                <h4 className="text-sm uppercase text-secondary font-semibold mb-2 flex items-center gap-2">
                  <Info size={16} /> Geplande Communicatie Acties
                </h4>
                {selectedDayItems.dayActions.length === 0 ? (
                  <p className="text-sm text-secondary italic">Geen communicatie acties op deze dag.</p>
                ) : (
                  <div className="flex flex-col gap-3">
                    {selectedDayItems.dayActions.map(action => (
                      <div key={action.id} className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-2">
                        <div className="flex justify-between items-start gap-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`badge badge-${action.layer.toLowerCase()}`}>{action.layer}</span>
                              <span className="font-bold text-base">{action.knowledgeItemName}</span>
                            </div>
                            <span className="text-primary font-medium">{action.actionName}</span>
                          </div>
                          <span className="font-bold text-lg">
                            {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(action.cost)}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2 text-xs text-secondary mt-2 pt-2 border-t border-[var(--border)]">
                          <div>
                            <span>Startdatum: </span>
                            <strong className="text-white">{format(parseISO(action.scheduledStartDate), 'dd-MM-yyyy')}</strong>
                          </div>
                          <div>
                            <span>Duur: </span>
                            <strong className="text-white">{action.durationDays} dag(en)</strong>
                          </div>
                          <div>
                            <span>Theoretische start: </span>
                            <span>{format(addDays(parseISO(action.originalStartDate), action.dayOffset), 'dd-MM-yyyy')}</span>
                          </div>
                          <div>
                            <span>Status: </span>
                            {action.shiftedDays > 0 ? (
                              <span className="text-[#ff9800] font-bold">+{action.shiftedDays} dag(en) verschoven</span>
                            ) : (
                              <span className="text-[#4caf50]">Op schema</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end mt-6 pt-4 border-t border-[var(--border)]">
              <button onClick={() => setSelectedDay(null)} className="btn btn-primary px-6">
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
