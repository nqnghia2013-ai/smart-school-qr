const fs = require('fs');

let code = fs.readFileSync('src/pages/DigitalClass.tsx', 'utf8');

if (!code.includes('showToast')) {
    code = code.replace(/const \{ currentUser, users, classes, updateClass, students, staffs, deleteUser, setQuests: setGlobalQuests, quests: globalQuests \} = useAppContext\(\);/, 'const { currentUser, users, classes, updateClass, students, staffs, deleteUser, setQuests: setGlobalQuests, quests: globalQuests, showToast } = useAppContext();');
}

// 1. handleFileUpload (excel)
code = code.replace(/const wb = XLSX\.read\(bstr, \{ type: 'binary', cellDates: true \}\);/, `const wb = XLSX.read(bstr, { type: 'binary', cellDates: true }); showToast('Tải tài liệu thành công', 'success');`);

// 2. handleMaterialFileChange
code = code.replace(/setLocalFileData\(base64String\);\n\s*\}\n\s*reader\.readAsDataURL\(file\);/, `setLocalFileData(base64String); showToast('Tải tài liệu thành công', 'success');\n      }\n      reader.readAsDataURL(file);`);

// 3. handleMomentImageChange
code = code.replace(/setNewMomentImg\(reader\.result as string\);\n\s*\}\n\s*reader\.readAsDataURL\(file\);/, `setNewMomentImg(reader.result as string); showToast('Tải tài liệu thành công', 'success');\n      }\n      reader.readAsDataURL(file);`);

fs.writeFileSync('src/pages/DigitalClass.tsx', code);
