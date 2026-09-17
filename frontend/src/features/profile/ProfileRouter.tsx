import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../auth/hooks/useAuth';
import { Role } from '../../security/roles/roles';

// Import the specific profile pages
import { AdminProfile } from '../admin/pages/AdminProfile';
import { HrProfile } from '../hr/pages/HrProfile';
import { ManagerProfile } from '../team-manager/pages/ManagerProfile';
import { TeamLeadProfile } from '../team-lead/pages/TeamLeadProfile';
import { EmployeeProfile } from '../employee/pages/EmployeeProfile';

export const ProfileRouter: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  switch (user.role) {
    case Role.ADMIN:
      return <AdminProfile />;
    case Role.HR:
      return <HrProfile />;
    case Role.MANAGER:
      return <ManagerProfile />;
    case Role.TEAM_LEAD:
      return <TeamLeadProfile />;
    case Role.EMPLOYEE:
    default:
      return <EmployeeProfile />;
  }
};
