const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROLES = [
  { name: 'ADMIN', dir: 'admin', home: '/admin/dashboard' },
  { name: 'HR', dir: 'hr', home: '/hr/dashboard' },
  { name: 'MANAGER', dir: 'manager', home: '/manager/dashboard' },
  { name: 'TEAM_LEAD', dir: 'team-lead', home: '/team-lead/dashboard' },
  { name: 'EMPLOYEE', dir: 'employee', home: '/employee/dashboard' }
];

const BASE_URL = 'http://localhost:3000';
const OUT_DIR = path.join(__dirname, '../test-results');

async function testDashboards() {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  
  let summary = '# Test Summary\n\n';

  for (const role of ROLES) {
    console.log(`\n=== Testing Role: ${role.name} ===`);
    summary += `## ${role.name}\n\n`;
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    // Inject mock session
    await page.goto(`${BASE_URL}/login`);
    await page.evaluate(({ roleName }) => {
      localStorage.setItem('auth_token', 'mock_token');
      localStorage.setItem('user_role', roleName);
      localStorage.setItem('wfa_initialized_role', roleName);
      localStorage.setItem('user_data', JSON.stringify({
         id: '1', name: `Mock ${roleName}`, role: roleName, permissions: []
      }));
    }, { roleName: role.name });

    // Intercept all API requests and mock successful responses so the frontend doesn't log out
    await page.route('**/api/v1/**', async route => {
      if (route.request().method() === 'OPTIONS') {
        return route.fulfill({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' } });
      }
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            metrics: {
              totalWorkforce: 150,
              attendanceRate: '98%',
              productivityVelocity: '95%',
              averagePerformanceScore: 92
            },
            teamProductivity: [],
            shifts: []
          }
        })
      });
    });

    // Navigate to home to populate sidebar
    await page.goto(`${BASE_URL}${role.home}`);
    await page.waitForTimeout(2000); // Wait for initial render
    
    // Extract all unique routes from AppRoutes.tsx for this role
    const appRoutesContent = fs.readFileSync(path.join(__dirname, '../frontend/src/app/routes/AppRoutes.tsx'), 'utf-8');
    const routeRegex = /<Route\s+path=["']([^"']+)["'][^>]*element={<RoleGuard[^>]*allowedRoles={\[[^\]]*Role\.([A-Z_]+)[^\]]*\]}/g;
    
    let links = [role.home];
    let match;
    while ((match = routeRegex.exec(appRoutesContent)) !== null) {
      const routePath = match[1];
      // Note: we can't perfectly extract all roles from the regex if there are multiple. 
      // But we can just use a simpler approach: finding all RoleGuard tags that contain Role.X
    }
    
    // Better Regex:
    const betterRegex = /<Route\s+path=["']([^"']+)["'][^>]*element={<RoleGuard[^>]*allowedRoles=\{([^}]+)\}/g;
    let betterMatch;
    while ((betterMatch = betterRegex.exec(appRoutesContent)) !== null) {
      const routePath = betterMatch[1];
      const allowedRoles = betterMatch[2];
      if (allowedRoles.includes(`Role.${role.name}`)) {
        let fullPath = routePath.startsWith('/') ? routePath : `/${routePath}`;
        if (!links.includes(fullPath) && !fullPath.includes(':')) {
           links.push(fullPath);
        }
      }
    }
    
    console.log(`Found ${links.length} pages to test for ${role.name}: ${links.join(', ')}`);
    
    for (let i = 0; i < links.length; i++) {
      const route = links[i];
      const pageName = route === '/' ? 'root' : route.replace(/\//g, '_').replace(/^_/, '');
      console.log(`  -> Testing ${route} ...`);
      
      let pageErrors = [];
      let consoleErrors = [];
      
      page.on('pageerror', err => {
        pageErrors.push(err.message);
      });
      
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      await page.goto(`${BASE_URL}${route}`, { waitUntil: 'networkidle', timeout: 15000 }).catch(e => pageErrors.push(e.message));
      await page.waitForTimeout(1000); // allow animations
      
      // Check for Error Boundaries
      const hasErrorBoundary = await page.evaluate(() => {
        return document.body.innerHTML.includes('Dashboard Error') || 
               document.body.innerHTML.includes('We encountered an unexpected error');
      });
      
      if (hasErrorBoundary) {
        pageErrors.push('React Error Boundary Triggered');
      }
      
      const screenshotPath = path.join(OUT_DIR, role.dir, `${pageName}.png`);
      await page.screenshot({ path: screenshotPath, fullPage: true });
      
      const status = pageErrors.length === 0 ? '✅ PASS' : '❌ FAIL';
      let reportStr = `### Route: ${route}\n**Status**: ${status}\n\n`;
      if (pageErrors.length > 0) reportStr += `**Page Errors:**\n- ${pageErrors.join('\n- ')}\n\n`;
      if (consoleErrors.length > 0) reportStr += `**Console Errors:**\n- ${consoleErrors.join('\n- ')}\n\n`;
      
      const reportPath = path.join(OUT_DIR, role.dir, `${pageName}.md`);
      fs.writeFileSync(reportPath, reportStr);
      
      summary += `- [${route}](./${role.dir}/${pageName}.md): ${status}\n`;
      
      // Remove listeners for next iteration
      page.removeAllListeners('pageerror');
      page.removeAllListeners('console');
    }
    
    summary += '\n';
    await context.close();
  }

  fs.writeFileSync(path.join(OUT_DIR, 'summary.md'), summary);
  console.log('Testing complete. Summary written to test-results/summary.md');
  await browser.close();
}

testDashboards().catch(console.error);
