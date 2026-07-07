const fs = require('fs');
if (fs.existsSync('src/pages/RoomDetail.tsx')) {
  let code = fs.readFileSync('src/pages/RoomDetail.tsx', 'utf8');
  code = code.replace(/value=\{newTitle\}/g, "value={newTitle || ''}");
  code = code.replace(/value=\{newType\}/g, "value={newType || ''}");
  code = code.replace(/value=\{newUrl\}/g, "value={newUrl || ''}");
  code = code.replace(/value=\{newGrade\}/g, "value={newGrade || ''}");
  code = code.replace(/value=\{newSemester\}/g, "value={newSemester || ''}");
  code = code.replace(/value=\{searchDriveQuery\}/g, "value={searchDriveQuery || ''}");
  fs.writeFileSync('src/pages/RoomDetail.tsx', code);
}
