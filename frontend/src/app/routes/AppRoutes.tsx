import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '../../security/guards/ProtectedRoute';
import { RoleGuard } from '../../security/guards/RoleGuard';
import { GuestGuard } from '../../security/guards/GuestGuard';
import { MainLayout } from '../../shared/layouts/MainLayout';
import { LoginPage } from '../../auth/pages/LoginPage';

import { SignUpPage } from '../../auth/pages/SignUpPage';
import { LogoutPage } from '../../auth/pages/LogoutPage';
import { SsoCallbackPage } from '../../auth/pages/SsoCallbackPage';
import { ForgotPasswordPage } from '../../auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../../auth/pages/ResetPasswordPage';
import { VerifyEmailPage } from '../../auth/pages/VerifyEmailPage';
import { ChangePasswordPage } from '../../auth/pages/ChangePasswordPage';
import { Role, ROLE_HOME_PATHS } from '../../security/roles/roles';
import { useAuth } from '../../auth/hooks/useAuth';

const ALL_ROLES = [Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD, Role.EMPLOYEE];

// Admin Dashboards & Pages
import { AdminDashboardPage as AdminDashboard } from '../../features/admin/dashboard/AdminDashboardPage';
import { UserManagement } from '../../features/admin/pages/UserManagement';
import { RoleManagement } from '../../features/admin/pages/RoleManagement';
import { PermissionsManagement } from '../../features/admin/pages/PermissionsManagement';
import { DepartmentsManagement } from '../../features/admin/pages/DepartmentsManagement';
import { LocationsManagement } from '../../features/admin/pages/LocationsManagement';
import { AuditLogsPage } from '../../features/admin/pages/AuditLogsPage';
import { SystemSettings } from '../../features/admin/pages/SystemSettings';
import { SystemConfiguration } from '../../features/admin/pages/SystemConfiguration';
import { SecurityAdminDashboard } from '../../features/admin/pages/SecurityAdminDashboard';

// HR Dashboards & Pages
import { HrDashboardPage as HRDashboard } from '../../features/hr/dashboard/HrDashboardPage';
import { EmployeeManagement } from '../../features/hr/pages/EmployeeManagement';
import { EmployeeProfilePage } from '../../features/hr/pages/EmployeeProfilePage';
import { AttendanceManagement } from '../../features/hr/pages/AttendanceManagement';
import { RecruitmentManagement } from '../../features/hr/pages/RecruitmentManagement';
import { LeaveManagement } from '../../features/hr/pages/LeaveManagement';
import { PayrollReports } from '../../features/hr/pages/PayrollReports';
import { HRReports } from '../../features/hr/pages/HRReports';

// Manager Dashboards & Pages
import { ManagerDashboardPage as ManagerDashboard } from '../../features/team-manager/dashboard/ManagerDashboardPage';
import { TeamAnalytics } from '../../features/team-manager/pages/TeamAnalytics';
import { TeamReports } from '../../features/team-manager/pages/TeamReports';
import { ApprovalsPage } from '../../features/team-manager/pages/ApprovalsPage';
import { DeptHeadDashboard } from '../../features/team-manager/pages/DeptHeadDashboard';
import { ManagerTeamPage } from '../../features/team-manager/pages/ManagerTeamPage';
import { ManagerSprintsPage } from '../../features/team-manager/pages/ManagerSprintsPage';
import { ManagerTasksPage } from '../../features/team-manager/pages/ManagerTasksPage';

// Team Lead Dashboards & Pages
import { TeamLeadDashboardPage as TeamLeadDashboard } from '../../features/team-lead/dashboard/TeamLeadDashboardPage';
import { TeamMembersPage } from '../../features/team-lead/pages/TeamMembersPage';
import { TaskTrackingPage } from '../../features/team-lead/pages/TaskTrackingPage';
import { Productivity } from '../../features/team-lead/pages/Productivity';
import { FeedbackManagement } from '../../features/team-lead/pages/FeedbackManagement';
import { TeamLeadSprintsPage } from '../../features/team-lead/pages/TeamLeadSprintsPage';

// Employee Dashboards & Pages
import { EmployeeDashboard } from '../../features/employee/dashboard/EmployeeDashboard';
import { ProfileRouter as Profile } from '../../features/profile/ProfileRouter';
import { MyAttendance } from '../../features/employee/pages/MyAttendance';
import { MyPerformance } from '../../features/employee/pages/MyPerformance';
import { EmployeeRequestsPage } from '../../features/employee/pages/EmployeeRequestsPage';
import { AbsenceManagementPage } from '../../features/employee/pages/AbsenceManagementPage';
import { MyGoalsPage } from '../../features/employee/pages/MyGoalsPage';
import { PayslipsPage } from '../../features/employee/pages/PayslipsPage';
import { PublicHolidaysPage } from '../../features/employee/pages/PublicHolidaysPage';
import { MyExpensesPage } from '../../features/employee/pages/MyExpensesPage';
import { EmployeeWorkPage } from '../../features/employee/pages/EmployeeWorkPage';

