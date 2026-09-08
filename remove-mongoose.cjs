const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');

    // Remove .session(session)
    content = content.replace(/\.session\(session\)/g, '');

    // Replace mongoose imports with transaction import from sqlite-cloud
    // Adjust path depth dynamically based on file location
    const dirDepth = filePath.split(/[\\/]/).length - 1; // Assuming src is at depth 1 or 2... wait, hardcode for now
    if (filePath.includes('attendance.service.ts')) {
        content = content.replace(/import mongoose from '.*transaction\.js';/, "import { transaction } from '../database/sqlite-cloud.js';");
    } else if (filePath.includes('auth.controller.ts')) {
        content = content.replace(/import mongoose from '.*transaction\.js';/, "import { transaction } from '../database/sqlite-cloud.js';");
    }

    // Replace transaction blocks
    // Pattern: const session = await mongoose.startSession(); ... await session.withTransaction(async () => {
    // and finally { session.endSession(); }
    
    // Simplest way: regex out session
    content = content.replace(/const session = await mongoose\.startSession\(\);\s*/g, '');
    content = content.replace(/await session\.withTransaction\(/g, 'await transaction(');
    content = content.replace(/finally\s*\{\s*session\.endSession\(\);\s*\}/g, 'finally { }');

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
}

replaceInFile(path.join(__dirname, 'backend/src/services/attendance.service.ts'));
replaceInFile(path.join(__dirname, 'backend/src/controllers/auth.controller.ts'));
