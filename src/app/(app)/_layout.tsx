import { Stack, Redirect } from 'expo-router';
import { useAppSelector } from '@/src/redux/hooks';

export default function AppLayout() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (!isAuthenticated) return <Redirect href="/(auth)/login" />;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
