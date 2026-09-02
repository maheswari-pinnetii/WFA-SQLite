// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../../frontend/src/auth/pages/LoginPage';
import { SignUpPage } from '../../frontend/src/auth/pages/SignUpPage';
import { EmailLoginCard } from '../../frontend/src/auth/components/EmailLoginCard';
import { PasswordlessLoginCard } from '../../frontend/src/auth/components/PasswordlessLoginCard';

// Mock useAuth hook
vi.mock('../../frontend/src/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    role: 'EMPLOYEE',
    user: null,
    login: vi.fn().mockResolvedValue({ data: { user: { role: 'EMPLOYEE' } } }),
    signup: vi.fn().mockResolvedValue({ success: true }),
    initializeAuth: vi.fn(),
    isLoading: false,
  }),
}));

describe('Modern Authentication Flow Test Suite', () => {
  describe('1. LoginPage Component', () => {
    it('should render Stackly branded card with Roles selector, inputs, and Sign In button', () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      // Verify Stackly Branding & Titles
      expect(screen.getByText('STACKLY')).toBeInTheDocument();
      expect(screen.getByText('Welcome Back')).toBeInTheDocument();
      expect(screen.getByText('Sign in to access your dashboard')).toBeInTheDocument();

      // Verify Form Controls
      expect(screen.getByLabelText(/Roles/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email \/ Employee ID/i)).toBeInTheDocument();
      expect(screen.getByText(/MFA Delivery Channel/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Remember me/i)).toBeInTheDocument();
      expect(screen.getByText(/Forgot password\?/i)).toBeInTheDocument();

      // Verify Action button
      expect(screen.getByRole('button', { name: /^Sign In$/i })).toBeInTheDocument();

      // Verify footer link
      expect(screen.getByRole('link', { name: /Create account/i })).toBeInTheDocument();
    });
  });

  describe('2. EmailLoginCard Component', () => {
    it('should update controlled inputs and toggle password visibility', () => {
      const onSubmitMock = vi.fn();
      render(
        <BrowserRouter>
          <EmailLoginCard onSubmit={onSubmitMock} />
        </BrowserRouter>
      );

      const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
      const toggleBtn = screen.getByRole('button', { name: /Show password/i });

      // Change input values
      fireEvent.change(passwordInput, { target: { value: 'SecretPassword123' } });
      expect(passwordInput.value).toBe('SecretPassword123');

      // Test Password visibility toggle
      expect(passwordInput.type).toBe('password');
      fireEvent.click(toggleBtn);
      expect(passwordInput.type).toBe('text');
      fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
      expect(passwordInput.type).toBe('password');
    });

    it('should trigger onSubmit with payload when valid', () => {
      const onSubmitMock = vi.fn();
      render(
        <BrowserRouter>
          <EmailLoginCard onSubmit={onSubmitMock} currentEmail="john@stackly.internal" />
        </BrowserRouter>
      );

      fireEvent.change(screen.getByLabelText(/^Password$/i), { target: { value: 'Pass12345!' } });

      const nextBtn = screen.getByRole('button', { name: /^Next$/i });
      fireEvent.click(nextBtn);

      expect(onSubmitMock).toHaveBeenCalledWith({
        email: 'john@stackly.internal',
        password: 'Pass12345!',
      });
    });
  });

  describe('3. PasswordlessLoginCard Component', () => {
    it('should render biometric HUD scanner, Next and Skip for now buttons', () => {
      const onPasskeyLoginMock = vi.fn();
      const onSkipMock = vi.fn();

      render(
        <BrowserRouter>
          <PasswordlessLoginCard onPasskeyLogin={onPasskeyLoginMock} onSkip={onSkipMock} />
        </BrowserRouter>
      );

      expect(screen.getByText(/Sign in faster with your face, fingerprint, or PIN/i)).toBeInTheDocument();
      expect(screen.getByText(/built-in Windows Hello, Touch ID, Face ID/i)).toBeInTheDocument();

      // Click Skip
      const skipBtn = screen.getByRole('button', { name: /Skip for now/i });
      fireEvent.click(skipBtn);
      expect(onSkipMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('4. SignUpPage Component', () => {
    it('should render Stackly registration form with role selection and inputs', () => {
      render(
        <BrowserRouter>
          <SignUpPage />
        </BrowserRouter>
      );

      expect(screen.getByText('STACKLY')).toBeInTheDocument();
      expect(screen.getByRole('heading', { name: /Create Account/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email \/ Employee ID/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Role/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    });
  });
});
