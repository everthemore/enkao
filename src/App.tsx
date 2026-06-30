import { useState } from 'react';
import { LayoutDashboard, CalendarPlus, CalendarDays } from 'lucide-react';
import DashboardView from './views/DashboardView';
import PlanningView from './views/PlanningView';
import EventsView from './views/EventsView';

type Tab = 'dashboard' | 'planning' | 'events';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="flex items-center gap-2 mb-6">
          <div style={{ background: 'var(--primary)', padding: '0.5rem', borderRadius: '8px' }}>
            <CalendarDays color="white" />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.25rem' }}>NRO Planner</h1>
        </div>

        <button 
          className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : ''}`}
          style={{ justifyContent: 'flex-start' }}
          onClick={() => setActiveTab('dashboard')}
        >
          <LayoutDashboard size={18} />
          Dashboard
        </button>

        <button 
          className={`btn ${activeTab === 'planning' ? 'btn-primary' : ''}`}
          style={{ justifyContent: 'flex-start' }}
          onClick={() => setActiveTab('planning')}
        >
          <CalendarPlus size={18} />
          Planning Maken
        </button>

        <button 
          className={`btn ${activeTab === 'events' ? 'btn-primary' : ''}`}
          style={{ justifyContent: 'flex-start' }}
          onClick={() => setActiveTab('events')}
        >
          <CalendarDays size={18} />
          Evenementen
        </button>
      </aside>

      <main className="main-content">
        <div className="animate-fade-in">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'planning' && <PlanningView />}
          {activeTab === 'events' && <EventsView />}
        </div>
      </main>
    </div>
  );
}

export default App;
