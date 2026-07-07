const fs = require('fs');
if (fs.existsSync('src/pages/SubjectRooms.tsx')) {
  let code = fs.readFileSync('src/pages/SubjectRooms.tsx', 'utf8');
  code = code.replace(/value=\{search\}/g, "value={search || ''}");
  fs.writeFileSync('src/pages/SubjectRooms.tsx', code);
}
