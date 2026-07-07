const fs = require('fs');
let code = fs.readFileSync('src/pages/SocialNetwork.tsx', 'utf8');

code = code.replace(/alert\('Vui lòng nhập tên nhóm và chọn ít nhất 1 thành viên'\);/g, "showToast('Vui lòng nhập tên nhóm và chọn ít nhất 1 thành viên', 'error');");

fs.writeFileSync('src/pages/SocialNetwork.tsx', code);
