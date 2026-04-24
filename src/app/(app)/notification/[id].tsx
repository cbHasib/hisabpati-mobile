import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import {
  useGetNotificationQuery,
  useMarkNotificationReadMutation,
} from '@/src/redux/api.config/notificationApi';
import { NotificationType } from '@/src/interface/common.interface';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';

const TYPE_CONFIG: Record<
  NotificationType,
  { icon: keyof typeof Ionicons.glyphMap; color: string; label: string }
> = {
  expense:  { icon: 'arrow-up-circle',    color: COLORS.expense,  label: 'Expense' },
  income:   { icon: 'arrow-down-circle',  color: COLORS.income,   label: 'Income' },
  transfer: { icon: 'swap-horizontal',    color: COLORS.transfer, label: 'Transfer' },
  loan:     { icon: 'cash',               color: COLORS.loan,     label: 'Loan' },
  system:   { icon: 'information-circle', color: COLORS.primary,  label: 'System' },
  reminder: { icon: 'alarm',              color: '#8B5CF6',       label: 'Reminder' },
};

function formatDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  } catch {
    return iso;
  }
}

export default function NotificationDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, isError } = useGetNotificationQuery(id ?? '', { skip: !id });
  const [markRead] = useMarkNotificationReadMutation();

  const notification = data?.data;

  // Auto-mark as read on open
  useEffect(() => {
    if (notification && !notification.isRead) {
      markRead(notification._id).catch(() => {});
    }
  }, [notification, markRead]);

  const cfg = notification
    ? (TYPE_CONFIG[notification.type] ?? TYPE_CONFIG.system)
    : TYPE_CONFIG.system;

  return (
    <View style={[styles.screen, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={20} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>Notification</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Content */}
      {isLoading ? (
        <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 60 }} />
      ) : isError || !notification ? (
        <View style={styles.errorWrap}>
          <Ionicons name="alert-circle-outline" size={48} color={COLORS.textMuted} />
          <Text style={styles.errorText}>Notification not found</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => router.back()}>
            <Text style={styles.retryText}>Go back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 32 }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero card */}
          <View style={[styles.heroCard, { borderTopColor: cfg.color }]}>
            <View style={[styles.heroIconWrap, { backgroundColor: cfg.color + '18' }]}>
              <Ionicons name={cfg.icon} size={36} color={cfg.color} />
            </View>

            <View style={[styles.typePill, { backgroundColor: cfg.color + '18' }]}>
              <Text style={[styles.typeText, { color: cfg.color }]}>{cfg.label}</Text>
            </View>

            <Text style={styles.heroTitle}>{notification.title}</Text>
            <Text style={styles.heroTime}>{formatDateTime(notification.createdAt)}</Text>
          </View>

          {/* Message card */}
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Message</Text>
            <Text style={styles.cardBody}>{notification.message}</Text>
          </View>

          {/* Meta card (if any extra fields) */}
          {notification.meta && Object.keys(notification.meta).length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Details</Text>
              {Object.entries(notification.meta).map(([key, val]) => (
                <View key={key} style={styles.metaRow}>
                  <Text style={styles.metaKey}>
                    {key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase())}
                  </Text>
                  <Text style={styles.metaVal}>{String(val)}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Status pill */}
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusPill,
                notification.isRead ? styles.statusRead : styles.statusUnread,
              ]}
            >
              <Ionicons
                name={notification.isRead ? 'checkmark-circle' : 'ellipse'}
                size={14}
                color={notification.isRead ? COLORS.success : COLORS.primary}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: notification.isRead ? COLORS.success : COLORS.primary },
                ]}
              >
                {notification.isRead ? 'Read' : 'Unread'}
              </Text>
            </View>
          </View>
        </ScrollView>
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
    justifyContent: 'space-between',
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
  headerTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
  },

  // Scroll
  scroll: {
    padding: SPACING.md,
    gap: 12,
  },

  // Hero
  heroCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    alignItems: 'center',
    borderTopWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
    marginBottom: 4,
  },
  heroIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  typePill: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: RADIUS.full,
    marginBottom: 12,
  },
  typeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  heroTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 26,
  },
  heroTime: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textMuted,
  },

  // Card
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  cardBody: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    lineHeight: 22,
  },

  // Meta
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  metaKey: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  metaVal: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },

  // Status
  statusRow: {
    alignItems: 'center',
    marginTop: 4,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: RADIUS.full,
  },
  statusRead: {
    backgroundColor: COLORS.success + '18',
  },
  statusUnread: {
    backgroundColor: COLORS.primaryLight,
  },
  statusText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '700',
  },

  // Error
  errorWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    padding: SPACING.xl,
  },
  errorText: {
    fontSize: FONT_SIZE.base,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    marginTop: 4,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: '700',
    fontSize: FONT_SIZE.sm,
  },
});
