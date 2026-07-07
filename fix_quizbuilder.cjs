const fs = require('fs');
let code = fs.readFileSync('src/components/QuizBuilder.tsx', 'utf8');

code = code.replace(/value=\{numQuestions\}/g, "value={numQuestions || ''}");
code = code.replace(/value=\{q\.question\}/g, "value={q.question || ''}");
code = code.replace(/value=\{opt\}/g, "value={opt || ''}");
code = code.replace(/value=\{q\.explanation\}/g, "value={q.explanation || ''}");

fs.writeFileSync('src/components/QuizBuilder.tsx', code);
