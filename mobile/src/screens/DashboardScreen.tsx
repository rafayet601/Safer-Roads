import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import ScoreGauge from '../components/ScoreGauge';
import TripCard from '../components/TripCard';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../hooks/useAuth';
import { Trip, DashboardData } from '../types';

interface DashboardScreenProps {
  navigation: any;
}

// Mock data for MVP
const mockDashboardData: DashboardData = {
  user: {
    id: '1',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe',
    createdAt: '2024-01-01',
    totalTrips: 45,
    averageScore: 87,
    currentStreak: 7,
    totalPoints: 12500,
    membershipLevel: 'gold',
  },
  todayScore: 92,
  weeklyScores: [85, 88, 90, 82, 92, 87, 92],
  recentTrips: [
    {
      id: '1',
      userId: '1',
      startedAt: '2024-03-15T08:30:00Z',
      endedAt: '2024-03-15T09:15:00Z',
      status: 'completed',
      startLocation: { latitude: 40.7128, longitude: -74.006, address: 'Home' },
      endLocation: { latitude: 40.758, longitude: -73.9855, address: 'Office' },
      distance: 12.5,
      duration: 2700,
      score: 92,
      events: [],
    },
    {
      id: '2',
      userId: '1',
      startedAt: '2024-03-14T17:00:00Z',
      endedAt: '2024-03-14T17:45:00Z',
      status: 'completed',
      startLocation: { latitude: 40.758, longitude: -73.9855, address: 'Office' },
      endLocation: { latitude: 40.7128, longitude: -74.006, address: 'Home' },
      distance: 11.8,
      duration: 2700,
      score: 88,
      events: [],
    },
  ],
  currentReward: {
    id: '1',
    name: 'Safe Driver',
    description: 'Complete 50 trips with 80+ score',
    type: 'badge',
    icon: 'trophy',
    progress: 45,
    target: 50,
  },
  savingsProjection: {
    currentPremium: 1500,
    estimatedSavings: 450,
    discountPercentage: 30,
    projectedPremium: 1050,
    factors: [],
    history: [],
  },
};

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData>(mockDashboardData);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const currentUser = user || dashboardData.user;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello, {currentUser.firstName}! 👋</Text>
            <Text style={styles.dateText}>
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => {}}
          >
            <Text style={styles.notificationIcon}>🔔</Text>
          </TouchableOpacity>
        </View>

        {/* Score Card */}
        <View style={styles.scoreCard}>
          <Text style={styles.sectionTitle}>Today's Score</Text>
          <View style={styles.scoreContainer}>
            <ScoreGauge score={dashboardData.todayScore} size="large" />
          </View>
          <View style={styles.streakContainer}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakText}>
              {dashboardData.user.currentStreak} day streak
            </Text>
          </View>
        </View>

        {/* Weekly Progress */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>This Week</Text>
          <View style={styles.weeklyCard}>
            <View style={styles.weeklyScores}>
              {dashboardData.weeklyScores.map((score, index) => (
                <View key={index} style={styles.dayScore}>
                  <Text style={styles.dayLabel}>
                    {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
                  </Text>
                  <View
                    style={[
                      styles.scoreDot,
                      {
                        backgroundColor:
                          score >= 90
                            ? '#22c55e'
                            : score >= 70
                            ? '#eab308'
                            : '#ef4444',
                      },
                    ]}
                  />
                  <Text style={styles.scoreValue}>{score}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentUser.totalTrips}</Text>
            <Text style={styles.statLabel}>Total Trips</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentUser.averageScore}</Text>
            <Text style={styles.statLabel}>Avg Score</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{currentUser.totalPoints}</Text>
            <Text style={styles.statLabel}>Points</Text>
          </View>
        </View>

        {/* Savings Preview */}
        <TouchableOpacity
          style={styles.savingsCard}
          onPress={() => navigation.navigate('Savings')}
        >
          <View style={styles.savingsInfo}>
            <Text style={styles.savingsTitle}>Insurance Savings</Text>
            <Text style={styles.savingsAmount}>
              ${dashboardData.savingsProjection.estimatedSavings}/year
            </Text>
          </View>
          <View style={styles.savingsProgress}>
            <ProgressBar
              progress={dashboardData.savingsProjection.discountPercentage}
              showPercentage
              color="#22c55e"
            />
          </View>
        </TouchableOpacity>

        {/* Recent Trips */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Trips</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Trips')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          {dashboardData.recentTrips.map((trip) => (
            <TripCard
              key={trip.id}
              trip={trip}
              onPress={() =>
                navigation.navigate('Trips', {
                  screen: 'TripDetail',
                  params: { tripId: trip.id },
                })
              }
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  dateText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationIcon: {
    fontSize: 20,
  },
  scoreCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  scoreContainer: {
    alignItems: 'center',
    marginVertical: 8,
  },
  streakContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  streakIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  streakText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#f97316',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#22c55e',
    fontWeight: '500',
  },
  weeklyCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  weeklyScores: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dayScore: {
    alignItems: 'center',
  },
  dayLabel: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
    marginBottom: 8,
  },
  scoreDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 10,
    color: '#9ca3af',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1f2937',
  },
  statLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  savingsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#22c55e',
    borderRadius: 16,
    padding: 20,
  },
  savingsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  savingsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  savingsAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  savingsProgress: {
    marginTop: 8,
  },
});

export default DashboardScreen;
