export interface ApiResponse<T> {
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export function createResponse<T>(data: T, requestId?: string): ApiResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function createPaginatedResponse<T>(
  items: T[],
  page: number,
  limit: number,
  total: number,
  requestId?: string
): ApiResponse<PaginatedResponse<T>> {
  return {
    data: {
      items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
      requestId,
    },
  };
}

// Scoring-specific types
export enum UnsafeEventType {
  SPEEDING = 'speeding',
  HARSH_BRAKING = 'harsh_braking',
  HARSH_ACCELERATION = 'harsh_acceleration',
  PHONE_DISTRACTION = 'phone_distraction',
}

export type EventSeverity = 'low' | 'medium' | 'high';

export interface UnsafeEvent {
  id: string;
  tripId: string;
  eventType: UnsafeEventType;
  timestamp: Date;
  latitude: number;
  longitude: number;
  severity: EventSeverity;
  scoreImpact: number;
  description: string;
}

export interface ScoreResult {
  tripId: string;
  overallScore: number;
  maxScore: number;
  eventImpacts: Array<{
    eventType: UnsafeEventType;
    count: number;
    totalImpact: number;
  }>;
  explanations: string[];
  scoredAt: Date;
}
