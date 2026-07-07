const fs = require('fs');

let code = fs.readFileSync('src/pages/SocialNetwork.tsx', 'utf8');

// Replace filteredDirectory map
code = code.replace(/\{filteredDirectory\.map\(user => \{/g, '{filteredDirectory.map((user, idx) => {');
code = code.replace(/<div key=\{user\.id\} className="flex items-center justify-between p-3 bg-white/g, '<div key={`${user.id}_${idx}`} className="flex items-center justify-between p-3 bg-white');

// Replace filteredFriends map
code = code.replace(/\{filteredFriends\.map\(user => \(/g, '{filteredFriends.map((user, idx) => (');

fs.writeFileSync('src/pages/SocialNetwork.tsx', code);
