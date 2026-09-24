const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (file !== 'node_modules') {
        processDirectory(fullPath);
      }
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Replace paths for dashboards
      // Example: from '../../features/admin/dashboard' -> from '../../features/dashboards/admin'
      const dashRegex = /(['"])(.*?)\/?features\/(admin|employee|hr|team-lead|team-manager)\/dashboard(.*?)?(['"])/g;
      content = content.replace(dashRegex, (match, q1, prefix, role, suffix, q2) => {
        let roleMapped = role === 'team-manager' ? 'manager' : role;
        changed = true;
        let suffixStr = suffix || '';
        if (suffixStr.startsWith('/')) suffixStr = suffixStr; // preserve
        return `${q1}${prefix ? prefix + '/' : ''}features/dashboards/${roleMapped}${suffixStr}${q2}`;
      });

      // Replace paths for auth
      // Example: from '../../auth/hooks/useAuth' -> from '../../features/auth/hooks/useAuth'
      // Only do this if it's explicitly matching the old structure, e.g. /auth/
      // Need to avoid matching import from '@supabase/auth-helpers' etc.
      // So match ../auth or ../../auth or ./auth
      const authRegex = /(['"])(\.\.?\/(?:\.\.\/)*)auth\/(.*?)(['"])/g;
      content = content.replace(authRegex, (match, q1, prefix, suffix, q2) => {
        changed = true;
        return `${q1}${prefix}features/auth/${suffix}${q2}`;
      });

      // Also replace security/ to features/auth/security/
      const securityRegex = /(['"])(\.\.?\/(?:\.\.\/)*)security\/(.*?)(['"])/g;
      content = content.replace(securityRegex, (match, q1, prefix, suffix, q2) => {
        changed = true;
        return `${q1}${prefix}features/auth/security/${suffix}${q2}`;
      });

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated imports in:', fullPath);
      }
    }
  }
}

console.log('Starting frontend refactoring...');
const rootDir = process.cwd();
processDirectory(path.join(rootDir, 'frontend', 'src'));
console.log('Finished frontend refactoring.');
