const fs = require('fs');
let code = fs.readFileSync('src/pages/Workspace.tsx', 'utf8');

code = code.replace(/value=\{mcqCount\}/g, "value={mcqCount || ''}");
code = code.replace(/value=\{shortCount\}/g, "value={shortCount || ''}");
code = code.replace(/value=\{essayCount\}/g, "value={essayCount || ''}");

fs.writeFileSync('src/pages/Workspace.tsx', code);
