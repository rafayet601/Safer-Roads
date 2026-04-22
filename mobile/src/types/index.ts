// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  createdAt: string;
  totalTrips: number;
  averageScore: number;
  currentStreak: number;
  totalPoints: number;
  membershipLevel: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Trip Types
export type TripStatus = 'active' | 'completed' | 'aborted';

export interface Trip {
  id: string;
  userId: string;
  startedAt: string;
  endedAt?: string;
  status: TripStatus;
  startLocation: Location;
  endLocation?: Location;
  distance: number; // in kilometers
  duration: number; // in seconds
  score: number;
  events: TelemetryEvent[];
}

export interface Location {
  latitude: number;
  longitude: number;
  address?: string;
}

export interface TelemetryEvent {
  id: string;
  tripId: string;
  type: EventType;
  timestamp: string;
  location: Location;
  severity?: 'low' | 'medium' | 'high';
  details?: Record<string, unknown>;
}

export type EventType = 
  | 'hard_brake'
  | 'hard_acceleration'
  | 'speeding'
  | 'phone_usage'
  | 'rapid_lane_change'
  | 'fatigue';

// Scoring Types
export interface ScoreResult {
  tripId: string;
  overallScore: number;
  categories: ScoreCategory[];
  breakdown: ScoreBreakdown;
  riskFactors: string[];
  suggestions: string[];
}

export interface ScoreCategory {
  name: string;
  score: number;
  weight: number;
}

export interface ScoreBreakdown {
  speed: number;
  braking: number;
  acceleration: number;
  laneDiscipline: number;
  focus: number;
}

// Rewards Types
export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'badge' | 'points' | 'discount' | 'gift';
  icon: string;
  pointsCost?: number;
  unlockedAt?: string;
  progress?: number;
  target?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  progress: number;
  target: number;
}

export interface UserStats {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  tripsThisWeek: number;
  tripsThisMonth: number;
  badges: Achievement[];
}

// Savings Types
export interface SavingsProjection {
  currentPremium: number;
  estimatedSavings: number;
  discountPercentage: number;
  projectedPremium: number;
  factors: SavingsFactor[];
  history: SavingsHistoryItem[];
}

export interface SavingsFactor {
  name: string;
  impact: number; // percentage
  description: string;
}

export interface SavingsHistoryItem {
  month: string;
  savings: number;
  score: number;
}

// Dashboard Types
export interface DashboardData {
  user: User;
  todayScore: number;
  weeklyScores: number[];
  recentTrips: Trip[];
  currentReward: Reward | null;
  savingsProjection: SavingsProjection;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Navigation Types
export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  Signup: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Dashboard: undefined;
  Trips: undefined;
  Rewards: undefined;
  Savings: undefined;
  Profile: undefined;
};

export type TripStackParamList = {
  TripHistory: undefined;
  TripDetail: { tripId: string };
};

// Telemetry Types
export interface TelemetrySample {
  timestamp: string; // ISO date-time string
  latitude: number;
  longitude: number;
  speedKmh: number;
  accelerationMps2: number;
  brakingForce: number;
  phoneUsageDetected: boolean;
}
