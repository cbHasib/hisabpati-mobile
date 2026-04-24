import { Redirect } from 'expo-router';
import { useAppSelector } from '@/src/redux/hooks';

export default function Index() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  return <Redirect href={isAuthenticated ? '/(app)/(tabs)/dashboard' : '/(auth)/login'} />;
}
