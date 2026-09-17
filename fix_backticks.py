import os
import glob

files = [
    'src/app/(public)/reserver/page.tsx', 
    'src/app/admin/reservations/page.tsx', 
    'src/app/admin/reservations/[id]/page.tsx'
]

for f in files:
    if os.path.exists(f):
        with open(f, 'r', encoding='utf-8') as file:
            content = file.read()
        
        # In python we literally replace backslash+backtick with just backtick
        content = content.replace('\\`', '`')
        
        # Also fix the import path for lib
        content = content.replace('@/lib/actions/reservation-actions', '../../../../lib/actions/reservation-actions')
        content = content.replace('@/lib/auth', '../../../../lib/auth')
        content = content.replace('@/lib/prisma', '../../../../lib/prisma')
        
        with open(f, 'w', encoding='utf-8') as file:
            file.write(content)
        print(f"Fixed {f}")
