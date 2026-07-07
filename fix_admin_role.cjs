const fs = require('fs');
let code = fs.readFileSync('src/pages/Admin.tsx', 'utf8');

code = code.replace(/value=\{u\.role\}/g, "value={u.role || 'student'}");
code = code.replace(/value=\{newRoom\.name\}/g, "value={newRoom.name || ''}");
code = code.replace(/value=\{newRoom\.description\}/g, "value={newRoom.description || ''}");
code = code.replace(/value=\{newClass\.name\}/g, "value={newClass.name || ''}");
code = code.replace(/value=\{newClass\.teacher\}/g, "value={newClass.teacher || ''}");

fs.writeFileSync('src/pages/Admin.tsx', code);
