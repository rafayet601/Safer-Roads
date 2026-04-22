import { Router, type Request, type Response, type NextFunction } from 'express';
import { z } from 'zod';
import { ScoringService, getScoreOrThrow } from '../services/scoring-service.js';
import { authenticate } from '../middleware/auth.js';
import { createResponse, UnsafeEventType, type EventSeverity } from '../shared/types.js';
import { ValidationError, NotFoundError } from '../shared/errors.js';

export const scoresRouter = Router();
const scoringService = new ScoringService();

// Validation schemas
const calculateScoreSchema = z.object({
  tripId: z.string().uuid(),
});

const addUnsafeEventSchema = z.object({
  tripId: z.string().uuid(),
  eventType: z.enum(['speeding', 'harsh_braking', 'harsh_acceleration', 'phone_distraction']),
  timestamp: z.string().datetime(),
  latitude: z.number(),
  longitude: z.number(),
  severity: z.enum(['low', 'medium', 'high']),
});

// GET /v1/scores/:tripId - Get score for a specific trip
scoresRouter.get('/:tripId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId } = req.params;

    const score = await scoringService.getScoreByTripId(tripId);
    if (!score) {
      throw new NotFoundError('Score for trip');
    }

    res.json(createResponse(score));
  } catch (error) {
    next(error);
  }
});

// POST /v1/scores/calculate - Calculate score for a trip (trigger scoring)
scoresRouter.post('/calculate', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = calculateScoreSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ValidationError('Invalid request', {
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { tripId } = validationResult.data;
    const score = await scoringService.calculateScore(tripId);

    res.json(createResponse(score));
  } catch (error) {
    next(error);
  }
});

// GET /v1/scores/events/:tripId - Get unsafe events for a trip
scoresRouter.get('/events/:tripId', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { tripId } = req.params;

    const events = await scoringService.getUnsafeEventsByTripId(tripId);

    res.json(createResponse({ events, tripId }));
  } catch (error) {
    next(error);
  }
});

// POST /v1/scores/events - Add an unsafe event (for testing/internal use)
scoresRouter.post('/events', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validationResult = addUnsafeEventSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      throw new ValidationError('Invalid request', {
        errors: validationResult.error.flatten().fieldErrors,
      });
    }

    const { tripId, eventType, timestamp, latitude, longitude, severity } = validationResult.data;

    const event = await scoringService.addUnsafeEvent({
      tripId,
      eventType: eventType as UnsafeEventType,
      timestamp: new Date(timestamp),
      latitude,
      longitude,
      severity: severity as EventSeverity,
    });

    res.json(createResponse(event));
  } catch (error) {
    next(error);
  }
});
