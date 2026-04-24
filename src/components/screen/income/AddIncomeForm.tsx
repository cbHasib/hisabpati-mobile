import React from 'react';
import { View, Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import ControlledTextInput from '@/src/components/form/ControlledTextInput';
import ControlledDropDown from '@/src/components/form/ControlledDropDown';
import Button from '@/src/components/ui/Button';
import { expenseIncomeSchema, ExpenseIncomeFormData } from '@/src/utils/validation';
import { useCreateIncomeMutation } from '@/src/redux/api.config/incomeApi';
import { useGetAccountsQuery } from '@/src/redux/api.config/accountApi';
import { useGetCategoriesQuery } from '@/src/redux/api.config/categoryApi';
import { todayString } from '@/src/utils/formatters';

interface Props {
  onSuccess?: () => void;
}

export default function AddIncomeForm({ onSuccess }: Props) {
  const [createIncome, { isLoading }] = useCreateIncomeMutation();
  const { data: accountsData } = useGetAccountsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();

  const accounts = ((accountsData?.data as any)?.accounts ?? [])?.map((a:any) => ({ label: a.name, value: a._id }));
  const categories = (categoriesData?.data ?? [])
    .filter((c) => c.type === 'income')
    .map((c) => ({ label: c.name, value: c._id }));

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ExpenseIncomeFormData>({
    resolver: zodResolver(expenseIncomeSchema),
    defaultValues: { date: todayString() },
  });

  const onSubmit = async (data: ExpenseIncomeFormData) => {
    try {
      await createIncome({
        amount: Number(data.amount),
        category: data.category,
        account: data.account,
        note: data.note,
        date: data.date,
      }).unwrap();
      reset();
      onSuccess?.();
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Failed to add income.');
    }
  };

  return (
    <View>
      <ControlledTextInput
        control={control}
        name="amount"
        label="Amount (৳)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        leftIcon="cash-outline"
        error={errors.amount?.message}
      />
      <ControlledDropDown
        control={control}
        name="category"
        label="Category"
        options={categories}
        placeholder="Select income category"
        error={errors.category?.message}
      />
      <ControlledDropDown
        control={control}
        name="account"
        label="Wallet"
        options={accounts}
        placeholder="Select wallet"
        error={errors.account?.message}
      />
      <ControlledTextInput
        control={control}
        name="note"
        label="Note"
        placeholder="Income source description"
        leftIcon="create-outline"
        error={errors.note?.message}
      />
      <ControlledTextInput
        control={control}
        name="date"
        label="Date"
        placeholder="YYYY-MM-DD"
        leftIcon="calendar-outline"
        error={errors.date?.message}
      />
      <Button title="Add Income" onPress={handleSubmit(onSubmit)} loading={isLoading} />
    </View>
  );
}
