import { useState } from 'react';
import { useStore } from '../store/useStore';
import { Trash2, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';

export default function EventsView() {
  const events = useStore(state => state.events);
  const addEvent = useStore(state => state.addEvent);
  const removeEvent = useStore(state => state.removeEvent);

  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !description) return;
    
    addEvent({ date, description });
    setDate('');
    setDescription('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Beheer Evenementen & Feestdagen</h2>
      </div>

      <div className="glass-panel mb-6">
        <h3 className="mb-4">Nieuw Evenement Toevoegen</h3>
        <form onSubmit={handleAddEvent} className="flex gap-4 items-end">
          <div className="flex-col gap-2" style={{ flex: 1 }}>
            <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Datum</label>
            <input 
              type="date" 
              className="input mt-2" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              required
            />
          </div>
          <div className="flex-col gap-2" style={{ flex: 2 }}>
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
          <button type="submit" className="btn btn-primary h-full">
            <Plus size={18} /> Toevoegen
          </button>
        </form>
      </div>

      <div className="glass-panel">
        <h3 className="mb-4">Huidige Evenementen</h3>
        {events.length === 0 ? (
          <p>Er zijn nog geen evenementen toegevoegd. Weekenden worden automatisch overgeslagen.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Datum</th>
                <th>Beschrijving</th>
                <th style={{ width: '80px' }}>Acties</th>
              </tr>
            </thead>
            <tbody>
              {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(event => (
                <tr key={event.id}>
                  <td>{format(parseISO(event.date), 'dd-MM-yyyy')}</td>
                  <td>{event.description}</td>
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
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
