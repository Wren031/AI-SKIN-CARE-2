import { THEMES } from '@/src/constants/themes';
import { useTabVisibility } from '@/src/context/TabVisibilityContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const theme = THEMES.DERMA_AI;
const { COLORS, RADIUS } = theme;

// Wellness-inspired colors if not in your theme
const SOFT_ROSE = '#FB7185';
const SOFT_SAGE = '#F0FDF4';

export default function TabLayout() {
  const { isTabBarVisible } = useTabVisibility();
  const offsetAnim = useRef(new Animated.Value(0)).current;
  const router = useRouter();

  useEffect(() => {
    Animated.spring(offsetAnim, {
      toValue: isTabBarVisible ? 0 : 150,
      friction: 8,
      tension: 50,
      useNativeDriver: true,
    }).start();
  }, [isTabBarVisible]);

  return (
    <View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: SOFT_ROSE, // Warm, healthy glow color
          tabBarInactiveTintColor: '#94A3B8',
          tabBarLabelStyle: styles.labelStyle,
          tabBarStyle: [
            styles.tabBar,
            {
              transform: [{ translateY: offsetAnim }],
              opacity: isTabBarVisible ? 1 : 0,
            },
          ],
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Today', // More personal than "Home"
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "leaf" : "leaf-outline"} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="progress"
          options={{
            title: 'Journey', // Skincare is a process/journey
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "sparkles" : "sparkles-outline"} size={22} color={color} />
            ),
          }}
        />

        {/* Floating Glow Scan Button */}
        <Tabs.Screen
          name="camera-scan"
          options={{
            title: '',
            tabBarIcon: () => (
              <View style={styles.scanButtonContainer}>
                <View style={styles.scanButton}>
                  <Ionicons name="camera" size={28} color={COLORS.WHITE} />
                </View>
              </View>
            ),
          }}
        />

        <Tabs.Screen
          name="history"
          options={{
            title: 'Diary', // Personal history/logging
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "calendar" : "calendar-outline"} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="settings"
          options={{
            title: 'Profile',
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? "person" : "person-outline"} size={22} color={color} />
            ),
          }}
        />
      </Tabs>

      {/* Floating AI Assistant - Softened and Rounded */}
      {isTabBarVisible && (
        <Animated.View 
          style={[
            styles.floatingChatWrapper, 
            { transform: [{ translateY: offsetAnim }] }
          ]}
        >
          <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.chatFab}
            onPress={() => router.push('/chat-boot')}
          >
            <View style={styles.aiIconCircle}>
                <Ionicons name="chatbubble-ellipses" size={16} color={SOFT_ROSE} />
            </View>
            <Text style={styles.chatFabText}>Ask Beauty AI</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',

    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 30, // Very rounded for wellness vibe
    borderTopWidth: 0,
    height: 90,
    paddingBottom: Platform.OS === 'ios' ? 5 : 10,
    paddingTop: 10,
    // Soft organic shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 5,
  },
  labelStyle: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: -2,
  },
  scanButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  scanButton: {
    width: 64,
    height: 64,
    backgroundColor: SOFT_ROSE,
    borderRadius: 32, // Perfect circle
    justifyContent: 'center',
    alignItems: 'center',
    top: -20, // Pop out of the bar
    borderWidth: 6,
    borderColor: '#FFFFFF',
    shadowColor: SOFT_ROSE,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 10,
  },
  floatingChatWrapper: {
    position: 'absolute',
    bottom: 110, 
    right: 25,
    zIndex: 1000,
  },
  chatFab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B', // Dark slate for clear contrast
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 25,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  aiIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatFabText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
});