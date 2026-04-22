import { prisma } from '../shared/db.js';
import { type CreateTripInput, type TelemetryBatchInput } from '../types.js';
import { NotFoundError, ConflictError, ValidationError } from '../shared/errors.js';
import { publishEvent } from '../services/event-bus.js';

export class TripService {
  async startTrip(input: CreateTripInput): Promise<{
    id: string;
    status: string;
    startTime: Date;
  }> {
    // Check for existing active trip
    const activeTrip = await prisma.trip.findFirst({
      where: {
        userId: input.userId,
        status: 'active',
      },
    });

    if (activeTrip) {
      throw new ConflictError('User already has an active trip');
    }

    const trip = await prisma.trip.create({
      data: {
        userId: input.userId,
        startTime: new Date(),
        status: 'active',
      },
    });

    // Publish trip-started event
    await publishEvent('trip-started', {
      tripId: trip.id,
      userId: input.userId,
      timestamp: new Date().toISOString(),
    });

    return {
      id: trip.id,
      status: trip.status,
      startTime: trip.startTime,
    };
  }

  async findActiveTripByUser(userId: string): Promise<{
    id: string;
    userId: string;
    status: string;
  } | null> {
    return await prisma.trip.findFirst({
      where: {
        userId,
        status: 'active',
      },
      select: {
        id: true,
        userId: true,
        status: true,
      },
    });
  }

  async findById(tripId: string): Promise<{
    id: string;
    userId: string;
    startTime: Date;
    endTime: Date | null;
    status: string;
    distance: number | null;
    duration: number | null;
  } | null> {
    return await prisma.trip.findUnique({
      where: { id: tripId },
      select: {
        id: true,
        userId: true,
        startTime: true,
        endTime: true,
        status: true,
        distance: true,
        duration: true,
      },
    });
  }

  async findByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{
    trips: Array<{
      id: string;
      userId: string;
      startTime: Date;
      endTime: Date | null;
      status: string;
      distance: number | null;
      duration: number | null;
    }>;
    total: number;
  }> {
    const trips = await prisma.trip.findMany({
      where: { userId },
      skip: offset,
      take: limit,
      orderBy: { startTime: 'desc' },
      select: {
        id: true,
        userId: true,
        startTime: true,
        endTime: true,
        status: true,
        distance: true,
        duration: true,
      },
    });

    const total = await prisma.trip.count({
      where: { userId },
    });

    return { trips, total };
  }

  async ingestTelemetry(input: TelemetryBatchInput): Promise<{
    eventsAccepted: number;
  }> {
    const trip = await prisma.trip.findUnique({
      where: { id: input.tripId },
    });

    if (!trip) {
      throw new NotFoundError('Trip');
    }

    if (trip.status !== 'active') {
      throw new ValidationError('Cannot add telemetry to a non-active trip');
    }

    // Idempotency check - reject if batch already processed
    const existingBatch = await prisma.telemetryBatch.findUnique({
      where: { batchId: input.batchId },
    });

    if (existingBatch) {
      return { eventsAccepted: 0 };
    }

    // Create telemetry batch
    const batch = await prisma.telemetryBatch.create({
      data: {
        tripId: input.tripId,
        batchId: input.batchId,
        sampleCount: input.events.length,
        validationStatus: 'valid',
        rawData: input.events,
      },
    });

    // Publish telemetry-received event
    await publishEvent('telemetry-received', {
      tripId: input.tripId,
      batchId: input.batchId,
      sampleCount: input.events.length,
      timestamp: new Date().toISOString(),
    });

    return { eventsAccepted: input.events.length };
  }

  async completeTrip(
    tripId: string,
    endLatitude?: number,
    endLongitude?: number,
    endTime?: Date,
  ): Promise<{
    id: string;
    status: string;
  }> {
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      throw new NotFoundError('Trip');
    }

    if (trip.status !== 'active') {
      throw new ConflictError('Trip is not active');
    }

    const endedAt = endTime || new Date();

    // Calculate duration in seconds
    const duration = Math.floor((endedAt.getTime() - trip.startTime.getTime()) / 1000);

    // Update trip to completed
    const completedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        endTime: endedAt,
        status: 'completed',
        duration,
      },
    });

    // Publish trip-completed event for scoring
    await publishEvent('trip-completed', {
      tripId: completedTrip.id,
      userId: completedTrip.userId,
      startTime: trip.startTime.toISOString(),
      endTime: endedAt.toISOString(),
      duration,
      timestamp: new Date().toISOString(),
    });

    return {
      id: completedTrip.id,
      status: completedTrip.status,
    };
  }

  async getTelemetryCount(tripId: string): Promise<number> {
    return await prisma.telemetryBatch.count({
      where: { tripId },
    });
  }
}
