import { useTabVisibility } from '@/src/context/TabVisibilityContext';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, Platform, StyleSheet, View } from 'react-native';

// Oasis Palette
const SAGE = '#2C362B';
const DEEP_SAGE = '#3A4D39';
const INACTIVE = '#CBD5E1';

export default function TabLayout() {
  const { isTabBarVisible } = useTabVisibility();
  const offsetAnim = useRef(new Animated.Value(0)).current;

useEffect(() => {
    Animated.timing(offsetAnim, {
      toValue: isTabBarVisible ? 0 : 150,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isTabBarVisible]);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: SAGE,
        tabBarInactiveTintColor: INACTIVE,
        // ADD THIS: This is the magic line that stops the loop
        tabBarStyle: {
          ...styles.tabBar,
          display: isTabBarVisible ? 'flex' : 'none', // Toggle display based on state
          transform: [{ translateY: offsetAnim }],
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "leaf" : "leaf-outline"} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="progress"
        options={{
          title: 'Journey',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "analytics" : "analytics-outline"} size={22} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="camera-scan"
        options={{
          title: '',
          tabBarButton: isTabBarVisible ? undefined : () => null, 
          tabBarIcon: () => (
            <View style={styles.scanButton}>
              <View style={styles.iconRotate}>
                <Ionicons name="scan" size={28} color="white" />
              </View>
            </View>
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: 'Archive',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "book" : "book-outline"} size={22} color={color} />
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
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    height: Platform.OS === 'ios' ? 95 : 80, 
    paddingBottom: Platform.OS === 'ios' ? 30 : 15,
    paddingTop: 12,
    shadowColor: DEEP_SAGE,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 20,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F1',
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  scanButton: {
    width: 62,
    height: 62,
    backgroundColor: SAGE,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Platform.OS === 'ios' ? -40 : -55,
    borderWidth: 4,
    borderColor: '#fff',
    transform: [{ rotate: '45deg' }],
    shadowColor: SAGE,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  iconRotate: {
    transform: [{ rotate: '-45deg' }],
  },
});