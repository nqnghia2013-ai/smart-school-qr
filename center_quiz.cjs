const fs = require('fs');
let code = fs.readFileSync('src/components/QuizPlayer.tsx', 'utf8');

const oldCode = `<div className="max-w-5xl w-full flex-1 flex flex-col justify-center">`;
const newCode = `<div className="max-w-5xl w-full my-auto flex flex-col justify-center">`;

code = code.replace(oldCode, newCode);
fs.writeFileSync('src/components/QuizPlayer.tsx', code);
