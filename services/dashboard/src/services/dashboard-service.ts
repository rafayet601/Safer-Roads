import { v4 as uuidv4 } from 'uuid';
import { UnsafeEventType, TripStatus } from '../shared/types.js';

// Types for the dashboard service
export interface DashboardSummary {
  recentTrips: RecentTrip[];
  averageScore: number;
  totalTrips: number;
  topRiskCategories: RiskCategory[];
  premiumSavings: number;
}

export interface RecentTrip {
  id: string;
  date: string;
  distance: number;
  duration: number;
  score: number;
}

export interface RiskCategory {
  type: UnsafeEventType;
  count: number;
  severity: string;
}

export interface WeeklyTrend {
  week: string;
  averageScore: number;
  tripCount: number;
}

export interface Trip {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  status: TripStatus;
  startLatitude: number;
  startLongitude: number;
  endLatitude: number;
  endLongitude: number;
  distanceMeters?: number;
  durationSeconds?: number;
}

export interface ScoreResult {
  tripId: string;
  overallScore: number;
  maxScore: number;
  eventImpacts: unknown[];
  explanations: unknown[];
  scoredAt: Date;
}

// Mock data stores for MVP (in production, these would call other services)
const mockTrips: Trip[] = [];
const mockScores: ScoreResult[] = [];

// Initialize with sample data
function initializeMockData(): void {
  if (mockTrips.length > 0) return;

  const now = new Date();
  const userId = 'demo-user-id';

  // Create sample trips for the past 2 weeks
  for (let i = 0; i < 12; i++) {
    const daysAgo = i * 1;
    const tripDate = new Date(now);
    tripDate.setDate(tripDate.getDate() - daysAgo);

    const trip: Trip = {
      id: uuidv4(),
      userId,
      startedAt: tripDate,
      endedAt: new Date(tripDate.getTime() + 20 * 60 * 1000), // 20 min trip
      status: TripStatus.COMPLETED,
      startLatitude: 37.7749,
      startLongitude: -122.4194,
      endLatitude: 37.7849,
      endLongitude: -122.4094,
      distanceMeters: 5000 + Math.floor(Math.random() * 10000),
      durationSeconds: 20 * 60 + Math.floor(Math.random() * 15 * 60),
    };

    mockTrips.push(trip);

    // Create corresponding score
    const score = 70 + Math.floor(Math.random() * 30);
    const scoreResult: ScoreResult = {
      tripId: trip.id,
      overallScore: score,
      maxScore: 100,
      eventImpacts: [],
      explanations: [],
      scoredAt: new Date(tripDate.getTime() + 20 * 60 * 1000),
    };

    mockScores.push(scoreResult);
  }

  // Sort trips by date descending
  mockTrips.sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime());
  mockScores.sort((a, b) => b.scoredAt.getTime() - a.scoredAt.getTime());
}

export class DashboardService {
  constructor() {
    initializeMockData();
  }

  async getDashboardSummary(userId: string): Promise<DashboardSummary> {
    // Get user's trips from mock store
    const userTrips = mockTrips.filter((t) => t.userId === userId).slice(0, 5);
    const userScores = mockScores.filter((s) =>
      userTrips.some((t) => t.id === s.tripId)
    );

    // Recent trips (last 5)
    const recentTrips: RecentTrip[] = userTrips.map((trip) => {
      const score = userScores.find((s) => s.tripId === trip.id);
      return {
        id: trip.id,
        date: trip.startedAt.toISOString(),
        distance: trip.distanceMeters || 0,
        duration: trip.durationSeconds || 0,
        score: score?.overallScore || 0,
      };
    });

    // Calculate average score (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentScores = mockScores.filter(
      (s) => s.scoredAt >= sevenDaysAgo
    );

    const averageScore = recentScores.length > 0
      ? Math.round(
          recentScores.reduce((sum, s) => sum + s.overallScore, 0) / recentScores.length
        )
      : 0;

    // Top risk categories (mock data for MVP)
    const topRiskCategories: RiskCategory[] = [
      {
        type: UnsafeEventType.SPEEDING,
        count: Math.floor(Math.random() * 10) + 1,
        severity: 'medium',
      },
      {
        type: UnsafeEventType.HARSH_BRAKING,
        count: Math.floor(Math.random() * 8) + 1,
        severity: 'low',
      },
      {
        type: UnsafeEventType.HARSH_ACCELERATION,
        count: Math.floor(Math.random() * 5) + 1,
        severity: 'low',
      },
      {
        type: UnsafeEventType.PHONE_DISTRACTION,
        count: Math.floor(Math.random() * 3),
        severity: 'high',
      },
    ].sort((a, b) => b.count - a.count);

    // Calculate premium savings (mock calculation)
    // Higher score = more savings, capped at 30%
    const premiumSavings = Math.round((averageScore / 100) * 30 * 50); // $50 base premium

    return {
      recentTrips,
      averageScore,
      totalTrips: userTrips.length,
      topRiskCategories,
      premiumSavings,
    };
  }

  async getWeeklyTrends(userId: string): Promise<WeeklyTrend[]> {
    const trends: WeeklyTrend[] = [];
    const now = new Date();

    // Generate 8 weeks of trend data
    for (let week = 7; week >= 0; week--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - week * 7);

      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 7);

      // Get scores for this week
      const weekScores = mockScores.filter(
        (s) =>
          s.scoredAt >= weekStart &&
          s.scoredAt < weekEnd
      );

      const averageScore =
        weekScores.length > 0
          ? Math.round(
              weekScores.reduce((sum, s) => sum + s.overallScore, 0) / weekScores.length
            )
          : 0;

      trends.push({
        week: weekStart.toISOString().split('T')[0],
        averageScore,
        tripCount: weekScores.length,
      });
    }

    return trends;
  }
}
