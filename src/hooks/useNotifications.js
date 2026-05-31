import { useEffect } from 'react';

export function useNotifications() {
  useEffect(() => {
    if (!("Notification" in window)) return;

    if (Notification.permission === "default") {
       Notification.requestPermission();
    }

    const checkReminders = () => {
       if (Notification.permission !== "granted") return;
       const now = new Date();
       const hour = now.getHours();
       const minute = now.getMinutes();

       if (minute === 0) { 
           const firedKey = `notif_${now.toISOString().split('T')[0]}_${hour}_${minute}`;
           if (localStorage.getItem(firedKey)) return;

           let title = null;
           let body = null;
           
           if (hour === 6) {
              title = "🌅 Good Morning!";
              body = "Time to wake up and start your day. Don't forget your routine!";
           } else if (hour === 7) {
              title = "🧘 Time for Practice";
              body = "Consistency is key. 108 Surya Namaskar awaits.";
           } else if (hour === 20) {
              title = "🌙 Evening Routine";
              body = "No phones after 8 PM. Start your journaling and prayer.";
           }

           if (title) {
               new Notification(title, { body, icon: '/favicon.svg' });
               localStorage.setItem(firedKey, 'true');
           }
       }
    };

    const interval = setInterval(checkReminders, 30000);
    return () => clearInterval(interval);
  }, []);
}
