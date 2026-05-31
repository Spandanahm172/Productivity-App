import { useState } from 'react';
import './Settings.css';

export function Settings({ appData, updateUserConfig }) {
   const [config, setConfig] = useState(appData.userConfig);

   const save = (newConfig) => {
       setConfig(newConfig);
       updateUserConfig(newConfig);
   };

   const addCategory = () => {
       const title = prompt("Enter category name (e.g., 🏋️ Workout):");
       if (!title) return;
       const newCat = {
           id: 'cat_' + Date.now(),
           cat: title,
           tasks: []
       };
       save([...config, newCat]);
   };

   const deleteCategory = (catId) => {
       if(!confirm("Are you sure you want to delete this entire category?")) return;
       save(config.filter(c => c.id !== catId));
   };

   const addTask = (catId) => {
       const label = prompt("Enter task name:");
       if (!label) return;
       const newTask = {
           id: 'task_' + Date.now(),
           label
       };
       save(config.map(c => {
           if (c.id === catId) {
               return { ...c, tasks: [...c.tasks, newTask] };
           }
           return c;
       }));
   };

   const deleteTask = (catId, taskId) => {
       if(!confirm("Are you sure?")) return;
       save(config.map(c => {
           if (c.id === catId) {
               return { ...c, tasks: c.tasks.filter(t => t.id !== taskId) };
           }
           return c;
       }));
   };

   return (
      <div className="settingsContainer fade-in">
         <h2>Settings & Skills</h2>
         <p className="subtitle">Customize your daily routine.</p>

         <div className="categoryList">
            {config.map(c => (
               <div key={c.id} className="editCategoryCard">
                  <div className="editCategoryHeader">
                      <h3>{c.cat}</h3>
                      <button className="iconBtn danger" onClick={() => deleteCategory(c.id)}>🗑️</button>
                  </div>
                  <div className="editTaskList">
                      {c.tasks.map(t => (
                         <div key={t.id} className="editTaskRow">
                             <span>{t.label}</span>
                             {t.id !== 'abacus' && (
                                <button className="iconBtn small" onClick={() => deleteTask(c.id, t.id)}>❌</button>
                             )}
                         </div>
                      ))}
                      <button className="addTaskBtn" onClick={() => addTask(c.id)}>+ Add Task</button>
                  </div>
               </div>
            ))}
         </div>
         <button className="addCategoryBtn" onClick={addCategory}>+ Add New Category</button>
      </div>
   );
}
