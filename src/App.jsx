import { useState } from 'react';
import { useAppStorage } from './hooks/useAppStorage';
import { Dashboard } from './components/Dashboard';
import { AbacusTool } from './components/AbacusTool';
import { HistoryView } from './components/HistoryView';
import { Settings } from './components/Settings';
import { useNotifications } from './hooks/useNotifications';
import './App.css';

function App() {
  const { 
    appData, 
    today, 
    toggleTask, 
    addCoins, 
    updateUserConfig, 
    addTask,
    deleteTask,
    renameTask,
    addCategory,
    deleteCategory,
    renameCategory,
    isLoading 
  } = useAppStorage();
  const [activeTab, setActiveTab] = useState('daily');
  
  useNotifications();

  if (isLoading) {
    return <div className="loadingContainer">Loading...</div>;
  }

  return (
    <div className="appContainer">
      <header className="appHeader">
        <div>
          <h1>Discipline</h1>
          <p className="dateText">{new Date(today).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
        </div>
        <div className="statsBadge">
          <span className="coinCounter">🪙 {appData.stats.totalCoins}</span>
          <span className="streakCounter">🔥 {appData.stats.currentStreak}</span>
        </div>
      </header>

      <main className="appContent">
        {activeTab === 'daily' && (
           <Dashboard 
             appData={appData}
             today={today}
             toggleTask={toggleTask}
             onStartAbacus={() => setActiveTab('abacus')}
             addTask={addTask}
             deleteTask={deleteTask}
             renameTask={renameTask}
             addCategory={addCategory}
             deleteCategory={deleteCategory}
             renameCategory={renameCategory}
           />
        )}
        {activeTab === 'abacus' && (
           <AbacusTool 
              addCoins={addCoins} 
              onBack={() => setActiveTab('daily')}
           />
        )}
        {activeTab === 'history' && (
           <HistoryView appData={appData} />
        )}
        {activeTab === 'settings' && (
           <Settings appData={appData} updateUserConfig={updateUserConfig} />
        )}
      </main>

      <nav className="bottomNav">
        <button className={`navItem ${activeTab === 'daily' ? 'active' : ''}`} onClick={() => setActiveTab('daily')}>Daily</button>
        <button className={`navItem ${activeTab === 'abacus' ? 'active' : ''}`} onClick={() => setActiveTab('abacus')}>Abacus</button>
        <button className={`navItem ${activeTab === 'history' ? 'active' : ''}`} onClick={() => setActiveTab('history')}>History</button>
        <button className={`navItem ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>Settings</button>
      </nav>
    </div>
  );
}

export default App;
