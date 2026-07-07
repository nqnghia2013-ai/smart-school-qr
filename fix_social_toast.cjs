const fs = require('fs');

let code = fs.readFileSync('src/pages/SocialNetwork.tsx', 'utf8');

if (!code.includes('showToast')) {
    code = code.replace(/const \{ currentUser, students, classes, staffs, deleteUser \} = useAppContext\(\);/, 'const { currentUser, students, classes, staffs, deleteUser, showToast } = useAppContext();');
}

// 1. In handleCreateGroup
code = code.replace(/setIsCreatingGroup\(false\);\n\s*setGroupName\(''\);/, `setIsCreatingGroup(false);
    setGroupName('');
    setGroupAvatar(null);
    setSelectedFriends([]);
    showToast('Tạo nhóm trò chuyện thành công', 'success');`);

// 2. In groupAvatar upload
code = code.replace(/reader\.onloadend = \(\) => setGroupAvatar\(reader\.result as string\);/g, `reader.onloadend = () => { setGroupAvatar(reader.result as string); showToast('Tải tài liệu thành công', 'success'); };`);

// 3. In handleFileUpload
code = code.replace(/const base64Data = reader\.result as string;\n\s*sendMessage\(type, '', base64Data, file\.name\);/g, `const base64Data = reader.result as string;
          sendMessage(type, '', base64Data, file.name);
          showToast('Tải tài liệu thành công', 'success');`);

fs.writeFileSync('src/pages/SocialNetwork.tsx', code);
