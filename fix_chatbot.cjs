const fs = require('fs');
if (fs.existsSync('src/components/Chatbot.tsx')) {
  let code = fs.readFileSync('src/components/Chatbot.tsx', 'utf8');
  code = code.replace(/value=\{inputText\}/g, "value={inputText || ''}");
  fs.writeFileSync('src/components/Chatbot.tsx', code);
}
