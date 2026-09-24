const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const modulesDir = path.join(rootDir, 'backend', 'src', 'modules');

// 1. Build a map of filename -> domain
const fileDomainMap = {};
function scanModules(dir, domain) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanModules(fullPath, domain || file);
        } else if (fullPath.endsWith('.ts')) {
            const basename = path.basename(fullPath).replace('.ts', '.js'); // for imports
            if (domain) {
                fileDomainMap[basename] = domain;
            }
        }
    }
}
scanModules(modulesDir, null);

// 2. Process files to fix imports
function fixImports(dir, currentDomain) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixImports(fullPath, currentDomain || file);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Find all imports that use ../../repositories/ or ../../services/ or ../../modules/
            const regex = /from ['"](?:\.\.\/)+((?:repositories|services|modules|core\/ai)\/[^'"]+)['"]/g;
            content = content.replace(regex, (match, importPath) => {
                const parts = importPath.split('/');
                const filename = parts[parts.length - 1]; // e.g. attendance.repository.js
                
                const targetDomain = fileDomainMap[filename];
                if (targetDomain) {
                    changed = true;
                    if (targetDomain === currentDomain) {
                        return `from './${filename}'`;
                    } else {
                        return `from '../${targetDomain}/${filename}'`;
                    }
                }
                
                // Fallback: try to see if it's already in the same domain
                return match; 
            });

            // Specific fixes for imports starting with ./ai/... since ai was moved to core? 
            const aiRegex = /from ['"]\.\/ai\/aiService\.js['"]/g;
            if (aiRegex.test(content) && !fs.existsSync(path.join(path.dirname(fullPath), 'ai'))) {
                 // point to core if aiService is in core
                 if (fileDomainMap['aiService.js'] === 'core') {
                     content = content.replace(aiRegex, `"../core/aiService.js"`);
                     changed = true;
                 }
            }
            
            // fix notification.service if moved
            const notifRegex = /from ['"]\.\/notification\.service\.js['"]/g;
            if (notifRegex.test(content) && fileDomainMap['notification.service.js']) {
                 const tDomain = fileDomainMap['notification.service.js'];
                 if (tDomain !== currentDomain) {
                     content = content.replace(notifRegex, `"../${tDomain}/notification.service.js"`);
                     changed = true;
                 }
            }


            if (changed) {
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}
fixImports(modulesDir, null);
