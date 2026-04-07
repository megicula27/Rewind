/**
 * Rewind — GlassTabBar
 * 
 * Custom glassmorphic bottom tab bar.
 * Surface color at 80% opacity + backdrop-blur for the "cherry blossom bleeds through" effect.
 * Uses MaterialCommunityIcons per user's preference.
 */

import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '../theme/colors';
import { Spacing, Radius } from '../theme/spacing';
import { Typography, FontFamily } from '../theme/typography';
import Animated, { 
  useAnimatedStyle, 
  withTiming, 
  withSpring,
  interpolateColor 
} from 'react-native-reanimated';
import { Text } from 'react-native';

interface TabConfig {
  name: string;
  label: string;
  icon: string;
  iconFocused: string;
}

const TABS: TabConfig[] = [
  { name: 'index', label: 'Home', icon: 'home-outline', iconFocused: 'home' },
  { name: 'add', label: 'Add', icon: 'plus-circle-outline', iconFocused: 'plus-circle' },
  { name: 'points-screen', label: 'Points', icon: 'star-outline', iconFocused: 'star' },
  { name: 'profile', label: 'Profile', icon: 'account-outline', iconFocused: 'account' },
];

interface GlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function TabButton({ 
  tab, 
  isActive, 
  onPress, 
  onLongPress 
}: { 
  tab: TabConfig; 
  isActive: boolean; 
  onPress: () => void;
  onLongPress: () => void;
}) {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withSpring(isActive ? 1 : 0.95, { damping: 15 }) },
      ],
    };
  }, [isActive]);

  const pillStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isActive ? 1 : 0, { duration: 300 }),
      transform: [
        { scaleX: withSpring(isActive ? 1 : 0.5, { damping: 15 }) },
      ],
    };
  }, [isActive]);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      style={styles.tabButton}
      accessibilityRole="tab"
      accessibilityState={{ selected: isActive }}
      accessibilityLabel={tab.label}
    >
      <Animated.View style={[styles.tabContent, animatedStyle]}>
        {/* Active pill indicator */}
        <Animated.View style={[styles.activePill, pillStyle]} />
        
        <MaterialCommunityIcons
          name={isActive ? tab.iconFocused as any : tab.icon as any}
          size={24}
          color={isActive ? Colors.primary : Colors.neutral}
        />
        <Text
          style={[
            styles.tabLabel,
            { 
              color: isActive ? Colors.primary : Colors.neutral,
              fontFamily: isActive ? FontFamily.semiBold : FontFamily.medium,
            },
          ]}
          numberOfLines={1}
        >
          {tab.label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function GlassTabBar({ state, descriptors, navigation }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const bottomPadding = Math.max(insets.bottom, Spacing.compact);
  const visibleRoutes = state.routes.filter((route: any) =>
    TABS.some((tab) => tab.name === route.name)
  );

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <BlurView
        intensity={80}
        tint="light"
        style={[StyleSheet.absoluteFill, styles.blur]}
      />
      <View style={styles.tabRow}>
        {visibleRoutes.map((route: any) => {
          const tab = TABS.find((t) => t.name === route.name) || TABS[0];
          const routeIndex = state.routes.findIndex((item: any) => item.key === route.key);
          const isActive = state.index === routeIndex;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isActive && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <TabButton
              key={route.key}
              tab={tab}
              isActive={isActive}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: `${Colors.surface}CC`, // 80% opacity
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    overflow: 'hidden',
  },
  blur: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
  },
  tabRow: {
    flexDirection: 'row',
    paddingTop: Spacing.compact,
    paddingHorizontal: Spacing.cozy,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56, // Accessibility min tap target
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.compact,
    paddingHorizontal: Spacing.cozy,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    left: -4,
    right: -4,
    bottom: 0,
    backgroundColor: Colors.primary_container,
    borderRadius: Radius.full,
    opacity: 0.5,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
    letterSpacing: 0.1,
  },
});
