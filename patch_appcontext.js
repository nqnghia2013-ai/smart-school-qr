const fs = require('fs');
let code = fs.readFileSync('src/context/AppContext.tsx', 'utf8');

if (!code.includes('DUPLICATE KEY CHECK')) {
  const replaceStr = `if (!d.empty) {
          const newUsers = d.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const ids = newUsers.map(u => u.id);
          const duplicates = ids.filter((item, index) => ids.indexOf(item) !== index);
          if (duplicates.length > 0) {
            console.error("DUPLICATE KEY CHECK: Duplicate IDs in Firestore:", duplicates);
          }
          setUsers(newUsers);
        }`;
  code = code.replace(`if (!d.empty) setUsers(d.docs.map(doc => ({ id: doc.id, ...doc.data() } as User)));`, replaceStr);
  fs.writeFileSync('src/context/AppContext.tsx', code);
}
