const fs = require('fs');
let code = fs.readFileSync('src/pages/DocumentLibrary.tsx', 'utf8');

code = code.replace(/<Loader2,\s*Plus className="w-5 h-5 animate-spin" \/>/, '<Loader2 className="w-5 h-5 animate-spin" />');
fs.writeFileSync('src/pages/DocumentLibrary.tsx', code);
