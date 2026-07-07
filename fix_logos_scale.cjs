const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Sidebar logo replacement
const oldSidebarContainer = /\<div className=\{\`flex items-center relative z-10 p-6 \$\{isSidebarCollapsed \? 'lg:justify-center lg:px-0' : 'justify-between'\}\`\}\>/;
const newSidebarContainer = `<div className={\`flex items-center relative z-10 px-6 py-3 \${isSidebarCollapsed ? 'lg:justify-center lg:px-0' : 'justify-between'}\`}>`;

layoutCode = layoutCode.replace(oldSidebarContainer, newSidebarContainer);

const oldSidebarLogo = /\`transition-all duration-300 object-contain \$\{isSidebarCollapsed \? 'h-20 w-20 ml-1 object-left' : 'h-40 w-auto object-left'\}\`/;
const newSidebarLogo = `\`transition-all duration-300 object-contain scale-[1.35] origin-left \${isSidebarCollapsed ? 'h-14 w-14 ml-2' : 'h-24 w-auto -ml-2 -mt-2'}\``;

layoutCode = layoutCode.replace(oldSidebarLogo, newSidebarLogo);

// Footer logo replacement
const oldFooterLogo = /<img src="\/logo\.png" alt="Smart School Workspace" className="h-48 object-contain" \/>/;
const newFooterLogo = `<img src="/logo.png" alt="Smart School Workspace" className="h-28 scale-[1.35] origin-left object-contain -ml-2" />`;

layoutCode = layoutCode.replace(oldFooterLogo, newFooterLogo);

fs.writeFileSync('src/components/Layout.tsx', layoutCode);

let loginCode = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Login logo replacement
const oldLoginLogo = /<img src="\/logo\.png" alt="Smart School Workspace" className="h-56 md:h-72 object-contain mb-4" \/>/;
const newLoginLogo = `<img src="/logo.png" alt="Smart School Workspace" className="h-40 md:h-48 scale-[1.35] object-contain mb-2" />`;

loginCode = loginCode.replace(oldLoginLogo, newLoginLogo);
fs.writeFileSync('src/pages/Login.tsx', loginCode);

