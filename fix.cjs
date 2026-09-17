const fs = require('fs');

const replaces = [
  {
    file: 'src/app/(protected)/admin/logistics/maintenance/page.tsx',
    from: `.include('' as any, i => i.include('' as any, e => e.select('name')))`,
    to: `.include('inventory', i => i.include('equipment', e => e.select('name')))`
  },
  {
    file: 'src/app/(protected)/admin/logistics/maintenance/page.tsx',
    from: `.include('' as any, u => u.select('name', 'email'))`,
    to: `.include('user', u => u.select('name', 'email'))`
  },
  {
    file: 'src/app/(protected)/admin/logistics/inventory/page.tsx',
    from: `.include('' as any, e => e.select('name'))`,
    to: `.include('equipment', e => e.select('name'))`
  },
  {
    file: 'src/app/(protected)/admin/logistics/inventory/page.tsx',
    from: `.include('' as any, l => l.select('name'))`,
    to: `.include('location', l => l.select('name'))`
  },
  {
    file: 'src/app/(protected)/admin/logistics/equipments/page.tsx',
    from: `.include('' as any, c => c.select('name'))`,
    to: `.include('category', c => c.select('name'))`
  },
  {
    file: 'src/app/(protected)/admin/logistics/allocations/page.tsx',
    from: `.include('' as any, i => i.include('' as any, e => e.select('name')))`,
    to: `.include('inventory', i => i.include('equipment', e => e.select('name')))`
  },
  {
    file: 'src/app/(protected)/admin/logistics/allocations/page.tsx',
    from: `.include('' as any, r => r.select('reference', 'startDate', 'endDate'))`,
    to: `.include('reservation', r => r.select('reference', 'startDate', 'endDate'))`
  },
  {
    file: 'src/app/(protected)/admin/catalogue/services/[id]/page.tsx',
    from: `.include('' as any, c => c.select('name'))`,
    to: `.include('category', c => c.select('name'))`
  },
  {
    file: 'src/app/(protected)/admin/catalogue/services/[id]/page.tsx',
    from: `.include('' as any, f => f.include('' as any, r => r.include('' as any, e => e.select('name', 'totalGlobalQuantity'))))`,
    to: `.include('formulas', f => f.include('resources', r => r.include('equipment', e => e.select('name', 'totalGlobalQuantity'))))`
  },
  {
    file: 'src/app/(protected)/admin/catalogue/page.tsx',
    from: `.include('' as any, c => c.select('name'))`,
    to: `.include('category', c => c.select('name'))`
  }
];

replaces.forEach(({file, from, to}) => {
  if (fs.existsSync(file)) {
    let content = fs.readFileSync(file, 'utf-8');
    if (content.includes(from)) {
      content = content.replace(from, to);
      fs.writeFileSync(file, content);
      console.log('Fixed in', file);
    } else {
      console.log('From string not found in', file);
    }
  } else {
    console.log('File not found', file);
  }
});
