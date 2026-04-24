export const COLORS = {
  // Brand
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#EEF0FF',

  // Semantic
  income: '#22C55E',
  expense: '#EF4444',
  transfer: '#3B82F6',
  loan: '#F59E0B',

  // Neutral
  white: '#FFFFFF',
  black: '#0F0F0F',
  background: '#F5F7FF',
  card: '#FFFFFF',
  surface: '#F0F2FA',

  // Text
  textPrimary: '#1A1A2E',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',

  // Border
  border: '#E5E7EB',
  borderLight: '#F3F4F6',

  // Status
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // Dark theme
  dark: {
    background: '#0F1117',
    card: '#1A1D27',
    surface: '#252836',
    textPrimary: '#F9FAFB',
    textSecondary: '#9CA3AF',
    border: '#2D3148',
  },
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

export const FONT_SIZE = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  xxl: 30,
  xxxl: 36,
} as const;

export const FONT_WEIGHT = {
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
} as const;
