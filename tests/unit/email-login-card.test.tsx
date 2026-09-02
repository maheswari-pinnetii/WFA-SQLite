// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { EmailLoginCard } from '../../frontend/src/auth/components/EmailLoginCard';

describe('Step 1: EmailLoginCard Component Unit Tests', () => {
  const renderCard = (props: React.ComponentProps<typeof EmailLoginCard>) => {
    return render(
      <BrowserRouter>
        <EmailLoginCard {...props} />
      </BrowserRouter>
    );
  };

  it('1.1 should render badge header, Stackly branding, email input, and password field', () => {
    renderCard({
      onSubmit: vi.fn(),
      currentEmail: 'employee@thestackly.com',
    });

    expect(screen.getByText('Step 1 of 2: Password')).toBeInTheDocument();
    expect(screen.getByText('Knowledge Factor')).toBeInTheDocument();
    expect(screen.getByAltText('Stackly')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email address/i)).toHaveValue('employee@thestackly.com');
    expect(screen.getByText('Sign in to your account')).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password$/i)).toBeInTheDocument();
    expect(screen.getByText('Forgot your password?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Next$/i })).toBeInTheDocument();
  });

  it('1.2 should toggle password visibility when clicking eye button', () => {
    renderCard({ onSubmit: vi.fn() });

    const passwordInput = screen.getByLabelText(/^Password$/i) as HTMLInputElement;
    const toggleBtn = screen.getByRole('button', { name: /Show password/i });

    expect(passwordInput.type).toBe('password');

    // Toggle on
    fireEvent.click(toggleBtn);
    expect(passwordInput.type).toBe('text');

    // Toggle off
    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    expect(passwordInput.type).toBe('password');
  });

  it('1.3 should allow typing and changing corporate email directly in input', () => {
    const onEmailChangeMock = vi.fn();
    renderCard({
      onSubmit: vi.fn(),
      currentEmail: 'original@thestackly.com',
      onEmailChange: onEmailChangeMock,
    });

    const emailInput = screen.getByLabelText(/Email address/i) as HTMLInputElement;
    expect(emailInput.value).toBe('original@thestackly.com');

    // Change email value
    fireEvent.change(emailInput, { target: { value: 'updated@thestackly.com' } });

    expect(onEmailChangeMock).toHaveBeenCalledWith('updated@thestackly.com');
    expect(emailInput.value).toBe('updated@thestackly.com');
  });

  it('1.4 should display validation error when password is empty', async () => {
    const onSubmitMock = vi.fn();
    renderCard({ onSubmit: onSubmitMock, prefilledPassword: '' });

    const passwordInput = screen.getByLabelText(/^Password$/i);
    fireEvent.change(passwordInput, { target: { value: '' } });

    const submitBtn = screen.getByRole('button', { name: /^Next$/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please enter your password.')).toBeInTheDocument();
    expect(onSubmitMock).not.toHaveBeenCalled();
  });

  it('1.5 should submit form with valid credentials', () => {
    const onSubmitMock = vi.fn();
    renderCard({
      onSubmit: onSubmitMock,
      currentEmail: 'engineer@thestackly.com',
    });

    const passwordInput = screen.getByLabelText(/^Password$/i);
    fireEvent.change(passwordInput, { target: { value: 'ValidSecurePass2026!' } });

    const submitBtn = screen.getByRole('button', { name: /^Next$/i });
    fireEvent.click(submitBtn);

    expect(onSubmitMock).toHaveBeenCalledWith({
      email: 'engineer@thestackly.com',
      password: 'ValidSecurePass2026!',
    });
  });

  it('1.6 should render error message passed from parent', () => {
    renderCard({
      onSubmit: vi.fn(),
      errorMessage: 'Invalid password. 3 attempts remaining.',
    });

    expect(screen.getByText('Invalid password. 3 attempts remaining.')).toBeInTheDocument();
  });
});
