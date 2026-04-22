import { Router, type Request, type Response, type NextFunction } from 'express';
import { PricingService } from '../services/pricing-service.js';
import { authenticate } from '../middleware/auth.js';
import { createResponse } from '../shared/types.js';
import { ValidationError } from '../shared/errors.js';
import { z } from 'zod';

export const pricingRouter = Router();
const pricingService = new PricingService();

const calculatorQuerySchema = z.object({
  score: z.coerce.number().min(0).max(100).optional(),
});

pricingRouter.get('/savings', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    const savingsInfo = await pricingService.getSavingsInfo(userId);
    const projection = await pricingService.getSavingsProjection(userId);

    const response = {
      savings: savingsInfo,
      projection,
      disclaimer: 'Savings are estimates and not guaranteed',
    };

    res.json(createResponse(response));
  } catch (error) {
    next(error);
  }
});

pricingRouter.get('/calculator', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      throw new ValidationError('User not authenticated');
    }

    const queryValidation = calculatorQuerySchema.safeParse(req.query);
    if (!queryValidation.success) {
      throw new ValidationError('Invalid query parameters', {
        details: queryValidation.error.flatten(),
      });
    }

    const { score } = queryValidation.data;

    const result = await pricingService.calculateScenario({
      userId,
      hypotheticalScore: score,
    });

    res.json(createResponse(result));
  } catch (error) {
    next(error);
  }
});
