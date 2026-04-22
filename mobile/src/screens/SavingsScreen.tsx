import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ProgressBar from '../components/ProgressBar';

// Mock data for MVP
const mockSavingsData = {
  currentPremium: 1500,
  estimatedSavings: 450,
  discountPercentage: 30,
  projectedPremium: 1050,
  factors: [
    { name: 'Driving Score', impact: 15, description: 'Based on your average score of 87' },
    { name: 'Trip Frequency', impact: 8, description: 'Regular safe driving patterns' },
    { name: 'Streak Bonus', impact: 7, description: '7-day driving streak' },
  ],
  history: [
    { month: 'Jan', savings: 280, score: 82 },
    { month: 'Feb', savings: 320, score: 85 },
    { month: 'Mar', savings: 450, score: 87 },
  ],
  membershipLevel: 'gold',
  memberBenefits: [
    'Priority support',
    'Exclusive rewards',
    '5% additional discount',
  ],
};

const SavingsScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [savingsData] = useState(mockSavingsData);

  const onRefresh = async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Insurance Savings</Text>
        <Text style={styles.subtitle}>See how much you can save</Text>
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
        {/* Main Savings Card */}
        <View style={styles.mainCard}>
          <Text style={styles.mainCardLabel}>Estimated Annual Savings</Text>
          <Text style={styles.savingsAmount}>
            ${savingsData.estimatedSavings}
          </Text>
          <View style={styles.discountContainer}>
            <Text style={styles.discountText}>
              {savingsData.discountPercentage}% discount
            </Text>
          </View>
        </View>

        {/* Premium Comparison */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Premium Comparison</Text>
          <View style={styles.premiumRow}>
            <View style={styles.premiumItem}>
              <Text style={styles.premiumLabel}>Current</Text>
              <Text style={styles.premiumValue}>
                ${savingsData.currentPremium}/yr
              </Text>
            </View>
            <View style={styles.arrowContainer}>
              <Text style={styles.arrow}>→</Text>
            </View>
            <View style={styles.premiumItem}>
              <Text style={styles.premiumLabel}>Projected</Text>
              <Text style={[styles.premiumValue, styles.premiumValueNew]}>
                ${savingsData.projectedPremium}/yr
              </Text>
            </View>
          </View>
          <ProgressBar
            progress={savingsData.discountPercentage}
            label="Savings Progress"
            showPercentage
            color="#22c55e"
            height={10}
          />
        </View>

        {/* Savings Factors */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>What Affects Your Savings</Text>
          {savingsData.factors.map((factor, index) => (
            <View key={index} style={styles.factorRow}>
              <View style={styles.factorInfo}>
                <Text style={styles.factorName}>{factor.name}</Text>
                <Text style={styles.factorDescription}>{factor.description}</Text>
              </View>
              <View style={styles.factorImpact}>
                <Text style={styles.factorImpactValue}>+{factor.impact}%</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Savings History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Savings History</Text>
          <View style={styles.historyContainer}>
            {savingsData.history.map((item, index) => (
              <View key={index} style={styles.historyItem}>
                <View style={styles.historyBar}>
                  <View
                    style={[
                      styles.historyFill,
                      { height: `${(item.savings / 500) * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.historyMonth}>{item.month}</Text>
                <Text style={styles.historySavings}>${item.savings}</Text>
                <Text style={styles.historyScore}>{item.score}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Membership Benefits */}
        <View style={styles.card}>
          <View style={styles.membershipHeader}>
            <Text style={styles.cardTitle}>Your Membership</Text>
            <View style={styles.levelBadge}>
              <Text style={styles.levelBadgeText}>
                {savingsData.membershipLevel.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={styles.membershipSubtitle}>Member Benefits</Text>
          {savingsData.memberBenefits.map((benefit, index) => (
            <View key={index} style={styles.benefitRow}>
              <Text style={styles.benefitCheck}>✓</Text>
              <Text style={styles.benefitText}>{benefit}</Text>
            </View>
          ))}
        </View>

        {/* Disclaimer */}
        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            * Savings are estimates based on your driving data and may vary.
            Contact your insurance provider for actual quotes.
          </Text>
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
  mainCard: {
    margin: 20,
    padding: 24,
    backgroundColor: '#22c55e',
    borderRadius: 20,
    alignItems: 'center',
  },
  mainCardLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8,
  },
  savingsAmount: {
    fontSize: 48,
    fontWeight: '700',
    color: '#fff',
  },
  discountContainer: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
  },
  discountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  premiumRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  premiumItem: {
    alignItems: 'center',
  },
  premiumLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 4,
  },
  premiumValue: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  premiumValueNew: {
    color: '#22c55e',
  },
  arrowContainer: {
    paddingHorizontal: 20,
  },
  arrow: {
    fontSize: 24,
    color: '#9ca3af',
  },
  factorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  factorInfo: {
    flex: 1,
  },
  factorName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  factorDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  factorImpact: {
    backgroundColor: '#22c55e',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  factorImpactValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  historyContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 150,
  },
  historyItem: {
    alignItems: 'center',
  },
  historyBar: {
    width: 40,
    height: 100,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  historyFill: {
    backgroundColor: '#22c55e',
    borderRadius: 8,
    width: '100%',
  },
  historyMonth: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 8,
  },
  historySavings: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 4,
  },
  historyScore: {
    fontSize: 10,
    color: '#9ca3af',
  },
  membershipHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  levelBadge: {
    backgroundColor: '#f59e0b',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  levelBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#fff',
  },
  membershipSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  benefitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  benefitCheck: {
    fontSize: 14,
    color: '#22c55e',
    marginRight: 12,
    fontWeight: '600',
  },
  benefitText: {
    fontSize: 14,
    color: '#1f2937',
  },
  disclaimer: {
    padding: 20,
    paddingTop: 0,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});

export default SavingsScreen;
