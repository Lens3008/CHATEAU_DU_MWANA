const fs = require('fs');

const files = [
  'src/app/admin/reservations/[id]/page.tsx',
  'src/app/admin/reservations/page.tsx',
  'src/app/admin/crm/page.tsx',
  'src/app/admin/crm/clients/[id]/page.tsx',
  'src/app/admin/cms/settings/page.tsx',
  'src/app/admin/cms/pages/page.tsx',
  'src/app/admin/cms/media/page.tsx'
];

files.forEach(file => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace:
    // const user = await requireAuth();
    // requireRole(user, ['ADMIN'...]);
    // With:
    // const user = await requireRole(['ADMIN'...]);
    
    content = content.replace(/const user = await requireAuth\(\);\s*requireRole\(user, /g, 'const user = await requireRole(');
    content = content.replace(/const user = await requireAuth\(\);\s*await requireRole\(user, /g, 'const user = await requireRole(');
    
    // If there is no requireAuth() before it, just replace requireRole(user, ...) with await requireRole(...)
    content = content.replace(/requireRole\(user, /g, 'await requireRole(');
    
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  } else {
    console.log('Not found:', file);
  }
});
