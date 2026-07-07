const fs = require('fs');
if (fs.existsSync('src/pages/Feedback.tsx')) {
  let code = fs.readFileSync('src/pages/Feedback.tsx', 'utf8');
  code = code.replace(/value=\{newTitle\}/g, "value={newTitle || ''}");
  code = code.replace(/value=\{newDesc\}/g, "value={newDesc || ''}");
  fs.writeFileSync('src/pages/Feedback.tsx', code);
}
