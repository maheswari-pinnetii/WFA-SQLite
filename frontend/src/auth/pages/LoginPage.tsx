import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ROLE_HOME_PATHS } from '../../security/roles/roles';
import AuthLayout from '../../components/auth/AuthLayout';
import LoginForm from '../../components/auth/LoginForm';
import { RoleType } from '../../theme/roles';

export const LoginPage: React.FC = () => {
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<RoleType>('EMPLOYEE');

  useEffect(() => {
    if (isAuthenticated) {
      const homePath = ROLE_HOME_PATHS[role] || '/employee/dashboard';
      navigate(homePath, { replace: true });
    }
  }, [isAuthenticated, role, navigate]);

  return (
    <AuthLayout selectedRole={selectedRole} isWide={true}>
      <LoginForm
        selectedRole={selectedRole}
        onRoleChange={setSelectedRole}
        onSuccess={() => {
          const target = ROLE_HOME_PATHS[role] || (selectedRole === 'ADMIN' ? '/admin/dashboard' : selectedRole === 'HR' ? '/hr/dashboard' : selectedRole === 'MANAGER' ? '/manager/dashboard' : selectedRole === 'TEAM_LEAD' ? '/team-lead/dashboard' : '/employee/dashboard');
          navigate(target, { replace: true });
        }}
      />
      <div className="text-center text-sm font-medium text-slate-400 mt-6">
        Don't have an account?{' '}
        <Link to="/signup" className="text-blue-400 font-semibold hover:underline">
          Create account
        </Link>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
