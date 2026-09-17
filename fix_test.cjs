const fs = require('fs'); let c = fs.readFileSync('test_analytics.ts', 'utf8'); c = c.replace(/import\('\.\/lib\//g, "import('./src/lib/"); fs.writeFileSync('test_analytics.ts', c);
