import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { 
  User, 
  AuthTokens, 
  LoginCredentials, 
  SignupData, 
  Trip, 
  ScoreResult,
  DashboardData,
  SavingsProjection,
  Reward,
  Achievement,
  ApiResponse 
} from '../types';

const BASE_URL = 'http://localhost:3007/v1'; // Use gateway

class ApiClient {
  public client: AxiosInstance; // Make it public
  private accessToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Handle token refresh or logout
          this.accessToken = null;
        }
        return Promise.reject(error);
      }
    );
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
  }

  // Auth endpoints
  async login(credentials: LoginCredentials): Promise<{ user: User; tokens: AuthTokens }> {
    const response = await this.client.post<ApiResponse<{ user: User; tokens: AuthTokens }>>(
      '/auth/login',
      credentials
    );
    this.setAccessToken(response.data.data.tokens.accessToken);
    return response.data.data;
  }

  async signup(data: SignupData): Promise<{ userId: string }> {
    const response = await this.client.post<ApiResponse<{ userId: string }>>(
      '/auth/signup',
      data
    );
    return response.data.data;
  }

  async logout(): Promise<void> {
    await this.client.post('/auth/logout');
    this.setAccessToken(null);
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    const response = await this.client.post<ApiResponse<AuthTokens>>(
      '/auth/refresh',
      { refreshToken }
    );
    this.setAccessToken(response.data.data.accessToken);
    return response.data.data;
  }

  // User endpoints
  async getProfile(): Promise<User> {
    const response = await this.client.get<ApiResponse<User>>('/users/profile');
    return response.data.data;
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await this.client.patch<ApiResponse<User>>(
      '/users/profile',
      data
    );
    return response.data.data;
  }

  // Trip endpoints
  async getTrips(page = 1, limit = 20): Promise<{ trips: Trip[]; total: number }> {
    const response = await this.client.get<ApiResponse<Trip[]>>('/trips', {
      params: { page, limit },
    });
    return {
      trips: response.data.data,
      total: response.data.meta?.total || 0,
    };
  }

  async getTripById(tripId: string): Promise<Trip> {
    const response = await this.client.get<ApiResponse<Trip>>(`/trips/${tripId}`);
    return response.data.data;
  }

  async getActiveTrip(): Promise<Trip | null> {
    const response = await this.client.get<ApiResponse<Trip | null>>('/trips/active');
    return response.data.data;
  }

  async startTrip(): Promise<Trip> {
    const response = await this.client.post<ApiResponse<Trip>>('/trips/start');
    return response.data.data;
  }

  async endTrip(tripId: string): Promise<Trip> {
    const response = await this.client.post<ApiResponse<Trip>>(`/trips/${tripId}/end`);
    return response.data.data;
  }

  // Scoring endpoints
  async getTripScore(tripId: string): Promise<ScoreResult> {
    const response = await this.client.get<ApiResponse<ScoreResult>>(
      `/scores/trips/${tripId}`
    );
    return response.data.data;
  }

  async getUserScores(period: 'day' | 'week' | 'month' | 'all'): Promise<number[]> {
    const response = await this.client.get<ApiResponse<number[]>>('/scores', {
      params: { period },
    });
    return response.data.data;
  }

  // Dashboard endpoints
  async getDashboard(): Promise<DashboardData> {
    const response = await this.client.get<ApiResponse<DashboardData>>('/dashboard');
    return response.data.data;
  }

  // Rewards endpoints
  async getRewards(): Promise<Reward[]> {
    const response = await this.client.get<ApiResponse<Reward[]>>('/rewards');
    return response.data.data;
  }

  async getAchievements(): Promise<Achievement[]> {
    const response = await this.client.get<ApiResponse<Achievement[]>>('/rewards/achievements');
    return response.data.data;
  }

  async claimReward(rewardId: string): Promise<Reward> {
    const response = await this.client.post<ApiResponse<Reward>>(
      `/rewards/${rewardId}/claim`
    );
    return response.data.data;
  }

  // Savings endpoints
  async getSavingsProjection(): Promise<SavingsProjection> {
    const response = await this.client.get<ApiResponse<SavingsProjection>>(
      '/savings/projection'
    );
    return response.data.data;
  }
}

export const api = new ApiClient();
export default api;
