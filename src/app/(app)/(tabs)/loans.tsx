import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useGetLoanGivingsQuery,
  useAddLoanGivingMutation,
  useDeleteLoanGivingMutation,
  useAddLoanGivingPaymentMutation,
  useRevertLoanGivingToUnpaidMutation,
} from '@/src/redux/api.config/loanGivingApi';
import {
  useGetLoanReceivingsQuery,
  useAddLoanReceivingMutation,
  useDeleteLoanReceivingMutation,
  useAddLoanReceivingPaymentMutation,
  useRevertLoanReceivingToUnpaidMutation,
} from '@/src/redux/api.config/loanReceivingApi';
import { useGetAccountsQuery } from '@/src/redux/api.config/accountApi';
import { useAppSelector } from '@/src/redux/hooks';
import ControlledTextInput from '@/src/components/form/ControlledTextInput';
import ControlledDropDown from '@/src/components/form/ControlledDropDown';
import Button from '@/src/components/ui/Button';
import BottomSheetModal from '@/src/components/ui/BottomSheetModal';
import EmptyState from '@/src/components/ui/EmptyState';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';
import { formatCurrency, formatRelativeDate, todayString } from '@/src/utils/formatters';
import { loanSchema, LoanFormData } from '@/src/utils/validation';
import { ILoanGiving, ILoanReceiving } from '@/src/interface/common.interface';

type LoanTab = 'given' | 'taken';

