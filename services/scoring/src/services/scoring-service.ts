import { prisma } from '../shared/db.js';
import { publishEvent } from './event-bus.js';

interface TelemetryEvent {
  timestamp: string;
  speedMps: number;
  acceleration?: number;
  phoneDistraction?: boolean;
  brakingForce?: number;
}

export class ScoringService {
  private readonly SPEED_THRESHOLD_MS = 20; // ~72 km/h soft limit
  private readonly HARSH_BRAKING_THRESHOLD = 0.7; // 7 m/s^2
  private readonly HARSH_ACCELERATION_THRESHOLD = 0.7; // 7 m/s^2

  /**
   * Score a completed trip based on telemetry data
   */
  async scoreTrip(tripId: string): Promise<{
    tripId: string;
    scoreValue: number;
    events: Array<{ eventType: string; severity: string; impact: number }>;
  }> {
    // Fetch trip and telemetry data
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
      include: {
        telemetryBatches: true,
      },
    });

    if (!trip) {
      throw new Error(`Trip ${tripId} not found`);
    }

    // Extract telemetry events from batches
    const events: TelemetryEvent[] = [];
    for (const batch of trip.telemetryBatches) {
      const data = batch.rawData as TelemetryEvent[];
      events.push(...data);
    }

    // Detect unsafe events
    const detectedEvents = this.detectEvents(events);
    const scoreValue = this.calculateScore(detectedEvents);
    const coachingMessages = this.generateCoaching(detectedEvents);

    // Store score result
    const tripScore = await prisma.tripScore.create({
      data: {
        tripId,
        scoreValue,
        scoringVersion: 'v1-rules-based',
      },
    });

    // Store event detections
    await Promise.all(
      detectedEvents.map((event) =>
        prisma.tripEvent.create({
          data: {
            tripId,
            scoreId: tripScore.id,
            eventType: event.eventType,
            severity: event.severity,
            timestamp: new Date(event.timestamp),
            impact: event.impact,
            details: { detected: true },
          },
        }),
      ),
    );

    // Store coaching messages
    await Promise.all(
      coachingMessages.map((message) =>
        prisma.coachingMessage.create({
          data: {
            tripId,
            messageType: 'actionable_tip',
            messageText: message,
          },
        }),
      ),
    );

    // Publish trip-scored event for rewards/pricing services
    await publishEvent('trip-scored', {
      tripId,
      userId: trip.userId,
      scoreValue,
      events: detectedEvents,
      timestamp: new Date().toISOString(),
    });

    return {
      tripId,
      scoreValue,
      events: detectedEvents,
    };
  }

  /**
   * Detect unsafe driving events from telemetry
   */
  private detectEvents(events: TelemetryEvent[]): Array<{
    eventType: string;
    severity: string;
    timestamp: string;
    impact: number;
  }> {
    const detectedEvents: Array<{
      eventType: string;
      severity: string;
      timestamp: string;
      impact: number;
    }> = [];

    for (const event of events) {
      // Speeding detection (above 20 m/s = 72 km/h)
      if (event.speedMps > this.SPEED_THRESHOLD_MS) {
        const severity = event.speedMps > 25 ? 'high' : event.speedMps > 22 ? 'medium' : 'low';
        detectedEvents.push({
          eventType: 'speeding',
          severity,
          timestamp: event.timestamp,
          impact: severity === 'high' ? 10 : severity === 'medium' ? 5 : 2,
        });
      }

      // Harsh braking detection
      if (event.brakingForce && event.brakingForce > this.HARSH_BRAKING_THRESHOLD) {
        detectedEvents.push({
          eventType: 'harsh_braking',
          severity: 'medium',
          timestamp: event.timestamp,
          impact: 5,
        });
      }

      // Harsh acceleration detection
      if (event.acceleration && event.acceleration > this.HARSH_ACCELERATION_THRESHOLD) {
        detectedEvents.push({
          eventType: 'harsh_acceleration',
          severity: 'low',
          timestamp: event.timestamp,
          impact: 3,
        });
      }

      // Phone distraction detection
      if (event.phoneDistraction) {
        detectedEvents.push({
          eventType: 'phone_distraction',
          severity: 'high',
          timestamp: event.timestamp,
          impact: 15,
        });
      }
    }

    return detectedEvents;
  }

  /**
   * Calculate trip score (0-100) based on detected events
   */
  private calculateScore(events: Array<{ eventType: string; impact: number }>): number {
    const BASE_SCORE = 100;
    const totalDeductions = events.reduce((sum, event) => sum + event.impact, 0);
    const score = Math.max(0, BASE_SCORE - totalDeductions);
    return Math.round(score * 100) / 100; // Round to 2 decimals
  }

  /**
   * Generate coaching messages based on detected events
   */
  private generateCoaching(events: Array<{ eventType: string; severity: string }>): string[] {
    const messages: Set<string> = new Set();

    const speedingCount = events.filter((e) => e.eventType === 'speeding').length;
    if (speedingCount > 0) {
      messages.add(
        `You exceeded the speed limit ${speedingCount} time(s). Try maintaining steady speeds within posted limits.`,
      );
    }

    const brakingCount = events.filter((e) => e.eventType === 'harsh_braking').length;
    if (brakingCount > 0) {
      messages.add(
        `Detected ${brakingCount} harsh braking event(s). Leave more distance between you and the car ahead.`,
      );
    }

    const accelerationCount = events.filter((e) => e.eventType === 'harsh_acceleration').length;
    if (accelerationCount > 0) {
      messages.add(`Accelerate gradually and smoothly to improve comfort and safety.`);
    }

    const distractionCount = events.filter((e) => e.eventType === 'phone_distraction').length;
    if (distractionCount > 0) {
      messages.add(`Phone use detected while driving. Keep focus on the road.`);
    }

    return Array.from(messages).slice(0, 3); // Max 3 messages
  }

  /**
   * Retrieve a previously calculated score
   */
  async getScore(tripId: string): Promise<{
    scoreValue: number;
    events: Array<{ eventType: string; severity: string; impact: number }>;
  } | null> {
    const score = await prisma.tripScore.findUnique({
      where: { tripId },
      include: {
        events: true,
      },
    });

    if (!score) return null;

    return {
      scoreValue: score.scoreValue,
      events: score.events.map((e) => ({
        eventType: e.eventType,
        severity: e.severity,
        impact: e.impact,
      })),
    };
  }
}
