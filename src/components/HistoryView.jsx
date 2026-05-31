import { useState } from 'react';
import { TaskCategory } from './TaskCategory';
import './HistoryView.css';

export function HistoryView({ appData }) {
   const [selectedDate, setSelectedDate] = useState(null);

   if (selectedDate) {
      const dayData = appData.history[selectedDate];
      if(!dayData) return <button onClick={() => setSelectedDate(null)}>Back</button>;

      return (
         <div className="historyDetail fade-in">
            <button className="backBtn" onClick={() => setSelectedDate(null)}>← Back to Calendar</button>
            <h2 className="detailDate">{new Date(selectedDate).toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric'})}</h2>
            <div className="detailSummary">
               <span className="summaryItem">Earned: {dayData.coinsEarned} 🪙</span>
               <span className="summaryItem">Status: {dayData.completed ? '✅ Perfect' : '❌ Incomplete'}</span>
            </div>
            
            <TaskCategory title="Completed Tasks">
               {Object.entries(dayData.tasks).map(([k, v]) => (
                  <div key={k} className="readOnlyTask">
                      <span className="taskIcon">{v ? '✅' : '❌'}</span>
                      <span className={`taskName ${v ? 'done' : 'missed'}`}>{k.replace('_', ' ')}</span>
                  </div>
               ))}
            </TaskCategory>
         </div>
      );
   }

   const today = new Date();
   const days = Array.from({length: 30}, (_, i) => {
      const d = new Date();
      d.setDate(today.getDate() - i);
      return d.toISOString().split('T')[0];
   }).reverse();

   return (
      <div className="historyContainer fade-in">
         <h2>Your Journey</h2>
         <p className="subtitle">Consistency is key.</p>
         
         <div className="calendarGrid">
            {days.map(dStr => {
               const dayData = appData.history[dStr];
               let statusClass = 'empty';
               if (dayData) {
                  statusClass = dayData.completed ? 'perfect' : 'partial';
               }

               return (
                  <button 
                     key={dStr} 
                     className={`dayBox ${statusClass}`}
                     disabled={!dayData}
                     onClick={() => dayData && setSelectedDate(dStr)}
                  >
                     <span className="dayNum">{new Date(dStr).getDate()}</span>
                     {dayData && (
                        <span className="dayIcon">{dayData.completed ? '✅' : '❌'}</span>
                     )}
                  </button>
               );
            })}
         </div>
      </div>
   );
}
