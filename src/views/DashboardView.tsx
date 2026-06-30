import { useStore } from '../store/useStore';
import { format, parseISO } from 'date-fns';

export default function DashboardView() {
  const getCalculatedActions = useStore(state => state.getCalculatedActions);
  const plannedItems = useStore(state => state.plannedItems);
  
  const calculatedActions = getCalculatedActions();

  const totalCost = calculatedActions.reduce((acc, curr) => acc + curr.cost, 0);
  const totalDays = calculatedActions.reduce((acc, curr) => acc + curr.durationDays, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2>Dashboard Overzicht</h2>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="glass-panel stat-card" style={{ flex: 1 }}>
          <span className="label">Geplande Kennisitems</span>
          <span className="value">{plannedItems.length}</span>
        </div>
        <div className="glass-panel stat-card" style={{ flex: 1 }}>
          <span className="label">Totaal Communicatie Acties</span>
          <span className="value">{calculatedActions.length}</span>
        </div>
        <div className="glass-panel stat-card" style={{ flex: 1 }}>
          <span className="label">Totale Kosten (geschat)</span>
          <span className="value">
            {new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(totalCost)}
          </span>
        </div>
        <div className="glass-panel stat-card" style={{ flex: 1 }}>
          <span className="label">Totale Looptijd (dagen)</span>
          <span className="value">{totalDays}</span>
        </div>
      </div>

      <div className="glass-panel">
        <h3 className="mb-4">Aankomende Communicatie Acties</h3>
        {calculatedActions.length === 0 ? (
          <p className="text-secondary">Er zijn nog geen acties berekend. Ga naar 'Planning Maken' om te beginnen.</p>
        ) : (
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Datum Uitvoering</th>
                  <th>Laag</th>
                  <th>Kennisitem</th>
                  <th>Actie</th>
                  <th>Duur (dagen)</th>
                  <th>Kosten</th>
                </tr>
              </thead>
              <tbody>
                {calculatedActions.map(action => (
                  <tr key={action.id}>
                    <td>
                      <strong>{format(parseISO(action.scheduledStartDate), 'dd-MM-yyyy')}</strong>
                    </td>
                    <td>
                      <span className={`badge badge-${action.layer.toLowerCase()}`}>
                        {action.layer}
                      </span>
                    </td>
                    <td>{action.knowledgeItemName}</td>
                    <td>{action.actionName}</td>
                    <td>{action.durationDays} d.</td>
                    <td>{new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(action.cost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
