const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Sidebar logo replacement
layoutCode = layoutCode.replace(
  /\`transition-all duration-300 object-contain \$\{isSidebarCollapsed \? 'h-14 w-14 ml-1 object-left' : 'h-24 w-auto object-left'\}\`/,
  "\`transition-all duration-300 object-contain \${isSidebarCollapsed ? 'h-20 w-20 ml-1 object-left' : 'h-40 w-auto object-left'}\`"
);

// Footer logo replacement
layoutCode = layoutCode.replace(
  /className="h-32 object-contain"/,
  'className="h-48 object-contain"'
);

fs.writeFileSync('src/components/Layout.tsx', layoutCode);

let loginCode = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Login logo replacement
loginCode = loginCode.replace(
  /className="h-48 md:h-64 object-contain mb-4 scale-125 hover:scale-150 transition-transform duration-500"/,
  'className="h-56 md:h-72 object-contain mb-4"'
);

fs.writeFileSync('src/pages/Login.tsx', loginCode);
