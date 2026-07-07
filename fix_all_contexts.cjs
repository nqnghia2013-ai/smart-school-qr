const fs = require('fs');

const filesToFix = {
    'src/pages/Workspace.tsx': [/const \{ currentUser \} = useAppContext\(\);/g, 'const { currentUser, showToast } = useAppContext();'],
    'src/pages/DigitalClass.tsx': [/const \{ classes, currentUser, updateClass, updateUser, users, students \} = useAppContext\(\);/g, 'const { classes, currentUser, updateClass, updateUser, users, students, showToast } = useAppContext();'],
    'src/pages/LearningApps.tsx': [/const \{ learningApps, addLearningApp, deleteLearningApp, currentUser \} = useAppContext\(\);/g, 'const { learningApps, addLearningApp, deleteLearningApp, currentUser, showToast } = useAppContext();'],
    'src/pages/RoomDetail.tsx': [/const \{ rooms, updateRoom, currentUser, updateUser \} = useAppContext\(\);/g, 'const { rooms, updateRoom, currentUser, updateUser, showToast } = useAppContext();'],
    'src/components/Layout.tsx': [/const \{ recordRoomVisit, currentUser, logout, notifications, markNotificationAsRead, clearAllNotifications, students, classes, staffs \} = useAppContext\(\);/g, 'const { recordRoomVisit, currentUser, logout, notifications, markNotificationAsRead, clearAllNotifications, students, classes, staffs, showToast } = useAppContext();'],
    'src/components/FaceScanner.tsx': [/const \{ currentUser, users \} = useAppContext\(\);/g, 'const { currentUser, users, showToast } = useAppContext();'],
    'src/components/GifShopModal.tsx': [/const \{ currentUser, updateUser, storeGifs, addStoreGif, deleteStoreGif \} = useAppContext\(\);/g, 'const { currentUser, updateUser, storeGifs, addStoreGif, deleteStoreGif, showToast } = useAppContext();'],
};

for (const [file, [regex, replacement]] of Object.entries(filesToFix)) {
    if (fs.existsSync(file)) {
        let code = fs.readFileSync(file, 'utf8');
        code = code.replace(regex, replacement);
        // Special case for FaceScanner where context might be different
        if (file === 'src/components/FaceScanner.tsx') {
           if (!code.includes('showToast } = useAppContext')) {
               code = code.replace(/const \{ users, students, classes, staffs \} = useAppContext\(\);/, 'const { users, students, classes, staffs, showToast } = useAppContext();');
               code = code.replace(/const \{ currentUser \} = useAppContext\(\);/, 'const { currentUser, showToast } = useAppContext();');
           }
        }
        if (file === 'src/pages/Workspace.tsx') {
           if (!code.includes('showToast } = useAppContext')) {
               code = code.replace(/const \{ students, users, classes, currentUser \} = useAppContext\(\);/, 'const { students, users, classes, currentUser, showToast } = useAppContext();');
               code = code.replace(/const \{ students, users, classes, currentUser, deleteUser \} = useAppContext\(\);/, 'const { students, users, classes, currentUser, deleteUser, showToast } = useAppContext();');
           }
        }
        fs.writeFileSync(file, code);
    }
}
