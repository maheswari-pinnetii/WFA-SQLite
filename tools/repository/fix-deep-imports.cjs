const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const modulesDir = path.join(rootDir, 'backend', 'src', 'modules');
const backendSrcDir = path.join(rootDir, 'backend', 'src');

function fixDeepImports(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            fixDeepImports(fullPath);
        } else if (fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let changed = false;

            // Fix imports for core directories: database, config, utils, sockets, middleware, models
            const coreDirs = ['database', 'config', 'utils', 'sockets', 'middleware', 'models'];
            const regex = /from ['"](\.\.\/)+((?:database|config|utils|sockets|middleware|models)\/[^'"]+)['"]/g;
            
            content = content.replace(regex, (match, dotdots, targetPath) => {
                const targetFileAbs = path.join(backendSrcDir, targetPath);
                
                // compute relative path from fullPath to targetFileAbs
                let rel = path.relative(path.dirname(fullPath), targetFileAbs);
                rel = rel.replace(/\\/g, '/');
                if (!rel.startsWith('.')) rel = './' + rel;
                
                changed = true;
                return "from '" + rel + "'";
            });

            if (changed) {
                fs.writeFileSync(fullPath, content);
            }
        }
    }
}
fixDeepImports(modulesDir);
