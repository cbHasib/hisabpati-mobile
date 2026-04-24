export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    CHANGE_PASSWORD: '/auth/change-password',
    RESET_PASSWORD_EMAIL: '/auth/reset-password-email',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email',
    RESEND_EMAIL_VERIFICATION: '/auth/resend-email-verification',
    VALIDATE_PASSWORD: '/auth/validate-password',
  },
  USER: {
    GET_USER: '/user/get-user/',
    UPDATE_USER: '/user/',
  },
  ACCOUNT: {
    BASE: '/account/',
  },
  CATEGORY: {
    BASE: '/category/',
  },
  EXPENSE: {
    BASE: '/expense/',
  },
  INCOME: {
    BASE: '/income/',
  },
  TRANSFER: {
    BASE: '/transfer/',
  },
  LOAN_GIVING: {
    BASE: '/loan-giving/',
    PAYMENT: (id: string) => `/loan-giving/payment/${id}`,
    REVERT: (id: string) => `/loan-giving/revert-to-unpaid/${id}`,
  },
  LOAN_RECEIVING: {
    BASE: '/loan-receiving/',
    PAYMENT: (id: string) => `/loan-receiving/payment/${id}`,
    REVERT: (id: string) => `/loan-receiving/revert-to-unpaid/${id}`,
  },
  DASHBOARD: {
    BASE: '/dashboard/',
    INCOME_EXPENSE_BY_MONTH: '/dashboard/income-expense-by-month',
  },
  REPORT: {
    BASE: '/report/',
  },
  NOTIFICATION: {
    BASE: '/notification/',
  },
} as const;
