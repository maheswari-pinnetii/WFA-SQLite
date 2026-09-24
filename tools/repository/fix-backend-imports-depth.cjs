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

      // When moved from depth 2 to depth 3, `../` becomes `../../` for common directories
      const dirsToBump = ['database', 'config', 'utils', 'sockets', 'middleware', 'services', 'repositories', 'routes'];
      for (const d of dirsToBump) {
          const regex = new RegExp(`'\\.\\.\\/${d}\\/`, 'g');
          if (regex.test(content)) {
             content = content.replace(regex, `'../../${d}/`);
             changed = true;
          }
          const regex2 = new RegExp(`"\\.\\.\\/${d}\\/`, 'g');
          if (regex2.test(content)) {
             content = content.replace(regex2, `"../../${d}/`);
             changed = true;
          }
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

const rootDir = process.cwd();
processDirectory(path.join(rootDir, 'backend', 'src', 'modules'));
