import Queue from 'bull';
import { getConfig } from '../shared/config.js';

const config = getConfig();

// Initialize Bull queue for event publishing
const eventQueue = new Queue('safe-driving-events', {
  redis: {
    host: config.REDIS_HOST || 'localhost',
    port: config.REDIS_PORT || 6379,
  },
});

export interface DomainEvent {
  eventType: string;
  payload: Record<string, any>;
  timestamp: string;
}

/**
 * Publish a domain event to the event bus
 * Other services will consume these events asynchronously
 */
export async function publishEvent(eventType: string, payload: Record<string, any>): Promise<void> {
  try {
    const event: DomainEvent = {
      eventType,
      payload,
      timestamp: new Date().toISOString(),
    };

    await eventQueue.add(event, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000,
      },
      removeOnComplete: true,
    });
  } catch (error) {
    console.error(`Failed to publish event ${eventType}:`, error);
    // Don't throw - logging failures is sufficient for MVP
  }
}

/**
 * Consume events from the queue (called by scoring/rewards services)
 */
export function consumeEvents(handler: (event: DomainEvent) => Promise<void>): void {
  eventQueue.process(async (job) => {
    const event: DomainEvent = job.data;
    await handler(event);
  });
}

export { eventQueue };
