export enum Role {
  ADMIN = 'ADMIN',
  HR = 'HR',
  EXECUTIVE = 'EXECUTIVE',
  MANAGER = 'MANAGER',
  TEAM_LEAD = 'TEAM_LEAD',
  EMPLOYEE = 'EMPLOYEE'
}

export const ROLE_LABELS: Record<Role, string> = {
  [Role.ADMIN]: 'System Administrator',
  [Role.HR]: 'HR Operations Manager',
  [Role.EXECUTIVE]: 'Executive Sponsor',
  [Role.MANAGER]: 'Department Manager',
  [Role.TEAM_LEAD]: 'Team Lead (TL)',
  [Role.EMPLOYEE]: 'Employee Self Service',
};

export const ROLE_HOME_PATHS: Record<Role, string> = {
  [Role.ADMIN]: '/admin/dashboard',
  [Role.HR]: '/hr/dashboard',
  [Role.EXECUTIVE]: '/executive/dashboard',
  [Role.MANAGER]: '/manager/dashboard',
  [Role.TEAM_LEAD]: '/team-lead/dashboard',
  [Role.EMPLOYEE]: '/employee/dashboard',
};

export const ROLE_LEVELS: Record<Role, number> = {
  [Role.ADMIN]: 0,
  [Role.EXECUTIVE]: 1,
  [Role.HR]: 2,
  [Role.MANAGER]: 3,
  [Role.TEAM_LEAD]: 4,
  [Role.EMPLOYEE]: 5,
};

export const ROLE_CATEGORIES: Record<Role, 'System' | 'Executive' | 'HR' | 'Management' | 'Operational'> = {
  [Role.ADMIN]: 'System',
  [Role.EXECUTIVE]: 'Executive',
  [Role.HR]: 'HR',
  [Role.MANAGER]: 'Management',
  [Role.TEAM_LEAD]: 'Operational',
  [Role.EMPLOYEE]: 'Operational',
};
