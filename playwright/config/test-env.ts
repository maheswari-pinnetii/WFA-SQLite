/**
 * Playwright E2E Test Environment & Credentials
 */

export const TEST_ENV = {
  BASE_URL: process.env.BASE_URL || 'http://localhost:3000',
  API_URL: process.env.API_URL || 'http://localhost:5001',
  TIMEOUTS: {
    ACTION: 10000,
    NAVIGATION: 15000,
    EXPECT: 5000,
  },
  USERS: {
    EMPLOYEE: {
      email: 'employee@thestackly.com',
      name: 'Stackly Employee',
      role: 'EMPLOYEE',
      expectedDashboardUrl: '/employee/dashboard',
    },
    ADMIN: {
      email: 'admin@thestackly.com',
      name: 'Stackly Admin',
      role: 'ADMIN',
      expectedDashboardUrl: '/admin/dashboard',
    },
    MANAGER: {
      email: 'manager@thestackly.com',
      name: 'Stackly Manager',
      role: 'MANAGER',
      expectedDashboardUrl: '/manager/dashboard',
    },
  },
  ROUTES: {
    LOGIN: '/login',
    SIGNUP: '/signup',
    FORGOT_PASSWORD: '/forgot-password',
    EMPLOYEE_DASHBOARD: '/employee/dashboard',
  },
};
