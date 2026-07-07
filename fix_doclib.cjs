const fs = require('fs');
if (fs.existsSync('src/pages/DocumentLibrary.tsx')) {
  let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');
  code = code.replace(/value=\{searchTerm \|\| ''\}/g, "value={searchTerm || ''}");
  fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
}
