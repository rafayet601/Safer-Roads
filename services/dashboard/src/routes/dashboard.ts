import { Router, type Request, type Response, type NextFunction } from 'express';
import type { RequestWithUser } from '../shared/types.js';
import { createResponse } from '../shared/types.js';
import { authenticate } from '../middleware/auth.js';
import { DashboardService } from '../services/dashboard-service.js';
import type { DashboardSummary, WeeklyTrend } from '../services/dashboard-service.js';

export const dashboardRouter = Router();
const dashboardService = new DashboardService();

/**
 * GET /v1/dashboard
 * Get dashboard summary with recent trips, score trends, and top risks
 */
dashboardRouter.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as RequestWithUser).user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User ID not found in token',
          },
        });
        return;
      }

      const summary: DashboardSummary = await dashboardService.getDashboardSummary(userId);

      res.json(createResponse(summary));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /v1/dashboard/trends
 * Get score trends over time (weekly)
 */
dashboardRouter.get(
  '/trends',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = (req as RequestWithUser).user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            code: 'UNAUTHORIZED',
            message: 'User ID not found in token',
          },
        });
        return;
      }

      const trends: WeeklyTrend[] = await dashboardService.getWeeklyTrends(userId);

      res.json(createResponse(trends));
    } catch (error) {
      next(error);
    }
  }
);
