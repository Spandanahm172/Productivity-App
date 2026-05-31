import { useState } from 'react';
import { TaskCategory } from './TaskCategory';
import { TaskCheckbox } from './TaskCheckbox';
import './Dashboard.css';

export function Dashboard({ 
   appData, 
   today, 
   toggleTask, 
   onStartAbacus,
   addTask,
   deleteTask,
   renameTask,
   addCategory,
   deleteCategory,
   renameCategory
}) {
   const [isEditMode, setIsEditMode] = useState(false);
   const [addingToCategory, setAddingToCategory] = useState(null);
   const [newTaskLabel, setNewTaskLabel] = useState('');
   const [isAddingCategory, setIsAddingCategory] = useState(false);
   const [newCategoryTitle, setNewCategoryTitle] = useState('');

   const todayData = appData?.history[today];
   if(!todayData) return null;
   
   const totalTasks = Object.keys(todayData.tasks).length;
   const completedTasks = Object.values(todayData.tasks).filter(Boolean).length;
   const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

   // Render all groups in Edit Mode so user can add tasks to empty groups.
   // In normal mode, only show active groups that contain tasks.
   const activeGroups = isEditMode 
      ? appData.userConfig 
      : appData.userConfig.filter(g => g.tasks.length > 0);

   const handleAddTaskSubmit = (e, catId) => {
       e.preventDefault();
       if (!newTaskLabel.trim()) return;
       addTask(catId, newTaskLabel.trim());
       setNewTaskLabel('');
       setAddingToCategory(null);
   };

   const handleAddCategorySubmit = (e) => {
       e.preventDefault();
       if (!newCategoryTitle.trim()) return;
       addCategory(newCategoryTitle.trim());
       setNewCategoryTitle('');
       setIsAddingCategory(false);
   };

   return (
      <div className="dashboardContainer fade-in">
         <div className="dashboardHeader">
            <h2>{isEditMode ? "Customize Routine" : "Daily Checklist"}</h2>
            <button 
               className={`editModeToggle ${isEditMode ? 'active' : ''}`}
               onClick={() => {
                  setIsEditMode(!isEditMode);
                  setAddingToCategory(null);
                  setIsAddingCategory(false);
               }}
            >
               {isEditMode ? '✓ Done Editing' : '⚙️ Edit Tasks'}
            </button>
         </div>

         {!isEditMode && (
            <div className="progressCard">
               <div className="progressHeader">
                  <h3>Daily Progress</h3>
                  <span>{progress}%</span>
               </div>
               <div className="progressBarBg">
                  <div className="progressBarFill" style={{ width: `${progress}%` }}></div>
               </div>
               {todayData.completed && <p className="bonusText">🎉 +50 Bonus Coins Earned!</p>}
            </div>
         )}

         <div className="taskList">
            {activeGroups.map(group => (
               <TaskCategory 
                  key={group.id} 
                  title={isEditMode ? (
                     <input 
                        type="text" 
                        value={group.cat} 
                        onChange={(e) => renameCategory(group.id, e.target.value)}
                        className="categoryTitleInput"
                        placeholder="Category name"
                     />
                  ) : group.cat}
                  actions={isEditMode && (
                     group.id !== 'skill' ? (
                        <button 
                           className="iconBtn danger small" 
                           onClick={() => {
                              if(window.confirm(`Are you sure you want to delete the entire category "${group.cat}" and all of its tasks?`)) {
                                 deleteCategory(group.id);
                              }
                           }}
                           title="Delete Category"
                        >
                           🗑️
                        </button>
                     ) : (
                        <span className="lockedBadge" title="Core skill category is locked">🔒</span>
                     )
                  )}
               >
                  {group.tasks.map(task => {
                     const isChecked = todayData.tasks[task.id] || false;
                     return (
                        <div key={task.id} className={`taskRowContainer ${isEditMode ? 'editing' : ''}`}>
                            {isEditMode ? (
                               <>
                                  <input 
                                     type="text" 
                                     value={task.label} 
                                     onChange={(e) => renameTask(group.id, task.id, e.target.value)}
                                     className="taskRenameInput"
                                     placeholder="Task description"
                                  />
                                  {task.id !== 'abacus' ? (
                                     <button 
                                        className="iconBtn danger small" 
                                        onClick={() => {
                                           if(window.confirm(`Are you sure you want to delete the task "${task.label}"?`)) {
                                              deleteTask(group.id, task.id);
                                           }
                                        }}
                                        title="Delete Task"
                                     >
                                        🗑️
                                     </button>
                                  ) : (
                                     <span className="lockedBadge" title="Abacus Practice is locked as a core system feature.">🔒</span>
                                  )}
                               </>
                            ) : (
                               <>
                                  <TaskCheckbox 
                                     label={task.label}
                                     checked={isChecked}
                                     onChange={() => toggleTask(task.id)}
                                  />
                                  {task.id === 'abacus' && (
                                     <button className="startActionBtn" onClick={onStartAbacus}>Practice</button>
                                  )}
                               </>
                            )}
                        </div>
                     );
                  })}

                  {isEditMode && (
                     <div className="categoryEditFooter">
                        {addingToCategory === group.id ? (
                           <form onSubmit={(e) => handleAddTaskSubmit(e, group.id)} className="inlineTaskForm">
                              <input 
                                 type="text" 
                                 placeholder="Enter task name..." 
                                 value={newTaskLabel} 
                                 onChange={(e) => setNewTaskLabel(e.target.value)}
                                 className="inlineTaskInput"
                                 autoFocus
                              />
                              <div className="inlineFormActions">
                                 <button type="submit" className="inlineFormBtn save">Add</button>
                                 <button type="button" className="inlineFormBtn cancel" onClick={() => setAddingToCategory(null)}>Cancel</button>
                              </div>
                           </form>
                        ) : (
                           <button 
                              className="inlineAddTaskBtn" 
                              onClick={() => { 
                                 setAddingToCategory(group.id); 
                                 setNewTaskLabel(''); 
                              }}
                           >
                              ➕ Add Task
                           </button>
                        )}
                     </div>
                  )}
               </TaskCategory>
            ))}

            {isEditMode && (
               <div className="addCategorySection">
                  {isAddingCategory ? (
                     <form onSubmit={handleAddCategorySubmit} className="addCategoryForm">
                        <input 
                           type="text" 
                           placeholder="Category Name (e.g. 🏋️ Fitness)..." 
                           value={newCategoryTitle}
                           onChange={(e) => setNewCategoryTitle(e.target.value)}
                           className="addCategoryInput"
                           autoFocus
                        />
                        <div className="addCategoryActions">
                           <button type="submit" className="addCategorySubmitBtn">Add Category</button>
                           <button type="button" className="addCategoryCancelBtn" onClick={() => setIsAddingCategory(false)}>Cancel</button>
                        </div>
                     </form>
                  ) : (
                     <button className="addCategoryBtn" onClick={() => { setIsAddingCategory(true); setNewCategoryTitle(''); }}>
                        ➕ Add New Category
                     </button>
                  )}
               </div>
            )}
         </div>
      </div>
   );
}
