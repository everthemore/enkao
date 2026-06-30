import { useState } from 'react';
import { useStore } from '../store/useStore';
import { getKnowledgeItemNames, getLayers } from '../utils/dataGenerator';
import { Trash2, Plus } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { EducationLayer } from '../types';

export default function PlanningView() {
  const plannedItems = useStore(state => state.plannedItems);
  const addPlannedItem = useStore(state => state.addPlannedItem);
  const removePlannedItem = useStore(state => state.removePlannedItem);

  const knowledgeItems = getKnowledgeItemNames();
  const layers = getLayers();

  const [selectedLayer, setSelectedLayer] = useState<EducationLayer>('PO');
  const [selectedItem, setSelectedItem] = useState(knowledgeItems[0]);
  const [startDate, setStartDate] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    addPlannedItem({
      layer: selectedLayer,
      knowledgeItemName: selectedItem,
      startDate
    });
    // Reset form partially
    setStartDate('');
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Planning Maken</h2>
      </div>

      <div className="glass-panel mb-6">
        <h3 className="mb-4">Nieuw Kennisitem Plannen</h3>
        <form onSubmit={handleAdd} className="flex gap-4 items-end">
          <div className="flex-col gap-2" style={{ flex: 1 }}>
            <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Onderwijslaag</label>
            <select 
              className="select mt-2" 
              value={selectedLayer} 
              onChange={e => setSelectedLayer(e.target.value as EducationLayer)}
            >
              {layers.map(layer => (
                <option key={layer} value={layer}>{layer}</option>
              ))}
            </select>
          </div>
          
          <div className="flex-col gap-2" style={{ flex: 1.5 }}>
            <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Kennisitem</label>
            <select 
              className="select mt-2" 
              value={selectedItem} 
              onChange={e => setSelectedItem(e.target.value)}
            >
              {knowledgeItems.map(item => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>

          <div className="flex-col gap-2" style={{ flex: 1 }}>
            <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Startdatum</label>
            <input 
              type="date" 
              className="input mt-2" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              required
            />
          </div>

          <button type="submit" className="btn btn-primary h-full">
            <Plus size={18} /> Toevoegen
          </button>
        </form>
      </div>

      <div className="glass-panel">
        <h3 className="mb-4">Geplande Kennisitems</h3>
        {plannedItems.length === 0 ? (
          <p>Er zijn nog geen items gepland. Voeg er hierboven één toe om de uren en kosten te berekenen.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Laag</th>
                <th>Startdatum</th>
                <th style={{ width: '80px' }}>Acties</th>
              </tr>
            </thead>
            <tbody>
              {plannedItems.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map(item => (
                <tr key={item.id}>
                  <td><strong>{item.knowledgeItemName}</strong></td>
                  <td>
                    <span className={`badge badge-${item.layer.toLowerCase()}`}>
                      {item.layer}
                    </span>
                  </td>
                  <td>{format(parseISO(item.startDate), 'dd-MM-yyyy')}</td>
                  <td>
                    <button 
                      onClick={() => removePlannedItem(item.id)} 
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
