const fs = require('fs');
if (fs.existsSync('src/pages/Workspace.tsx')) {
  let code = fs.readFileSync('src/pages/Workspace.tsx', 'utf8');
  code = code.replace(/value=\{selectedParentId\}/g, "value={selectedParentId || ''}");
  code = code.replace(/value=\{teacherComment\}/g, "value={teacherComment || ''}");
  code = code.replace(/value=\{search\}/g, "value={search || ''}");
  code = code.replace(/value=\{gradeSubject\}/g, "value={gradeSubject || ''}");
  code = code.replace(/value=\{schoolName\}/g, "value={schoolName || ''}");
  code = code.replace(/value=\{examTitle\}/g, "value={examTitle || ''}");
  code = code.replace(/value=\{subject\}/g, "value={subject || ''}");
  code = code.replace(/value=\{duration\}/g, "value={duration || ''}");
  code = code.replace(/value=\{contextText\}/g, "value={contextText || ''}");
  code = code.replace(/value=\{goal\}/g, "value={goal || ''}");
  code = code.replace(/value=\{topic\}/g, "value={topic || ''}");
  code = code.replace(/value=\{examTopic\}/g, "value={examTopic || ''}");
  code = code.replace(/value=\{essayAnswer\}/g, "value={essayAnswer || ''}");
  fs.writeFileSync('src/pages/Workspace.tsx', code);
}
