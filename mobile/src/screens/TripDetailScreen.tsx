import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScoreGauge from '../components/ScoreGauge';
import ProgressBar, { MultiSegmentProgress } from '../components/ProgressBar';
import { Trip, ScoreResult } from '../types';

interface TripDetailScreenProps {
  route: { params: { tripId: string } };
  navigation: any;
}

// Mock data for MVP
const mockTrip: Trip = {
  id: '1',
  userId: '1',
  startedAt: '2024-03-15T08:30:00Z',
  endedAt: '2024-03-15T09:15:00Z',
  status: 'completed',
  startLocation: { latitude: 40.7128, longitude: -74.006, address: '123 Main St, New York' },
  endLocation: { latitude: 40.758, longitude: -73.9855, address: '456 Park Ave, New York' },
  distance: 12.5,
  duration: 2700,
  score: 92,
  events: [
    { id: 'e1', tripId: '1', type: 'hard_brake', timestamp: '2024-03-15T08:45:00Z', location: { latitude: 40.72, longitude: -74.01 }, severity: 'low' },
    { id: 'e2', tripId: '1', type: 'phone_usage', timestamp: '2024-03-15T08:50:00Z', location: { latitude: 40.73, longitude: -74.02 }, severity: 'medium' },
  ],
};

const mockScoreResult: ScoreResult = {
  tripId: '1',
  overallScore: 92,
  categories: [
    { name: 'Speed', score: 95, weight: 30 },
    { name: 'Braking', score: 88, weight: 25 },
    { name: 'Acceleration', score: 90, weight: 20 },
    { name: 'Focus', score: 85, weight: 25 },
  ],
  breakdown: {
    speed: 95,
    braking: 88,
    acceleration: 90,
    laneDiscipline: 92,
    focus: 85,
  },
  riskFactors: ['Phone usage detected'],
  suggestions: ['Avoid phone usage while driving', 'Maintain consistent speed'],
};

const TripDetailScreen: React.FC<TripDetailScreenProps> = ({ route, navigation }) => {
  const { tripId } = route.params;
  const [trip, setTrip] = useState<Trip>(mockTrip);
  const [scoreResult, setScoreResult] = useState<ScoreResult>(mockScoreResult);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes} min`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Score Section */}
        <View style={styles.scoreSection}>
          <ScoreGauge score={scoreResult.overallScore} size="large" />
        </View>

        {/* Trip Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Trip Details</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>{formatDate(trip.startedAt)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Time</Text>
            <Text style={styles.infoValue}>
              {formatTime(trip.startedAt)} - {formatTime(trip.endedAt || '')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Duration</Text>
            <Text style={styles.infoValue}>{formatDuration(trip.duration)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Distance</Text>
            <Text style={styles.infoValue}>{trip.distance.toFixed(1)} km</Text>
          </View>
        </View>

        {/* Route */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Route</Text>
          <View style={styles.routeContainer}>
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.routeDotStart]} />
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>Start</Text>
                <Text style={styles.routeAddress}>
                  {trip.startLocation.address || 'Unknown'}
                </Text>
              </View>
            </View>
            <View style={styles.routeLine} />
            <View style={styles.routePoint}>
              <View style={[styles.routeDot, styles.routeDotEnd]} />
              <View style={styles.routeContent}>
                <Text style={styles.routeLabel}>End</Text>
                <Text style={styles.routeAddress}>
                  {trip.endLocation?.address || 'Unknown'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Score Breakdown */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Score Breakdown</Text>
          <View style={styles.breakdownContainer}>
            {Object.entries(scoreResult.breakdown).map(([key, value]) => (
              <View key={key} style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>
                  {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}
                </Text>
                <View style={styles.breakdownBar}>
                  <ProgressBar
                    progress={value}
                    showPercentage
                    color={
                      value >= 90
                        ? '#22c55e'
                        : value >= 70
                        ? '#eab308'
                        : '#ef4444'
                    }
                    height={6}
                  />
                </View>
              </View>
            ))}
          </View>
        </View>

        {/* Risk Factors */}
        {scoreResult.riskFactors.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Risk Factors</Text>
            {scoreResult.riskFactors.map((risk, index) => (
              <View key={index} style={styles.riskItem}>
                <Text style={styles.riskIcon}>⚠️</Text>
                <Text style={styles.riskText}>{risk}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Suggestions */}
        {scoreResult.suggestions.length > 0 && (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Suggestions</Text>
            {scoreResult.suggestions.map((suggestion, index) => (
              <View key={index} style={styles.suggestionItem}>
                <Text style={styles.suggestionIcon}>💡</Text>
                <Text style={styles.suggestionText}>{suggestion}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  scoreSection: {
    backgroundColor: '#fff',
    paddingVertical: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  infoLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  routeContainer: {
    paddingLeft: 8,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  routeDotStart: {
    backgroundColor: '#22c55e',
  },
  routeDotEnd: {
    backgroundColor: '#ef4444',
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: '#e5e7eb',
    marginLeft: 5,
  },
  routeContent: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: '#9ca3af',
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 14,
    color: '#1f2937',
  },
  breakdownContainer: {
    gap: 12,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  breakdownLabel: {
    width: 100,
    fontSize: 14,
    color: '#6b7280',
  },
  breakdownBar: {
    flex: 1,
  },
  riskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  riskIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  riskText: {
    fontSize: 14,
    color: '#ef4444',
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
  },
  suggestionIcon: {
    fontSize: 16,
    marginRight: 8,
    marginTop: 2,
  },
  suggestionText: {
    flex: 1,
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
});

export default TripDetailScreen;
