import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().regex(/^01[3-9]\d{8}$/, 'Enter a valid Bangladeshi phone number'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Must contain uppercase, lowercase, and a number'
    ),
});

export const expenseIncomeSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((v) => Number(v) > 0, 'Amount must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  account: z.string().min(1, 'Wallet is required'),
  note: z.string().min(1, 'Note is required'),
  date: z.string().min(1, 'Date is required'),
});

export const transferSchema = z.object({
  from: z.string().min(1, 'Source wallet is required'),
  to: z.string().min(1, 'Destination wallet is required'),
  amount: z.string().min(1, 'Amount is required').refine((v) => Number(v) > 0, 'Amount must be greater than 0'),
  date: z.string().min(1, 'Date is required'),
  note: z.string().optional(),
  charge: z.string().optional(),
});

export const loanSchema = z.object({
  amount: z.string().min(1, 'Amount is required').refine((v) => Number(v) > 0, 'Amount must be greater than 0'),
  account: z.string().min(1, 'Wallet is required'),
  date: z.string().min(1, 'Date is required'),
  dueDate: z.string().optional(),
  note: z.string().optional(),
  interest: z.string().optional(),
  person: z.string().min(1, 'Person name is required'),
  phone: z.string().min(1, 'Phone is required'),
  address: z.string().optional(),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Must contain uppercase, lowercase, and a number'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ExpenseIncomeFormData = z.infer<typeof expenseIncomeSchema>;
export type TransferFormData = z.infer<typeof transferSchema>;
export type LoanFormData = z.infer<typeof loanSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
