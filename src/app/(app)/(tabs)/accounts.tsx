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
  Modal,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  useGetAccountsQuery,
  useCreateAccountMutation,
  useUpdateAccountMutation,
  useDeleteAccountMutation,
} from '@/src/redux/api.config/accountApi';
import { useAppSelector } from '@/src/redux/hooks';
import ControlledTextInput from '@/src/components/form/ControlledTextInput';
import ControlledDropDown from '@/src/components/form/ControlledDropDown';
import Button from '@/src/components/ui/Button';
import BottomSheetModal from '@/src/components/ui/BottomSheetModal';
import EmptyState from '@/src/components/ui/EmptyState';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';
import { formatCurrency } from '@/src/utils/formatters';
import { IAccount } from '@/src/interface/common.interface';

const accountSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  balance: z.string().min(1, 'Balance is required'),
  type: z.string().min(1, 'Type is required'),
  note: z.string().optional(),
});
type AccountFormData = z.infer<typeof accountSchema>;

const ACCOUNT_TYPE_OPTIONS = [
  { label: 'Cash', value: 'cash' },
  { label: 'Bank', value: 'bank' },
  { label: 'Mobile Banking', value: 'mobile_banking' },
  { label: 'Card', value: 'card' },
  { label: 'Other', value: 'other' },
];

const ACCOUNT_COLORS: Record<string, string> = {
  cash: '#22C55E',
  bank: '#6C63FF',
  mobile_banking: '#F59E0B',
  card: '#3B82F6',
  other: '#6B7280',
};

