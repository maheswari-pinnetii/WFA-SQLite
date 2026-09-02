// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import axios, { AxiosInstance } from 'axios';
import { app } from '../../backend/src/app.js';
import { initDb } from '../../backend/src/database/connection.js';
import { PasswordlessLoginCard } from '../../frontend/src/auth/components/PasswordlessLoginCard';
import { LoginPage } from '../../frontend/src/auth/pages/LoginPage';
import { RealTimeDevicePinLock } from '../../frontend/src/auth/components/RealTimeDevicePinLock';
import { RealTimePatternLock } from '../../frontend/src/auth/components/RealTimePatternLock';
import { RealTimeScreenLock } from '../../frontend/src/auth/components/RealTimeScreenLock';

// Mock useAuth hook for frontend tests
vi.mock('../../frontend/src/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    isAuthenticated: false,
    role: 'ADMIN',
    user: null,
    login: vi.fn().mockResolvedValue({ payload: { user: { role: 'ADMIN' } } }),
    signup: vi.fn().mockResolvedValue({ success: true }),
    setSession: vi.fn(),
    initializeAuth: vi.fn(),
    isLoading: false,
  }),
}));

describe('Trusted Devices & Biometric / Homescreen Lock Test Suite', () => {
  describe('1. Backend API: Trusted Devices Endpoints', () => {
    let server: any;
    let client: AxiosInstance;
    let createdDeviceId: string;
    const testEmail = 'admin@thestackly.com';
    const testFingerprint = `test_fp_${Date.now()}`;

    beforeAll(async () => {
      await initDb();
      return new Promise<void>((resolve) => {
        server = app.listen(0, () => {
          const address = server.address();
          const port = typeof address === 'string' ? 5099 : address.port;
          client = axios.create({
            baseURL: `http://localhost:${port}`,
            validateStatus: () => true,
          });
          resolve();
        });
      });
    });

    afterAll(async () => {
      if (server && typeof server.close === 'function') {
        await new Promise<void>((resolve) => server.close(() => resolve()));
      }
    });

    it('1.1 should save a trusted device with Face Recognition (face)', async () => {
      const res = await client.post('/api/auth/trusted-devices', {
        email: testEmail,
        deviceName: 'Admin Workstation (Windows Hello Face)',
        authMethod: 'face',
        deviceFingerprint: testFingerprint,
        deviceType: 'desktop',
      });

      expect(res.status).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.trustedDevice).toBeDefined();
      expect(res.data.trustedDevice.authMethod).toBe('face');
      expect(res.data.trustedDevice.deviceName).toBe('Admin Workstation (Windows Hello Face)');
      expect(res.data.trustedDevice.status).toBe('ACTIVE');
      createdDeviceId = res.data.trustedDevice.id;
    });

    it('1.2 should save a trusted device with Biometrics / Fingerprint (biometric)', async () => {
      const res = await client.post('/api/auth/trusted-devices', {
        email: testEmail,
        deviceName: 'Admin MacBook (Touch ID)',
        authMethod: 'biometric',
        deviceFingerprint: `fp_bio_${Date.now()}`,
        deviceType: 'laptop',
      });

      expect(res.status).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.trustedDevice.authMethod).toBe('biometric');
    });

    it('1.3 should save a trusted device with Homescreen Lock / PIN (screen_lock)', async () => {
      const res = await client.post('/api/auth/trusted-devices', {
        email: testEmail,
        deviceName: 'Mobile Phone (Screen Lock)',
        authMethod: 'screen_lock',
        deviceFingerprint: `fp_pin_${Date.now()}`,
        deviceType: 'mobile',
      });

      expect(res.status).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.trustedDevice.authMethod).toBe('screen_lock');
    });

    it('1.4 should save a trusted device with Device PIN (device_pin)', async () => {
      const res = await client.post('/api/auth/trusted-devices', {
        email: testEmail,
        deviceName: 'Office Tablet (Device PIN)',
        authMethod: 'device_pin',
        deviceFingerprint: `fp_devpin_${Date.now()}`,
        deviceType: 'tablet',
      });

      expect(res.status).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.trustedDevice.authMethod).toBe('device_pin');
    });

    it('1.5 should save a trusted device with Pattern Lock (pattern)', async () => {
      const res = await client.post('/api/auth/trusted-devices', {
        email: testEmail,
        deviceName: 'Field Android (Pattern Lock)',
        authMethod: 'pattern',
        deviceFingerprint: `fp_pat_${Date.now()}`,
        deviceType: 'mobile',
      });

      expect(res.status).toBe(201);
      expect(res.data.success).toBe(true);
      expect(res.data.trustedDevice.authMethod).toBe('pattern');
    });

    it('1.6 should list all active trusted devices for user', async () => {
      const res = await client.get(`/api/auth/trusted-devices?email=${encodeURIComponent(testEmail)}`);

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(Array.isArray(res.data.devices)).toBe(true);
      expect(res.data.devices.length).toBeGreaterThanOrEqual(1);

      const faceDevice = res.data.devices.find((d: any) => d.auth_method === 'face');
      expect(faceDevice).toBeDefined();
    });

    it('1.7 should verify active trusted device by device fingerprint', async () => {
      const res = await client.post('/api/auth/trusted-devices/verify', {
        email: testEmail,
        deviceFingerprint: testFingerprint,
      });

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.isTrusted).toBe(true);
      expect(res.data.device.authMethod).toBe('face');
    });

    it('1.8 should revoke a trusted device by ID', async () => {
      const res = await client.delete(`/api/auth/trusted-devices/${createdDeviceId}`);

      expect(res.status).toBe(200);
      expect(res.data.success).toBe(true);
      expect(res.data.message).toContain('revoked');

      // Verify device is no longer active
      const verifyRes = await client.post('/api/auth/trusted-devices/verify', {
        email: testEmail,
        deviceFingerprint: testFingerprint,
      });

      expect(verifyRes.data.isTrusted).toBe(false);
    });
  });

  describe('2. Frontend UI: Real-Time Lock Mechanisms & Save Trusted Device', () => {
    beforeEach(() => {
      localStorage.clear();
      vi.clearAllMocks();
    });

    it('2.1 should render Face ID, Fingerprint, Device PIN, Pattern, and Homescreen Lock selector chips', () => {
      render(
        <BrowserRouter>
          <PasswordlessLoginCard onPasskeyLogin={vi.fn()} />
        </BrowserRouter>
      );

      expect(screen.getByRole('button', { name: /Face ID \/ Windows Hello/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Fingerprint \/ Touch ID/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Device PIN/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Pattern Lock/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Homescreen Lock \/ PIN/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/Save as trusted device/i)).toBeInTheDocument();
    });

    it('2.2 should toggle lock methods and update active state and helper text', () => {
      render(
        <BrowserRouter>
          <PasswordlessLoginCard onPasskeyLogin={vi.fn()} />
        </BrowserRouter>
      );

      const faceBtn = screen.getByRole('button', { name: /Face ID \/ Windows Hello/i });
      const bioBtn = screen.getByRole('button', { name: /Fingerprint \/ Touch ID/i });
      const pinBtn = screen.getByRole('button', { name: /Device PIN/i });
      const patternBtn = screen.getByRole('button', { name: /Pattern Lock/i });
      const screenLockBtn = screen.getByRole('button', { name: /Homescreen Lock \/ PIN/i });

      // Click Device PIN
      fireEvent.click(pinBtn);
      expect(screen.getAllByText(/Enter your 4-digit device PIN/i).length).toBeGreaterThanOrEqual(1);

      // Click Pattern Lock
      fireEvent.click(patternBtn);
      expect(screen.getAllByText(/Draw your unlock pattern/i).length).toBeGreaterThanOrEqual(1);

      // Click Homescreen Lock
      fireEvent.click(screenLockBtn);
      expect(screen.getAllByText(/Swipe or Click to Unlock/i).length).toBeGreaterThanOrEqual(1);

      // Click Fingerprint
      fireEvent.click(bioBtn);
      expect(screen.getAllByText(/Touch ID \/ Fingerprint/i).length).toBeGreaterThanOrEqual(1);

      // Click Face ID
      fireEvent.click(faceBtn);
      expect(screen.getAllByText(/Face ID \/ Windows Hello/i).length).toBeGreaterThanOrEqual(1);
    });

    it('2.3 should toggle Save as trusted device checkbox and custom device name field', () => {
      render(
        <BrowserRouter>
          <PasswordlessLoginCard onPasskeyLogin={vi.fn()} />
        </BrowserRouter>
      );

      const checkbox = screen.getByLabelText(/Save as trusted device/i) as HTMLInputElement;
      expect(checkbox.checked).toBe(true);

      const deviceInput = screen.getByLabelText(/Trusted device label/i) as HTMLInputElement;
      expect(deviceInput).toBeInTheDocument();

      fireEvent.change(deviceInput, { target: { value: 'Company ThinkPad X1' } });
      expect(deviceInput.value).toBe('Company ThinkPad X1');

      // Uncheck
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(false);
      expect(screen.queryByLabelText(/Trusted device label/i)).not.toBeInTheDocument();
    });

    it('2.4 should display Trusted Device Quick Unlock banner on LoginPage when saved device exists', async () => {
      // Simulate existing trusted device in localStorage
      localStorage.setItem(
        'wfa_trusted_device',
        JSON.stringify({
          email: 'admin@thestackly.com',
          deviceName: 'Admin Secure Laptop',
          authMethod: 'face',
          savedAt: new Date().toISOString(),
        })
      );

      render(
        <BrowserRouter>
          <LoginPage />
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Trusted Device: Admin Secure Laptop/i)).toBeInTheDocument();
        expect(screen.getByText(/Face Recognition/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Quick Unlock/i })).toBeInTheDocument();
      });

      // Clicking Quick Unlock transitions directly to Step 2
      const quickUnlockBtn = screen.getByRole('button', { name: /Quick Unlock/i });
      fireEvent.click(quickUnlockBtn);

      await waitFor(() => {
        expect(screen.getByText('Step 2 of 2: Passwordless')).toBeInTheDocument();
      });
    });

    it('2.5 should unlock when 4-digit PIN is entered in RealTimeDevicePinLock', async () => {
      const onSuccessMock = vi.fn();
      render(<RealTimeDevicePinLock onSuccess={onSuccessMock} />);

      expect(screen.getByText(/Enter your 4-digit device PIN/i)).toBeInTheDocument();

      // Enter 1 2 3 4
      fireEvent.click(screen.getByRole('button', { name: '1' }));
      fireEvent.click(screen.getByRole('button', { name: '2' }));
      fireEvent.click(screen.getByRole('button', { name: '3' }));
      fireEvent.click(screen.getByRole('button', { name: '4' }));

      await waitFor(
        () => {
          expect(onSuccessMock).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it('2.6 should unlock when demo pattern is triggered in RealTimePatternLock', async () => {
      const onSuccessMock = vi.fn();
      render(<RealTimePatternLock onSuccess={onSuccessMock} />);

      const demoBtn = screen.getByRole('button', { name: /Demo Pattern/i });
      fireEvent.click(demoBtn);

      await waitFor(
        () => {
          expect(onSuccessMock).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });

    it('2.7 should unlock when slide/click is clicked in RealTimeScreenLock', async () => {
      const onSuccessMock = vi.fn();
      render(<RealTimeScreenLock onSuccess={onSuccessMock} />);

      const unlockBtn = screen.getByRole('button', { name: /Swipe or Click to Unlock/i });
      fireEvent.click(unlockBtn);

      await waitFor(
        () => {
          expect(onSuccessMock).toHaveBeenCalled();
        },
        { timeout: 2000 }
      );
    });
  });
});
