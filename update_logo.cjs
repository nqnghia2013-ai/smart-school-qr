const fs = require('fs');

let layoutCode = fs.readFileSync('src/components/Layout.tsx', 'utf8');

// Sidebar logo replacement
const oldSidebarLogo = `<div className="flex items-center space-x-3">
            <div className={\`w-10 h-10 bg-gradient-to-br from-[#FFD15B] to-[#EAB308] rounded-xl flex flex-wrap items-center justify-center p-1.5 gap-0.5 overflow-hidden shadow-sm shrink-0 \${isSidebarCollapsed ? 'lg:mx-0' : ''}\`}>
              <div className="w-3 h-3 border-2 border-[#131612] rounded-sm"></div>
              <div className="w-3 h-3 border-2 border-[#131612]/70 rounded-sm"></div>
              <div className="w-3 h-3 border-2 border-[#131612]/70 rounded-sm bg-[#131612]"></div>
              <div className="w-3 h-3 border-2 border-[#131612] rounded-sm"></div>
            </div>
            <div className={\`flex flex-col transition-opacity duration-200 \${isSidebarCollapsed ? 'lg:hidden lg:opacity-0 lg:w-0 overflow-hidden' : 'opacity-100'}\`}>
              <span className="text-slate-900 dark:text-white font-bold leading-tight font-display tracking-tight text-[15px]">SMART SCHOOL<br/>WORKSPACE</span>
            </div>
          </div>`;

const newSidebarLogo = `<div className="flex items-center">
            <img 
              src="/logo.png" 
              alt="Smart School Workspace" 
              className={\`transition-all duration-300 object-contain \${isSidebarCollapsed ? 'h-10 w-10 ml-2 object-left' : 'h-14 w-auto object-left'}\`} 
            />
          </div>`;

layoutCode = layoutCode.replace(oldSidebarLogo, newSidebarLogo);

// Footer logo replacement
const oldFooterLogo = `<div className="flex items-center space-x-3 mb-2">
                  <div className="w-10 h-10 bg-[#FFD15B] rounded-lg flex flex-wrap items-center justify-center p-1.5 gap-0.5 overflow-hidden shadow-sm">
                    {/* Simulated split QR logo from image */}
                    <div className="w-3 h-3 border-2 border-[#121411] rounded-sm"></div>
                    <div className="w-3 h-3 border-2 border-[#121411] rounded-sm"></div>
                    <div className="w-3 h-3 border-2 border-[#121411] rounded-sm bg-[#121411]"></div>
                    <div className="w-3 h-3 border-2 border-[#121411] rounded-sm"></div>
                  </div>
                  <div>
                    <span className="text-slate-900 dark:text-white font-bold font-display tracking-tight block leading-tight text-lg">SMART SCHOOL<br/>WORKSPACE SYSTEM</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[10px] tracking-wider uppercase leading-none mt-1 block">QR System</span>
                  </div>
                </div>`;

const newFooterLogo = `<div className="flex items-center space-x-3 mb-2">
                  <img src="/logo.png" alt="Smart School Workspace" className="h-16 object-contain" />
                </div>`;
                
layoutCode = layoutCode.replace(oldFooterLogo, newFooterLogo);

fs.writeFileSync('src/components/Layout.tsx', layoutCode);


let loginCode = fs.readFileSync('src/pages/Login.tsx', 'utf8');

// Login logo replacement
const oldLoginLogo = `<div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mb-5 relative group">
                <div className="absolute inset-0 bg-white/20 rounded-[1.5rem] opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Fingerprint className="w-8 h-8 relative z-10" />
              </div>
              <h1 className="text-2xl md:text-3xl font-display font-black text-slate-900 tracking-tight flex flex-col gap-1">
                <span className="leading-tight">SMART SCHOOL<br/>WORKSPACE SYSTEM</span>
                <span className="text-xs font-black tracking-[0.2em] uppercase text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 mt-1">Access Protocol</span>
              </h1>`;

const newLoginLogo = `<img src="/logo.png" alt="Smart School Workspace" className="h-32 md:h-40 object-contain mb-4" />`;
              
loginCode = loginCode.replace(oldLoginLogo, newLoginLogo);
fs.writeFileSync('src/pages/Login.tsx', loginCode);

