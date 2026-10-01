const fs = require('fs');
let content = fs.readFileSync('backend/src/modules/core/audit.controller.ts', 'utf-8');
content = content.replace("import { query } from '../../database/connection.js';\n", "");
fs.writeFileSync('backend/src/modules/core/audit.controller.ts', content, 'utf-8');
console.log('Fixed audit imports');
