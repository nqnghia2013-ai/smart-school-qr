const fs = require('fs');
let code = fs.readFileSync('src/pages/Workspace.tsx', 'utf8');

code = code.replace(/const \{ students, users, classes, currentUser \} = useAppContext\(\);/g, 'const { students, users, classes, currentUser, showToast } = useAppContext();');
code = code.replace(/const \{ students, users, classes, currentUser, deleteUser \} = useAppContext\(\);/g, 'const { students, users, classes, currentUser, deleteUser, showToast } = useAppContext();');

fs.writeFileSync('src/pages/Workspace.tsx', code);
