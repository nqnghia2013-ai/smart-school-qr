const fs = require('fs');
if (fs.existsSync('src/pages/LearningApps.tsx')) {
  let code = fs.readFileSync('src/pages/LearningApps.tsx', 'utf8');
  code = code.replace(/value=\{newApp\.name\}/g, "value={newApp.name || ''}");
  code = code.replace(/value=\{newApp\.url\}/g, "value={newApp.url || ''}");
  code = code.replace(/value=\{newApp\.logo\}/g, "value={newApp.logo || ''}");
  fs.writeFileSync('src/pages/LearningApps.tsx', code);
}
