const fs = require('fs');
let code = fs.readFileSync('src/pages/DigitalClass.tsx', 'utf8');

code = code.replace(/value=\{awardBonusScore\}/g, "value={awardBonusScore || ''}");
code = code.replace(/value=\{newQuestPoints\}/g, "value={newQuestPoints || ''}");
code = code.replace(/value=\{newQuestTimeLimit\}/g, "value={newQuestTimeLimit || ''}");

fs.writeFileSync('src/pages/DigitalClass.tsx', code);
