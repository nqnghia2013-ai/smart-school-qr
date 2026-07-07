const fs = require('fs');

let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

code = code.replace(
  /await setDoc\(doc\(db, 'documents', id\), newDoc\);/g,
  `await setDoc(doc(db, 'documents', id), JSON.parse(JSON.stringify(newDoc)));`
);

fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
