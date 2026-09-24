const fs = require('fs');
const path = require('path');

const docsDir = path.join(__dirname, 'docs');

const mappings = {
  '01-project-overview.md': '01-project',
  '13-task-breakdown.md': '01-project',
  'ENTERPRISE_ROADMAP.md': '01-project',
  'MASTER_PRODUCT_BACKLOG.md': '01-project',
  'FINAL_IMPLEMENTATION_QUEUE.md': '01-project',
  'Project-Overview.md': '01-project',
  '15-project-memory.md': '00-governance',
  '02-product-requirements.md': '02-product',
  '12-feature-matrix.md': '02-product',
  'TRACEABILITY_MATRIX.md': '03-requirements',
  '04-design-system.md': '04-ux-design',
  'icon-system.md': '04-ux-design',
  '03-solution-architecture.md': '05-architecture',
  '06-backend-architecture.md': '05-architecture',
  '14-architecture-decisions.md': '05-architecture',
  '07-database-architecture.md': '06-data',
  '08-api-specification.md': '07-api',
  '05-development-rules.md': '08-engineering',
  'TECH_STACK.md': '08-engineering',
  'CODE-DOCUMENTATION-AUDIT.md': '08-engineering',
  'DOCUMENTATION-COMPLETENESS.md': '08-engineering',
  '09-rbac-security.md': '09-security',
  'SECURITY_TEST_RESULTS.md': '09-security',
  '10-testing-strategy.md': '10-testing',
  'END_TO_END_TEST_MATRIX.md': '10-testing',
  '11-deployment-operations.md': '11-devops',
  'PERFORMANCE_TEST_RESULTS.md': '12-observability',
  '16-production-readiness.md': '13-release',
  '17-changelog.md': '13-release',
  'PRODUCTION_READINESS_GATE.md': '13-release',
  'PRODUCTION_READINESS_REPORT.md': '13-release',
  'API_VERIFICATION_REPORT.md': '17-reports',
  'DATABASE_INTEGRITY_REPORT.md': '17-reports',
  'FINAL_PRODUCT_COMPLETENESS_REPORT.md': '17-reports',
  'FINAL_REPOSITORY_GAP_REGISTER.md': '17-reports',
  'CROSS_MODULE_GAP_MATRIX.md': '17-reports',
  'GOLDEN_DATASET_SPEC.md': '10-testing'
};

for (const [file, folder] of Object.entries(mappings)) {
  const oldPath = path.join(docsDir, file);
  const newPath = path.join(docsDir, folder, file);
  
  if (fs.existsSync(oldPath)) {
    if (!fs.existsSync(path.join(docsDir, folder))) {
      fs.mkdirSync(path.join(docsDir, folder), { recursive: true });
    }
    fs.renameSync(oldPath, newPath);
    console.log(`Moved ${file} -> ${folder}`);
  }
}
