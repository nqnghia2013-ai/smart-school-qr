const fs = require('fs');

let code = fs.readFileSync('src/pages/RoomDetail.tsx', 'utf8');

if (!code.includes('showToast')) {
    code = code.replace(/const \{ currentUser, rooms, users \} = useAppContext\(\);/, 'const { currentUser, rooms, users, showToast } = useAppContext();');
}

code = code.replace(/const sizeMB = \(\(file\.size \/ \(1024 \* 1024\)\)\)\.toFixed\(2\);\n\s*setLocalFileSize\(`\$\{sizeMB\} MB`\);/g, `const sizeMB = ((file.size / (1024 * 1024))).toFixed(2);
    setLocalFileSize(\`\${sizeMB} MB\`);
    showToast('Tải tài liệu thành công', 'success');`);

fs.writeFileSync('src/pages/RoomDetail.tsx', code);
