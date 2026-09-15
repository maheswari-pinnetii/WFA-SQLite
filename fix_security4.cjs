const fs = require('fs');
let code = fs.readFileSync('scratch_utf8.tsx', 'utf8');
let start = code.indexOf('const [mfaStatus');
let end = code.indexOf('return (');
if (start > -1 && end > -1) {
    let statesAndFuncs = code.substring(start, end);
    const imports = `import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../auth/hooks/useAuth';
import { apiClient } from '../../../api/client';
import { Settings, Eye, EyeOff, Shield, ShieldCheck, AlertTriangle } from 'lucide-react';
`;
    let jsxStart = code.indexOf('{/* Tab 5: Security Settings */}');
    let jsxEnd = code.indexOf('{/* Tab 6: Notifications */}');
    let jsxStr = code.substring(jsxStart, jsxEnd);
    
    // Replace the opening block "{activeTab === 'security' && ("
    // We will just find the first "(" after "&&"
    let braceIndex = jsxStr.indexOf('&& (');
    if (braceIndex > -1) {
        jsxStr = 'return (\n' + jsxStr.substring(braceIndex + 4);
    }
    
    // Now we must replace the ending ")}" with ");"
    // Since we cut before Tab 6, the very last characters should be ")}"
    jsxStr = jsxStr.trim();
    if (jsxStr.endsWith(')}')) {
        jsxStr = jsxStr.substring(0, jsxStr.length - 2) + ');';
    } else if (jsxStr.endsWith(') }')) {
        jsxStr = jsxStr.substring(0, jsxStr.length - 3) + ');';
    } else {
        // Fallback: just append );
        jsxStr += '\n);';
    }

    let finalCode = imports + '\nexport const SecurityTab: React.FC = () => {\n  const { user } = useAuth();\n' + statesAndFuncs + '\n  useEffect(() => {\n    fetchMfaStatus();\n    fetchTrustedDevices();\n  }, []);\n\n' + jsxStr + '\n};\n';
    fs.writeFileSync('frontend/src/features/profile/components/SecurityTab.tsx', finalCode);
    console.log('Fixed SecurityTab perfectly');
}
