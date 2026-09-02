/**
 * Backend Authentication Flow Types
 * Express Request/Response Payloads for Password & Passkey (WebAuthn) Endpoints
 */

export type AuthMethod = 'password' | 'passkey';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role?: string;
  avatar?: string;
  createdAt?: string;
  hasPasskey?: boolean;
}

export interface EmailLoginPayload {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface PasswordlessLoginPayload {
  email?: string;
  credentialId?: string;
  assertionResponse?: AuthenticationResponseJSON;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  authMethod: AuthMethod;
  password?: string;
  passkeyRegistration?: RegistrationResponseJSON;
}

export interface PublicKeyCredentialCreationOptionsJSON {
  challenge: string;
  rp: {
    name: string;
    id?: string;
  };
  user: {
    id: string;
    name: string;
    displayName: string;
  };
  pubKeyCredParams: Array<{
    alg: number;
    type: 'public-key';
  }>;
  timeout?: number;
  attestation?: 'none' | 'indirect' | 'direct';
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    residentKey?: 'discouraged' | 'preferred' | 'required';
    requireResidentKey?: boolean;
    userVerification?: 'required' | 'preferred' | 'discouraged';
  };
  excludeCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: Array<'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid'>;
  }>;
}

export interface PublicKeyCredentialRequestOptionsJSON {
  challenge: string;
  timeout?: number;
  rpId?: string;
  allowCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: Array<'usb' | 'nfc' | 'ble' | 'internal' | 'hybrid'>;
  }>;
  userVerification?: 'required' | 'preferred' | 'discouraged';
}

export interface RegistrationResponseJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    attestationObject: string;
    transports?: string[];
  };
  type: 'public-key';
  clientExtensionResults?: Record<string, unknown>;
  authenticatorAttachment?: string;
}

export interface AuthenticationResponseJSON {
  id: string;
  rawId: string;
  response: {
    clientDataJSON: string;
    authenticatorData: string;
    signature: string;
    userHandle?: string;
  };
  type: 'public-key';
  clientExtensionResults?: Record<string, unknown>;
  authenticatorAttachment?: string;
}

export interface PasskeyCredentialRecord {
  id: string;
  userId: string;
  credentialId: string;
  publicKey: string;
  counter: number;
  transports?: string[];
  createdAt: string;
  deviceLabel?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  refreshToken?: string;
  user?: UserProfile;
  requiresPasskey?: boolean;
}

export interface PasskeyRegistrationOptionsResponse {
  success: boolean;
  options: PublicKeyCredentialCreationOptionsJSON;
  challenge: string;
}

export interface PasskeyLoginOptionsResponse {
  success: boolean;
  options: PublicKeyCredentialRequestOptionsJSON;
  challenge: string;
}

export interface PasskeyVerifyResponse {
  success: boolean;
  verified: boolean;
  token?: string;
  user?: UserProfile;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}
