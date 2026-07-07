const fs = require('fs');

let code = fs.readFileSync('src/pages/DigitalClass.tsx', 'utf8');

code = code.replace(
  /setDoc\(doc\(db, 'classExtras', id\), \{ materials, moments, quests \}, \{ merge: true \}\)/,
  `setDoc(doc(db, 'classExtras', id), JSON.parse(currentDataString), { merge: true })`
);

fs.writeFileSync('src/pages/DigitalClass.tsx', code);
