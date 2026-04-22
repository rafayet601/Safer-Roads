import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: string;
  height?: number;
  backgroundColor?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  label,
  showPercentage = false,
  color = '#22c55e',
  height = 8,
  backgroundColor = '#e5e7eb',
}) => {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <View style={styles.container}>
      {(label || showPercentage) && (
        <View style={styles.labelContainer}>
          {label && <Text style={styles.label}>{label}</Text>}
          {showPercentage && (
            <Text style={[styles.percentage, { color }]}>
              {Math.round(clampedProgress)}%
            </Text>
          )}
        </View>
      )}
      <View style={[styles.track, { height, backgroundColor }]}>
        <View 
          style={[
            styles.fill, 
            { 
              width: `${clampedProgress}%`, 
              backgroundColor: color,
              height,
            }
          ]} 
        />
      </View>
    </View>
  );
};

interface MultiSegmentProgressProps {
  segments: {
    value: number;
    color: string;
    label?: string;
  }[];
  height?: number;
  showLegend?: boolean;
}

export const MultiSegmentProgress: React.FC<MultiSegmentProgressProps> = ({
  segments,
  height = 12,
  showLegend = false,
}) => {
  const total = segments.reduce((sum, seg) => sum + seg.value, 0);

  return (
    <View style={styles.multiContainer}>
      <View style={[styles.multiTrack, { height }]}>
        {segments.map((segment, index) => (
          <View
            key={index}
            style={[
              styles.multiSegment,
              {
                width: `${(segment.value / total) * 100}%`,
                backgroundColor: segment.color,
                height,
              },
              index === 0 && styles.multiSegmentFirst,
              index === segments.length - 1 && styles.multiSegmentLast,
            ]}
          />
        ))}
      </View>
      {showLegend && (
        <View style={styles.legend}>
          {segments.map((segment, index) => (
            <View key={index} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              {segment.label && (
                <Text style={styles.legendLabel}>
                  {segment.label}: {segment.value}
                </Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: {
    fontSize: 14,
    color: '#4b5563',
    fontWeight: '500',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
  },
  track: {
    width: '100%',
    borderRadius: 100,
    overflow: 'hidden',
  },
  fill: {
    borderRadius: 100,
  },
  // Multi-segment styles
  multiContainer: {
    width: '100%',
  },
  multiTrack: {
    width: '100%',
    flexDirection: 'row',
    borderRadius: 6,
    overflow: 'hidden',
  },
  multiSegment: {},
  multiSegmentFirst: {
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
  },
  multiSegmentLast: {
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    gap: 16,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6,
  },
  legendLabel: {
    fontSize: 12,
    color: '#6b7280',
  },
});

export default ProgressBar;
