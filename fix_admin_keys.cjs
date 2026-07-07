const fs = require('fs');

let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(/key=\{u\.id\}/g, 'key={`${u.id}_${index}`}');

fs.writeFileSync('src/pages/Admin.tsx', code);
