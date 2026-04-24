import dayjs from 'dayjs';

export const formatCurrency = (amount: number, currency = 'BDT'): string => {
  const symbol = currency === 'BDT' ? '৳' : '$';
  return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

export const formatDate = (dateStr: string, format = 'DD MMM YYYY'): string => {
  return dayjs(dateStr).format(format);
};

export const formatRelativeDate = (dateStr: string): string => {
  const date = dayjs(dateStr);
  const now = dayjs();
  const diffDays = now.diff(date, 'day');

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.format('DD MMM YYYY');
};

export const getMonthName = (monthIndex: number): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[monthIndex] ?? '';
};

export const todayString = (): string => dayjs().format('YYYY-MM-DD');
