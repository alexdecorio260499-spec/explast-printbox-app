import re

with open('src/app/page.tsx', 'r') as f:
    content = f.read()

# Make the app flat and minimal
content = content.replace('bg-slate-50', 'bg-white')
content = content.replace('bg-stone-50', 'bg-white')

# Update Theme Object
theme_pattern = r"const theme = brand === 'Explast' \? \{.*?\} : \{.*?\};"
new_theme = """const theme = brand === 'Explast' ? {
    primary: 'bg-slate-900',
    primaryHover: 'hover:bg-slate-800',
    primaryText: 'text-slate-900',
    primaryBorder: 'border-slate-900',
    primaryLight: 'bg-gray-50',
    appBg: 'bg-white',
    sidebarBg: 'bg-white border-r border-gray-200',
    sidebarText: 'text-gray-500',
    sidebarActiveText: 'text-slate-900 font-bold bg-gray-50',
    sidebarHover: 'hover:bg-gray-50 hover:text-slate-900',
    badge: 'bg-gray-100 text-gray-800'
  } : {
    primary: 'bg-emerald-900',
    primaryHover: 'hover:bg-emerald-800',
    primaryText: 'text-emerald-900',
    primaryBorder: 'border-emerald-900',
    primaryLight: 'bg-gray-50',
    appBg: 'bg-white',
    sidebarBg: 'bg-white border-r border-gray-200',
    sidebarText: 'text-gray-500',
    sidebarActiveText: 'text-emerald-900 font-bold bg-gray-50',
    sidebarHover: 'hover:bg-gray-50 hover:text-emerald-900',
    badge: 'bg-gray-100 text-gray-800'
  };"""
content = re.sub(theme_pattern, new_theme, content, flags=re.DOTALL)

# Remove shadows and rounded-xl
content = content.replace('shadow-sm', '')
content = content.replace('shadow-md', '')
content = content.replace('shadow-lg', '')
content = content.replace('rounded-xl', 'rounded-sm')
content = content.replace('rounded-lg', 'rounded-sm')
content = content.replace('rounded-full', 'rounded-sm')

# Sidebar link colors need to use the new sidebarText properties
content = content.replace('text-white text-opacity-70', '${theme.sidebarText}')
content = content.replace('text-white', '${theme.sidebarActiveText}') # This might break some actual white text on dark buttons. Let's be careful.

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
