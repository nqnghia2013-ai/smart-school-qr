const fs = require('fs');

let code = fs.readFileSync('src/pages/DigitalClass.tsx', 'utf8');

// Replace addUser with updateUser
code = code.replace(/const { classes, currentUser, updateClass, addUser, users, students } = useAppContext\(\);/, 'const { classes, currentUser, updateClass, updateUser, users, students } = useAppContext();');

fs.writeFileSync('src/pages/DigitalClass.tsx', code);
