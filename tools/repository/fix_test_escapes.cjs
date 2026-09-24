const fs = require('fs');
let content = fs.readFileSync('tests/integration/payroll/tally-export.test.ts', 'utf8');
content = content.replace(/\\\${/g, '${');
content = content.replace(/\\`/g, '`');
fs.writeFileSync('tests/integration/payroll/tally-export.test.ts', content);
