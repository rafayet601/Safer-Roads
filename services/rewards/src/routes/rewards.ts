import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { RewardsService } from '../services/rewards-service.js';
import { authenticate } from '../middleware/auth.js';
import { createResponse } from '../shared/types.js';
import { UnauthorizedError, ValidationError } from '../shared/errors.js';

export const rewardsRouter = Router();
const rewardsService = new RewardsService();

// Schema for award points request
const awardPointsSchema = z.object({
  userId: z.string().uuid(),
  tripId: z.string().uuid(),
  score: z.number().min(0).max(100),
});

// GET /v1/rewards - Get user rewards summary
rewardsRouter.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const rewards = await rewardsService.getUserRewards(userId);

      const response = {
        points: rewards.points,
        streak: rewards.streak,
        level: rewards.level,
        totalTrips: rewards.totalTrips,
        highScoreTrips: rewards.highScoreTrips,
      };

      res.json(createResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

// GET /v1/rewards/missions - Get user missions
rewardsRouter.get(
  '/missions',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const missions = await rewardsService.getUserMissions(userId);

      const response = missions.map((mission) => ({
        id: mission.id,
        title: mission.title,
        description: mission.description,
        target: mission.target,
        progress: mission.progress,
        completed: mission.completed,
        completedAt: mission.completedAt?.toISOString(),
      }));

      res.json(createResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

// GET /v1/rewards/achievements - Get user achievements/badges
rewardsRouter.get(
  '/achievements',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const achievements = await rewardsService.getUserAchievements(userId);

      const response = achievements.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        description: achievement.description,
        type: achievement.type,
        unlocked: achievement.unlocked,
        unlockedAt: achievement.unlockedAt?.toISOString(),
      }));

      res.json(createResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

// POST /v1/rewards/award - Award points (called after trip scoring)
rewardsRouter.post(
  '/award',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // This endpoint can be called by internal services
      // For now, check auth but also allow body to specify userId for service-to-service calls
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const parsed = awardPointsSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', {
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { userId: bodyUserId, tripId, score } = parsed.data;

      // Ensure the authenticated user matches the body userId
      // Or allow if called with admin privileges (simplified for MVP)
      if (userId !== bodyUserId) {
        throw new UnauthorizedError('Cannot award points for another user');
      }

      const rewards = await rewardsService.awardPoints(bodyUserId, score);

      const response = {
        tripId,
        pointsAwarded: 10 + Math.floor(score * 0.5),
        totalPoints: rewards.points,
        newStreak: rewards.streak,
        newLevel: rewards.level,
      };

      res.json(createResponse(response));
    } catch (error) {
      next(error);
    }
  }
);
