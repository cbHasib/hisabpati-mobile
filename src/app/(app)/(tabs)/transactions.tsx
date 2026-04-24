import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useGetExpensesQuery, useDeleteExpenseMutation } from '@/src/redux/api.config/expenseApi';
import { useGetIncomesQuery, useDeleteIncomeMutation } from '@/src/redux/api.config/incomeApi';
import { useGetTransfersQuery, useDeleteTransferMutation } from '@/src/redux/api.config/transferApi';
import { useAppSelector } from '@/src/redux/hooks';
import { TransactionItem } from '@/src/components/ui/FinanceCards';
import BottomSheetModal from '@/src/components/ui/BottomSheetModal';
import EmptyState from '@/src/components/ui/EmptyState';
import AddExpenseForm from '@/src/components/screen/expense/AddExpenseForm';
import AddIncomeForm from '@/src/components/screen/income/AddIncomeForm';
import AddTransferForm from '@/src/components/screen/transfer/AddTransferForm';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';
import { formatRelativeDate } from '@/src/utils/formatters';

type Tab = 'expense' | 'income' | 'transfer';
type ModalType = 'expense' | 'income' | 'transfer' | null;

export default function TransactionsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);
  const discreet = user?.settings?.discreetMode ?? false;
  const [activeTab, setActiveTab] = useState<Tab>('expense');
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const { data: expData, isFetching: expFetching, refetch: refetchExp } = useGetExpensesQuery();
  const { data: incData, isFetching: incFetching, refetch: refetchInc } = useGetIncomesQuery();
  const { data: txfData, isFetching: txfFetching, refetch: refetchTxf } = useGetTransfersQuery();
  const [deleteExpense] = useDeleteExpenseMutation();
  const [deleteIncome] = useDeleteIncomeMutation();
  const [deleteTransfer] = useDeleteTransferMutation();

  const isFetching = activeTab === 'expense' ? expFetching : activeTab === 'income' ? incFetching : txfFetching;
  const onRefresh = activeTab === 'expense' ? refetchExp : activeTab === 'income' ? refetchInc : refetchTxf;

  const items =
    activeTab === 'expense'
      ? ((expData?.data as any)?.data ?? [])
      : activeTab === 'income'
      ? ((incData?.data as any)?.data ?? [])
      : (txfData?.data ?? []);

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Are you sure you want to delete this transaction?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (activeTab === 'expense') await deleteExpense(id).unwrap();
            else if (activeTab === 'income') await deleteIncome(id).unwrap();
            else await deleteTransfer(id).unwrap();
          } catch {
            Alert.alert('Error', 'Failed to delete.');
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Transactions</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setActiveModal(activeTab)}
        >
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        {(['expense', 'income', 'transfer'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {isFetching && items.length === 0 ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item: any) => item._id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={
            <RefreshControl refreshing={isFetching} onRefresh={onRefresh} tintColor={COLORS.primary} />
          }
          ListEmptyComponent={
            <EmptyState
              icon="receipt-outline"
              title={`No ${activeTab}s yet`}
              subtitle={`Tap + to add your first ${activeTab}`}
            />
          }
          renderItem={({ item }: { item: any }) => (
            <TouchableOpacity
              onLongPress={() => handleDelete(item._id)}
              activeOpacity={0.8}
              style={styles.txWrap}
            >
              <TransactionItem
                title={item.note ?? 'Transaction'}
                subtitle={
                  activeTab !== 'transfer'
                    ? typeof item.category === 'object'
                      ? item.category?.name
                      : undefined
                    : `${typeof item.from === 'object' ? item.from?.name : 'Wallet'} → ${typeof item.to === 'object' ? item.to?.name : 'Wallet'}`
                }
                amount={item.amount}
                type={activeTab === 'transfer' ? 'transfer' : activeTab}
                date={item.date ? formatRelativeDate(item.date) : undefined}
                discreet={discreet}
              />
            </TouchableOpacity>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 0 }} />}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={[styles.fab, { bottom: insets.bottom + 80 }]}
        onPress={() => setActiveModal(activeTab)}
      >
        <Ionicons name="add" size={28} color={COLORS.white} />
      </TouchableOpacity>

      <BottomSheetModal visible={activeModal === 'expense'} onClose={() => setActiveModal(null)} title="Add Expense">
        <AddExpenseForm onSuccess={() => setActiveModal(null)} />
      </BottomSheetModal>
      <BottomSheetModal visible={activeModal === 'income'} onClose={() => setActiveModal(null)} title="Add Income">
        <AddIncomeForm onSuccess={() => setActiveModal(null)} />
      </BottomSheetModal>
      <BottomSheetModal visible={activeModal === 'transfer'} onClose={() => setActiveModal(null)} title="Transfer Money">
        <AddTransferForm onSuccess={() => setActiveModal(null)} />
      </BottomSheetModal>
    </View>
  );
}

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
  headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.textPrimary },
  addBtn: {
    width: 38,
    height: 38,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.md,
    paddingBottom: 10,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },
  list: { padding: SPACING.md },
  txWrap: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  fab: {
    position: 'absolute',
    right: SPACING.md,
    width: 56,
    height: 56,
    borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
});
