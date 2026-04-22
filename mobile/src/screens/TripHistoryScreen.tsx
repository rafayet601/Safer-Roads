import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import TripCard from '../components/TripCard';
import { Trip } from '../types';

interface TripHistoryScreenProps {
  navigation: any;
}

// Mock data for MVP
const mockTrips: Trip[] = [
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
  {
    id: '3',
    userId: '1',
    startedAt: '2024-03-14T08:15:00Z',
    endedAt: '2024-03-14T09:00:00Z',
    status: 'completed',
    startLocation: { latitude: 40.7128, longitude: -74.006, address: 'Home' },
    endLocation: { latitude: 40.758, longitude: -73.9855, address: 'Office' },
    distance: 12.3,
    duration: 2700,
    score: 85,
    events: [],
  },
  {
    id: '4',
    userId: '1',
    startedAt: '2024-03-13T17:30:00Z',
    endedAt: '2024-03-13T18:15:00Z',
    status: 'completed',
    startLocation: { latitude: 40.758, longitude: -73.9855, address: 'Office' },
    endLocation: { latitude: 40.7128, longitude: -74.006, address: 'Home' },
    distance: 11.5,
    duration: 2700,
    score: 90,
    events: [],
  },
  {
    id: '5',
    userId: '1',
    startedAt: '2024-03-13T08:00:00Z',
    endedAt: '2024-03-13T08:45:00Z',
    status: 'completed',
    startLocation: { latitude: 40.7128, longitude: -74.006, address: 'Home' },
    endLocation: { latitude: 40.758, longitude: -73.9855, address: 'Office' },
    distance: 12.7,
    duration: 2700,
    score: 87,
    events: [],
  },
];

type FilterType = 'all' | 'week' | 'month';

const TripHistoryScreen: React.FC<TripHistoryScreenProps> = ({ navigation }) => {
  const [trips, setTrips] = useState<Trip[]>(mockTrips);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1500);
  };

  const handleTripPress = (tripId: string) => {
    navigation.navigate('TripDetail', { tripId });
  };

  const renderTrip = ({ item }: { item: Trip }) => (
    <TripCard trip={item} onPress={() => handleTripPress(item.id)} />
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Trip History</Text>
        <Text style={styles.subtitle}>{trips.length} trips total</Text>
      </View>

      <View style={styles.filterContainer}>
        {(['all', 'week', 'month'] as FilterType[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterButton, filter === f && styles.filterButtonActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterButtonText,
                filter === f && styles.filterButtonTextActive,
              ]}
            >
              {f === 'all' ? 'All' : f === 'week' ? 'This Week' : 'This Month'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={trips}
        renderItem={renderTrip}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#22c55e"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>🚗</Text>
            <Text style={styles.emptyText}>No trips yet</Text>
            <Text style={styles.emptySubtext}>
              Start your first trip to see it here
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
  },
  filterButtonActive: {
    backgroundColor: '#22c55e',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 20,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
});

export default TripHistoryScreen;
