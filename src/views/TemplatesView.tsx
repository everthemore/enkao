import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getKnowledgeItemNames, getLayers } from '../utils/dataGenerator';
import { Trash2, Save, Plus } from 'lucide-react';
import type { EducationLayer, ActionTemplate } from '../types';

function TemplateRow({ template }: { template: ActionTemplate }) {
  const updateTemplate = useStore(state => state.updateActionTemplate);
  const removeTemplate = useStore(state => state.removeActionTemplate);
  
  const [name, setName] = useState(template.actionName);
  const [offset, setOffset] = useState(template.dayOffset);
  const [duration, setDuration] = useState(template.durationDays);
  const [cost, setCost] = useState(template.cost);

  // Sync state if template changes from outside
  useEffect(() => {
    setName(template.actionName);
    setOffset(template.dayOffset);
    setDuration(template.durationDays);
    setCost(template.cost);
  }, [template]);

  const hasChanges = 
    name !== template.actionName || 
    offset !== template.dayOffset || 
    duration !== template.durationDays || 
    cost !== template.cost;

  const handleSave = () => {
    updateTemplate(template.id, {
      actionName: name,
      dayOffset: offset,
      durationDays: duration,
      cost: cost
    });
  };

  return (
    <tr>
      <td>
        <input className="input" value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.25rem' }} />
      </td>
      <td>
        <input className="input" type="number" value={offset} onChange={e => setOffset(Number(e.target.value))} style={{ padding: '0.25rem', width: '80px' }} />
      </td>
      <td>
        <input className="input" type="number" value={duration} onChange={e => setDuration(Number(e.target.value))} style={{ padding: '0.25rem', width: '80px' }} />
      </td>
      <td>
        <input className="input" type="number" value={cost} onChange={e => setCost(Number(e.target.value))} style={{ padding: '0.25rem', width: '100px' }} />
      </td>
      <td>
        <div className="flex gap-2">
          {hasChanges && (
            <button onClick={handleSave} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem' }}>
              <Save size={16} />
            </button>
          )}
          <button onClick={() => removeTemplate(template.id)} className="btn btn-danger" style={{ padding: '0.25rem 0.5rem' }}>
            <Trash2 size={16} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function TemplatesView() {
  const templates = useStore(state => state.actionTemplates);
  const addTemplate = useStore(state => state.addActionTemplate);
  
  const layers = getLayers();
  const items = getKnowledgeItemNames();

  const [selectedLayer, setSelectedLayer] = useState<EducationLayer>('PO');
  const [selectedItem, setSelectedItem] = useState<string>(items[0]);

  const filteredTemplates = templates
    .filter(t => t.layer === selectedLayer && t.knowledgeItemName === selectedItem)
    .sort((a, b) => a.dayOffset - b.dayOffset);

  const handleAddNew = () => {
    addTemplate({
      layer: selectedLayer,
      knowledgeItemName: selectedItem,
      actionName: 'Nieuwe Actie',
      dayOffset: 0,
      durationDays: 1,
      cost: 0
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h2>Beheer Sjablonen (Standaard Acties)</h2>
      </div>

      <div className="glass-panel flex gap-6 items-end">
        <div className="flex flex-col gap-2" style={{ minWidth: '150px' }}>
          <label className="text-secondary" style={{ fontSize: '0.75rem' }}>Onderwijslaag</label>
          <select 
            className="select" 
            value={selectedLayer} 
            onChange={(e) => setSelectedLayer(e.target.value as EducationLayer)}
          >
            {layers.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div className="flex flex-col gap-2" style={{ minWidth: '200px' }}>
          <label className="text-secondary" style={{ fontSize: '0.75rem' }}>Kennisitem</label>
          <select 
            className="select" 
            value={selectedItem} 
            onChange={(e) => setSelectedItem(e.target.value)}
          >
            {items.map(i => <option key={i} value={i}>{i}</option>)}
          </select>
        </div>
      </div>

      <div className="glass-panel">
        <div className="flex justify-between items-center mb-4">
          <h3>
            Acties voor {selectedItem} ({selectedLayer})
          </h3>
          <button onClick={handleAddNew} className="btn btn-primary">
            <Plus size={16} /> Nieuwe Actie
          </button>
        </div>

        {filteredTemplates.length === 0 ? (
          <p className="text-secondary">Geen acties gevonden voor deze combinatie. Voeg een nieuwe actie toe.</p>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Actie Naam</th>
                <th>Start na (dagen)</th>
                <th>Duur (dagen)</th>
                <th>Kosten (€)</th>
                <th style={{ width: '120px' }}>Acties</th>
              </tr>
            </thead>
            <tbody>
              {filteredTemplates.map(template => (
                <TemplateRow key={template.id} template={template} />
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
