import re

with open('frontend/src/features/employee/pages/EmployeeProfile.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

imports = """import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { apiClient } from '../../../../api/client';
import { Settings, Eye, EyeOff } from 'lucide-react';
"""

# Extract all state variables up to loadingDevices
states_match = re.search(r'const \[mfaStatus.*?const \[loadingDevices, setLoadingDevices\] = useState\(false\);', code, re.DOTALL)
states = states_match.group(0) if states_match else ""

# Extract functions up to handleRevokeDevice
funcs_match = re.search(r'const fetchTrustedDevices = async.*?const handleRevokeDevice = async.*?\} catch \(err\) \{.*?\}.*?\};', code, re.DOTALL)
funcs = funcs_match.group(0) if funcs_match else ""

# Extract JSX
jsx_start = code.find("{/* Tab 5: Security Settings */}")
jsx_end = code.find("{/* Tab 6: Notifications */}")
if jsx_start != -1 and jsx_end != -1:
    jsx_str = code[jsx_start:jsx_end]

    # Replace {activeTab === 'security' && ( with return (
    jsx_str = jsx_str.replace("{activeTab === 'security' && (", "return (")
    # Remove the trailing )}
    jsx_str = jsx_str[:jsx_str.rfind(")}")] + ");"

    final_code = imports + "\nexport const SecurityTab: React.FC = () => {\n  const { user } = useAuth();\n" + states + "\n\n" + funcs + "\n\n  useEffect(() => {\n    fetchMfaStatus();\n    fetchTrustedDevices();\n  }, []);\n\n" + jsx_str + "\n};\n"

    with open('frontend/src/features/profile/components/SecurityTab.tsx', 'w', encoding='utf-8') as f:
        f.write(final_code)
    print("SecurityTab extracted")
else:
    print("Could not find security tab boundaries.")
