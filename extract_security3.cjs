const fs = require('fs');
let code = fs.readFileSync('scratch_profile.tsx', 'utf8');
const imports = `import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { apiClient } from '../../../api/client';
import { Settings, Eye, EyeOff } from 'lucide-react';
`;

let startIdx = code.indexOf('const [mfaStatus');
let endIdx = code.indexOf('const fetchCalendarEvents');
let statesAndFuncs = code.substring(startIdx, endIdx);

let jsxStart = code.indexOf('{/* Tab 5: Security Settings */}');
let jsxEnd = code.indexOf('{/* Tab 6: Notifications */}');
let jsxStr = code.substring(jsxStart, jsxEnd);
jsxStr = jsxStr.replace("{activeTab === 'security' && (", "return (");
jsxStr = jsxStr.substring(0, jsxStr.lastIndexOf(')}')) + ');';

let finalCode = imports + '\nexport const SecurityTab: React.FC = () => {\n  const { user } = useAuth();\n' + statesAndFuncs + '\n  useEffect(() => {\n    fetchMfaStatus();\n    fetchTrustedDevices();\n  }, []);\n\n' + jsxStr + '\n};\n';

fs.writeFileSync('frontend/src/features/profile/components/SecurityTab.tsx', finalCode);
console.log('SecurityTab extracted correctly');
