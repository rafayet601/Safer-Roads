import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AchievementBadge from '../components/AchievementBadge';
import ProgressBar from '../components/ProgressBar';
import { Achievement, Reward } from '../types';

interface RewardsScreenProps {
  navigation: any;
}

// Mock data for MVP
const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Trip',
    description: 'Complete your first trip',
    icon: 'car',
    progress: 1,
    target: 1,
    unlockedAt: '2024-02-01',
  },
  {
    id: '2',
    name: 'Safe Driver',
    description: 'Complete 50 trips with 80+ score',
    icon: 'trophy',
    progress: 45,
    target: 50,
  },
  {
    id: '3',
    name: 'Streak Master',
    description: 'Maintain a 7-day driving streak',
    icon: 'fire',
    progress: 7,
    target: 7,
    unlockedAt: '2024-03-10',
  },
  {
    id: '4',
    name: 'Speed Demon',
    description: 'Never exceed the speed limit',
    icon: 'speedometer',
    progress: 12,
    target: 20,
  },
  {
    id: '5',
    name: 'Focus Champion',
    description: '100 trips with no phone usage',
    icon: 'shield',
    progress: 45,
    target: 100,
  },
  {
    id: '6',
    name: 'Road Warrior',
    description: 'Drive 1000 km total',
    icon: 'road',
    progress: 567,
    target: 1000,
  },
];

const mockRewards: Reward[] = [
  {
    id: '1',
    name: '10% Insurance Discount',
    description: 'Get 10% off your next premium',
    type: 'discount',
    icon: 'gift',
    pointsCost: 1000,
    progress: 850,
    target: 1000,
  },
  {
    id: '2',
    name: 'Car Wash Voucher',
    description: 'Free car wash at partner location',
    type: 'gift',
    icon: 'gift',
    pointsCost: 500,
  },
  {
    id: '3',
    name: 'Premium Badge',
    description: 'Exclusive gold profile badge',
    type: 'badge',
    icon: 'medal',
    pointsCost: 2000,
  },
];

const RewardsScreen: React.FC<RewardsScreenProps> = ({ navigation }) => {
  const [achievements] = useState<Achievement[]>(mockAchievements);
  const [rewards] = useState<Reward[]>(mockRewards);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'achievements' | 'rewards'>('achievements');

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const totalPoints = 12500;
  const currentStreak = 7;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Rewards</Text>
        <View style={styles.pointsContainer}>
          <Text style={styles.pointsLabel}>Points</Text>
          <Text style={styles.pointsValue}>{totalPoints.toLocaleString()}</Text>
        </View>
      </View>

      {/* Streak Card */}
      <View style={styles.streakCard}>
        <Text style={styles.streakIcon}>🔥</Text>
        <View style={styles.streakInfo}>
          <Text style={styles.streakValue}>{currentStreak} Day Streak</Text>
          <Text style={styles.streakLabel}>Keep it up!</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'achievements' && styles.tabActive]}
          onPress={() => setActiveTab('achievements')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'achievements' && styles.tabTextActive,
            ]}
          >
            Achievements
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'rewards' && styles.tabActive]}
          onPress={() => setActiveTab('rewards')}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === 'rewards' && styles.tabTextActive,
            ]}
          >
            Rewards
          </Text>
        </TouchableOpacity>
      </View>

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
        {activeTab === 'achievements' ? (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Unlocked</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.badgeRow}
            >
              {achievements
                .filter((a) => a.unlockedAt)
                .map((achievement) => (
                  <AchievementBadge
                    key={ achievement.id}
                    achievement={achievement}
                    size="medium"
                  />
                ))}
            </ScrollView>

            <Text style={styles.sectionTitle}>In Progress</Text>
            <View style={styles.achievementsList}>
              {achievements
                .filter((a) => !a.unlockedAt && a.progress > 0)
                .map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="large"
                  />
                ))}
            </View>

            <Text style={styles.sectionTitle}>Not Started</Text>
            <View style={styles.achievementsList}>
              {achievements
                .filter((a) => !a.unlockedAt && a.progress === 0)
                .map((achievement) => (
                  <AchievementBadge
                    key={achievement.id}
                    achievement={achievement}
                    size="medium"
                  />
                ))}
            </View>
          </View>
        ) : (
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>Available Rewards</Text>
            {rewards.map((reward) => (
              <View key={reward.id} style={styles.rewardCard}>
                <View style={styles.rewardIcon}>
                  <Text style={styles.rewardEmoji}>
                    {reward.type === 'discount' ? '🎁' : reward.type === 'gift' ? '🎁' : '🏅'}
                  </Text>
                </View>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardName}>{reward.name}</Text>
                  <Text style={styles.rewardDescription}>
                    {reward.description}
                  </Text>
                  {reward.pointsCost && (
                    <View style={styles.rewardPoints}>
                      <Text style={styles.pointsCost}>
                        {reward.pointsCost} points
                      </Text>
                    </View>
                  )}
                </View>
                <TouchableOpacity style={styles.claimButton}>
                  <Text style={styles.claimButtonText}>Claim</Text>
                </TouchableOpacity>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
  },
  pointsContainer: {
    alignItems: 'flex-end',
  },
  pointsLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
  pointsValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#22c55e',
  },
  streakCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  streakIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  streakInfo: {
    flex: 1,
  },
  streakValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  streakLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 2,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabActive: {
    backgroundColor: '#22c55e',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  tabTextActive: {
    color: '#fff',
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
    marginTop: 8,
  },
  badgeRow: {
    paddingBottom: 8,
  },
  achievementsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: 24,
  },
  rewardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  rewardIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  rewardEmoji: {
    fontSize: 24,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  rewardDescription: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  rewardPoints: {
    marginTop: 6,
  },
  pointsCost: {
    fontSize: 12,
    fontWeight: '600',
    color: '#22c55e',
  },
  claimButton: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  claimButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});

export default RewardsScreen;
