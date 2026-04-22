import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthTokens } from '../types';
import api from '../services/api';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  loadStoredAuth: () => Promise<void>;
  clearError: () => void;
}

const STORAGE_KEYS = {
  USER: '@auth_user',
  TOKENS: '@auth_tokens',
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  tokens: null,
  isLoading: false,
  isAuthenticated: false,
  error: null,

  login: async (email: string, password: string) => {
    set({ isLoading: true, error: null });
    try {
      const { user, tokens } = await api.login({ email, password });
      
      // Store credentials
      await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      await AsyncStorage.setItem(STORAGE_KEYS.TOKENS, JSON.stringify(tokens));
      
      // Set API token
      api.setAccessToken(tokens.accessToken);
      
      set({ user, tokens, isLoading: false, isAuthenticated: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  signup: async (email: string, password: string, firstName: string, lastName: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.signup({ email, password, firstName, lastName });
      
      // Auto-login after signup
      await get().login(email, password);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Signup failed';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await api.logout();
    } catch {
      // Ignore logout errors
    } finally {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER);
      await AsyncStorage.removeItem(STORAGE_KEYS.TOKENS);
      api.setAccessToken(null);
      set({ user: null, tokens: null, isLoading: false, isAuthenticated: false });
    }
  },

  loadStoredAuth: async () => {
    set({ isLoading: true });
    try {
      const [userJson, tokensJson] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER),
        AsyncStorage.getItem(STORAGE_KEYS.TOKENS),
      ]);

      if (userJson && tokensJson) {
        const user = JSON.parse(userJson) as User;
        const tokens = JSON.parse(tokensJson) as AuthTokens;
        
        api.setAccessToken(tokens.accessToken);
        
        set({ user, tokens, isLoading: false, isAuthenticated: true });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false, isAuthenticated: false });
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
