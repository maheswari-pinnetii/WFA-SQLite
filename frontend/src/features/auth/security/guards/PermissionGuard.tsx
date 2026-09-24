import React from 'react';
import { Permission } from '../permissions/permissions';
import { usePermission } from '../../../../shared/hooks/usePermission';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  requiredPermission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredPermission,
  fallback,
  children,
}) => {
  const { hasPermission } = usePermission();
  const allowed = hasPermission(requiredPermission);
  const reason = `Your active security scope does not permit '${requiredPermission}'.`;

  if (!allowed) {
    if (fallback) return <>{fallback}</>;
    return null;
  }

  return <>{children}</>;
};
