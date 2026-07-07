const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

const oldUserState = `  const [users, setUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem('smart_school_users');
    if (saved) return JSON.parse(saved);
    return [{ id: 'admin1', email: 'admin@school.edu.vn', role: 'admin', fullName: 'Ban Giám Hiệu' }];
  });`;

const newUserState = `  const [users, setUsers] = useState<User[]>([]);`;

code = code.replace(oldUserState, newUserState);

// Remove the !d.empty check for all onSnapshot
code = code.replace(/if \(!d\.empty\) setUsers\(d\.docs\.map\(doc => \(\{ id: doc\.id, \.\.\.doc\.data\(\) \} as User\)\)\);/g, 
  `setUsers(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));`);

fs.writeFileSync('src/context/AppContext.tsx', code);
