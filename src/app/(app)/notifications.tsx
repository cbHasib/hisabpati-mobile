import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from '@/src/redux/api.config/notificationApi';
import { INotification, NotificationType } from '@/src/interface/common.interface';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';
import { formatRelativeDate } from '@/src/utils/formatters';

// ─── Icon + color per notification type ──────────────────────────────────────
const TYPE_CONFIG: Record<
  NotificationType,
  { icon: keyof typeof Ionicons.glyphMap; color: string }
> = {
  expense:  { icon: 'arrow-up-circle',    color: COLORS.expense },
  income:   { icon: 'arrow-down-circle',  color: COLORS.income },
  transfer: { icon: 'swap-horizontal',    color: COLORS.transfer },
  loan:     { icon: 'cash',               color: COLORS.loan },
  system:   { icon: 'information-circle', color: COLORS.primary },
  reminder: { icon: 'alarm',              color: '#8B5CF6' },
};

// ─── Single row ──────────────────────────────────────────────────────────────
function NotificationRow({
  item,
  onPress,
}: {
  item: INotification;
  onPress: () => void;
}) {
  const cfg = TYPE_CONFIG[item.type] ?? TYPE_CONFIG.system;

  return (
    <Pressable
      style={[styles.row, !item.isRead && styles.rowUnread]}
      onPress={onPress}
      android_ripple={{ color: COLORS.borderLight }}
    >
      {/* Icon bubble */}
      <View style={[styles.iconBubble, { backgroundColor: cfg.color + '18' }]}>
        <Ionicons name={cfg.icon} size={22} color={cfg.color} />
      </View>

      {/* Body */}
      <View style={styles.rowBody}>
        <View style={styles.rowTop}>
          <Text style={[styles.rowTitle, !item.isRead && styles.rowTitleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.rowTime}>
            {item.createdAt ? formatRelativeDate(item.createdAt) : ''}
          </Text>
        </View>
        <Text style={styles.rowMsg} numberOfLines={2}>{item.message}</Text>
      </View>

      {/* Unread dot */}
      {!item.isRead && <View style={[styles.unreadDot, { backgroundColor: cfg.color }]} />}
    </Pressable>
  );
}

// ─── Empty state ─────────────────────────────────────────────────────────────
function EmptyNotifications() {
  return (
    <View style={styles.empty}>
      <View style={styles.emptyIconWrap}>
        <Ionicons name="notifications-off-outline" size={40} color={COLORS.textMuted} />
      </View>
      <Text style={styles.emptyTitle}>All caught up!</Text>
      <Text style={styles.emptySubtitle}>No notifications yet. We'll let you know when something happens.</Text>
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function NotificationsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { data, isLoading, isFetching, refetch } = useGetNotificationsQuery();
  const [markAll, { isLoading: markingAll }] = useMarkAllNotificationsReadMutation();
  const [markOne] = useMarkNotificationReadMutation();

  const notifications = data?.data ?? [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handlePress = useCallback(
    async (item: INotification) => {
      if (!item.isRead) {
        markOne(item._id).catch(() => {});
      }
      router.push(`/(app)/notification/${item._id}` as never);
    },
    [markOne, router],
  );

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <View style={styles.headerBadge}>
              <Text style={styles.headerBadgeText}>{unreadCount}</Text>
            </View>
          )}
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={styles.markAllBtn}
            onPress={() => markAll()}
            disabled={markingAll}
          >
            {markingAll ? (
              <ActivityIndicator size={14} color={COLORS.primary} />
            ) : (
              <Text style={styles.markAllText}>Mark all read</Text>
            )}
          </TouchableOpacity>
        )}
        {unreadCount === 0 && <View style={{ width: 80 }} />}
      </View>

      {/* List */}
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 48 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <NotificationRow item={item} onPress={() => handlePress(item)} />
          )}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          ListEmptyComponent={<EmptyNotifications />}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={COLORS.primary} />
          }
          contentContainerStyle={[
            styles.listContent,
            notifications.length === 0 && styles.listContentEmpty,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: 14,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 3,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 8,
  },
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },
  headerBadge: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.full,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primaryLight,
    minWidth: 80,
    alignItems: 'center',
  },
  markAllText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.primary,
  },

  // List
  listContent: {
    padding: SPACING.md,
    gap: 0,
  },
  listContentEmpty: {
    flex: 1,
    justifyContent: 'center',
  },
  separator: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginLeft: 70,
  },

  // Row
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 14,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  rowUnread: {
    backgroundColor: COLORS.primaryLight,
  },
  iconBubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    flexShrink: 0,
  },
  rowBody: {
    flex: 1,
  },
  rowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  rowTitle: {
    flex: 1,
    fontSize: FONT_SIZE.base,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginRight: 8,
  },
  rowTitleUnread: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  rowTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
    flexShrink: 0,
  },
  rowMsg: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginLeft: 8,
    marginTop: 4,
    flexShrink: 0,
  },

  // Empty
  empty: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    paddingHorizontal: SPACING.xl,
  },
  emptyIconWrap: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 20,
  },
});
