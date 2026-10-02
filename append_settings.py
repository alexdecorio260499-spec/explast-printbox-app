import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

settings_code = """
  const renderSettings = () => {
    return (
      <div className="bg-white overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200 bg-white">
          <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-1">Configuration</p>
          <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
        </div>
        
        <div className="p-8 max-w-4xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            
            <div className="md:col-span-1">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-widest mb-4">Account</h3>
              <ul className="space-y-3 text-sm text-gray-500 font-medium">
                <li className="text-gray-900 font-bold cursor-pointer">Profile Information</li>
                <li className="cursor-pointer hover:text-gray-900 transition-colors">Security & Password</li>
                <li className="cursor-pointer hover:text-gray-900 transition-colors">Notifications</li>
                <li className="cursor-pointer hover:text-gray-900 transition-colors">Team Members</li>
              </ul>
            </div>
            
            <div className="md:col-span-2 space-y-8">
              <div>
                <h4 className="text-sm font-bold text-gray-900 mb-4">Personal Details</h4>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">First Name</label>
                    <input type="text" defaultValue="Alexandre" className="w-full border border-gray-200 rounded-sm px-4 py-3 bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400" />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Last Name</label>
                    <input type="text" defaultValue="De Coriolis" className="w-full border border-gray-200 rounded-sm px-4 py-3 bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs uppercase tracking-wider font-bold text-gray-500 mb-2">Email Address</label>
                    <input type="email" defaultValue="alex@explast.mu" className="w-full border border-gray-200 rounded-sm px-4 py-3 bg-gray-50 text-gray-900 focus:outline-none focus:border-gray-400" />
                  </div>
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-100">
                <button className="px-6 py-3 bg-slate-900 text-white rounded-sm font-bold text-xs uppercase tracking-wider hover:bg-slate-800 transition-colors">Save Changes</button>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    );
  };
"""

content = content.replace("  return (\n    <div className={`flex h-screen w-full ${theme.appBg} font-sans`}>", settings_code + "\n  return (\n    <div className={`flex h-screen w-full ${theme.appBg} font-sans`}>")

content = content.replace("{activeView === 'Clients' && renderClients()}", "{activeView === 'Clients' && renderClients()}\n          {activeView === 'Settings' && renderSettings()}")

# Update sidebar branding
content = content.replace("{brand === 'Explast' ? <Factory size={28} className=\"text-blue-400\" /> : <Leaf size={28} className=\"text-emerald-400\" />}\n          <h1 className=\"text-2xl font-bold tracking-tight\">{brand}</h1>", "{brand === 'Explast' ? <Factory size={28} className=\"text-gray-900\" /> : <Leaf size={28} className=\"text-gray-900\" />}\n          <h1 className=\"text-lg font-bold tracking-tight text-gray-900 uppercase\">Ocean Pearl</h1>")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