// Error Pages
import { NotFoundPage, AccessDeniedPage, ServerErrorPage } from '../../features/error';
import { Unauthorized } from '../../pages/Unauthorized';

// Newly Created Dashboard Subpage Components
import { ProductivityAnalyticsPage } from '../../features/analytics/pages/ProductivityAnalyticsPage';
import { RiskAnalyticsPage } from '../../features/analytics/pages/RiskAnalyticsPage';
import { SkillsAnalyticsPage } from '../../features/analytics/pages/SkillsAnalyticsPage';
import { PerformanceAnalyticsPage } from '../../features/analytics/pages/PerformanceAnalyticsPage';
import { PerformanceOverviewPage } from '../../features/analytics/pages/PerformanceOverviewPage';
import { OrgOverviewPage } from '../../features/admin/pages/OrgOverviewPage';
import { TeamsPage } from '../../features/admin/pages/TeamsPage';
import { OrganizationPage } from '../../features/admin/pages/OrganizationPage';
import { AccessControlPage } from '../../features/admin/pages/AccessControlPage';
import { GeofencingPage } from '../../features/admin/pages/GeofencingPage';
import { AttendanceHistoryPage } from '../../features/hr/pages/AttendanceHistoryPage';
import { ShiftsPage } from '../../features/hr/pages/ShiftsPage';
import { AttendanceCorrectionsPage } from '../../features/hr/pages/AttendanceCorrectionsPage';
import { SkillOverviewPage } from '../../features/analytics/pages/SkillOverviewPage';
import { SkillGapsPage } from '../../features/analytics/pages/SkillGapsPage';
import { SkillCoveragePage } from '../../features/analytics/pages/SkillCoveragePage';
import { LandingPage } from '../../pages/LandingPage';
import { AttendanceOverviewPage } from '../../features/hr/pages/AttendanceOverviewPage';
import { MonthlyAttendancePage } from '../../features/hr/pages/MonthlyAttendancePage';
import { ShiftManagementPage } from '../../features/hr/pages/ShiftManagementPage';
import { LeavePoliciesPage } from '../../features/hr/pages/LeavePoliciesPage';
import PayrollDashboard from './payroll/PayrollDashboard';
import MyPayslips from './payroll/MyPayslips';
import { PayrollRunDetailsPage } from './payroll/PayrollRunDetailsPage';
import { PayrollRegisterPage } from './payroll/PayrollRegisterPage';
import { CtcCalculatorPage } from '../../features/hr/pages/CtcCalculatorPage';
import { SalaryRevisionHistoryPage } from '../../features/hr/pages/SalaryRevisionHistoryPage';
import { DepartmentPayrollPage } from '../../features/hr/pages/DepartmentPayrollPage';
import { TaxDeclarationsPage } from '../../features/employee/pages/TaxDeclarationsPage';
import { EmployeePayrollProfilePage } from '../../features/employee/pages/EmployeePayrollProfilePage';
import { AssetManagementPage } from '../../features/hr/pages/AssetManagementPage';
import { FullFinalSettlementPage } from '../../features/hr/pages/FullFinalSettlementPage';
import { SalaryStructuresPage } from '../../features/hr/pages/SalaryStructuresPage';
import { StatutoryCompliancePage } from '../../features/hr/pages/StatutoryCompliancePage';
import { HeadcountAnalyticsPage } from '../../features/analytics/pages/HeadcountAnalyticsPage';
import { AttritionAnalyticsPage } from '../../features/analytics/pages/AttritionAnalyticsPage';


const DefaultHomeRedirect: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  const target = ROLE_HOME_PATHS[role] || '/employee/dashboard';
  return <Navigate to={target} replace />;
};

