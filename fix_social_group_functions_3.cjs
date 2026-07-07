const fs = require('fs');
let code = fs.readFileSync('src/pages/SocialNetwork.tsx', 'utf8');

// Find the code to remove
const startMarker = '  const handleUpdateGroupSettings = async (settings: any) => {';
const endMarker = '    if (!activeChat || !activeChat.isGroup) return true;\n    if (activeChat.chatSettings?.canSendMessages !== false) return true;\n    return activeChat.adminId === currentUser?.id || (activeChat.deputyIds || []).includes(currentUser?.id);\n  };\n';

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker) + endMarker.length;

if (startIndex !== -1 && endIndex !== -1) {
  const extracted = code.substring(startIndex, endIndex);
  // Remove from old place
  code = code.substring(0, startIndex) + code.substring(endIndex);
  
  // Find where to put it
  const targetReturn = '  return (\n    <div className="flex h-[calc(100vh-7rem)] bg-white';
  const targetIndex = code.indexOf(targetReturn);
  
  if (targetIndex !== -1) {
    code = code.substring(0, targetIndex) + extracted + '\n' + code.substring(targetIndex);
  }
}

fs.writeFileSync('src/pages/SocialNetwork.tsx', code);
