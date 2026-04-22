import { v4 as uuidv4 } from 'uuid';
import api from '../api';

interface TelemetryReading {
  timestamp: string;
  latitude: number;
  longitude: number;
  speedKmh: number;
  accelerationMps2: number;
  brakingForce: number;
  phoneUsageDetected: boolean;
}

class TelemetryService {
  private isTracking = false;
  private telemetryBuffer: TelemetryReading[] = [];
  private readonly BUFFER_SIZE = 10;
  private readonly SEND_INTERVAL_MS = 5000;
  private sendInterval: NodeJS.Timeout | null = null;
  private currentTripId: string | null = null;

  /**
   * Request necessary permissions for telemetry collection
   * Simplified version that always returns true for MVP
   */
  async requestPermissions(): Promise<boolean> {
    // For MVP, we'll assume permissions are granted
    // In a real implementation, you would use expo-permissions
    return true;
  }

  /**
   * Check if we have the necessary permissions
   * Simplified version that always returns true for MVP
   */
  async hasPermissions(): Promise<boolean> {
    // For MVP, we'll assume permissions are granted
    return true;
  }

  /**
   * Start tracking telemetry for a trip
   */
  async startTracking(tripId: string): Promise<void> {
    if (this.isTracking) {
      console.warn('Telemetry tracking already started');
      return;
    }

    // For MVP, we'll simulate telemetry data instead of using actual sensors
    this.currentTripId = tripId;
    this.isTracking = true;
    this.telemetryBuffer = [];

    // Set up periodic sending of simulated data
    this.sendInterval = setInterval(() => {
      this.generateAndSendSimulatedTelemetry();
    }, this.SEND_INTERVAL_MS);

    console.log(`Started telemetry tracking for trip ${tripId}`);
  }

  /**
   * Stop tracking telemetry
   */
  async stopTracking(): Promise<void> {
    if (!this.isTracking) return;

    this.isTracking = false;

    // Clear send interval
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
    }

    // Send any remaining telemetry
    if (this.telemetryBuffer.length > 0 && this.currentTripId) {
      await this.sendTelemetryBatch(this.telemetryBuffer);
      this.telemetryBuffer = [];
    }

    console.log('Stopped telemetry tracking');
  }

  /**
   * Generate and send simulated telephony data
   */
  private generateAndSendSimulatedTelemetry(): void {
    if (!this.isTracking || !this.currentTripId) return;

    // Generate a simulated telemetry reading
    const telemetry: TelemetryReading = {
      timestamp: new Date().toISOString(),
      latitude: 34.0522 + (Math.random() - 0.5) * 0.01, // Random location near LA
      longitude: -118.2437 + (Math.random() - 0.5) * 0.01,
      speedKmh: Math.random() * 60, // Random speed 0-60 km/h
      accelerationMps2: (Math.random() - 0.5) * 2, // Random acceleration -1 to 1 m/s²
      brakingForce: Math.random() > 0.7 ? Math.random() * 0.5 : 0, // Random braking 30% of time
      phoneUsageDetected: Math.random() > 0.9, // Random phone usage 10% of time
    };

    this.addToBuffer(telemetry);
  }

  /**
   * Add a telemetry reading to the buffer
   */
  private addToBuffer(reading: TelemetryReading): void {
    this.telemetryBuffer.push(reading);

    // Send if buffer is full
    if (this.telemetryBuffer.length >= this.BUFFER_SIZE) {
      this.sendBufferedTelemetry();
    }
  }

  /**
   * Send the buffered telemetry data
   */
  private async sendBufferedTelemetry(): Promise<void> {
    if (this.telemetryBuffer.length === 0 || !this.currentTripId) return;

    const batchToSend = [...this.telemetryBuffer];
    this.telemetryBuffer = [];

    try {
      await this.sendTelemetryBatch(batchToSend);
    } catch (error) {
      console.error('Failed to send telemetry batch:', error);
      // Put the data back in the buffer to retry later
      this.telemetryBuffer.unshift(...batchToSend);
    }
  }

  /**
   * Send a batch of telemetry data to the backend
   */
  private async sendTelemetryBatch(batch: TelemetryReading[]): Promise<void> {
    if (!this.currentTripId) return;

    // Convert to the format expected by the API
    const telemetryData = batch.map(reading => ({
      timestamp: reading.timestamp,
      latitude: reading.latitude,
      longitude: reading.longitude,
      speedKmh: reading.speedKmh,
      accelerationMps2: reading.accelerationMps2,
      brakingForce: reading.brakingForce,
      phoneUsageDetected: reading.phoneUsageDetected,
    }));

    // Generate a batchId for idempotency
    const batchId = uuidv4();

    await api.client.post(`/trips/${this.currentTripId}/telemetry`, {
      batchId,
      telemetryData,
    });

    console.log(`Sent ${batch.length} telemetry samples for trip ${this.currentTripId}`);
  }
}

// Export a singleton instance
export const telemetryService = new TelemetryService();
export default telemetryService;
