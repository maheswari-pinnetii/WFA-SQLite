const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'backend', 'src');

function replaceInFile(filePath, replacements) {
    const fullPath = path.join(srcDir, filePath);
    if (!fs.existsSync(fullPath)) {
        console.log(`Skipping ${filePath} (not found)`);
        return;
    }
    let content = fs.readFileSync(fullPath, 'utf8');
    let original = content;
    for (const [search, replace] of replacements) {
        content = content.split(search).join(replace);
    }
    if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

// 1. Fix auth.controller.ts
replaceInFile('controllers/auth.controller.ts', [
    ["'../../database/connection.js'", "'../database/connection.js'"],
    ["'./auth.service.js'", "'../services/auth.service.js'"],
    ["'./auth.repository.js'", "'../repositories/auth.repository.js'"],
    ["'../../database/transaction.js'", "'../database/transaction.js'"],
    ["'../../database/sqlite-cloud.js'", "'../database/sqlite-cloud.js'"],
    ["'./totp.js'", "'../utils/totp.js'"],
    ["'../../config/env.js'", "'../config/env.js'"],
    ["'../../sockets/socketEmitter.js'", "'../sockets/socketEmitter.js'"],
    ["'../../utils/errorHandler.js'", "'../utils/errorHandler.js'"]
]);

// 2. Fix analytics.repository.ts
replaceInFile('repositories/analytics.repository.ts', [
    ["'../../database/sqlite-cloud.js'", "'../database/sqlite-cloud.js'"]
]);

// 3. Fix attendance.repository.ts
replaceInFile('repositories/attendance.repository.ts', [
    ["'../../database/sqlite-cloud.js'", "'../database/sqlite-cloud.js'"]
]);

// 4. Fix auth.repository.ts
replaceInFile('repositories/auth.repository.ts', [
    ["'../../database/sqlite-cloud.js'", "'../database/sqlite-cloud.js'"]
]);

// 5. Fix employee.repository.ts
replaceInFile('repositories/employee.repository.ts', [
    ["'../../database/sqlite-cloud.js'", "'../database/sqlite-cloud.js'"]
]);

// 6. Fix analytics.service.ts
replaceInFile('services/analytics.service.ts', [
    ["'./analytics.repository.js'", "'../repositories/analytics.repository.js'"],
    ["'../../models/index.js'", "'../models/index.js'"]
]);

// 7. Fix attendance.service.ts
replaceInFile('services/attendance.service.ts', [
    ["'../../database/transaction.js'", "'../database/transaction.js'"],
    ["'./attendance.repository.js'", "'../repositories/attendance.repository.js'"],
    ["'../employees/employee.repository.js'", "'../repositories/employee.repository.js'"],
    ["'../auth/auth.repository.js'", "'../repositories/auth.repository.js'"],
    ["'../../models/index.js'", "'../models/index.js'"],
    ["'../../database/connection.js'", "'../database/connection.js'"],
    ["'../notifications/notification.service.js'", "'./notification.service.js'"],
    ["'../../sockets/index.js'", "'../sockets/index.js'"],
    ["'../../services/ai/aiService.js'", "'./ai/aiService.js'"]
]);

// 8. Fix auth.service.ts
replaceInFile('services/auth.service.ts', [
    ["'./auth.repository.js'", "'../repositories/auth.repository.js'"],
    ["'../../database/connection.js'", "'../database/connection.js'"],
    ["'../../config/env.js'", "'../config/env.js'"],
    ["'./totp.js'", "'../utils/totp.js'"],
    ["'../../services/email.service.js'", "'./email.service.js'"]
]);

// 9. Fix employee.service.ts
replaceInFile('services/employee.service.ts', [
    ["'./employee.repository.js'", "'../repositories/employee.repository.js'"],
    ["'../auth/auth.repository.js'", "'../repositories/auth.repository.js'"]
]);

// 10. Fix notification.service.ts
replaceInFile('services/notification.service.ts', [
    ["'../../database/connection.js'", "'../database/connection.js'"]
]);

// 11. Fix totp.ts
replaceInFile('utils/totp.ts', [
    ["'../../config/env.js'", "'../config/env.js'"]
]);
