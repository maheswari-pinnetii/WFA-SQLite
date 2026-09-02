// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { SignUpPage } from '../../frontend/src/auth/pages/SignUpPage';

const mockSignup = vi.fn();
vi.mock('../../frontend/src/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    signup: mockSignup,
    setSession: vi.fn(),
    isAuthenticated: false,
    role: 'EMPLOYEE',
    user: null,
    initializeAuth: vi.fn(),
    isLoading: false,
  }),
}));

describe('Step 3: SignUpPage Component Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderSignUp = () => {
    return render(
      <BrowserRouter>
        <SignUpPage />
      </BrowserRouter>
    );
  };

  it('3.1 should render full name, email, role selector, MFA options, and password inputs', () => {
    renderSignUp();

    expect(screen.getByText('STACKLY')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email \/ Employee ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('3.2 should validate full name presence', async () => {
    renderSignUp();

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please enter your full name.')).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('3.3 should validate email format', async () => {
    renderSignUp();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Email \/ Employee ID/i), { target: { value: 'invalid-email-format' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please enter a valid work email address.')).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('3.4 should validate password length under 8 characters', async () => {
    renderSignUp();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Email \/ Employee ID/i), { target: { value: 'jane@thestackly.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'short' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('3.5 should validate password confirmation match', async () => {
    renderSignUp();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Email \/ Employee ID/i), { target: { value: 'jane@thestackly.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'SecurePass123!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'MismatchPass456!' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('3.6 should submit registration with valid data', async () => {
    mockSignup.mockResolvedValueOnce({
      token: 'jwt-signup-token-123',
      user: { id: 'usr-123', email: 'jane@thestackly.com', role: 'EMPLOYEE' },
    });

    renderSignUp();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Email \/ Employee ID/i), { target: { value: 'jane@thestackly.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'ValidPass2026!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'ValidPass2026!' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        fullName: 'Jane Doe',
        name: 'Jane Doe',
        email: 'jane@thestackly.com',
        password: 'ValidPass2026!',
        role: 'EMPLOYEE',
        department: 'Operations',
      });
    });
  });
});
