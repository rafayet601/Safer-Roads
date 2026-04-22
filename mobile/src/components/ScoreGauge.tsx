import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ScoreGaugeProps {
  score: number;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

const ScoreGauge: React.FC<ScoreGaugeProps> = ({ 
  score, 
  size = 'medium',
  showLabel = true 
}) => {
  const getScoreColor = (scoreValue: number): string => {
    if (scoreValue >= 90) return '#22c55e'; // Green - Excellent
    if (scoreValue >= 70) return '#eab308'; // Yellow - Good
    if (scoreValue >= 50) return '#f97316'; // Orange - Fair
    return '#ef4444'; // Red - Needs improvement
  };

  const getScoreLabel = (scoreValue: number): string => {
    if (scoreValue >= 90) return 'Excellent';
    if (scoreValue >= 70) return 'Good';
    if (scoreValue >= 50) return 'Fair';
    return 'Needs Work';
  };

  const dimensions = {
    small: { container: 80, score: 24, label: 10 },
    medium: { container: 120, score: 36, label: 14 },
    large: { container: 180, score: 56, label: 18 },
  };

  const { container, score: scoreFont, label: labelFont } = dimensions[size];
  const scoreColor = getScoreColor(score);

  // Calculate the sweep angle based on score (0-100 maps to 0-180 degrees)
  const sweepAngle = (score / 100) * 180;

  return (
    <View style={[styles.container, { width: container, height: container / 2 + 20 }]}>
      {/* Background arc */}
      <View style={[
        styles.arcBackground, 
        { 
          width: container, 
          height: container,
          borderRadius: container / 2,
          borderWidth: size === 'small' ? 6 : size === 'medium' ? 10 : 14,
          borderColor: '#e5e7eb',
        }
      ]} />
      
      {/* Score circle */}
      <View style={[
        styles.scoreCircle,
        {
          width: container - (size === 'small' ? 16 : size === 'medium' ? 24 : 32),
          height: container - (size === 'small' ? 16 : size === 'medium' ? 24 : 32),
          borderRadius: (container - (size === 'small' ? 16 : size === 'medium' ? 24 : 32)) / 2,
          backgroundColor: scoreColor,
        }
      ]}>
        <Text style={[styles.scoreText, { fontSize: scoreFont, color: '#fff' }]}>
          {score}
        </Text>
      </View>

      {showLabel && (
        <Text style={[styles.label, { fontSize: labelFont, color: scoreColor }]}>
          {getScoreLabel(score)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  arcBackground: {
    position: 'absolute',
    top: 0,
  },
  scoreCircle: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  scoreText: {
    fontWeight: '700',
  },
  label: {
    fontWeight: '600',
    marginTop: 8,
  },
});

export default ScoreGauge;
