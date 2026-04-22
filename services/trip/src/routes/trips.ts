import { Router, type Request, type Response, type NextFunction } from 'express';
import { TripService } from '../services/trip-service.js';
import { authenticate } from '../middleware/auth.js';
import {
  startTripSchema,
  telemetryBatchSchema,
  completeTripSchema,
  listTripsQuerySchema,
  type TripSummaryResponse,
  type TripDetailResponse,
  type TelemetryAcceptedResponse,
  type TripCompletedResponse,
} from '../types.js';
import { createResponse, createPaginatedResponse } from '../shared/types.js';
import {
  NotFoundError,
  ConflictError,
  ValidationError,
  UnauthorizedError,
} from '../shared/errors.js';

export const tripRouter = Router();
const tripService = new TripService();

// POST /v1/trips - Start a new trip session
tripRouter.post(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const parsed = startTripSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', {
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const input = parsed.data;
      const trip = await tripService.startTrip({
        userId,
        startLatitude: input.startLocation?.latitude,
        startLongitude: input.startLocation?.longitude,
      });

      const response: TripCompletedResponse = {
        tripId: trip.id,
        status: trip.status,
        message: 'Trip started successfully',
      };

      res.status(201).json(createResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

// GET /v1/trips - List user's trips
tripRouter.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const parsed = listTripsQuerySchema.safeParse(req.query);
      if (!parsed.success) {
        throw new ValidationError('Invalid query parameters', {
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { limit, offset } = parsed.data;
      const { trips, total } = await tripService.findByUserId(userId, limit, offset);

      const tripSummaries: TripSummaryResponse[] = trips.map((trip) => ({
        tripId: trip.id,
        startTime: trip.startedAt.toISOString(),
        endTime: trip.endedAt?.toISOString(),
        distanceKm: trip.distanceMeters ? trip.distanceMeters / 1000 : undefined,
        durationMinutes: trip.durationSeconds
          ? Math.round(trip.durationSeconds / 60)
          : undefined,
        tripScore: undefined, // Would come from scoring service
        status: trip.status === 'active' ? 'active' : trip.status,
      }));

      res.json(createPaginatedResponse(tripSummaries, offset / limit + 1, limit, total));
    } catch (error) {
      next(error);
    }
  }
);

// GET /v1/trips/:id - Get trip details
tripRouter.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const tripId = req.params.id;
      const trip = await tripService.findById(tripId);

      if (!trip) {
        throw new NotFoundError('Trip');
      }

      // Ensure user can only access their own trips
      if (trip.userId !== userId) {
        throw new NotFoundError('Trip');
      }

      const telemetryCount = await tripService.getTelemetryCount(tripId);

      const response: TripDetailResponse = {
        tripId: trip.id,
        startTime: trip.startedAt.toISOString(),
        endTime: trip.endedAt?.toISOString(),
        distanceKm: trip.distanceMeters ? trip.distanceMeters / 1000 : undefined,
        durationMinutes: trip.durationSeconds
          ? Math.round(trip.durationSeconds / 60)
          : undefined,
        tripScore: undefined, // Would come from scoring service
        status: trip.status === 'active' ? 'active' : trip.status,
        startLatitude: trip.startLatitude,
        startLongitude: trip.startLongitude,
        endLatitude: trip.endLatitude,
        endLongitude: trip.endLongitude,
        telemetryCount,
      };

      res.json(createResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

// POST /v1/trips/:id/telemetry - Ingest batch telemetry
tripRouter.post(
  '/:id/telemetry',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const tripId = req.params.id;
      const trip = await tripService.findById(tripId);

      if (!trip) {
        throw new NotFoundError('Trip');
      }

      // Ensure user can only add telemetry to their own trips
      if (trip.userId !== userId) {
        throw new NotFoundError('Trip');
      }

      const parsed = telemetryBatchSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', {
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { batchId, telemetryData } = parsed.data;
      const { eventsAccepted } = await tripService.ingestTelemetry({
        tripId,
        batchId,
        events: telemetryData,
      });

      const response: TelemetryAcceptedResponse = {
        batchId,
        eventsAccepted,
      };

      res.status(202).json(createResponse(response));
    } catch (error) {
      next(error);
    }
  }
);

// POST /v1/trips/:id/complete - Complete trip
tripRouter.post(
  '/:id/complete',
  authenticate,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        throw new UnauthorizedError('User not authenticated');
      }

      const tripId = req.params.id;
      const trip = await tripService.findById(tripId);

      if (!trip) {
        throw new NotFoundError('Trip');
      }

      // Ensure user can only complete their own trips
      if (trip.userId !== userId) {
        throw new NotFoundError('Trip');
      }

      const parsed = completeTripSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid request body', {
          errors: parsed.error.flatten().fieldErrors,
        });
      }

      const { endLocation, endTime } = parsed.data;

      const completedTrip = await tripService.completeTrip(
        tripId,
        endLocation?.latitude,
        endLocation?.longitude,
        endTime ? new Date(endTime) : undefined
      );

      const response: TripCompletedResponse = {
        tripId: completedTrip.id,
        status: completedTrip.status,
        message: 'Trip completed successfully. Scoring in progress.',
      };

      res.json(createResponse(response));
    } catch (error) {
      next(error);
    }
  }
);
