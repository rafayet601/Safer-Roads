import { v4 as uuidv4 } from 'uuid';
import type { UserRewards, Mission, Achievement } from '../shared/types.js';

export type { UserRewards, Mission, Achievement };

// In-memory storage
const userRewards = new Map<string, UserRewards>();
const userMissions = new Map<string, Mission[]>();
const userAchievements = new Map<string, Achievement[]>();

// Default missions
const defaultMissions: Omit<Mission, 'progress' | 'completed' | 'completedAt'>[] = [
  {
    id: 'mission_1',
    title: 'Complete 5 Trips',
    description: 'Complete a total of 5 trips',
    type: 'trip_count',
    target: 5,
  },
  {
    id: 'mission_2',
    title: 'Score 90+ on 3 Trips',
    description: 'Get a score of 90 or higher on 3 trips',
    type: 'high_score',
    target: 3,
  },
];

// Default achievements
const defaultAchievements: Omit<Achievement, 'unlocked' | 'unlockedAt'>[] = [
  {
    id: 'achievement_first_trip',
    title: 'First Trip',
    description: 'Complete your first trip',
    type: 'first_trip',
  },
  {
    id: 'achievement_streak_7_days',
    title: 'Safe Driver 7 Days',
    description: 'Maintain a 7-day driving streak',
    type: 'streak_7_days',
  },
  {
    id: 'achievement_points_100',
    title: '100 Points Club',
    description: 'Earn 100 total points',
    type: 'points_100',
  },
];

export class RewardsService {
  /**
   * Calculate user level based on total points
   */
  calculateLevel(points: number): 'Bronze' | 'Silver' | 'Gold' {
    if (points >= 1000) return 'Gold';
    if (points >= 500) return 'Silver';
    return 'Bronze';
  }

  /**
   * Ensure user rewards exist (initialize if not)
   */
  private ensureUserRewards(userId: string): UserRewards {
    if (!userRewards.has(userId)) {
      const rewards: UserRewards = {
        userId,
        points: 0,
        streak: 0,
        level: 'Bronze',
        totalTrips: 0,
        highScoreTrips: 0,
      };
      userRewards.set(userId, rewards);
    }
    return userRewards.get(userId)!;
  }

  /**
   * Ensure user missions exist (initialize if not)
   */
  private ensureUserMissions(userId: string): Mission[] {
    if (!userMissions.has(userId)) {
      const missions: Mission[] = defaultMissions.map((m) => ({
        ...m,
        progress: 0,
        completed: false,
      }));
      userMissions.set(userId, missions);
    }
    return userMissions.get(userId)!;
  }

  /**
   * Ensure user achievements exist (initialize if not)
   */
  private ensureUserAchievements(userId: string): Achievement[] {
    if (!userAchievements.has(userId)) {
      const achievements: Achievement[] = defaultAchievements.map((a) => ({
        ...a,
        unlocked: false,
      }));
      userAchievements.set(userId, achievements);
    }
    return userAchievements.get(userId)!;
  }

  /**
   * Get user rewards summary
   */
  async getUserRewards(userId: string): Promise<UserRewards> {
    return this.ensureUserRewards(userId);
  }

  /**
   * Get user missions
   */
  async getUserMissions(userId: string): Promise<Mission[]> {
    return this.ensureUserMissions(userId);
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId: string): Promise<Achievement[]> {
    return this.ensureUserAchievements(userId);
  }

  /**
   * Award points after trip scoring
   * MVP Rules:
   * - Points: 10 points per trip + bonus based on score (score * 0.5)
   * - Streak: +1 day for each trip with score >= 80
   * - Level: Calculate from total points (0-499: Bronze, 500-999: Silver, 1000+: Gold)
   */
  async awardPoints(userId: string, score: number): Promise<UserRewards> {
    const rewards = this.ensureUserRewards(userId);

    // Calculate points: 10 base + score bonus
    const basePoints = 10;
    const scoreBonus = Math.floor(score * 0.5);
    const earnedPoints = basePoints + scoreBonus;

    // Update streak if score >= 80
    const newStreak = score >= 80 ? rewards.streak + 1 : rewards.streak;

    // Calculate new total points and level
    const newTotalPoints = rewards.points + earnedPoints;
    const newLevel = this.calculateLevel(newTotalPoints);

    // Update trip counts
    const newTotalTrips = rewards.totalTrips + 1;
    const newHighScoreTrips = score >= 90 ? rewards.highScoreTrips + 1 : rewards.highScoreTrips;

    const updatedRewards: UserRewards = {
      userId,
      points: newTotalPoints,
      streak: newStreak,
      level: newLevel,
      totalTrips: newTotalTrips,
      highScoreTrips: newHighScoreTrips,
    };

    userRewards.set(userId, updatedRewards);

    // Update missions
    await this.updateMissions(userId, newTotalTrips, newHighScoreTrips, score);

    // Update achievements
    await this.updateAchievements(userId, updatedRewards);

    return updatedRewards;
  }

  /**
   * Update missions progress
   */
  private async updateMissions(
    userId: string,
    totalTrips: number,
    highScoreTrips: number,
    _score: number
  ): Promise<void> {
    const missions = this.ensureUserMissions(userId);

    const updatedMissions = missions.map((mission) => {
      let progress = mission.progress;

      if (mission.type === 'trip_count') {
        progress = totalTrips;
      } else if (mission.type === 'high_score') {
        progress = highScoreTrips;
      }

      const completed = progress >= mission.target;
      const completedAt = completed && !mission.completed ? new Date() : mission.completedAt;

      return {
        ...mission,
        progress,
        completed,
        completedAt,
      };
    });

    userMissions.set(userId, updatedMissions);
  }

  /**
   * Update achievements based on rewards
   */
  private async updateAchievements(userId: string, rewards: UserRewards): Promise<void> {
    const achievements = this.ensureUserAchievements(userId);

    const updatedAchievements = achievements.map((achievement) => {
      if (achievement.unlocked) return achievement;

      let unlocked = false;

      switch (achievement.type) {
        case 'first_trip':
          unlocked = rewards.totalTrips >= 1;
          break;
        case 'streak_7_days':
          unlocked = rewards.streak >= 7;
          break;
        case 'points_100':
          unlocked = rewards.points >= 100;
          break;
      }

      const unlockedAt = unlocked && !achievement.unlocked ? new Date() : achievement.unlockedAt;

      return {
        ...achievement,
        unlocked,
        unlockedAt,
      };
    });

    userAchievements.set(userId, updatedAchievements);
  }
}
