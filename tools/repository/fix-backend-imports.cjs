const fs = require('fs');
const path = require('path');

const moduleMap = {
  'auth': 'core',
  'authFlow': 'core',
  'biometric': 'core',
  'audit': 'core',
  'backup': 'core',
  'document': 'core',
  'compliance': 'core',
  'notification': 'core',
  'search': 'core',
  'workflow': 'core',
  'webhook': 'core',
  'email': 'core',
  'emailRetry': 'core',
  'push': 'core',
  'cache': 'core',
  'featureFlag': 'core',
  'jobScheduler': 'core',
  'ai': 'ai',
  'analytics': 'analytics',
  'report': 'analytics',
  'employee': 'users',
  'organization': 'users',
  'job-role': 'users',
  'employee-master': 'users',
  'employee-lifecycle': 'users',
  'performance': 'hr',
  'recruitment': 'hr',
  'workforce': 'hr',
  'assets-training': 'hr',
  'bulk-import': 'hr',
  'attendance': 'attendance',
  'attendance-phase2': 'attendance',
  'attendanceWorkflow': 'attendance',
  'timesheet': 'time-tracking',
  'shift': 'time-tracking',
  'scheduling': 'time-tracking',
  'leave': 'leave',
  'leave-engine': 'leave',
  'payroll': 'payroll',
  'payroll-engine': 'payroll',
  'payroll-pdf': 'payroll',
  'payroll.engine': 'payroll',
  'expense': 'payroll',
  'tax-calculation': 'payroll',
  'full-final-settlement': 'payroll',
  'nach-generator': 'payroll',
  'admin-dashboard': 'dashboards',
  'hr-dashboard': 'dashboards',
  'manager-dashboard': 'dashboards',
  'team-lead-dashboard': 'dashboards',
  'employee-dashboard': 'dashboards'
};

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx') || fullPath.endsWith('.js')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Replace /controllers/NAME.controller
      const controllerRegex = /(['"`])(.*?)controllers\/([^./'"]+)\.controller(\.js|\.ts)?(['"`])/g;
      content = content.replace(controllerRegex, (match, q1, prefix, name, ext, q2) => {
        const targetModule = moduleMap[name] || 'core';
        changed = true;
        return `${q1}${prefix}modules/${targetModule}/${name}.controller${ext || ''}${q2}`;
      });

      // Replace /services/NAME.service
      const serviceRegex = /(['"`])(.*?)services\/([^./'"]+)\.service(\.js|\.ts)?(['"`])/g;
      content = content.replace(serviceRegex, (match, q1, prefix, name, ext, q2) => {
        const targetModule = moduleMap[name] || 'core';
        changed = true;
        return `${q1}${prefix}modules/${targetModule}/${name}.service${ext || ''}${q2}`;
      });

      // Also handle /services/NAME (for things like /services/payroll.engine)
      const serviceRegex2 = /(['"`])(.*?)services\/([^./'"]+)\.engine(\.js|\.ts)?(['"`])/g;
      content = content.replace(serviceRegex2, (match, q1, prefix, name, ext, q2) => {
        const targetModule = moduleMap[name] || 'core';
        changed = true;
        return `${q1}${prefix}modules/${targetModule}/${name}.engine${ext || ''}${q2}`;
      });
      
      // Also handle /services/dashboards/NAME
      const dashboardServiceRegex = /(['"`])(.*?)services\/dashboards\/([^./'"]+)\.service(\.js|\.ts)?(['"`])/g;
      content = content.replace(dashboardServiceRegex, (match, q1, prefix, name, ext, q2) => {
        changed = true;
        return `${q1}${prefix}modules/dashboards/${name}.service${ext || ''}${q2}`;
      });

      if (changed) {
        fs.writeFileSync(fullPath, content);
        console.log('Updated imports in:', fullPath);
      }
    }
  }
}

console.log('Starting refactoring...');
const rootDir = process.cwd();
processDirectory(path.join(rootDir, 'backend', 'src'));
processDirectory(path.join(rootDir, 'tests'));
console.log('Finished refactoring imports.');
