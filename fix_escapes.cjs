const fs = require('fs');
let content = fs.readFileSync('backend/src/services/payroll.service.ts', 'utf8');
content = content.replace(/\\\${/g, '${');
content = content.replace(/<\/ENVELOPE>\\`;/, '</ENVELOPE>`;');
content = content.replace(/<\/ENVELOPE>\\`/, '</ENVELOPE>`');
fs.writeFileSync('backend/src/services/payroll.service.ts', content);
