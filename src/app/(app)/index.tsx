import { Redirect } from 'expo-router';
import { useAppSelector } from '@/src/redux/hooks';

export default function AppIndex() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;
  return <Redirect href="/(app)/(tabs)/dashboard" />;
}
