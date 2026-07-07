const fs = require('fs');
if (fs.existsSync('src/pages/DigitalClass.tsx')) {
  let code = fs.readFileSync('src/pages/DigitalClass.tsx', 'utf8');
  code = code.replace(/value=\{searchMaterial\}/g, "value={searchMaterial || ''}");
  code = code.replace(/value=\{newMaterialTitle\}/g, "value={newMaterialTitle || ''}");
  code = code.replace(/value=\{newMaterialUrl\}/g, "value={newMaterialUrl || ''}");
  code = code.replace(/value=\{awardStudentId\}/g, "value={awardStudentId || ''}");
  code = code.replace(/value=\{awardDesc\}/g, "value={awardDesc || ''}");
  code = code.replace(/value=\{newMomentTitle\}/g, "value={newMomentTitle || ''}");
  code = code.replace(/value=\{newMomentDate\}/g, "value={newMomentDate || ''}");
  code = code.replace(/value=\{newQuestTitle\}/g, "value={newQuestTitle || ''}");
  code = code.replace(/value=\{newQuestDesc\}/g, "value={newQuestDesc || ''}");
  code = code.replace(/value=\{newQuestUrl\}/g, "value={newQuestUrl || ''}");
  fs.writeFileSync('src/pages/DigitalClass.tsx', code);
}
