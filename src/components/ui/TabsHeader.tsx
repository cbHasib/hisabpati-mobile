import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import { useAppSelector } from '@/src/redux/hooks';
import { useGetNotificationsQuery } from '@/src/redux/api.config/notificationApi';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function getBadgeColor(pkg: string) {
  if (pkg === 'premium') return '#F59E0B';
  if (pkg === 'basic') return COLORS.primary;
  return COLORS.textSecondary;
}

/** Two-letter initials from a full name */
function getInitials(name?: string | null) {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function TabsHeader({ route, options }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAppSelector((state) => state.auth);

  // Live unread count from the notifications cache
  const { data: notifData } = useGetNotificationsQuery();
  const unreadCount = (notifData?.data ?? []).filter((n) => !n.isRead).length;

  const isDashboard = route.name === 'dashboard';

  // Per-screen right action injected via navigation.setOptions
  const rightAction =
    typeof options.headerRight === 'function'
      ? options.headerRight({ tintColor: COLORS.textPrimary })
      : null;

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      {/* ── Left ── */}
      <View style={styles.left}>
        {isDashboard ? (
          <>
            <Text style={styles.greeting}>Good {getGreeting()} 👋</Text>
            <View style={styles.nameRow}>
              <Text style={styles.userName} numberOfLines={1}>
                {user?.name?.split(' ')[0] ?? 'User'}
              </Text>
              {user?.package && (
                <View
                  style={[
                    styles.pkgBadge,
                    { backgroundColor: getBadgeColor(user.package) + '22' },
                  ]}
                >
                  <Text style={[styles.pkgText, { color: getBadgeColor(user.package) }]}>
                    {user.package.charAt(0).toUpperCase() + user.package.slice(1)}
                  </Text>
                </View>
              )}
            </View>
          </>
        ) : (
          <Text style={styles.pageTitle} numberOfLines={1}>
            {options.title ?? route.name}
          </Text>
        )}
      </View>

      {/* ── Right ── */}
      <View style={styles.right}>
        {/* Per-screen action (e.g. + button from screens) */}
        {rightAction}

        {/* Notification bell */}
        <TouchableOpacity
          style={styles.iconBtn}
          onPress={() => router.push('/(app)/notifications' as never)}
          activeOpacity={0.7}
        >
          <Ionicons name="notifications-outline" size={20} color={COLORS.textPrimary} />
          {unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>

        {/* Avatar */}
        <TouchableOpacity
          style={[styles.avatar, { backgroundColor: COLORS.primary + '22' }]}
          onPress={() => router.push('/(app)/(tabs)/profile' as never)}
          activeOpacity={0.8}
        >
          <Text style={styles.avatarText}>{getInitials(user?.name)}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingBottom: 14,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },

  // Left
  left: {
    flex: 1,
    marginRight: 12,
    justifyContent: 'flex-end',
  },
  greeting: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    marginBottom: 2,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  pkgBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  pkgText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
  },
  pageTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  // Right
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 5,
    right: 5,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: COLORS.expense,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: COLORS.white,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 12,
  },

  // Avatar
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },
});

