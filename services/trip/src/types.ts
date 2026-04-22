import { z } from 'zod';

// ==========================================
// Entity Types (previously from @safe-driving/entities)
// ==========================================

export enum TripStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABORTED = 'aborted',
  PROCESSING = 'processing',
  FAILED = 'failed',
}

export interface Trip {
  id: string;
  userId: string;
  startedAt: Date;
  endedAt?: Date;
  status: TripStatus;
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  distanceMeters?: number;
  durationSeconds?: number;
}

export interface CreateTripInput {
  userId: string;
  startLatitude?: number;
  startLongitude?: number;
}

export interface TelemetryEvent {
  id: string;
  tripId: string;
  timestamp: Date;
  eventType: 'location' | 'sensor' | 'batch';
  latitude: number;
  longitude: number;
  speedMps?: number;
  accuracy?: number;
  rawSensorData?: Record<string, unknown>;
}

export interface TelemetryBatchInput {
  tripId: string;
  batchId: string;
  events: Array<{
    timestamp: string;
    latitude: number;
    longitude: number;
    speedMps?: number;
    accuracy?: number;
    rawSensorData?: Record<string, unknown>;
  }>;
}

// ==========================================
// Request/Response Schemas (Zod)
// ==========================================

// Start Trip
export const startTripSchema = z.object({
  startTime: z.string().datetime().optional(),
  startLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
});

export type StartTripInput = z.infer<typeof startTripSchema>;

// Telemetry Batch
export const telemetryEventSchema = z.object({
  timestamp: z.string().datetime(),
  latitude: z.number(),
  longitude: z.number(),
  speedMps: z.number().optional(),
  accuracy: z.number().optional(),
  accelerationX: z.number().optional(),
  accelerationY: z.number().optional(),
  accelerationZ: z.number().optional(),
  gyroX: z.number().optional(),
  gyroY: z.number().optional(),
  gyroZ: z.number().optional(),
  rawSensorData: z.record(z.unknown()).optional(),
});

export const telemetryBatchSchema = z.object({
  batchId: z.string().uuid(),
  telemetryData: z.array(telemetryEventSchema).min(1).max(1000),
});

export type TelemetryBatchInputSchema = z.infer<typeof telemetryBatchSchema>;
export type TelemetryEventInput = z.infer<typeof telemetryEventSchema>;

// Complete Trip
export const completeTripSchema = z.object({
  endTime: z.string().datetime().optional(),
  endLocation: z
    .object({
      latitude: z.number(),
      longitude: z.number(),
    })
    .optional(),
});

export type CompleteTripInput = z.infer<typeof completeTripSchema>;

// List Trips Query
export const listTripsQuerySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export type ListTripsQuery = z.infer<typeof listTripsQuerySchema>;

// ==========================================
// Response Types
// ==========================================

export interface TripResponse {
  tripId: string;
}

export interface TripSummaryResponse {
  tripId: string;
  startTime: string;
  endTime?: string;
  distanceKm?: number;
  durationMinutes?: number;
  tripScore?: number;
  status: 'active' | 'completed' | 'aborted' | 'processing' | 'failed';
}

export interface TripDetailResponse extends TripSummaryResponse {
  startLatitude?: number;
  startLongitude?: number;
  endLatitude?: number;
  endLongitude?: number;
  telemetryCount?: number;
}

export interface TelemetryAcceptedResponse {
  batchId: string;
  eventsAccepted: number;
}

export interface TripCompletedResponse {
  tripId: string;
  status: string;
  message: string;
}
