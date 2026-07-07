const fs = require('fs');
let code = fs.readFileSync('src/lib/seed.ts', 'utf8');

code = code.replace(/if \(!snap\.empty\) \{\s*return; \/\/ Database is already seeded\s*\}/, `// check removed`);

fs.writeFileSync('src/lib/seed.ts', code);
