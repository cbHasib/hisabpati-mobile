import React from 'react';
import { View, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '@/src/components/form/ControlledTextInput';
import ControlledDropDown from '@/src/components/form/ControlledDropDown';
import Button from '@/src/components/ui/Button';
import { transferSchema, TransferFormData } from '@/src/utils/validation';
import { useTransferMoneyMutation } from '@/src/redux/api.config/transferApi';
import { useGetAccountsQuery } from '@/src/redux/api.config/accountApi';
import { todayString } from '@/src/utils/formatters';

interface Props {
  onSuccess?: () => void;
}

export default function AddTransferForm({ onSuccess }: Props) {
  const [transferMoney, { isLoading }] = useTransferMoneyMutation();
  const { data: accountsData } = useGetAccountsQuery();

  const accounts = ((accountsData?.data as any)?.accounts ?? [])?.map((a:any) => ({ label: `${a.name} (৳${Number(a.balance).toFixed(2)})`, value: a._id }));

  const { control, handleSubmit, reset, formState: { errors } } = useForm<TransferFormData>({
    resolver: zodResolver(transferSchema),
    defaultValues: { date: todayString(), charge: '0' },
  });

  const onSubmit = async (data: TransferFormData) => {
    if (data.from === data.to) {
      Alert.alert('Invalid', 'Source and destination wallets must be different.');
      return;
    }
    try {
      await transferMoney({
        from: data.from,
        to: data.to,
        amount: Number(data.amount),
        charge: Number(data.charge ?? 0),
        date: data.date,
        note: data.note,
      }).unwrap();
      reset();
      onSuccess?.();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Failed to transfer.');
    }
  };

  return (
    <View>
      <ControlledDropDown
        control={control}
        name="from"
        label="From Wallet"
        options={accounts}
        placeholder="Select source wallet"
        error={errors.from?.message}
      />
      <ControlledDropDown
        control={control}
        name="to"
        label="To Wallet"
        options={accounts}
        placeholder="Select destination wallet"
        error={errors.to?.message}
      />
      <ControlledTextInput
        control={control}
        name="amount"
        label="Amount (৳)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        leftIcon="cash-outline"
        error={errors.amount?.message}
      />
      <ControlledTextInput
        control={control}
        name="charge"
        label="Transfer Charge (৳)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        leftIcon="card-outline"
        error={errors.charge?.message}
      />
      <ControlledTextInput
        control={control}
        name="date"
        label="Date"
        placeholder="YYYY-MM-DD"
        leftIcon="calendar-outline"
        error={errors.date?.message}
      />
      <ControlledTextInput
        control={control}
        name="note"
        label="Note (Optional)"
        placeholder="Transfer note"
        leftIcon="create-outline"
        error={errors.note?.message}
      />
      <Button title="Transfer" onPress={handleSubmit(onSubmit)} loading={isLoading} variant="secondary" />
    </View>
  );
}
