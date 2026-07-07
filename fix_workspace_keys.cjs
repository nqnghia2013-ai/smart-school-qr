const fs = require('fs');

let code = fs.readFileSync('src/pages/Workspace.tsx', 'utf8');

code = code.replace(/\{parentUsers\.map\(p => \{/g, '{parentUsers.map((p, idx) => {');
code = code.replace(/<option key=\{p\.id\} value=\{p\.id\}>/g, '<option key={`${p.id}_${idx}`} value={p.id}>');

fs.writeFileSync('src/pages/Workspace.tsx', code);
