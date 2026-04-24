export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}

export interface PaginatedResponse<T = unknown> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface IAccount {
  _id: string;
  name: string;
  accountNumber?: string;
  balance: number;
  currency: 'BDT' | 'USD';
  user: string;
  isActive: boolean;
  isDeleted: boolean;
  type?: string;
  note?: string;
}

export interface ICategory {
  _id: string;
  name: string;
  type: 'income' | 'expense';
  user: string;
  isDeleted: boolean;
  createdAt: string;
}

export interface IExpense {
  _id: string;
  amount: number;
  category: ICategory | string;
  account: IAccount | string;
  user: string;
  note: string;
  date: string;
  transaction?: string;
}

export interface IIncome {
  _id: string;
  amount: number;
  category: ICategory | string;
  account: IAccount | string;
  user: string;
  note: string;
  date: string;
  transaction?: string;
}

export interface ITransfer {
  _id: string;
  from: IAccount | string;
  to: IAccount | string;
  amount: number;
  charge: number;
  date: string;
  note?: string;
  user: string;
}

export interface ILoanReceiver {
  name: string;
  phone: string;
  address?: string;
}

export interface ILoanGiving {
  _id: string;
  amount: number;
  balance: number;
  charge: number;
  date: string;
  dueDate: string;
  note?: string;
  account: IAccount | string;
  user: string;
  isPaid: boolean;
  lastPaymentDate?: string | null;
  receiver: ILoanReceiver;
  payments: any[];
}

export interface ILoanReceiving {
  _id: string;
  amount: number;
  balance: number;
  charge: number;
  date: string;
  dueDate: string;
  note?: string;
  account: IAccount | string;
  user: string;
  isPaid: boolean;
  lastPaymentDate?: string | null;
  giver: ILoanReceiver;
  payments: any[];
}

export interface IDashboard {
  totalIncome: number;
  totalExpense: number;
  totalBalance: number;
  totalLoanGiving: number;
  totalLoanReceiving: number;
  recentTransactions: any[];
  expenseByCategory: { name: string; amount: number }[];
  incomeByCategory: { name: string; amount: number }[];
}
