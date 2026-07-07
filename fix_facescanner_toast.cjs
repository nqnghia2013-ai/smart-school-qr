const fs = require('fs');

let code = fs.readFileSync('src/components/FaceScanner.tsx', 'utf8');

if (!code.includes('showToast')) {
    code = code.replace(/const \{ users, students, classes, staffs \} = useAppContext\(\);/, 'const { users, students, classes, staffs, showToast } = useAppContext();');
}

code = code.replace(/setUploadedImageUrl\(imgUrl\);/g, `setUploadedImageUrl(imgUrl);
    showToast('Tải tài liệu thành công', 'success');`);

fs.writeFileSync('src/components/FaceScanner.tsx', code);
