const fs = require('fs');

let code = fs.readFileSync('src/components/Layout.tsx', 'utf8');

code = code.replace(/const decodedText = await html5QrCode\.scanFileV2\(file\);/g, `const decodedText = await html5QrCode.scanFileV2(file);
      showToast('Tải tài liệu thành công', 'success');`);

fs.writeFileSync('src/components/Layout.tsx', code);