export default function LoansScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);
  const discreet = user?.settings?.discreetMode ?? false;
  const [activeTab, setActiveTab] = useState<LoanTab>('given');
  const [showModal, setShowModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState<{ id: string; type: LoanTab } | null>(null);
  const [payAmount, setPayAmount] = useState('');

  const { data: givenData, isFetching: givenFetching, refetch: refetchGiven } = useGetLoanGivingsQuery();
  const { data: takenData, isFetching: takenFetching, refetch: refetchTaken } = useGetLoanReceivingsQuery();
  const { data: accountsData } = useGetAccountsQuery();
  const [createGiven, { isLoading: creatingGiven }] = useAddLoanGivingMutation();
  const [createTaken, { isLoading: creatingTaken }] = useAddLoanReceivingMutation();
  const [deleteGiven] = useDeleteLoanGivingMutation();
  const [deleteTaken] = useDeleteLoanReceivingMutation();
  const [payGiven] = useAddLoanGivingPaymentMutation();
  const [payTaken] = useAddLoanReceivingPaymentMutation();
  const [revertGiven] = useRevertLoanGivingToUnpaidMutation();
  const [revertTaken] = useRevertLoanReceivingToUnpaidMutation();

  const accounts = ((accountsData?.data as any)?.accounts ?? [])?.map((a:any) => ({ label: a.name, value: a._id }));

  const isFetching = activeTab === 'given' ? givenFetching : takenFetching;
  const items: any[] = activeTab === 'given' ? ((givenData?.data as any)?.data ?? []) : ((takenData?.data as any)?.data ?? []);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<LoanFormData>({
    resolver: zodResolver(loanSchema),
    defaultValues: { date: todayString() },
  });

  const onSubmit = async (data: LoanFormData) => {
    try {
      const payload = {
        receiver: { name: data.person, phone: data.phone, address: data.address },
        amount: Number(data.amount),
        account: data.account,
        note: data.note,
        date: data.date,
        dueDate: data.dueDate ?? '',
      };
      if (activeTab === 'given') await createGiven(payload).unwrap();
      else await createTaken(payload).unwrap();
      reset();
      setShowModal(false);
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Failed.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Loan', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            if (activeTab === 'given') await deleteGiven(id).unwrap();
            else await deleteTaken(id).unwrap();
          } catch {
            Alert.alert('Error', 'Failed to delete.');
          }
        },
      },
    ]);
  };

  const handlePayment = async () => {
    if (!paymentModal || !payAmount) return;
    try {
      const amount = Number(payAmount);
      if (paymentModal.type === 'given') {
        await payGiven({ id: paymentModal.id, amount, date: new Date().toISOString().slice(0, 10) }).unwrap();
      } else {
        await payTaken({ id: paymentModal.id, amount, date: new Date().toISOString().slice(0, 10) }).unwrap();
      }
      setPaymentModal(null);
      setPayAmount('');
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Payment failed.');
    }
  };

  const handleRevert = async (id: string) => {
    try {
      if (activeTab === 'given') await revertGiven(id).unwrap();
      else await revertTaken(id).unwrap();
    } catch {
      Alert.alert('Error', 'Failed to revert.');
    }
  };

  const totalGiven = (givenData?.data as any)?.totalAmount ?? 0;
  const totalTaken = (takenData?.data as any)?.totalAmount ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Loans</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setShowModal(true)}>
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Summary Row */}
      <View style={styles.summaryRow}>
        <TouchableOpacity style={[styles.summaryCard, { borderColor: COLORS.loan }]} onPress={() => setActiveTab('given')}>
          <Text style={styles.summaryLabel}>Loan Given</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.loan }]}>
            {discreet ? '••••' : formatCurrency(totalGiven)}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.summaryCard, { borderColor: COLORS.transfer }]} onPress={() => setActiveTab('taken')}>
          <Text style={styles.summaryLabel}>Loan Taken</Text>
          <Text style={[styles.summaryAmount, { color: COLORS.transfer }]}>
            {discreet ? '••••' : formatCurrency(totalTaken)}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'given' && styles.tabActive]}
          onPress={() => setActiveTab('given')}
        >
          <Text style={[styles.tabText, activeTab === 'given' && styles.tabTextActive]}>Loan Given</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'taken' && styles.tabActive]}
          onPress={() => setActiveTab('taken')}
        >
          <Text style={[styles.tabText, activeTab === 'taken' && styles.tabTextActive]}>Loan Taken</Text>
        </TouchableOpacity>
      </View>

      {isFetching && items.length === 0 ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={
            <RefreshControl
              refreshing={isFetching}
              onRefresh={activeTab === 'given' ? refetchGiven : refetchTaken}
              tintColor={COLORS.primary}
            />
          }
          ListEmptyComponent={
            <EmptyState icon="cash-outline" title="No loans yet" subtitle="Tap + to add a loan" />
          }
          renderItem={({ item }) => {
            const statusColor = item.isPaid ? COLORS.income : item.isDue ? COLORS.loan : COLORS.expense;
            return (
              <View style={styles.loanCard}>
                <View style={styles.loanTop}>
                  <View style={styles.loanPersonRow}>
                    <View style={[styles.personAvatar, { backgroundColor: COLORS.primary + '15' }]}>
                      <Text style={styles.personInitial}>
                        {(item.person ?? 'U').charAt(0).toUpperCase()}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.personName}>{(item.receiver?.name || item?.sender?.name) ?? item.person ?? '—'}</Text>
                      {item.date && <Text style={styles.loanDate}>{formatRelativeDate(item.date)}</Text>}
                    </View>
                  </View>
                  <View style={styles.loanAmountCol}>
                    <Text style={[styles.loanAmount, { color: activeTab === 'given' ? COLORS.loan : COLORS.transfer }]}>
                      {discreet ? '••••' : formatCurrency(item.amount)}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: statusColor + '15' }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>{item.isPaid ? 'Paid' : 'Unpaid'}</Text>
                    </View>
                  </View>
                </View>
                {item.note ? <Text style={styles.loanNote}>{item.note}</Text> : null}
                {item.dueDate && (
                  <Text style={styles.loanDue}>Due: {formatRelativeDate(item.dueDate)}</Text>
                )}
                <View style={styles.loanActions}>
                  {item.isPaid === false && (
                    <TouchableOpacity
                      style={[styles.loanActionBtn, { backgroundColor: COLORS.income + '15' }]}
                      onPress={() => setPaymentModal({ id: item._id, type: activeTab })}
                    >
                      <Ionicons name="checkmark-circle-outline" size={16} color={COLORS.income} />
                      <Text style={[styles.loanActionText, { color: COLORS.income }]}>Pay</Text>
                    </TouchableOpacity>
                  )}
                  {item.isPaid && (
                    <TouchableOpacity
                      style={[styles.loanActionBtn, { backgroundColor: COLORS.loan + '15' }]}
                      onPress={() => handleRevert(item._id)}
                    >
                      <Ionicons name="refresh-outline" size={16} color={COLORS.loan} />
                      <Text style={[styles.loanActionText, { color: COLORS.loan }]}>Revert</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={[styles.loanActionBtn, { backgroundColor: COLORS.expense + '10' }]}
                    onPress={() => handleDelete(item._id)}
                  >
                    <Ionicons name="trash-outline" size={16} color={COLORS.expense} />
                    <Text style={[styles.loanActionText, { color: COLORS.expense }]}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      {/* Add Loan Modal */}
      <BottomSheetModal visible={showModal} onClose={() => setShowModal(false)} title={`Add ${activeTab === 'given' ? 'Given' : 'Taken'} Loan`}>
        <ControlledTextInput control={control} name="person" label="Person Name" placeholder="Who?" leftIcon="person-outline" error={errors.person?.message} />
        <ControlledTextInput control={control} name="phone" label="Phone" placeholder="01XXXXXXXXX" keyboardType="phone-pad" leftIcon="call-outline" error={errors.phone?.message} />
        <ControlledTextInput control={control} name="address" label="Address (Optional)" placeholder="Area / City" leftIcon="location-outline" error={errors.address?.message} />
        <ControlledTextInput control={control} name="amount" label="Amount (৳)" placeholder="0.00" keyboardType="decimal-pad" leftIcon="cash-outline" error={errors.amount?.message} />
        <ControlledDropDown control={control} name="account" label="Wallet" options={accounts} placeholder="Select wallet" error={errors.account?.message} />
        <ControlledTextInput control={control} name="date" label="Date" placeholder="YYYY-MM-DD" leftIcon="calendar-outline" error={errors.date?.message} />
        <ControlledTextInput control={control} name="dueDate" label="Due Date (Optional)" placeholder="YYYY-MM-DD" leftIcon="calendar-outline" error={errors.dueDate?.message} />
        <ControlledTextInput control={control} name="note" label="Note (Optional)" placeholder="Loan description" leftIcon="create-outline" error={errors.note?.message} />
        <Button title="Add Loan" onPress={handleSubmit(onSubmit)} loading={creatingGiven || creatingTaken} />
      </BottomSheetModal>

      {/* Payment Modal */}
      <BottomSheetModal
        visible={!!paymentModal}
        onClose={() => { setPaymentModal(null); setPayAmount(''); }}
        title="Record Payment"
      >
        <View>
          <Text style={styles.payLabel}>Payment Amount (৳)</Text>
          <TextInput
            style={styles.payInput}
            value={payAmount}
            onChangeText={setPayAmount}
            keyboardType="decimal-pad"
            placeholder="0.00"
            placeholderTextColor={COLORS.textMuted}
          />
          <Button title="Confirm Payment" onPress={handlePayment} />
        </View>
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
    width: 38, height: 38, borderRadius: RADIUS.full,
    backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    borderWidth: 2,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontWeight: '600' },
  summaryAmount: { fontSize: FONT_SIZE.lg, fontWeight: '800', marginTop: 4 },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingBottom: 10,
    gap: 8,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  tab: { flex: 1, paddingVertical: 8, borderRadius: RADIUS.md, alignItems: 'center', backgroundColor: COLORS.surface },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: COLORS.white },
  list: { padding: SPACING.md },
  loanCard: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  loanTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  loanPersonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  personAvatar: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  personInitial: { fontSize: FONT_SIZE.base, fontWeight: '800', color: COLORS.primary },
  personName: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary },
  loanDate: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  loanAmountCol: { alignItems: 'flex-end', gap: 4 },
  loanAmount: { fontSize: FONT_SIZE.base, fontWeight: '800' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: RADIUS.full },
  statusText: { fontSize: FONT_SIZE.xs, fontWeight: '700', textTransform: 'capitalize' },
  loanNote: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginBottom: 4 },
  loanDue: { fontSize: FONT_SIZE.xs, color: COLORS.loan, marginBottom: 8 },
  loanActions: { flexDirection: 'row', gap: 8 },
  loanActionBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 12, paddingVertical: 6, borderRadius: RADIUS.md,
  },
  loanActionText: { fontSize: FONT_SIZE.xs, fontWeight: '700' },
  payLabel: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.textPrimary, marginBottom: 8 },
  payInput: {
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: 12,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
});
