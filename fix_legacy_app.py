import os
import glob

# Files with incorrect lib/prisma imports
files = glob.glob('app/**/*.tsx', recursive=True) + glob.glob('app/**/*.ts', recursive=True)

for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    original = content
    
    # Fix import Tool -> Wrench
    if 'import ' in content and 'lucide-react' in content:
        content = content.replace(' Tool,', ' Wrench as Tool,')
        content = content.replace('{ Tool,', '{ Wrench as Tool,')
        content = content.replace(', Tool }', ', Wrench as Tool }')
        
    # Replace relative paths with correct ones. Let's just use absolute replacement by counting depth.
    # The depth of the file from root
    depth = len(f.split(os.sep)) - 1
    # Create the correct relative path to root
    rel_to_root = '../' * depth
    
    import_auth = "from '" + rel_to_root + "lib/auth/user'"
    import_prisma = "from '" + rel_to_root + "prisma/db'"
    
    # Replace any ../../../.. style imports to lib with the exact correct one
    import re
    content = re.sub(r"from '(\.\./)+lib/auth/user'", import_auth, content)
    content = re.sub(r"from '(\.\./)+prisma/db'", import_prisma, content)

    if content != original:
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Fixed {f}")
