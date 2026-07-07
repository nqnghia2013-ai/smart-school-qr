const fs = require('fs');

let code = fs.readFileSync('src/pages/DigitalClass.tsx', 'utf8');

// Use updateUser instead of addUser to give coins
const oldAwardCoins = `      // Award points (coins) for completion
      const userDoc = users.find(u => u.id === currentUser.id);
      if (userDoc) {
        addUser({ ...userDoc, coins: (userDoc.coins || 0) + 10 });
      }`;

const newAwardCoins = `      // Award points (coins) for completion
      const userDoc = users.find(u => u.id === currentUser.id);
      if (userDoc) {
        updateUser(currentUser.id, { coins: (userDoc.coins || 0) + 10 });
      }`;

code = code.replace(oldAwardCoins, newAwardCoins);

fs.writeFileSync('src/pages/DigitalClass.tsx', code);
