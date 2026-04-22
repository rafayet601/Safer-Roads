import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Achievement } from '../types';

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress?: () => void;
  size?: 'small' | 'medium' | 'large';
}

const AchievementBadge: React.FC<AchievementBadgeProps> = ({ 
  achievement, 
  onPress,
  size = 'medium' 
}) => {
  const isUnlocked = !!achievement.unlockedAt;
  const progress = Math.min((achievement.progress / achievement.target) * 100, 100);

  const dimensions = {
    small: { container: 64, icon: 24, title: 10, desc: 8 },
    medium: { container: 100, icon: 36, title: 12, desc: 10 },
    large: { container: 140, icon: 48, title: 14, desc: 12 },
  };

  const { container, icon, title, desc } = dimensions[size];

  const getBadgeColor = (): string => {
    if (isUnlocked) return '#22c55e'; // Green - unlocked
    if (progress > 0) return '#3b82f6'; // Blue - in progress
    return '#9ca3af'; // Gray - not started
  };

  const getIconEmoji = (iconName: string): string => {
    const iconMap: Record<string, string> = {
      'trophy': '🏆',
      'star': '⭐',
      'fire': '🔥',
      'medal': '🏅',
      'target': '🎯',
      'road': '🛣️',
      'car': '🚗',
      'speedometer': '⚡',
      'shield': '🛡️',
      'crown': '👑',
    };
    return iconMap[iconName] || '🎖️';
  };

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}
    >
      <View style={[
        styles.badgeCircle,
        {
          width: container,
          height: container,
          borderRadius: container / 2,
          backgroundColor: isUnlocked ? getBadgeColor() : '#f3f4f6',
          borderColor: getBadgeColor(),
          borderWidth: isUnlocked ? 0 : 2,
        }
      ]}>
        <Text style={[
          styles.icon,
          { 
            fontSize: icon,
            opacity: isUnlocked ? 1 : 0.4,
          }
        ]}>
          {getIconEmoji(achievement.icon)}
        </Text>
        
        {!isUnlocked && progress > 0 && (
          <View style={styles.progressRing}>
            <View 
              style={[
                styles.progressFill, 
                { 
                  width: `${progress}%`,
                  backgroundColor: getBadgeColor(),
                }
              ]} 
            />
          </View>
        )}
      </View>

      <Text style={[styles.title, { fontSize: title }]} numberOfLines={1}>
        {achievement.name}
      </Text>
      
      {size !== 'small' && (
        <Text style={[styles.description, { fontSize: desc }]} numberOfLines={2}>
          {achievement.description}
        </Text>
      )}

      {!isUnlocked && size !== 'small' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFillBar, 
                { 
                  width: `${progress}%`,
                  backgroundColor: getBadgeColor(),
                }
              ]} 
            />
          </View>
          <Text style={styles.progressText}>
            {achievement.progress}/{achievement.target}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginHorizontal: 8,
    marginVertical: 8,
  },
  badgeCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  icon: {
    textAlign: 'center',
  },
  progressRing: {
    position: 'absolute',
    bottom: -4,
    left: '50%',
    marginLeft: -15,
    width: 30,
    height: 6,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  title: {
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  description: {
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 8,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    marginRight: 8,
    overflow: 'hidden',
  },
  progressFillBar: {
    height: '100%',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 10,
    color: '#9ca3af',
    minWidth: 30,
  },
});

export default AchievementBadge;
