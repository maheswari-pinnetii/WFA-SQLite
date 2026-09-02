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

  it('3.1 should render full name, email, and password setup inputs by default', () => {
    renderSignUp();

    expect(screen.getByText('Register Your Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Work Email/i)).toBeInTheDocument();
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
    fireEvent.change(screen.getByLabelText(/Work Email/i), { target: { value: 'invalid-email-format' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please enter a valid email address.')).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('3.4 should validate password length under 8 characters', async () => {
    renderSignUp();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Work Email/i), { target: { value: 'jane@thestackly.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'short' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'short' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Password must be at least 8 characters long.')).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('3.5 should validate password and confirm password mismatch', async () => {
    renderSignUp();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByLabelText(/Work Email/i), { target: { value: 'jane@thestackly.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Password123!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'DifferentPassword123!' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Passwords do not match.')).toBeInTheDocument();
    expect(mockSignup).not.toHaveBeenCalled();
  });

  it('3.6 should toggle to Setup Passkey tab and display WebAuthn promo information', () => {
    renderSignUp();

    const passkeyTab = screen.getByRole('tab', { name: /Setup Passkey/i });
    fireEvent.click(passkeyTab);

    expect(screen.queryByLabelText(/^Password$/i)).not.toBeInTheDocument();
    expect(screen.getByText('Fast & Phishing-Resistant')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account with Passkey/i })).toBeInTheDocument();
  });

  it('3.7 should submit standard password registration successfully', async () => {
    mockSignup.mockResolvedValueOnce({ success: true });
    renderSignUp();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Sarah Connor' } });
    fireEvent.change(screen.getByLabelText(/Work Email/i), { target: { value: 'sarah@thestackly.com' } });
    fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'SecurePass2026!' } });
    fireEvent.change(screen.getByLabelText(/Confirm Password/i), { target: { value: 'SecurePass2026!' } });

    const submitBtn = screen.getByRole('button', { name: /Create Account/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(mockSignup).toHaveBeenCalledWith({
        name: 'Sarah Connor',
        email: 'sarah@thestackly.com',
        password: 'SecurePass2026!',
      });
    });

    expect(await screen.findByText(/Account created successfully/i)).toBeInTheDocument();
  });
});
