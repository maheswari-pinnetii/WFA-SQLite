const fs = require('fs');
let content = fs.readFileSync('tests/unit/timesheet.service.test.ts', 'utf8');

content = content.replace(/vi\.mock\('@sqlitecloud\/drivers'[\s\S]*?\n\}\);\n/g, '');
content = content.replace(/vi\.mock\('\.\.\/\.\.\/backend\/src\/database\/sqlite-cloud'[\s\S]*?\n\}\);\n/g, '');
content = content.replace(/import \* as sqliteCloud from '\.\.\/\.\.\/backend\/src\/database\/sqlite-cloud\.ts';/g, 'import * as sqliteCloud from \'../../backend/src/database/sqlite-cloud.js\';');

const mockBlock = "vi.mock('../../backend/src/database/sqlite-cloud.js', () => ({\n  query: vi.fn(),\n  execute: vi.fn()\n}));\n";

content = content.replace(/import { describe, it, expect, vi, beforeEach } from 'vitest';/g, mockBlock + "\nimport { describe, it, expect, vi, beforeEach } from 'vitest';");

fs.writeFileSync('tests/unit/timesheet.service.test.ts', content);
console.log('Fixed test file mock');
