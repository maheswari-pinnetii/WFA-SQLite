import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { loginUserThunk, logoutUserThunk, logoutAction, clearError, loginSuccessAction, initializeAuthThunk } from '../store/authSlice';
import { Role } from '../../security/roles/roles';
import { authService } from '../services/auth.service';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const authState = useSelector((state: RootState) => state.auth);

  const initializeAuth = () => dispatch(initializeAuthThunk());

  const login = (emailOrPayload: string | { email: string; password?: string }, password?: string) => {
    if (typeof emailOrPayload === 'object' && emailOrPayload !== null) {
      return dispatch(loginUserThunk({ email: emailOrPayload.email, password: emailOrPayload.password }));
    }
    return dispatch(loginUserThunk({ email: emailOrPayload, password }));
  };

  const signup = async (signupData: any) => {
    return await authService.signup(signupData);
  };

  const verifyMfa = async (challengeId: string, code: string) => {
    const data = await authService.verifyMfa(challengeId, code);
    dispatch(loginSuccessAction(data));
    return data;
  };

  const resendMfa = async (challengeId: string, mfaMethod?: string) => {
    return await authService.resendMfa(challengeId, mfaMethod);
  };
  
  const logout = () => {
    authService.logout();
    dispatch(logoutAction());
    dispatch(logoutUserThunk());
  };

  const setSession = (data: { user: any; token: string }) => dispatch(loginSuccessAction(data));
  const dismissError = () => dispatch(clearError());

  return {
    ...authState,
    login,
    setSession,
    signup,
    verifyMfa,
    resendMfa,
    logout,
    dismissError,
    initializeAuth,
    role: authState.user?.role || Role.EMPLOYEE,
    permissions: authState.user?.permissions || [],
  };
};