export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAppSelector((state) => state.auth);
  const discreet = user?.settings?.discreetMode ?? false;
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<IAccount | null>(null);

  const { data, isFetching, refetch } = useGetAccountsQuery();
  const [createAccount, { isLoading: creating }] = useCreateAccountMutation();
  const [updateAccount, { isLoading: updating }] = useUpdateAccountMutation();
  const [deleteAccount] = useDeleteAccountMutation();

  const accounts: IAccount[] = (data?.data as any)?.accounts ?? [];
  const totalBalance = accounts && accounts?.length ? accounts?.reduce((s, a) => s + (a.balance ?? 0), 0) : 0;

  const { control, handleSubmit, reset, setValue, formState: { errors } } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { balance: '0', type: 'cash' },
  });

  const openAdd = () => {
    setEditTarget(null);
    reset({ balance: '0', type: 'cash' });
    setShowModal(true);
  };

  const openEdit = (acc: IAccount) => {
    setEditTarget(acc);
    setValue('name', acc.name);
    setValue('balance', String(acc.balance ?? 0));
    setValue('type', acc.type ?? 'cash');
    setValue('note', acc.note ?? '');
    setShowModal(true);
  };

  const onSubmit = async (data: AccountFormData) => {
    try {
      const payload = { name: data.name, balance: Number(data.balance), type: data.type, note: data.note };
      if (editTarget) {
        await updateAccount({ id: editTarget._id, body: payload }).unwrap();
      } else {
        await createAccount(payload).unwrap();
      }
      reset();
      setShowModal(false);
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Operation failed.');
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Wallet', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAccount(id).unwrap();
          } catch {
            Alert.alert('Error', 'Could not delete wallet.');
          }
        },
      },
    ]);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Wallets</Text>
        <TouchableOpacity style={styles.addBtn} onPress={openAdd}>
          <Ionicons name="add" size={22} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Total Card */}
      <View style={styles.totalCard}>
        <Text style={styles.totalLabel}>Total Balance</Text>
        <Text style={styles.totalAmount}>{discreet ? '৳ ••••••' : formatCurrency(totalBalance)}</Text>
        <Text style={styles.totalSub}>{accounts.length} wallet{accounts.length !== 1 ? 's' : ''}</Text>
      </View>

      {isFetching && accounts.length === 0 ? (
        <ActivityIndicator color={COLORS.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={accounts}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + 90 }]}
          refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} tintColor={COLORS.primary} />}
          ListEmptyComponent={
            <EmptyState
              icon="wallet-outline"
              title="No wallets yet"
              subtitle="Tap + to add your first wallet"
            />
          }
          renderItem={({ item }: { item: IAccount }) => (
            <View style={styles.accountCard}>
              <View style={[styles.accountIcon, { backgroundColor: (ACCOUNT_COLORS[item.type ?? 'other'] ?? '#6B7280') + '20' }]}>
                <Ionicons
                  name={getAccountIcon(item.type ?? 'other')}
                  size={24}
                  color={ACCOUNT_COLORS[item.type ?? 'other'] ?? '#6B7280'}
                />
              </View>
              <View style={styles.accountInfo}>
                <Text style={styles.accountName}>{item.name}</Text>
                <Text style={styles.accountType}>{formatType(item.type ?? 'other')}</Text>
                {item.note ? <Text style={styles.accountNote}>{item.note}</Text> : null}
              </View>
              <View style={styles.accountRight}>
                <Text style={[styles.accountBalance, { color: (item.balance ?? 0) >= 0 ? COLORS.income : COLORS.expense }]}>
                  {discreet ? '••••' : formatCurrency(item.balance ?? 0)}
                </Text>
                <View style={styles.accountActions}>
                  <TouchableOpacity onPress={() => openEdit(item)} style={styles.iconBtn}>
                    <Ionicons name="pencil-outline" size={18} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item._id)} style={styles.iconBtn}>
                    <Ionicons name="trash-outline" size={18} color={COLORS.expense} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        />
      )}

      <BottomSheetModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        title={editTarget ? 'Edit Wallet' : 'Add Wallet'}
      >
        <ControlledTextInput control={control} name="name" label="Wallet Name" placeholder="e.g. Cash in Hand" leftIcon="wallet-outline" error={errors.name?.message} />
        <ControlledDropDown control={control} name="type" label="Wallet Type" options={ACCOUNT_TYPE_OPTIONS} placeholder="Select type" error={errors.type?.message} />
        <ControlledTextInput control={control} name="balance" label="Initial Balance (৳)" placeholder="0.00" keyboardType="decimal-pad" leftIcon="cash-outline" error={errors.balance?.message} />
        <ControlledTextInput control={control} name="note" label="Note (Optional)" placeholder="Any description" leftIcon="create-outline" error={errors.note?.message} />
        <Button title={editTarget ? 'Update Wallet' : 'Add Wallet'} onPress={handleSubmit(onSubmit)} loading={creating || updating} />
      </BottomSheetModal>
    </View>
  );
}

function getAccountIcon(type: string) {
  const map: Record<string, any> = {
    cash: 'cash-outline',
    bank: 'business-outline',
    mobile_banking: 'phone-portrait-outline',
    card: 'card-outline',
    other: 'wallet-outline',
  };
  return map[type] ?? 'wallet-outline';
}

function formatType(type: string) {
  return type.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
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
  totalCard: {
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  totalLabel: { fontSize: FONT_SIZE.sm, color: 'rgba(255,255,255,0.75)' },
  totalAmount: { fontSize: FONT_SIZE.xxxl, fontWeight: '800', color: COLORS.white, marginVertical: 4 },
  totalSub: { fontSize: FONT_SIZE.xs, color: 'rgba(255,255,255,0.65)' },
  list: { paddingHorizontal: SPACING.md },
  accountCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  accountIcon: {
    width: 48,
    height: 48,
    borderRadius: RADIUS.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.sm,
  },
  accountInfo: { flex: 1 },
  accountName: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.textPrimary },
  accountType: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  accountNote: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: 2 },
  accountRight: { alignItems: 'flex-end', gap: 4 },
  accountBalance: { fontSize: FONT_SIZE.base, fontWeight: '800' },
  accountActions: { flexDirection: 'row', gap: 4 },
  iconBtn: {
    padding: 4,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
  },
});
