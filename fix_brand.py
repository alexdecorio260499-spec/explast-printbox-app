with open('src/app/page.tsx', 'r') as f:
    content = f.read()

content = content.replace("<h1 className=\"text-lg font-bold tracking-tight text-gray-900 uppercase\">Ocean Pearl</h1>", "<h1 className=\"text-lg font-bold tracking-tight text-gray-900 uppercase\">{brand}</h1>")

with open('src/app/page.tsx', 'w') as f:
    f.write(content)
