const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Fix imports like ../modules/<domain>/... to point to sibling or parent sibling
      const regex = /from ['"]\.\.\/modules\/([^/]+)\/([^'"]+)['"]/g;
      
      content = content.replace(regex, (match, domain, filename) => {
          changed = true;
          // Determine the domain of the CURRENT file
          const parts = fullPath.split(/\\|\//); // Handle Windows and Unix separators
          const modulesIndex = parts.indexOf('modules');
          const currentDomain = parts[modulesIndex + 1];

          if (currentDomain === domain) {
              return `from './${filename}'`;
          } else {
              return `from '../${domain}/${filename}'`;
          }
      });

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

const rootDir = process.cwd();
processDirectory(path.join(rootDir, 'backend', 'src', 'modules'));
