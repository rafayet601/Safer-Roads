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

export interface UserRewards {
  userId: string;
  points: number;
  streak: number;
  level: 'Bronze' | 'Silver' | 'Gold';
  totalTrips: number;
  highScoreTrips: number;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  type: 'trip_count' | 'high_score';
  target: number;
  progress: number;
  completed: boolean;
  completedAt?: Date;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  type: 'first_trip' | 'streak_7_days' | 'points_100';
  unlocked: boolean;
  unlockedAt?: Date;
}
