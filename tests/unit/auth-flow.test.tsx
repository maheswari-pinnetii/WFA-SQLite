// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { LoginPage } from '../../frontend/src/auth/pages/LoginPage';
import { MultipleLoginMethodsPage } from '../../frontend/src/auth/pages/MultipleLoginMethodsPage';
import { SignUpPage } from '../../frontend/src/auth/pages/SignUpPage';
import { EmailLoginCard } from '../../frontend/src/auth/components/EmailLoginCard';
import { PasswordlessLoginCard } from '../../frontend/src/auth/components/PasswordlessLoginCard';

// Mock useAuth hook
const mockLogin = vi.fn().mockResolvedValue({ payload: { user: { role: 'ADMIN' } } });
const mockSignup = vi.fn().mockResolvedValue({ success: true });
const mockSetSession = vi.fn();

vi.mock('../../frontend/src/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    role: 'ADMIN',
    user: null,
    login: mockLogin,
    signup: mockSignup,
    setSession: mockSetSession,
    initializeAuth: vi.fn(),
    isLoading: false,
  }),
}));

describe('Modern Authentication Flow Test Suite', () => {
  describe('1. LoginPage Multi-Step Flow (1st: Email Card -> 2nd: Passkey Card -> 3rd: Dashboard)', () => {
    it('1.1 should render Page 1 (EmailLoginCard) initially and advance to Page 2 (PasswordlessLoginCard) on Next', async () => {
      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      // Verify Page 1 (EmailLoginCard) elements
      expect(screen.getByText('Step 1 of 2: Password')).toBeInTheDocument();
      expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
      expect(screen.getByText(/Forgot your password\?/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /^Next$/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Create an account/i })).toBeInTheDocument();

      // Enter password on Page 1
      const passwordInput = screen.getByLabelText(/^Password$/i);
      fireEvent.change(passwordInput, { target: { value: 'StacklyWFA2026!' } });

      // Click Next on Page 1
      const nextBtn = screen.getByRole('button', { name: /^Next$/i });
      fireEvent.click(nextBtn);

      // Verify it advances to Page 2 (PasswordlessLoginCard)
      await waitFor(() => {
        expect(screen.getByText('Step 2 of 2: Passwordless')).toBeInTheDocument();
        expect(screen.getByText(/Sign in faster with your face, fingerprint, or PIN/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Skip for now/i })).toBeInTheDocument();
      });
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
    it('should render full name, email and toggle between Password and Passkey registration', () => {
      render(
        <BrowserRouter>
          <SignUpPage />
        </BrowserRouter>
      );

      expect(screen.getByText(/Register Your Account/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Work Email/i)).toBeInTheDocument();

      // Initial tab is "Set a Password"
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm Password/i)).toBeInTheDocument();

      // Toggle to "Setup Passkey"
      const passkeyTab = screen.getByRole('tab', { name: /Setup Passkey/i });
      fireEvent.click(passkeyTab);

      // Password fields should be replaced with the passkey promo box
      expect(screen.queryByLabelText(/^Password$/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Fast & Phishing-Resistant/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Create Account with Passkey/i })).toBeInTheDocument();

      // Toggle back to "Set a Password"
      const passwordTab = screen.getByRole('tab', { name: /Set a Password/i });
      fireEvent.click(passwordTab);
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    });
  });

  describe('5. MultipleLoginMethodsPage (Dual Card Showcase)', () => {
    it('should render both EmailLoginCard and PasswordlessLoginCard side-by-side with specs section', () => {
      render(
        <BrowserRouter>
          <MultipleLoginMethodsPage />
        </BrowserRouter>
      );

      // Verify Header & Badge
      expect(screen.getByText('Enterprise Authentication')).toBeInTheDocument();
      expect(screen.getByText('Multiple login methods')).toBeInTheDocument();
      expect(screen.getByText(/Select your preferred enterprise authentication method/i)).toBeInTheDocument();

      // Verify Left Card (Email Login)
      expect(screen.getByText('Step 1 of 2: Password')).toBeInTheDocument();
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();

      // Verify Right Card (Passwordless Login)
      expect(screen.getByText('Step 2 of 2: Passwordless')).toBeInTheDocument();
      expect(screen.getByText(/Sign in faster with your face, fingerprint, or PIN/i)).toBeInTheDocument();

      // Verify Bottom Educational Specifications Reference
      expect(screen.getByText(/Password-Based Authentication \(Left\)/i)).toBeInTheDocument();
      expect(screen.getByText(/Passwordless Authentication \(Right\)/i)).toBeInTheDocument();
    });
  });
});

