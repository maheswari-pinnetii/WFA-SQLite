// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { PasswordlessLoginCard } from '../../frontend/src/auth/components/PasswordlessLoginCard';

describe('Step 2: PasswordlessLoginCard Component Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderCard = (props: React.ComponentProps<typeof PasswordlessLoginCard>) => {
    return render(
      <BrowserRouter>
        <PasswordlessLoginCard {...props} />
      </BrowserRouter>
    );
  };

  it('2.1 should render FIDO2 / WebAuthn header, biometric heading, and HUD scanner', () => {
    renderCard({
      onPasskeyLogin: vi.fn(),
      currentEmail: 'employee@thestackly.com',
    });

    expect(screen.getByText('Step 2 of 2: Passwordless')).toBeInTheDocument();
    expect(screen.getByText('FIDO2 / WebAuthn')).toBeInTheDocument();
    expect(screen.getByAltText('Stackly')).toBeInTheDocument();
    expect(screen.getByText('employee@thestackly.com')).toBeInTheDocument();
    expect(screen.getByText('Sign in faster with your face, fingerprint, or PIN')).toBeInTheDocument();
    expect(screen.getByText(/built-in Windows Hello, Touch ID, Face ID/i)).toBeInTheDocument();

    // Verify dual action buttons
    expect(screen.getByRole('button', { name: /^Next$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Skip for now/i })).toBeInTheDocument();
  });

  it('2.2 should trigger onSkip callback when clicking Skip for now button', () => {
    const onSkipMock = vi.fn();
    renderCard({
      onPasskeyLogin: vi.fn(),
      onSkip: onSkipMock,
    });

    const skipBtn = screen.getByRole('button', { name: /Skip for now/i });
    fireEvent.click(skipBtn);

    expect(onSkipMock).toHaveBeenCalledTimes(1);
  });

  it('2.3 should call onPasskeyLogin with current email when clicking Next button', async () => {
    const onPasskeyLoginMock = vi.fn().mockResolvedValue(undefined);

    // Mock window.PublicKeyCredential support
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });

    renderCard({
      onPasskeyLogin: onPasskeyLoginMock,
      currentEmail: 'biometric.user@thestackly.com',
    });

    const nextBtn = screen.getByRole('button', { name: /^Next$/i });
    fireEvent.click(nextBtn);

    await waitFor(() => {
      expect(onPasskeyLoginMock).toHaveBeenCalledWith({ email: 'biometric.user@thestackly.com' });
    });
  });

  it('2.4 should display friendly error when PublicKeyCredential is not supported in browser', async () => {
    // Set PublicKeyCredential to undefined
    Object.defineProperty(window, 'PublicKeyCredential', {
      value: undefined,
      writable: true,
      configurable: true,
    });

    renderCard({
      onPasskeyLogin: vi.fn(),
    });

    const nextBtn = screen.getByRole('button', { name: /^Next$/i });
    fireEvent.click(nextBtn);

    expect(await screen.findByText(/Biometric \/ Passkey authentication is not supported/i)).toBeInTheDocument();
  });

  it('2.5 should allow editing email pill badge in passwordless card', () => {
    const onEmailChangeMock = vi.fn();
    renderCard({
      onPasskeyLogin: vi.fn(),
      currentEmail: 'passkey.initial@thestackly.com',
      onEmailChange: onEmailChangeMock,
    });

    const emailPill = screen.getByText('passkey.initial@thestackly.com');
    fireEvent.click(emailPill);

    const editInput = screen.getByLabelText('Switch Email') as HTMLInputElement;
    fireEvent.change(editInput, { target: { value: 'passkey.new@thestackly.com' } });
    fireEvent.blur(editInput);

    expect(onEmailChangeMock).toHaveBeenCalledWith('passkey.new@thestackly.com');
    expect(screen.getByText('passkey.new@thestackly.com')).toBeInTheDocument();
  });
});
