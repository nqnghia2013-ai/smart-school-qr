const fs = require('fs');
if (fs.existsSync('src/pages/SocialNetwork.tsx')) {
  let code = fs.readFileSync('src/pages/SocialNetwork.tsx', 'utf8');
  code = code.replace(/value=\{searchQuery\}/g, "value={searchQuery || ''}");
  code = code.replace(/value=\{newMessage\}/g, "value={newMessage || ''}");
  code = code.replace(/value=\{groupName\}/g, "value={groupName || ''}");
  fs.writeFileSync('src/pages/SocialNetwork.tsx', code);
}
