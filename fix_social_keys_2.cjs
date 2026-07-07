const fs = require('fs');

let code = fs.readFileSync('src/pages/SocialNetwork.tsx', 'utf8');

// The first replacement was done, now do the div
code = code.replace(/\{filteredFriends\.map\(\(user, idx\) => \(\n\s*<div key=\{user\.id\}/g, '{filteredFriends.map((user, idx) => (\n                <div key={`${user.id}_${idx}`}');
code = code.replace(/<div key=\{user\.id\} className="flex items-center justify-between p-3 bg-white/g, '<div key={`${user.id}_${idx}`} className="flex items-center justify-between p-3 bg-white');


fs.writeFileSync('src/pages/SocialNetwork.tsx', code);
