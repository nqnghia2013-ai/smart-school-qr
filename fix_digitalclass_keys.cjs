const fs = require('fs');

let code = fs.readFileSync('src/pages/DigitalClass.tsx', 'utf8');

// Replace key={hs.id} in DigitalClass.tsx with key={`${hs.id}_${idx}`}
code = code.replace(/<tr key=\{hs\.id\}/g, '<tr key={`${hs.id}_${idx}`}');
code = code.replace(/<option key=\{hs\.id\}/g, '<option key={`${hs.id}_${idx}`}');
code = code.replace(/<tr key=\{hs\.id\} className="border-b/g, '<tr key={`${hs.id}_${hidx}`} className="border-b'); // Check for inner loops

fs.writeFileSync('src/pages/DigitalClass.tsx', code);
