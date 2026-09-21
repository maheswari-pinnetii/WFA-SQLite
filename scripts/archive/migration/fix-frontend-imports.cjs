const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'frontend', 'src');

function replaceInFile(filePath, search, replaceStr) {
    const fullPath = path.join(srcDir, filePath);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    const newContent = content.split(search).join(replaceStr);
    if (content !== newContent) {
        fs.writeFileSync(fullPath, newContent, 'utf8');
        console.log(`Updated ${filePath}`);
    }
}

replaceInFile('store/attendanceSlice.ts', "'../services/api'", "'../api/client'");
replaceInFile('features/employee/pages/Profile.tsx', "'../../../services/api'", "'../../../api/client'");
replaceInFile('auth/store/authSlice.ts', "'../../services/api'", "'../../api/client'");
replaceInFile('auth/services/auth.service.ts', "'../../services/api'", "'../../api/client'");

// In the api/endpoints directory, the relative path was ../../services/api, now it's ../client
['auth.api.ts', 'employee.api.ts', 'workforce.api.ts', 'user.api.ts', 'report.api.ts', 'analytics.api.ts'].forEach(f => {
    replaceInFile(`api/endpoints/${f}`, "'../../services/api'", "'../client'");
});

// Also remove axiosClient.ts if it's dead code or update it
replaceInFile('api/client/axiosClient.ts', "'../../services/api'", "'../client'");

