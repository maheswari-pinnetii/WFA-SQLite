import { apiClient } from '../../services/api';

const handleApiError = (error: any, fallbackMessage: string): never => {
  const message = error.response?.data?.message || error.message || fallbackMessage;
  throw new Error(message);
};

export const authApi = {
  signup: async (signupData: any): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/auth/register', signupData);
      if (response.data && response.data.success) {
        return response.data.data || response.data;
      }
      throw new Error(response.data?.error || response.data?.message || 'Signup failed');
    } catch (error: any) {
      handleApiError(error, 'Signup failed');
    }
  },

  login: async (email: string, password?: string, mfaMethod?: string): Promise<any> => {
    const normalizedEmail = email.trim().toLowerCase();
    try {
      const response = await apiClient.post('/v1/auth/login', {
        email: normalizedEmail,
        password,
        mfaMethod
      });
      if (response.data && response.data.success) {
        return response.data.data || response.data;
      }
      throw new Error(response.data?.message || 'Login failed');
    } catch (error: any) {
      handleApiError(error, 'Login failed');
    }
  },

  verifyMfa: async (challengeId: string, otp: string): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/auth/mfa/verify', {
        challengeId,
        otp
      });
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'MFA OTP Verification failed');
    } catch (error: any) {
      handleApiError(error, 'MFA OTP Verification failed');
    }
  },

  resendMfa: async (challengeId: string, mfaMethod?: string): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/auth/mfa/resend', {
        challengeId,
        mfaMethod
      });
      if (response.data && response.data.success) {
        return response.data.data;
      }
      throw new Error(response.data?.message || 'OTP Resend failed');
    } catch (error: any) {
      handleApiError(error, 'OTP Resend failed');
    }
  },

  logout: async (refreshToken?: string): Promise<void> => {
    try {
      await apiClient.post('/v1/auth/logout', { refreshToken });
    } catch (error: any) {
      handleApiError(error, 'Logout failed');
    }
  },

  getGoogleLoginUrl: async (): Promise<string> => {
    try {
      const response = await apiClient.get('/v1/auth/sso/google');
      if (response.data && response.data.success && response.data.redirectUrl) {
        return response.data.redirectUrl;
      }
      throw new Error('Failed to get Google login URL');
    } catch (error: any) {
      return handleApiError(error, 'Google SSO initiation failed');
    }
  },

  getMicrosoftLoginUrl: async (): Promise<string> => {
    try {
      const response = await apiClient.get('/v1/auth/sso/microsoft');
      if (response.data && response.data.success && response.data.redirectUrl) {
        return response.data.redirectUrl;
      }
      throw new Error('Failed to get Microsoft login URL');
    } catch (error: any) {
      return handleApiError(error, 'Microsoft SSO initiation failed');
    }
  },

  passkeyRegisterOptions: async (email: string, fullName: string): Promise<any> => {
    const response = await apiClient.post('/api/auth/passkey/register-options', { email, fullName });
    if (!response.data?.success) throw new Error(response.data?.error || 'Unable to start passkey registration.');
    return response.data;
  },

  passkeyRegisterVerify: async (email: string, fullName: string, attestationResponse: any): Promise<any> => {
    const response = await apiClient.post('/api/auth/passkey/register-verify', { email, fullName, attestationResponse });
    if (!response.data?.success) throw new Error(response.data?.error || 'Passkey registration failed.');
    return response.data;
  },

  passkeyLoginOptions: async (email?: string): Promise<any> => {
    const response = await apiClient.post('/api/auth/passkey/login-options', { email });
    if (!response.data?.success) throw new Error(response.data?.error || 'Unable to start passkey sign-in.');
    return response.data;
  },

  passkeyLoginVerify: async (email: string, assertionResponse: any): Promise<any> => {
    const response = await apiClient.post('/api/auth/passkey/login-verify', { email, assertionResponse });
    if (!response.data?.success) throw new Error(response.data?.error || 'Passkey sign-in failed.');
    return response.data;
  },

  ssoCallback: async (code: string, state: string, provider: string): Promise<any> => {
    try {
      const response = await apiClient.post('/v1/auth/sso/callback', { code, state, provider });
      if (response.data && response.data.success) {
        return response.data;
      }
      throw new Error(response.data?.message || 'SSO authentication failed');
    } catch (error: any) {
      return handleApiError(error, 'SSO authentication failed');
    }
  },

  biometricLockLogin: async (payload: {
    email: string;
    authMethod: string;
    pin?: string;
    pattern?: number[];
    deviceFingerprint?: string;
    deviceName?: string;
    saveTrustedDevice?: boolean;
  }): Promise<any> => {
    try {
      const response = await apiClient.post('/api/auth/biometric/login', payload);
      if (response.data && response.data.success) {
        return response.data;
      }
      throw new Error(response.data?.error || response.data?.message || 'Biometric authentication failed');
    } catch (error: any) {
      handleApiError(error, 'Biometric authentication failed');
    }
  }
};

