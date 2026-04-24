import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetDashboardQuery } from '@/src/redux/api.config/dashboardApi';
import { useAppSelector } from '@/src/redux/hooks';
import { AmountCard, TransactionItem, SectionHeader } from '@/src/components/ui/FinanceCards';
import BottomSheetModal from '@/src/components/ui/BottomSheetModal';
import AddExpenseForm from '@/src/components/screen/expense/AddExpenseForm';
import AddIncomeForm from '@/src/components/screen/income/AddIncomeForm';
import AddTransferForm from '@/src/components/screen/transfer/AddTransferForm';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';
import { formatRelativeDate, formatCurrency } from '@/src/utils/formatters';

type ModalType = 'expense' | 'income' | 'transfer' | null;

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);
  const discreet = user?.settings?.discreetMode ?? false;
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const { data, isLoading, refetch, isFetching } = useGetDashboardQuery();

  const dashboard = data?.data;
  const recentTx = data?.data?.recentTransactions ?? [];
  const expenseCategories = dashboard?.expenseByCategory ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View>
          <Text style={styles.greeting}>Good {getGreeting()} 👋</Text>
          <Text style={styles.userName}>{user?.name?.split(' ')[0] ?? 'User'}</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[styles.badge, { backgroundColor: getBadgeColor(user?.package ?? 'free') + '20' }]}>
            <Text style={[styles.badgeText, { color: getBadgeColor(user?.package ?? 'free') }]}>
              {(user?.package ?? 'Free').charAt(0).toUpperCase() + (user?.package ?? 'free').slice(1)}
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        refreshControl={
          <RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={COLORS.primary} />
        }
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <ActivityIndicator color={COLORS.primary} size="large" style={{ marginTop: 40 }} />
        ) : (
          <>
            {/* Balance Hero */}
            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>Total Balance</Text>
              <Text style={styles.heroAmount}>
                {discreet ? '৳ ••••••' : formatCurrency(dashboard?.balance ?? 0)}
              </Text>
              <View style={styles.heroRow}>
                <View style={styles.heroItem}>
                  <Ionicons name="arrow-down-circle" size={16} color={COLORS.income} />
                  <Text style={styles.heroItemLabel}>Income</Text>
                  <Text style={[styles.heroItemAmount, { color: COLORS.income }]}>
                    {discreet ? '••••' : formatCurrency(dashboard?.totalIncome ?? 0)}
                  </Text>
                </View>
                <View style={styles.heroDivider} />
                <View style={styles.heroItem}>
                  <Ionicons name="arrow-up-circle" size={16} color={COLORS.expense} />
                  <Text style={styles.heroItemLabel}>Expense</Text>
                  <Text style={[styles.heroItemAmount, { color: COLORS.expense }]}>
                    {discreet ? '••••' : formatCurrency(dashboard?.totalExpense ?? 0)}
                  </Text>
                </View>
              </View>
            </View>

            {/* Loan Cards */}
            <View style={styles.cardsRow}>
              <AmountCard
                label="Loan Given"
                amount={dashboard?.pendingLoanGiven ?? 0}
                type="loan"
                discreet={discreet}
              />
              <AmountCard
                label="Loan Taken"
                amount={dashboard?.pendingLoanTaken ?? 0}
                type="transfer"
                discreet={discreet}
              />
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsCard}>
              <Text style={styles.actionsTitle}>Quick Add</Text>
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#FEF2F2' }]}
                  onPress={() => setActiveModal('expense')}
                >
                  <Ionicons name="arrow-up-circle" size={24} color={COLORS.expense} />
                  <Text style={[styles.actionLabel, { color: COLORS.expense }]}>Expense</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#ECFDF5' }]}
                  onPress={() => setActiveModal('income')}
                >
                  <Ionicons name="arrow-down-circle" size={24} color={COLORS.income} />
                  <Text style={[styles.actionLabel, { color: COLORS.income }]}>Income</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.actionBtn, { backgroundColor: '#EFF6FF' }]}
                  onPress={() => setActiveModal('transfer')}
                >
                  <Ionicons name="swap-horizontal" size={24} color={COLORS.transfer} />
                  <Text style={[styles.actionLabel, { color: COLORS.transfer }]}>Transfer</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Expense by category */}
            {expenseCategories.length > 0 && (
              <>
                <SectionHeader title="Spending by Category" />
                <View style={styles.categoriesCard}>
                  {expenseCategories.slice(0, 5).map((cat: any, i: number) => {
                    const total = expenseCategories.reduce((s: number, c: any) => s + (c.amount ?? c.total ?? 0), 0);
                    const amount = cat.amount ?? cat.total ?? 0;
                    const pct = total > 0 ? (amount / total) * 100 : 0;
                    return (
                      <View key={i} style={styles.categoryRow}>
                        <View style={[styles.categoryDot, { backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }]} />
                        <Text style={styles.categoryName} numberOfLines={1}>{cat._id ?? cat.name ?? 'Other'}</Text>
                        <View style={styles.categoryBarWrap}>
                          <View style={[styles.categoryBar, { width: `${pct}%`, backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] + '80' }]} />
                        </View>
                        <Text style={styles.categoryAmount}>{discreet ? '••••' : formatCurrency(amount)}</Text>
                      </View>
                    );
                  })}
                </View>
              </>
            )}

            {/* Recent Transactions */}
            <SectionHeader title="Recent Transactions" />
            <View style={styles.txCard}>
              {recentTx.length === 0 ? (
                <View style={styles.emptyTx}>
                  <Ionicons name="receipt-outline" size={36} color={COLORS.textMuted} />
                  <Text style={styles.emptyTxText}>No transactions yet</Text>
                </View>
              ) : (
                recentTx.slice(0, 8).map((tx: any, i: number) => (
                  <TransactionItem
                    key={tx._id ?? i}
                    title={tx.note ?? tx.type ?? 'Transaction'}
                    subtitle={
                      typeof tx.category === 'object'
                        ? tx.category?.name
                        : typeof tx.account === 'object'
                        ? tx.account?.name
                        : undefined
                    }
                    amount={tx.amount}
                    type={tx.type?.toLowerCase() ?? 'expense'}
                    date={tx.date ? formatRelativeDate(tx.date) : undefined}
                    discreet={discreet}
                  />
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* Modals */}
      <BottomSheetModal
        visible={activeModal === 'expense'}
        onClose={() => setActiveModal(null)}
        title="Add Expense"
      >
        <AddExpenseForm onSuccess={() => setActiveModal(null)} />
      </BottomSheetModal>

      <BottomSheetModal
        visible={activeModal === 'income'}
        onClose={() => setActiveModal(null)}
        title="Add Income"
      >
        <AddIncomeForm onSuccess={() => setActiveModal(null)} />
      </BottomSheetModal>

      <BottomSheetModal
        visible={activeModal === 'transfer'}
        onClose={() => setActiveModal(null)}
        title="Transfer Money"
      >
        <AddTransferForm onSuccess={() => setActiveModal(null)} />
      </BottomSheetModal>
    </View>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Morning';
  if (h < 17) return 'Afternoon';
  return 'Evening';
}

function getBadgeColor(pkg: string) {
  if (pkg === 'premium') return '#F59E0B';
  if (pkg === 'basic') return '#6C63FF';
  return '#6B7280';
}

const CATEGORY_COLORS = [
  COLORS.primary,
  COLORS.income,
  COLORS.expense,
  COLORS.loan,
  COLORS.transfer,
  '#8B5CF6',
  '#EC4899',
];

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  greeting: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  userName: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.textPrimary, marginTop: 2 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: RADIUS.full,
  },
  badgeText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  scroll: { padding: SPACING.md },
  heroCard: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  heroLabel: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.75)', marginBottom: 4 },
  heroAmount: { fontSize: FONT_SIZE.xxxl, fontWeight: '800', color: COLORS.white, marginBottom: SPACING.md },
  heroRow: { flexDirection: 'row', alignItems: 'center' },
  heroItem: { flex: 1, alignItems: 'center', gap: 4 },
  heroDivider: { width: 1, height: 40, backgroundColor: 'rgba(255,255,255,0.2)' },
  heroItemLabel: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.7)' },
  heroItemAmount: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.white },
  cardsRow: { flexDirection: 'row', marginBottom: SPACING.md },
  actionsCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  actionsTitle: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 12 },
  actionsRow: { flexDirection: 'row', gap: 10 },
  actionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    gap: 6,
  },
  actionLabel: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  categoriesCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  categoryDot: { width: 10, height: 10, borderRadius: 5 },
  categoryName: { width: 80, fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  categoryBarWrap: {
    flex: 1,
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: RADIUS.full,
    overflow: 'hidden',
  },
  categoryBar: { height: '100%', borderRadius: RADIUS.full },
  categoryAmount: { fontSize: FONT_SIZE.xs, fontWeight: '600', color: COLORS.textPrimary, minWidth: 70, textAlign: 'right' },
  txCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    paddingHorizontal: SPACING.md,
    paddingTop: 4,
    paddingBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  emptyTx: { alignItems: 'center', paddingVertical: SPACING.xl, gap: 8 },
  emptyTxText: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted },
});
