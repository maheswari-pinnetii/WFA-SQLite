// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../../frontend/src/auth/pages/LoginPage';
import { SignUpPage } from '../../frontend/src/auth/pages/SignUpPage';

const mockLogin = vi.fn();
const mockSignup = vi.fn();
const mockSetSession = vi.fn();

vi.mock('../../frontend/src/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    role: 'EMPLOYEE',
    user: null,
    login: mockLogin,
    signup: mockSignup,
    setSession: mockSetSession,
    initializeAuth: vi.fn(),
    isLoading: false,
  }),
}));

vi.mock('../../frontend/src/auth/services/auth.service', () => ({
  authService: {
    passkeyLogin: vi.fn(),
    registerPasskey: vi.fn(),
  },
}));

const renderPage = (page: React.ReactNode) => render(<BrowserRouter>{page}</BrowserRouter>);

describe('Authentication pages', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue({
      token: 'test-token',
      user: { role: 'EMPLOYEE', email: 'employee@thestackly.com' },
    });
    mockSignup.mockResolvedValue({ success: true });
  });

  it('renders password and passkey login without demo role controls', () => {
    renderPage(<LoginPage />);

    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in with a passkey/i })).toBeInTheDocument();
    expect(screen.queryByText('Demo:')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /^Admin$/i })).not.toBeInTheDocument();
  });

  it('logs in with email and password', async () => {
    renderPage(<LoginPage />);

    fireEvent.change(screen.getByLabelText(/Email address/i), { target: { value: 'employee@thestackly.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'SecurePass2026!' } });
    fireEvent.click(screen.getByRole('button', { name: /^Next$/i }));

    await waitFor(() => expect(mockLogin).toHaveBeenCalledWith('employee@thestackly.com', 'SecurePass2026!'));
  });

  it('renders all requested signup fields', () => {
    renderPage(<SignUpPage />);

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Employee ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Company Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Department/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Setup Passkey/i })).toBeInTheDocument();
  });
});
