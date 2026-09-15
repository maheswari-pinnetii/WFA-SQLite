const fs = require('fs');
let code = fs.readFileSync('scratch_profile.tsx', 'utf8');

const imports = `import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { apiClient } from '../../../../api/client';
import { Settings, Eye, EyeOff } from 'lucide-react';
`;

let statesRegex = /const \[mfaStatus, setMfaStatus\][\s\S]*?const \[loadingDevices, setLoadingDevices\] = useState\(false\);/;
let states = code.match(statesRegex)[0];

let funcsRegex = /const fetchTrustedDevices[\s\S]*?const handleRevokeDevice = async \(deviceId: string\) => {[\s\S]*?\n  };/;
let funcs = code.match(funcsRegex)[0];

let jsxStartStr = "        {/* Tab 5: Security Settings */}";
let jsxEndStr = "        {/* Tab 6: Notifications */}";
let jsxStart = code.indexOf(jsxStartStr);
let jsxEnd = code.indexOf(jsxEndStr);

let jsxStr = code.substring(jsxStart, jsxEnd);
jsxStr = jsxStr.replace(/{activeTab === 'security' && \(/, 'return (');
jsxStr = jsxStr.substring(0, jsxStr.lastIndexOf(')}')) + ');';

let finalCode = imports + '\nexport const SecurityTab: React.FC = () => {\n  const { user } = useAuth();\n' + states + '\n\n' + funcs + '\n\n  useEffect(() => {\n    fetchMfaStatus();\n    fetchTrustedDevices();\n  }, []);\n\n' + jsxStr + '\n};\n';

fs.writeFileSync('frontend/src/features/profile/components/SecurityTab.tsx', finalCode);
console.log('SecurityTab created successfully');
