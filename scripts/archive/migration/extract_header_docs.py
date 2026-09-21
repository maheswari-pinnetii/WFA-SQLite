import re

with open('frontend/src/features/employee/pages/EmployeeProfile.tsx', 'r', encoding='utf-8') as f:
    code = f.read()

# 1. ProfileHeader
header_imports = """import React from 'react';
import { useAuth } from '../../../../auth/hooks/useAuth';
import { getRoleBadgeClass } from '../../../../shared/utils/helpers';
import { LogOut as LogOutIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Role } from '../../../../security/roles/roles';
"""
header_jsx_start = code.find("{/* Header Banner */}")
header_jsx_end = code.find("{/* Tab 1: Overview */}")
# Wait, ProfileHeader shouldn't include the tabs menu.
header_jsx_end = code.find("{/* Tab Navigation */}")

if header_jsx_start != -1 and header_jsx_end != -1:
    header_jsx = code[header_jsx_start:header_jsx_end]
    header_code = header_imports + "\nexport const ProfileHeader: React.FC = () => {\n  const { user, logout } = useAuth();\n  const navigate = useNavigate();\n  const handleLogout = () => navigate('/logout');\n\n  return (\n    <>\n      " + header_jsx.replace("onClick={logout}", "onClick={handleLogout}") + "    </>\n  );\n};\n"
    with open('frontend/src/features/profile/components/ProfileHeader.tsx', 'w', encoding='utf-8') as f:
        f.write(header_code)

# 2. DocumentsTab
doc_jsx_start = code.find("{/* Tab 4: Documents */}")
doc_jsx_end = code.find("{/* Tab 5: Security Settings */}")
if doc_jsx_start != -1 and doc_jsx_end != -1:
    doc_jsx = code[doc_jsx_start:doc_jsx_end]
    doc_jsx = doc_jsx.replace("{activeTab === 'documents' && (", "return (")
    doc_jsx = doc_jsx[:doc_jsx.rfind(")}")] + ");"
    doc_code = "import React from 'react';\nimport { FileText, Download } from 'lucide-react';\n\nexport const DocumentsTab: React.FC = () => {\n" + doc_jsx + "\n};\n"
    with open('frontend/src/features/profile/components/DocumentsTab.tsx', 'w', encoding='utf-8') as f:
        f.write(doc_code)

print("Extraction script generated components.")
