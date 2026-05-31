import { useState, useEffect } from 'react';

const STORAGE_KEY = 'routineTrackerData';

export const DEFAULT_USER_CONFIG = [
  { id: 'morn', cat: "🌅 Morning Discipline", tasks: [
     { id: 'wake_up', label: 'Wake up before 6 AM' },
     { id: 'surya_namaskar', label: 'Surya Namaskar (108)' }
  ]},
  { id: 'skill', cat: "🧠 Skill Building", tasks: [
     { id: 'abacus', label: 'Abacus Practice' }
  ]},
  { id: 'aware', cat: "🌍 Awareness", tasks: [
     { id: 'news', label: 'News of the Day' }
  ]},
  { id: 'work', cat: "💼 Work", tasks: [
     { id: 'work', label: '8 Hours Productive Work' }
  ]},
  { id: 'eve', cat: "🌙 Evening Routine", tasks: [
     { id: 'evening', label: 'Prayer, Journaling, Dinner < 8PM' }
  ]},
  { id: 'disc', cat: "🚫 Discipline", tasks: [
     { id: 'no_phone', label: 'No phone after 8 PM' }
  ]}
];

const DEFAULT_STATE = {
  userConfig: DEFAULT_USER_CONFIG,
  history: {},
  stats: {
    totalCoins: 0,
    currentStreak: 0,
    highestStreak: 0,
    lastActiveDate: null,
  }
};

export function useAppStorage() {
  const [appData, setAppData] = useState(null);

  useEffect(() => {
    const rawData = localStorage.getItem(STORAGE_KEY);
    let data = rawData ? JSON.parse(rawData) : DEFAULT_STATE;
    
    // Legacy migration: add userConfig if missing
    if (!data.userConfig) {
       data.userConfig = DEFAULT_USER_CONFIG;
    }

    const today = new Date().toISOString().split('T')[0];
    const lastActive = data.stats.lastActiveDate;
    
    if (lastActive && lastActive !== today) {
      const lastDate = new Date(lastActive);
      const currentDate = new Date(today);
      const diffTime = Math.abs(currentDate - lastDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
      
      const lastWasComplete = data.history[lastActive]?.completed;
      
      if (diffDays > 1 || !lastWasComplete) {
         data.stats.currentStreak = 0;
      }
    }
    
    // Initialize today's tasks based on CURRENT user config
    if (!data.history[today]) {
        const todayTasks = {};
        data.userConfig.forEach(group => {
           group.tasks.forEach(t => {
               todayTasks[t.id] = false;
           });
        });

        data.history[today] = {
           tasks: todayTasks,
           coinsEarned: 0,
           completed: false
        };
    } else {
        // Migration logic for today: if user added new tasks mid-day, add them as false
        data.userConfig.forEach(group => {
           group.tasks.forEach(t => {
               if(data.history[today].tasks[t.id] === undefined) {
                   data.history[today].tasks[t.id] = false;
               }
           });
        });
    }
    
    data.stats.lastActiveDate = today;
    setAppData(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const saveState = (newState) => {
    setAppData(newState);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const today = new Date().toISOString().split('T')[0];

  const updateUserConfig = (newConfig) => {
      if (!appData) return;
      const newState = { ...appData, userConfig: newConfig };
      
      // Also update today's tasks immediately to reflect additions
      const todayNode = newState.history[today];
      newConfig.forEach(group => {
         group.tasks.forEach(t => {
             if(todayNode.tasks[t.id] === undefined) {
                 todayNode.tasks[t.id] = false;
             }
         });
      });
      // Removing tasks from today's active list if they were deleted from config
      const activeIds = new Set(newConfig.flatMap(g => g.tasks.map(t => t.id)));
      Object.keys(todayNode.tasks).forEach(id => {
          if (!activeIds.has(id)) {
             // We don't necessarily delete the task from history, just maybe hide it.
             // But to make progress bar accurate, we actually should delete it from today's map.
             // Actually, doing this could lower coins if they were already earned. 
             // We will leave coins alone for simplicity and just prune the key.
             delete todayNode.tasks[id];
          }
      });
      
      saveState(newState);
  };

  const toggleTask = (taskId) => {
    if (!appData) return;
    const newState = { ...appData };
    const todayNode = newState.history[today];
    const prevVal = todayNode.tasks[taskId];
    const newVal = !prevVal;
    
    todayNode.tasks[taskId] = newVal;
    
    if (newVal) {
      todayNode.coinsEarned += 10;
      newState.stats.totalCoins += 10;
    } else {
      todayNode.coinsEarned -= 10;
      newState.stats.totalCoins -= 10;
    }
    
    const allDone = Object.values(todayNode.tasks).every(v => v);
    if (!todayNode.completed && Object.keys(todayNode.tasks).length > 0 && allDone) {
       todayNode.completed = true;
       todayNode.coinsEarned += 50;
       newState.stats.totalCoins += 50;
       
       newState.stats.currentStreak += 1;
       if (newState.stats.currentStreak > newState.stats.highestStreak) {
         newState.stats.highestStreak = newState.stats.currentStreak;
       }
       
       if (newState.stats.currentStreak % 7 === 0) {
          newState.stats.totalCoins += 100;
       } else if (newState.stats.currentStreak % 3 === 0) {
          newState.stats.totalCoins += 30;
       }
    } else if (todayNode.completed && !allDone) {
       todayNode.completed = false;
       todayNode.coinsEarned -= 50;
       newState.stats.totalCoins -= 50;
       newState.stats.currentStreak = Math.max(0, newState.stats.currentStreak - 1);
    }
    
    saveState(newState);
  };

  const addCoins = (amount) => {
      if (!appData) return;
      const newState = { ...appData };
      newState.stats.totalCoins += amount;
      saveState(newState);
  };

  const addTask = (categoryId, label) => {
      if (!appData) return;
      const newTask = {
          id: 'task_' + Date.now(),
          label
      };
      const newConfig = appData.userConfig.map(group => {
          if (group.id === categoryId) {
              return { ...group, tasks: [...group.tasks, newTask] };
          }
          return group;
      });
      updateUserConfig(newConfig);
  };

  const deleteTask = (categoryId, taskId) => {
      if (!appData) return;
      const newConfig = appData.userConfig.map(group => {
          if (group.id === categoryId) {
              return { ...group, tasks: group.tasks.filter(t => t.id !== taskId) };
          }
          return group;
      });
      updateUserConfig(newConfig);
  };

  const renameTask = (categoryId, taskId, newLabel) => {
      if (!appData) return;
      const newConfig = appData.userConfig.map(group => {
          if (group.id === categoryId) {
              return {
                  ...group,
                  tasks: group.tasks.map(t => t.id === taskId ? { ...t, label: newLabel } : t)
              };
          }
          return group;
      });
      updateUserConfig(newConfig);
  };

  const addCategory = (title) => {
      if (!appData) return;
      const newCat = {
          id: 'cat_' + Date.now(),
          cat: title,
          tasks: []
      };
      updateUserConfig([...appData.userConfig, newCat]);
  };

  const deleteCategory = (categoryId) => {
      if (!appData) return;
      const newConfig = appData.userConfig.filter(group => group.id !== categoryId);
      updateUserConfig(newConfig);
  };

  const renameCategory = (categoryId, newTitle) => {
      if (!appData) return;
      const newConfig = appData.userConfig.map(group => {
          if (group.id === categoryId) {
              return { ...group, cat: newTitle };
          }
          return group;
      });
      updateUserConfig(newConfig);
  };

  return {
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
    isLoading: !appData
  };
}
