import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, RADIUS, SPACING } from '@/src/theme/theme.config';

interface AmountCardProps {
  label: string;
  amount: number;
  currency?: string;
  type?: 'income' | 'expense' | 'balance' | 'loan' | 'transfer';
  icon?: keyof typeof Ionicons.glyphMap;
  discreet?: boolean;
}

const typeConfig = {
  income: { bg: '#ECFDF5', color: COLORS.income, icon: 'trending-up' as const },
  expense: { bg: '#FEF2F2', color: COLORS.expense, icon: 'trending-down' as const },
  balance: { bg: COLORS.primaryLight, color: COLORS.primary, icon: 'wallet' as const },
  loan: { bg: '#FFFBEB', color: COLORS.loan, icon: 'cash' as const },
  transfer: { bg: '#EFF6FF', color: COLORS.transfer, icon: 'swap-horizontal' as const },
};

export function AmountCard({ label, amount, currency = 'BDT', type = 'balance', discreet }: AmountCardProps) {
  const config = typeConfig[type];
  const symbol = currency === 'BDT' ? '৳' : '$';
  const displayAmount = discreet
    ? '••••••'
    : `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <View style={[styles.card, { backgroundColor: config.bg }]}>
      <View style={[styles.iconWrap, { backgroundColor: config.color + '20' }]}>
        <Ionicons name={config.icon} size={20} color={config.color} />
      </View>
      <Text style={[styles.amount, { color: config.color }]} numberOfLines={1}>
        {displayAmount}
      </Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

interface TransactionItemProps {
  title: string;
  subtitle?: string;
  amount: number;
  currency?: string;
  date?: string;
  type: 'income' | 'expense' | 'transfer';
  onPress?: () => void;
  discreet?: boolean;
}

export function TransactionItem({
  title,
  subtitle,
  amount,
  currency = 'BDT',
  date,
  type,
  onPress,
  discreet,
}: TransactionItemProps) {
  const color = type === 'income' ? COLORS.income : type === 'expense' ? COLORS.expense : COLORS.transfer;
  const sign = type === 'income' ? '+' : '-';
  const symbol = currency === 'BDT' ? '৳' : '$';
  const displayAmount = discreet
    ? '••••'
    : `${sign}${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}`;

  return (
    <TouchableOpacity onPress={onPress} style={styles.txItem} activeOpacity={0.7}>
      <View style={[styles.txIcon, { backgroundColor: color + '18' }]}>
        <Ionicons
          name={type === 'income' ? 'arrow-down-circle' : type === 'expense' ? 'arrow-up-circle' : 'swap-horizontal'}
          size={22}
          color={color}
        />
      </View>
      <View style={styles.txInfo}>
        <Text style={styles.txTitle} numberOfLines={1}>{title}</Text>
        {subtitle && <Text style={styles.txSubtitle} numberOfLines={1}>{subtitle}</Text>}
      </View>
      <View style={styles.txRight}>
        <Text style={[styles.txAmount, { color }]}>{displayAmount}</Text>
        {date && <Text style={styles.txDate}>{date}</Text>}
      </View>
    </TouchableOpacity>
  );
}

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export function SectionHeader({ title, onSeeAll }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll}>
          <Text style={styles.seeAll}>See All</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: RADIUS.lg,
    padding: SPACING.md,
    margin: 4,
    minWidth: 140,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  amount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '700',
    marginBottom: 4,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  txItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  txIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  txInfo: { flex: 1, marginRight: 8 },
  txTitle: { fontSize: FONT_SIZE.base, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 2 },
  txSubtitle: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  txRight: { alignItems: 'flex-end' },
  txAmount: { fontSize: FONT_SIZE.base, fontWeight: '700', marginBottom: 2 },
  txDate: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 20,
  },
  sectionTitle: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.textPrimary },
  seeAll: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '600' },
});
