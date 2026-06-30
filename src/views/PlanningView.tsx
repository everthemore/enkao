import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { getKnowledgeItemNames, getLayers } from '../utils/dataGenerator';
import { Trash2, Plus, ChevronDown, ChevronUp } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import type { EducationLayer } from '../types';

export default function PlanningView() {
  const plannedItems = useStore(state => state.plannedItems);
  const addPlannedItem = useStore(state => state.addPlannedItem);
  const removePlannedItem = useStore(state => state.removePlannedItem);
  const getCalculatedActions = useStore(state => state.getCalculatedActions);
  const calculatedActions = getCalculatedActions();

  const knowledgeItems = getKnowledgeItemNames();
  const layers = getLayers();

  const [selectedLayer, setSelectedLayer] = useState<EducationLayer>('PO');
  const [selectedItem, setSelectedItem] = useState(knowledgeItems[0]);
  const [customName, setCustomName] = useState('');
  const [startDate, setStartDate] = useState('');

  // State for expandable rows
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) return;

    addPlannedItem({
      layer: selectedLayer,
      knowledgeItemName: selectedItem,
      customName: customName.trim() || undefined,
      startDate
    });
    // Reset form partially
    setStartDate('');
    setCustomName('');
  };

  const toggleExpand = (id: string) => {
    setExpandedItemId(prev => prev === id ? null : id);
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2>Planning Maken</h2>
      </div>

      <div className="glass-panel">
        <h3 className="mb-4">Nieuw Kennisitem Plannen</h3>
        <form onSubmit={handleAdd} className="flex flex-col gap-4">
          <div className="flex gap-4 items-end">
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

            <div className="flex-col gap-2" style={{ flex: 1.5 }}>
              <label className="text-secondary" style={{ fontSize: '0.875rem' }}>Specifieke Notitie/Naam (optioneel)</label>
              <input 
                type="text" 
                className="input mt-2" 
                placeholder="Bijv. Thema Lente 2024" 
                value={customName} 
                onChange={e => setCustomName(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="flex gap-4 items-end">
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
          </div>
        </form>
      </div>

      <div className="glass-panel">
        <h3 className="mb-4">Geplande Kennisitems</h3>
        {plannedItems.length === 0 ? (
          <p className="text-secondary">Er zijn nog geen items gepland. Voeg er hierboven één toe om de uren en kosten te berekenen.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '40px' }}></th>
                <th>Item</th>
                <th>Laag</th>
                <th>Startdatum</th>
                <th style={{ width: '80px' }}>Acties</th>
              </tr>
            </thead>
            <tbody>
              {plannedItems.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()).map(item => {
                const isExpanded = expandedItemId === item.id;
                const itemActions = calculatedActions.filter(a => a.plannedItemId === item.id);
                
                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      style={{ cursor: 'pointer', backgroundColor: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent' }} 
                      onClick={() => toggleExpand(item.id)}
                    >
                      <td style={{ color: 'var(--text-secondary)' }}>
                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                      </td>
                      <td>
                        <strong>{item.knowledgeItemName}</strong>
                        {item.customName && (
                          <span className="text-secondary ml-2" style={{ fontSize: '0.875rem' }}>
                            ({item.customName})
                          </span>
                        )}
                      </td>
                      <td>
                        <span className={`badge badge-${item.layer.toLowerCase()}`}>
                          {item.layer}
                        </span>
                      </td>
                      <td>{format(parseISO(item.startDate), 'dd-MM-yyyy')}</td>
                      <td>
                        <button 
                          onClick={(e) => { e.stopPropagation(); removePlannedItem(item.id); }} 
                          className="btn btn-danger"
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                    
                    {isExpanded && (
                      <tr style={{ backgroundColor: 'rgba(0,0,0,0.1)' }}>
                        <td colSpan={5} style={{ padding: '1.5rem' }}>
                          <h4 className="mb-3 text-secondary" style={{ fontSize: '0.875rem', textTransform: 'uppercase' }}>Berekende Communicatie Acties</h4>
                          {itemActions.length === 0 ? (
                            <p className="text-secondary" style={{ fontSize: '0.875rem' }}>Geen acties gevonden voor dit item. Controleer de sjablonen.</p>
                          ) : (
                            <table className="data-table" style={{ marginTop: 0, backgroundColor: 'var(--surface)' }}>
                              <thead>
                                <tr>
                                  <th style={{ fontSize: '0.75rem' }}>Actie</th>
                                  <th style={{ fontSize: '0.75rem' }}>Datum</th>
                                  <th style={{ fontSize: '0.75rem' }}>Duur</th>
                                  <th style={{ fontSize: '0.75rem' }}>Kosten</th>
                                </tr>
                              </thead>
                              <tbody>
                                {itemActions.map(action => (
                                  <tr key={action.id}>
                                    <td style={{ fontSize: '0.875rem' }}>{action.actionName}</td>
                                    <td style={{ fontSize: '0.875rem' }}>{format(parseISO(action.scheduledStartDate), 'dd-MM-yyyy')}</td>
                                    <td style={{ fontSize: '0.875rem' }}>{action.durationDays} dagen</td>
                                    <td style={{ fontSize: '0.875rem' }}>{new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(action.cost)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
