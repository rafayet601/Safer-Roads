import { useCallback } from 'react';
import { useAuthStore } from '../store/authStore';

export const useAuth = () => {
  const {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    error,
    login: storeLogin,
    signup: storeSignup,
    logout: storeLogout,
    loadStoredAuth,
    clearError,
  } = useAuthStore();

  const login = useCallback(
    async (email: string, password: string) => {
      await storeLogin(email, password);
    },
    [storeLogin]
  );

  const signup = useCallback(
    async (email: string, password: string, firstName: string, lastName: string) => {
      await storeSignup(email, password, firstName, lastName);
    },
    [storeSignup]
  );

  const logout = useCallback(async () => {
    await storeLogout();
  }, [storeLogout]);

  return {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    error,
    login,
    signup,
    logout,
    loadStoredAuth,
    clearError,
  };
};

export default useAuth;
