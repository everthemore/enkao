import { useState } from 'react';
import { useStore } from '../store/useStore';
import { getLayers } from '../utils/dataGenerator';
import { Trash2, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { EducationLayer } from '../types';

export default function EventsView() {
  const events = useStore(state => state.events);
  const addEvent = useStore(state => state.addEvent);
  const removeEvent = useStore(state => state.removeEvent);
  const availableLayers = getLayers();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  // By default, select all layers
  const [selectedLayers, setSelectedLayers] = useState<EducationLayer[]>([...availableLayers]);

  const handleLayerToggle = (layer: EducationLayer) => {
    setSelectedLayers(prev => 
      prev.includes(layer) ? prev.filter(l => l !== layer) : [...prev, layer]
    );
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !description || selectedLayers.length === 0) return;
    
    addEvent({ 
      startDate, 
      endDate: endDate || startDate, 
      description, 
      layers: selectedLayers 
    });
    
    setStartDate('');
    setEndDate('');
    setDescription('');
    setSelectedLayers([...availableLayers]);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2>Beheer Evenementen & Feestdagen</h2>
      </div>

      <div className="glass-panel">
        <h3 className="mb-4">Nieuw Evenement Toevoegen</h3>
        <form onSubmit={handleAddEvent} className="flex flex-col gap-4">
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-col gap-2" style={{ flex: 1, minWidth: '150px' }}>
              <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Startdatum</label>
              <input 
                type="date" 
                className="input mt-2" 
                value={startDate} 
                onChange={e => setStartDate(e.target.value)} 
                required
              />
            </div>
            <div className="flex-col gap-2" style={{ flex: 1, minWidth: '150px' }}>
              <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Einddatum (optioneel)</label>
              <input 
                type="date" 
                className="input mt-2" 
                value={endDate} 
                onChange={e => setEndDate(e.target.value)} 
              />
            </div>
            <div className="flex-col gap-2" style={{ flex: 2, minWidth: '250px' }}>
              <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Beschrijving</label>
              <input 
                type="text" 
                className="input mt-2" 
                placeholder="Bijv. Koningsdag, Onderwijscongres..." 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                required
              />
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Geldt voor de volgende onderwijslagen:</label>
            <div className="flex gap-4 mt-1">
              {availableLayers.map(layer => (
                <label key={layer} className="flex items-center gap-2" style={{ cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedLayers.includes(layer)} 
                    onChange={() => handleLayerToggle(layer)}
                  />
                  <span>{layer}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end mt-2">
            <button type="submit" className="btn btn-primary" disabled={selectedLayers.length === 0}>
              <Plus size={18} /> Toevoegen
            </button>
          </div>
        </form>
      </div>

      <div className="glass-panel">
        <h3 className="mb-4">Huidige Evenementen</h3>
        {events.length === 0 ? (
          <p className="text-secondary">Er zijn nog geen evenementen toegevoegd. Weekenden worden automatisch overgeslagen.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Datum / Periode</th>
                <th>Beschrijving</th>
                <th>Geldig voor</th>
                <th style={{ width: '80px' }}>Acties</th>
              </tr>
            </thead>
            <tbody>
              {events.sort((a, b) => {
                const aStart = a.startDate || a.date || '';
                const bStart = b.startDate || b.date || '';
                return new Date(aStart).getTime() - new Date(bStart).getTime();
              }).map(event => {
                const eStart = event.startDate || event.date;
                const eEnd = event.endDate || event.date;
                const dateDisplay = eStart === eEnd 
                  ? format(parseISO(eStart!), 'dd-MM-yyyy')
                  : `${format(parseISO(eStart!), 'dd-MM-yyyy')} t/m ${format(parseISO(eEnd!), 'dd-MM-yyyy')}`;

                return (
                  <tr key={event.id}>
                    <td>{dateDisplay}</td>
                    <td>{event.description}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {(event.layers || []).length === availableLayers.length 
                          ? <span className="badge">Alle Lagen</span>
                          : (event.layers || []).map(l => (
                            <span key={l} className={`badge badge-${l.toLowerCase()}`}>{l}</span>
                          ))
                        }
                      </div>
                    </td>
                    <td>
                      <button 
                        onClick={() => removeEvent(event.id)} 
                        className="btn btn-danger"
                        style={{ padding: '0.25rem 0.5rem' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