export const AppRoutes: React.FC = () => {
  const { initializeAuth, isLoading } = useAuth();

  React.useEffect(() => {
    initializeAuth();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-primary)] text-[var(--text-muted)] gap-3 font-sans">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="text-sm tracking-wide">Initializing secure workspace...</div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Default Root & Dashboard Redirects */}
      <Route path="/" element={<DefaultHomeRedirect />} />
      <Route path="/landing" element={<DefaultHomeRedirect />} />
      <Route path="/dashboard" element={<DefaultHomeRedirect />} />

      {/* Public Auth Routes */}
      <Route path="/login" element={<GuestGuard><LoginPage /></GuestGuard>} />
      <Route path="/sso-callback" element={<GuestGuard><SsoCallbackPage /></GuestGuard>} />
      <Route path="/signup" element={<GuestGuard><SignUpPage /></GuestGuard>} />
      <Route path="/logout" element={<LogoutPage />} />
      <Route path="/forgot-password" element={<GuestGuard><ForgotPasswordPage /></GuestGuard>} />
      <Route path="/reset-password" element={<GuestGuard><ResetPasswordPage /></GuestGuard>} />
      <Route path="/verify-email" element={<GuestGuard><VerifyEmailPage /></GuestGuard>} />
      {/* Protected Routes Enclosed in Enterprise MainLayout */}
      <Route
        path="/*"
        element={
          <ProtectedRoute>
            <MainLayout>
              <Routes>
                {/* ========== Account Security Routes (all authenticated roles) ========== */}
                <Route path="/change-password" element={<ChangePasswordPage />} />

                {/* ==================== 1. ADMIN ROUTES ==================== */}
                <Route path="/admin/dashboard" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AdminDashboard /></RoleGuard>} />
                <Route path="/admin/users" element={<RoleGuard allowedRoles={[Role.ADMIN]}><UserManagement /></RoleGuard>} />
                <Route path="/admin/roles" element={<RoleGuard allowedRoles={[Role.ADMIN]}><RoleManagement /></RoleGuard>} />
                <Route path="/admin/permissions" element={<RoleGuard allowedRoles={[Role.ADMIN]}><PermissionsManagement /></RoleGuard>} />
                <Route path="/admin/employees" element={<RoleGuard allowedRoles={[Role.ADMIN]}><EmployeeManagement /></RoleGuard>} />
                <Route path="/admin/departments" element={<RoleGuard allowedRoles={[Role.ADMIN]}><DepartmentsManagement /></RoleGuard>} />
                <Route path="/admin/locations" element={<RoleGuard allowedRoles={[Role.ADMIN]}><LocationsManagement /></RoleGuard>} />
                <Route path="/admin/analytics" element={<RoleGuard allowedRoles={[Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/admin/reports" element={<RoleGuard allowedRoles={[Role.ADMIN]}><HRReports /></RoleGuard>} />
                <Route path="/admin/audit-logs" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AuditLogsPage /></RoleGuard>} />
                <Route path="/admin/settings" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SystemSettings /></RoleGuard>} />
                <Route path="/admin/configuration" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SystemConfiguration /></RoleGuard>} />
                
                {/* Admin Analytics & Subsections */}
                <Route path="/admin/skills-overview" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SkillOverviewPage /></RoleGuard>} />
                <Route path="/admin/skills-gaps" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SkillGapsPage /></RoleGuard>} />
                <Route path="/admin/skills-coverage" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SkillCoveragePage /></RoleGuard>} />
                <Route path="/admin/performance-overview" element={<RoleGuard allowedRoles={[Role.ADMIN]}><PerformanceOverviewPage /></RoleGuard>} />
                <Route path="/admin/productivity-metrics" element={<RoleGuard allowedRoles={[Role.ADMIN]}><ProductivityAnalyticsPage /></RoleGuard>} />
                <Route path="/admin/access-control" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AccessControlPage /></RoleGuard>} />
                <Route path="/admin/geofencing" element={<RoleGuard allowedRoles={[Role.ADMIN]}><GeofencingPage /></RoleGuard>} />
                
                {/* Additional Admin Roster & Oversight Pages */}
                <Route path="/admin/productivity" element={<RoleGuard allowedRoles={[Role.ADMIN]}><ProductivityAnalyticsPage /></RoleGuard>} />
                <Route path="/admin/risk" element={<RoleGuard allowedRoles={[Role.ADMIN]}><RiskAnalyticsPage /></RoleGuard>} />
                <Route path="/admin/skills-analytics" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SkillsAnalyticsPage /></RoleGuard>} />
                <Route path="/admin/teams" element={<RoleGuard allowedRoles={[Role.ADMIN]}><TeamsPage /></RoleGuard>} />
                <Route path="/admin/organization" element={<RoleGuard allowedRoles={[Role.ADMIN]}><OrganizationPage /></RoleGuard>} />
                <Route path="/admin/attendance-overview" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AttendanceOverviewPage /></RoleGuard>} />
                <Route path="/admin/attendance-history" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AttendanceHistoryPage /></RoleGuard>} />
                <Route path="/admin/shifts" element={<RoleGuard allowedRoles={[Role.ADMIN]}><ShiftManagementPage /></RoleGuard>} />
                <Route path="/admin/corrections" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/admin/approvals" element={<RoleGuard allowedRoles={[Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />

                {/* ==================== 2. HR ROUTES ==================== */}
                <Route path="/hr/dashboard" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><HRDashboard /></RoleGuard>} />
                <Route path="/hr/employees" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><EmployeeManagement /></RoleGuard>} />
                <Route path="/hr/employees/:id" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD, Role.EMPLOYEE]}><EmployeeProfilePage /></RoleGuard>} />
                <Route path="/hr/recruitment" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><RecruitmentManagement /></RoleGuard>} />
                <Route path="/hr/attendance" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/hr/leave" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><LeaveManagement /></RoleGuard>} />
                <Route path="/hr/leaves" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><LeaveManagement /></RoleGuard>} />
                <Route path="/leaves" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD, Role.EMPLOYEE]}><AbsenceManagementPage /></RoleGuard>} />
                <Route path="/leave" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN, Role.MANAGER, Role.TEAM_LEAD, Role.EMPLOYEE]}><AbsenceManagementPage /></RoleGuard>} />
                <Route path="/admin/leaves" element={<RoleGuard allowedRoles={[Role.ADMIN]}><LeaveManagement /></RoleGuard>} />
                <Route path="/manager/leaves" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />
                <Route path="/employee/leaves" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><AbsenceManagementPage /></RoleGuard>} />
                <Route path="/hr/performance" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><PerformanceAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/payroll-reports" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><PayrollReports /></RoleGuard>} />
                <Route path="/hr/payroll" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><PayrollReports /></RoleGuard>} />
                <Route path="/admin/payroll" element={<RoleGuard allowedRoles={[Role.ADMIN]}><PayrollReports /></RoleGuard>} />
                <Route path="/payroll" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><PayrollReports /></RoleGuard>} />
                <Route path="/payroll/dashboard" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><PayrollDashboard /></RoleGuard>} />
                <Route path="/hr/workforce-analytics" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><HeadcountAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/reports" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><HRReports /></RoleGuard>} />
                <Route path="/hr/departments" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><DepartmentsManagement /></RoleGuard>} />

                {/* HR Analytics & Attendance Subsections */}
                <Route path="/hr/leave-policies" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><LeavePoliciesPage /></RoleGuard>} />
                <Route path="/hr/productivity" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><ProductivityAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/productivity-metrics" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><ProductivityAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/skills-overview" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><SkillOverviewPage /></RoleGuard>} />
                <Route path="/hr/skills-gaps" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><SkillGapsPage /></RoleGuard>} />
                <Route path="/hr/skills-coverage" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><SkillCoveragePage /></RoleGuard>} />
                <Route path="/hr/risk" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><RiskAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/teams" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><TeamsPage /></RoleGuard>} />
                <Route path="/hr/attendance-overview" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><AttendanceOverviewPage /></RoleGuard>} />
                <Route path="/hr/attendance-history" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><AttendanceHistoryPage /></RoleGuard>} />
                <Route path="/hr/shifts" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><ShiftManagementPage /></RoleGuard>} />
                <Route path="/hr/corrections" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/hr/approvals" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />
                <Route path="/hr/performance-overview" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><PerformanceOverviewPage /></RoleGuard>} />
                <Route path="/hr/recruitment-analytics" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><AttritionAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/workforce-planning" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><HeadcountAnalyticsPage /></RoleGuard>} />
                <Route path="/hr/audit-logs" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><AuditLogsPage /></RoleGuard>} />
                <Route path="/hr/settings" element={<RoleGuard allowedRoles={[Role.HR, Role.ADMIN]}><SystemSettings /></RoleGuard>} />

                {/* ==================== 3. DEPARTMENT MANAGER ROUTES ==================== */}
                <Route path="/manager/dashboard" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ManagerDashboard /></RoleGuard>} />
                <Route path="/manager/team" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ManagerTeamPage /></RoleGuard>} />
                <Route path="/manager/team/members" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ManagerTeamPage /></RoleGuard>} />
                <Route path="/manager/sprints" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ManagerSprintsPage /></RoleGuard>} />
                <Route path="/manager/tasks" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ManagerTasksPage /></RoleGuard>} />
                <Route path="/manager/analytics" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/manager/attendance" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/manager/leave-requests" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />
                <Route path="/manager/approvals" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />
                <Route path="/manager/performance" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamReports /></RoleGuard>} />
                <Route path="/manager/reports" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamReports /></RoleGuard>} />
                <Route path="/manager/productivity" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><Productivity /></RoleGuard>} />
                <Route path="/manager/attendance-analytics" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceOverviewPage /></RoleGuard>} />
                <Route path="/manager/skills-gaps" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><SkillGapsPage /></RoleGuard>} />
                <Route path="/manager/team-members" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ManagerTeamPage /></RoleGuard>} />
                <Route path="/manager/team-overview" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ManagerTeamPage /></RoleGuard>} />
                <Route path="/manager/team-attendance" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/manager/attendance-history" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceHistoryPage /></RoleGuard>} />
                <Route path="/manager/corrections" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/manager/team-skills" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><SkillOverviewPage /></RoleGuard>} />
                <Route path="/manager/skills-gaps-view" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><SkillGapsPage /></RoleGuard>} />
                <Route path="/manager/skills-coverage" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><SkillCoveragePage /></RoleGuard>} />
                <Route path="/manager/team-performance" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><TeamReports /></RoleGuard>} />
                <Route path="/manager/productivity-metrics" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ProductivityAnalyticsPage /></RoleGuard>} />
                <Route path="/manager/shifts" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><ShiftsPage /></RoleGuard>} />
                <Route path="/manager/settings" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.ADMIN]}><Profile /></RoleGuard>} />

                {/* ==================== 4. TEAM LEAD ROUTES (SPEC SECTION 16) ==================== */}
                <Route path="/team/dashboard" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamLeadDashboard /></RoleGuard>} />
                <Route path="/team/members" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamMembersPage /></RoleGuard>} />
                <Route path="/team/attendance" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><MonthlyAttendancePage /></RoleGuard>} />
                <Route path="/team/goals" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TaskTrackingPage /></RoleGuard>} />
                <Route path="/team/analytics" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><Productivity /></RoleGuard>} />

                <Route path="/team-lead/dashboard" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamLeadDashboard /></RoleGuard>} />
                <Route path="/team-lead/team" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamMembersPage /></RoleGuard>} />
                <Route path="/team-lead/sprints" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamLeadSprintsPage /></RoleGuard>} />
                <Route path="/team-lead/tasks" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TaskTrackingPage /></RoleGuard>} />
                <Route path="/team-lead/attendance" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><MonthlyAttendancePage /></RoleGuard>} />
                <Route path="/team-lead/productivity" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><Productivity /></RoleGuard>} />
                <Route path="/team-lead/performance" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><Productivity /></RoleGuard>} />
                <Route path="/team-lead/feedback" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><FeedbackManagement /></RoleGuard>} />
                <Route path="/team-lead/attendance-analytics" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><AttendanceOverviewPage /></RoleGuard>} />
                <Route path="/team-lead/workforce-analytics" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/team-lead/team-members" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamMembersPage /></RoleGuard>} />
                <Route path="/team-lead/team-overview" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/team-lead/team-attendance" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><MonthlyAttendancePage /></RoleGuard>} />
                <Route path="/team-lead/attendance-history" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><AttendanceHistoryPage /></RoleGuard>} />
                <Route path="/team-lead/corrections" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/team-lead/approvals" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><ApprovalsPage /></RoleGuard>} />
                <Route path="/team-lead/team-skills" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><SkillOverviewPage /></RoleGuard>} />
                <Route path="/team-lead/skills-gaps" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><SkillGapsPage /></RoleGuard>} />
                <Route path="/team-lead/team-performance" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamReports /></RoleGuard>} />
                <Route path="/team-lead/shifts" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><ShiftsPage /></RoleGuard>} />
                <Route path="/team-lead/reports" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamReports /></RoleGuard>} />
                <Route path="/team-lead/settings" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><Profile /></RoleGuard>} />

                {/* ==================== 5. EMPLOYEE ROUTES (SPEC SECTION 16) ==================== */}
                <Route path="/me/dashboard" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeDashboard /></RoleGuard>} />
                <Route path="/me/profile" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                <Route path="/me/attendance" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MonthlyAttendancePage /></RoleGuard>} />
                <Route path="/me/leave" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeRequestsPage /></RoleGuard>} />
                <Route path="/me/absence" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><AbsenceManagementPage /></RoleGuard>} />
                <Route path="/me/requests" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeRequestsPage /></RoleGuard>} />
                <Route path="/me/performance" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyPerformance /></RoleGuard>} />
                <Route path="/me/notifications" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeDashboard /></RoleGuard>} />
                <Route path="/me/expenses" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyExpensesPage /></RoleGuard>} />

                {/* Main Employee Navigation Mappings */}
                <Route path="/employee/dashboard" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeDashboard /></RoleGuard>} />
                
                {/* My Work */}
                <Route path="/employee/work" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeWorkPage /></RoleGuard>} />
                <Route path="/employee/work/tasks" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeWorkPage /></RoleGuard>} />
                <Route path="/employee/work/projects" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeWorkPage /></RoleGuard>} />
                <Route path="/employee/work/sprints" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeWorkPage /></RoleGuard>} />
                <Route path="/employee/work/logs" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeWorkPage /></RoleGuard>} />
                <Route path="/employee/tasks" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeWorkPage /></RoleGuard>} />
                <Route path="/employee/sprints" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeWorkPage /></RoleGuard>} />

                {/* Attendance */}
                <Route path="/employee/attendance" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MonthlyAttendancePage /></RoleGuard>} />
                <Route path="/employee/attendance/today" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/attendance/history" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MonthlyAttendancePage /></RoleGuard>} />
                <Route path="/employee/attendance/hours" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/attendance/corrections" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/employee/attendance-today" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/check-in-out" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/break" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/working-hours" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/employee/shifts" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><ShiftsPage /></RoleGuard>} />
                <Route path="/employee/corrections" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />

                {/* Leave */}
                <Route path="/employee/leave" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeRequestsPage /></RoleGuard>} />
                <Route path="/employee/leave/overview" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><AbsenceManagementPage /></RoleGuard>} />
                <Route path="/employee/leave/apply" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeRequestsPage /></RoleGuard>} />
                <Route path="/employee/leave/balance" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><AbsenceManagementPage /></RoleGuard>} />
                <Route path="/employee/leave/history" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeRequestsPage /></RoleGuard>} />
                <Route path="/employee/leave/policies" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><LeavePoliciesPage /></RoleGuard>} />
                <Route path="/employee/holidays" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><PublicHolidaysPage /></RoleGuard>} />

                {/* Payroll */}
                <Route path="/employee/payroll/overview" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeePayrollProfilePage /></RoleGuard>} />
                <Route path="/employee/payroll/salary" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeePayrollProfilePage /></RoleGuard>} />
                <Route path="/employee/payroll/payslips" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><PayslipsPage /></RoleGuard>} />
                <Route path="/employee/payroll/history" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyPayslips /></RoleGuard>} />
                <Route path="/employee/payroll/tax" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><TaxDeclarationsPage /></RoleGuard>} />
                <Route path="/employee/payroll/reimbursements" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyExpensesPage /></RoleGuard>} />
                <Route path="/employee/payslips" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><PayslipsPage /></RoleGuard>} />

                {/* Benefits & Learning & Skills */}
                <Route path="/employee/benefits/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                <Route path="/employee/learning/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><SkillOverviewPage /></RoleGuard>} />
                <Route path="/employee/skills" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><SkillOverviewPage /></RoleGuard>} />
                <Route path="/employee/skills-coverage" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><SkillCoveragePage /></RoleGuard>} />
                <Route path="/employee/skills-gaps" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><SkillGapsPage /></RoleGuard>} />

                {/* Performance */}
                <Route path="/employee/performance" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyPerformance /></RoleGuard>} />
                <Route path="/employee/performance/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyPerformance /></RoleGuard>} />
                <Route path="/employee/goals" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyGoalsPage /></RoleGuard>} />

                {/* Documents & Requests & Assets & Expenses */}
                <Route path="/employee/documents/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                <Route path="/employee/requests/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeRequestsPage /></RoleGuard>} />
                <Route path="/employee/assets/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                <Route path="/employee/expenses" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyExpensesPage /></RoleGuard>} />
                <Route path="/employee/expenses/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyExpensesPage /></RoleGuard>} />

                {/* Profile & Security & Settings & Analytics & Notifications */}
                <Route path="/employee/profile" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                <Route path="/employee/profile/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                <Route path="/employee/analytics" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeDashboard /></RoleGuard>} />
                <Route path="/employee/notifications" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeDashboard /></RoleGuard>} />
                <Route path="/employee/security" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                <Route path="/employee/settings" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />

                {/* Generic Sidebar Routes */}
                
                {/* People / Employees */}
                <Route path="/employees/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><EmployeeManagement /></RoleGuard>} />
                <Route path="/team-members" element={<RoleGuard allowedRoles={[Role.MANAGER, Role.TEAM_LEAD, Role.ADMIN, Role.HR]}><TeamMembersPage /></RoleGuard>} />
                
                {/* People / Organization */}
                <Route path="/organization/departments" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><DepartmentsManagement /></RoleGuard>} />
                <Route path="/organization/teams" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><TeamsPage /></RoleGuard>} />
                <Route path="/organization/designations" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><DepartmentsManagement /></RoleGuard>} />
                <Route path="/organization/locations" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><LocationsManagement /></RoleGuard>} />
                <Route path="/organization/cost-centers" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><SystemConfiguration /></RoleGuard>} />
                <Route path="/organization/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><OrganizationPage /></RoleGuard>} />

                {/* Employee Lifecycle */}
                <Route path="/lifecycle/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><EmployeeManagement /></RoleGuard>} />

                {/* Attendance */}
                <Route path="/attendance/overview" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><AttendanceOverviewPage /></RoleGuard>} />
                <Route path="/attendance/my" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyAttendance /></RoleGuard>} />
                <Route path="/attendance/team" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/attendance/register" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/attendance/corrections" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/attendance/regularization" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><AttendanceCorrectionsPage /></RoleGuard>} />
                <Route path="/attendance/shifts" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><ShiftsPage /></RoleGuard>} />
                <Route path="/attendance/overtime" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><AttendanceManagement /></RoleGuard>} />
                <Route path="/attendance/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyAttendance /></RoleGuard>} />

                {/* Leave */}
                <Route path="/leave/overview" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><LeaveManagement /></RoleGuard>} />
                <Route path="/leave/my" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeRequestsPage /></RoleGuard>} />
                <Route path="/leave/team" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><LeaveManagement /></RoleGuard>} />
                <Route path="/leave/requests" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><LeaveManagement /></RoleGuard>} />
                <Route path="/leave/types" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><LeavePoliciesPage /></RoleGuard>} />
                <Route path="/leave/policies" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><LeavePoliciesPage /></RoleGuard>} />
                <Route path="/leave/holiday" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><PublicHolidaysPage /></RoleGuard>} />
                <Route path="/leave/reports" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><LeaveManagement /></RoleGuard>} />
                <Route path="/leave/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeeRequestsPage /></RoleGuard>} />

                {/* Payroll */}
                <Route path="/payroll/dashboard" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}><PayrollDashboard /></RoleGuard>} />
                <Route path="/payroll/runs/:id" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}><PayrollRunDetailsPage /></RoleGuard>} />
                <Route path="/payroll/register" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><PayrollRegisterPage /></RoleGuard>} />
                <Route path="/payroll/ctc-calculator" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><CtcCalculatorPage /></RoleGuard>} />
                <Route path="/payroll/revisions" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.EMPLOYEE]}><SalaryRevisionHistoryPage /></RoleGuard>} />
                <Route path="/payroll/departments" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER]}><DepartmentPayrollPage /></RoleGuard>} />
                <Route path="/payroll/fnf" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><FullFinalSettlementPage /></RoleGuard>} />
                <Route path="/payroll/tax-declarations" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><TaxDeclarationsPage /></RoleGuard>} />
                <Route path="/payroll/profile" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><EmployeePayrollProfilePage /></RoleGuard>} />
                <Route path="/payroll/structures" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><SalaryStructuresPage /></RoleGuard>} />
                <Route path="/payroll/components" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><SalaryStructuresPage /></RoleGuard>} />
                <Route path="/payroll/runs/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><PayrollDashboard /></RoleGuard>} />
                <Route path="/payroll/payslips" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyPayslips /></RoleGuard>} />
                <Route path="/payroll/tax/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><TaxDeclarationsPage /></RoleGuard>} />
                <Route path="/payroll/compliance/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><StatutoryCompliancePage /></RoleGuard>} />
                <Route path="/payroll/reports" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><PayrollReports /></RoleGuard>} />
                <Route path="/payroll/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><PayrollDashboard /></RoleGuard>} />

                {/* Assets */}
                <Route path="/assets" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><AssetManagementPage /></RoleGuard>} />
                <Route path="/assets/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><AssetManagementPage /></RoleGuard>} />


                {/* Performance */}
                <Route path="/performance/dashboard" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><PerformanceOverviewPage /></RoleGuard>} />
                <Route path="/performance/goals" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyGoalsPage /></RoleGuard>} />
                <Route path="/performance/okrs" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyGoalsPage /></RoleGuard>} />
                <Route path="/performance/reviews" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><PerformanceAnalyticsPage /></RoleGuard>} />
                <Route path="/performance/360-feedback" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><PerformanceAnalyticsPage /></RoleGuard>} />
                <Route path="/performance/calibration" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><PerformanceOverviewPage /></RoleGuard>} />
                <Route path="/performance/reports" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><PerformanceAnalyticsPage /></RoleGuard>} />
                <Route path="/performance/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyPerformance /></RoleGuard>} />

                {/* Expenses */}
                <Route path="/expenses/my" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyExpensesPage /></RoleGuard>} />
                <Route path="/expenses/claims" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyExpensesPage /></RoleGuard>} />
                <Route path="/expenses/approvals" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><ApprovalsPage /></RoleGuard>} />
                <Route path="/expenses/policies" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><SystemSettings /></RoleGuard>} />
                <Route path="/expenses/reimbursements" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><MyExpensesPage /></RoleGuard>} />
                <Route path="/expenses/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><MyExpensesPage /></RoleGuard>} />

                {/* Recruitment */}
                <Route path="/recruitment/dashboard" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><RecruitmentManagement /></RoleGuard>} />
                <Route path="/recruitment/requisitions" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><RecruitmentManagement /></RoleGuard>} />
                <Route path="/recruitment/candidates/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><RecruitmentManagement /></RoleGuard>} />
                <Route path="/recruitment/interviews" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><RecruitmentManagement /></RoleGuard>} />
                <Route path="/recruitment/offers" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><RecruitmentManagement /></RoleGuard>} />
                <Route path="/recruitment/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><RecruitmentManagement /></RoleGuard>} />

                {/* Documents */}
                <Route path="/documents/my" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                <Route path="/documents/employee" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><EmployeeManagement /></RoleGuard>} />
                <Route path="/documents/policies" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><SystemSettings /></RoleGuard>} />
                <Route path="/documents/expiring" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><EmployeeManagement /></RoleGuard>} />
                <Route path="/documents/*" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />

                {/* Reports */}
                <Route path="/reports/workforce" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><TeamReports /></RoleGuard>} />
                <Route path="/reports/attendance" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><TeamReports /></RoleGuard>} />
                <Route path="/reports/leave" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><TeamReports /></RoleGuard>} />
                <Route path="/reports/payroll" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><PayrollReports /></RoleGuard>} />
                <Route path="/reports/expenses" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><TeamReports /></RoleGuard>} />
                <Route path="/reports/recruitment" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><HRReports /></RoleGuard>} />
                <Route path="/reports/performance" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><TeamReports /></RoleGuard>} />
                <Route path="/reports/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><TeamReports /></RoleGuard>} />

                {/* Analytics */}
                <Route path="/analytics/workforce" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><TeamAnalytics /></RoleGuard>} />
                <Route path="/analytics/headcount" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><HeadcountAnalyticsPage /></RoleGuard>} />
                <Route path="/analytics/attrition" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><AttritionAnalyticsPage /></RoleGuard>} />
                <Route path="/analytics/attendance" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><AttendanceHistoryPage /></RoleGuard>} />
                <Route path="/analytics/payroll" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR]}><PayrollReports /></RoleGuard>} />
                <Route path="/analytics/productivity" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><ProductivityAnalyticsPage /></RoleGuard>} />
                <Route path="/analytics/*" element={<RoleGuard allowedRoles={[Role.ADMIN, Role.HR, Role.MANAGER, Role.TEAM_LEAD]}><TeamAnalytics /></RoleGuard>} />


                {/* Administration */}
                <Route path="/administration/users" element={<RoleGuard allowedRoles={[Role.ADMIN]}><UserManagement /></RoleGuard>} />
                <Route path="/administration/roles" element={<RoleGuard allowedRoles={[Role.ADMIN]}><RoleManagement /></RoleGuard>} />
                <Route path="/administration/permissions" element={<RoleGuard allowedRoles={[Role.ADMIN]}><PermissionsManagement /></RoleGuard>} />
                <Route path="/administration/organization" element={<RoleGuard allowedRoles={[Role.ADMIN]}><OrganizationPage /></RoleGuard>} />
                <Route path="/administration/features" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SystemConfiguration /></RoleGuard>} />
                <Route path="/administration/audit-logs" element={<RoleGuard allowedRoles={[Role.ADMIN]}><AuditLogsPage /></RoleGuard>} />
                <Route path="/administration/security" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SecurityAdminDashboard /></RoleGuard>} />
                <Route path="/administration/settings" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SystemSettings /></RoleGuard>} />
                <Route path="/administration/*" element={<RoleGuard allowedRoles={[Role.ADMIN]}><SystemSettings /></RoleGuard>} />

                {/* Dedicated Error Pages Routes */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="/403" element={<AccessDeniedPage />} />
                <Route path="/500" element={<ServerErrorPage />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Missing Dashboard Quick Action Routes */}
                <Route path="/employee/tasks" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><TaskTrackingPage /></RoleGuard>} />
                <Route path="/team-lead/members" element={<RoleGuard allowedRoles={[Role.TEAM_LEAD, Role.ADMIN]}><TeamMembersPage /></RoleGuard>} />
                <Route path="/employee/profile" element={<RoleGuard allowedRoles={[Role.EMPLOYEE, Role.TEAM_LEAD, Role.MANAGER, Role.HR, Role.ADMIN]}><Profile /></RoleGuard>} />
                
                {/* Role-based Wildcard Fallbacks to prevent 404 on broken dashboard links */}
                <Route path="/admin/*" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/hr/*" element={<Navigate to="/hr/dashboard" replace />} />
                <Route path="/manager/*" element={<Navigate to="/manager/dashboard" replace />} />
                <Route path="/team-lead/*" element={<Navigate to="/team-lead/dashboard" replace />} />
                <Route path="/team/*" element={<Navigate to="/team/dashboard" replace />} />
                <Route path="/employee/*" element={<Navigate to="/employee/dashboard" replace />} />
                <Route path="/me/*" element={<Navigate to="/me/dashboard" replace />} />

                {/* Legacy Root Paths Redirects */}
                <Route path="/dashboard" element={<DefaultHomeRedirect />} />

                {/* Default Route Fallback */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </MainLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};


