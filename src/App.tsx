import { useState, useEffect } from 'react';
import { LayoutDashboard, CalendarPlus, CalendarDays, Moon, Sun } from 'lucide-react';
import DashboardView from './views/DashboardView';
import PlanningView from './views/PlanningView';
import EventsView from './views/EventsView';

type Tab = 'dashboard' | 'planning' | 'events';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [isLightMode, setIsLightMode] = useState(true); // Light mode by default as requested

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light-mode');
    } else {
      document.documentElement.classList.remove('light-mode');
    }
  }, [isLightMode]);

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

        <div style={{ marginTop: 'auto' }}>
          <button 
            className="btn"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={() => setIsLightMode(!isLightMode)}
          >
            {isLightMode ? (
              <><Moon size={18} /> Donkere Modus</>
            ) : (
              <><Sun size={18} /> Lichte Modus</>
            )}
          </button>
        </div>
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
