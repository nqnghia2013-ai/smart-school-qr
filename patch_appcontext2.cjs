const fs = require('fs');

let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

if (!code.includes('showToast:')) {
    code = code.replace(/clearAllNotifications: \(\) => void;/g, `clearAllNotifications: () => void;
  showToast: (message: string, type?: 'success' | 'error' | 'warning' | 'info') => void;`);

    code = code.replace(/const clearAllNotifications = \(\) => \{/g, `const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') => {
    window.dispatchEvent(new CustomEvent('show-toast', { detail: { message, type } }));
  };

  const clearAllNotifications = () => {`);

    code = code.replace(/recordRoomVisit, addNotification, markNotificationAsRead, clearAllNotifications/g, `recordRoomVisit, addNotification, markNotificationAsRead, clearAllNotifications, showToast`);
    
    fs.writeFileSync('src/context/AppContext.tsx', code);
}
