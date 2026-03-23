import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
    Platform,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
    ViewStyle,
} from 'react-native';

type SettingItemType = 'arrow' | 'switch' | 'text';

interface SettingItemProps {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description?: string;
  value?: string | boolean;
  onValueChange?: (newValue: boolean) => void;
  type?: SettingItemType;
  color?: string;
  isLast?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

const SettingItem: React.FC<SettingItemProps> = ({
  icon,
  title,
  description,
  value,
  onValueChange,
  type = 'arrow',
  color = '#64748b',
  isLast = false,
  onPress,
  style,
}) => {
  const isSwitch = type === 'switch';

  // Handle row tap for switches to improve UX
  const handlePress = () => {
    if (isSwitch && onValueChange && typeof value === 'boolean') {
      onValueChange(!value);
    } else if (onPress) {
      onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.item, isLast && styles.noBorder, style]}
      onPress={handlePress}
      // If it's a switch, we handle the press via the row, so we don't disable it
      activeOpacity={0.6}
    >
      {/* Icon with subtle background - using opacity for professional depth */}
      <View style={[styles.iconWrapper, { backgroundColor: `${color}12` }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>

      <View style={styles.textContainer}>
        <Text style={styles.itemTitle} numberOfLines={1}>
          {title}
        </Text>
        {description && (
          <Text style={styles.itemDescription} numberOfLines={2}>
            {description}
          </Text>
        )}
      </View>

      <View style={styles.rightContent}>
        {type === 'arrow' && (
          <Ionicons name="chevron-forward" size={18} color="#cbd5e1" />
        )}

        {type === 'switch' && typeof value === 'boolean' && (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#e2e8f0', true: color }} // Uses item's color for active state
            thumbColor={Platform.OS === 'ios' ? '#fff' : value ? '#fff' : '#f4f3f4'}
            // Prevents the switch from intercepting the touch if the row is tapped
            pointerEvents="none" 
          />
        )}

        {type === 'text' && typeof value === 'string' && (
          <View style={styles.valueWrapper}>
            <Text style={styles.itemValue}>{value}</Text>
            <Ionicons name="chevron-forward" size={14} color="#cbd5e1" />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12, // Slightly tighter padding for a cleaner look
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  noBorder: {
    borderBottomWidth: 0,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16, // Slightly larger for better readability
    fontWeight: '500', // Medium weight looks more premium than Bold
    color: '#1e293b',
  },
  itemDescription: {
    fontSize: 13,
    color: '#64748b',
    marginTop: 1,
  },
  rightContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  valueWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  itemValue: {
    fontSize: 15,
    color: '#94a3b8',
    marginRight: 6,
  },
});

export default SettingItem;