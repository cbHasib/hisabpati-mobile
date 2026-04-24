import Constants from 'expo-constants';

export type AppConfig = {
  apiPrefix: string;
  appVersion: string;
  apiServer: string;
  apiTimeout: number;
  locale: string;
  supportEmail: string;
  sentryDsn?: string;
};

const appConfig: AppConfig = {
  apiPrefix: '/api/v1',
  appVersion: Constants.expoConfig?.version ?? '1.0.0',
  apiServer: process.env.EXPO_PUBLIC_API_SERVER ?? 'https://hisabpati-api.vercel.app',
  apiTimeout: 15000,
  locale: 'en',
  supportEmail: 'support@hisabpati.com',
  sentryDsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
};

export default appConfig;
