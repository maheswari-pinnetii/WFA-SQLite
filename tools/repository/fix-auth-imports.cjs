const fs = require('fs');
const path = require('path');

function processDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) return;
  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Fix AuthProvider.tsx, etc.
      // from '../security/' to './security/'
      if (fullPath.endsWith('AuthProvider.tsx') || fullPath.endsWith('PermissionGuard.tsx') || fullPath.endsWith('ProtectedRoute.tsx') || fullPath.endsWith('RoleGuard.tsx')) {
         content = content.replace(/from '\.\.\/security\//g, "from './security/");
         changed = true;
      }
      
      // Fix EmailLoginCard, PasswordlessLoginCard
      // from '../../types/authFlow.types' to '../types/authFlow.types'
      if (fullPath.endsWith('EmailLoginCard.tsx') || fullPath.endsWith('PasswordlessLoginCard.tsx') || fullPath.endsWith('LoginPage.tsx') || fullPath.endsWith('SignUpPage.tsx')) {
         content = content.replace(/from '\.\.\/\.\.\/types\/authFlow\.types'/g, "from '../types/authFlow.types'");
         content = content.replace(/from '\.\.\/\.\.\/security\//g, "from '../security/");
         changed = true;
      }

      // Fix LogoutModal, LogoutPage
      if (fullPath.endsWith('LogoutModal.tsx') || fullPath.endsWith('LogoutPage.tsx')) {
         content = content.replace(/from '\.\.\/\.\.\/components\/common\/StacklyLogo'/g, "from '../../../components/common/StacklyLogo'");
         changed = true;
      }

      // Fix LoginPage, SignUpPage ThemeProvider
      if (fullPath.endsWith('LoginPage.tsx') || fullPath.endsWith('SignUpPage.tsx')) {
         content = content.replace(/from '\.\.\/\.\.\/design-system\//g, "from '../../../design-system/");
         changed = true;
      }

      // Fix auth.service.ts
      if (fullPath.endsWith('auth.service.ts')) {
         content = content.replace(/from '\.\.\/\.\.\/api\//g, "from '../../../api/");
         content = content.replace(/from '\.\.\/\.\.\/shared\//g, "from '../../../shared/");
         content = content.replace(/from '\.\.\/\.\.\/security\//g, "from '../security/");
         changed = true;
      }

      // Fix authSlice.ts
      if (fullPath.endsWith('authSlice.ts')) {
         content = content.replace(/from '\.\.\/\.\.\/security\//g, "from '../security/");
         content = content.replace(/from '\.\.\/\.\.\/api\//g, "from '../../../api/");
         changed = true;
      }

      // Fix auth.types.ts
      if (fullPath.endsWith('auth.types.ts')) {
         content = content.replace(/from '\.\.\/\.\.\/security\//g, "from '../security/");
         changed = true;
      }
      
      // Fix guards (PermissionGuard, RoleGuard)
      if (fullPath.includes('guards')) {
         content = content.replace(/from '\.\.\/\.\.\/shared\/hooks\/usePermission'/g, "from '../../../../shared/hooks/usePermission'");
         content = content.replace(/from '\.\.\/\.\.\/features\/auth\/hooks\/useAuth'/g, "from '../../hooks/useAuth'");
         changed = true;
      }

      // Fix AppRoutes.tsx future prop
      if (fullPath.endsWith('AppProvider.tsx')) {
         content = content.replace(/<BrowserRouter future=\{\{ v7_startTransition: true, v7_relativeSplatPath: true \}\}>/g, "<BrowserRouter>");
         changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content);
      }
    }
  }
}

const rootDir = process.cwd();
processDirectory(path.join(rootDir, 'frontend', 'src', 'features', 'auth'));
processDirectory(path.join(rootDir, 'frontend', 'src', 'app', 'providers'));
