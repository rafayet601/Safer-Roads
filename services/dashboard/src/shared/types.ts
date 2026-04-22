// Shared types for the dashboard service

export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    correlationId?: string;
  };
  error?: {
    code: string;
    message: string;
  };
}

export function createResponse<T>(data: T, correlationId?: string): ApiResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      correlationId,
    },
  };
}

export interface User {
  userId: string;
  email: string;
}

// Re-export UnsafeEventType from entities for convenience
export enum UnsafeEventType {
  SPEEDING = 'SPEEDING',
  HARSH_BRAKING = 'HARSH_BRAKING',
  HARSH_ACCELERATION = 'HARSH_ACCELERATION',
  PHONE_DISTRACTION = 'PHONE_DISTRACTION',
  DISTRACTED = 'DISTRACTED',
  RAN_RED_LIGHT = 'RAN_RED_LIGHT',
  UNSAFE_LANE_CHANGE = 'UNSAFE_LANE_CHANGE',
}

// Trip status enum
export enum TripStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABORTED = 'aborted',
}

// Request with user extension
export interface RequestWithUser {
  user?: User;
}
