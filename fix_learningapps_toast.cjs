const fs = require('fs');

let code = fs.readFileSync('src/pages/LearningApps.tsx', 'utf8');

if (!code.includes('showToast')) {
    code = code.replace(/const \{ currentUser, learningApps \} = useAppContext\(\);/, 'const { currentUser, learningApps, showToast } = useAppContext();');
}

code = code.replace(/reader\.onloadend = \(\) => \{\n\s*setNewApp\(\{ \.\.\.newApp, logo: reader\.result as string \}\);\n\s*\};/, `reader.onloadend = () => {
        setNewApp({ ...newApp, logo: reader.result as string });
        showToast('Tải tài liệu thành công', 'success');
      };`);

fs.writeFileSync('src/pages/LearningApps.tsx', code);
