import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ControlledTextInput from '@/src/components/form/ControlledTextInput';
import Button from '@/src/components/ui/Button';
import { loginSchema, LoginFormData } from '@/src/utils/validation';
import { useLoginMutation } from '@/src/redux/features/auth/authApi';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';
import { useAppSelector } from '@/src/redux/hooks';

export default function LoginScreen() {
  const router = useRouter();
  const { lastLoginEmail } = useAppSelector((state) => state.auth);
  const insets = useSafeAreaInsets();
  const [login, { isLoading }] = useLoginMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data).unwrap();
      router.replace('/(app)/(tabs)/dashboard');
    } catch (err: any) {
      console.log(err);
      Alert.alert('Login Failed', err?.data?.message ?? 'Invalid credentials. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo / Brand */}
        <View style={styles.brandSection}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>HP</Text>
          </View>
          <Text style={styles.brandName}>HisabPati</Text>
          <Text style={styles.tagline}>Your personal finance manager</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Welcome Back</Text>
          <Text style={styles.cardSubtitle}>Sign in to your account</Text>

          <ControlledTextInput
            control={control}
            name="email"
            label="Email Address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            leftIcon="mail-outline"
            error={errors.email?.message}
            defaultValue={lastLoginEmail ?? ''}
          />
          <ControlledTextInput
            control={control}
            name="password"
            label="Password"
            placeholder="••••••••"
            isPassword
            leftIcon="lock-closed-outline"
            error={errors.password?.message}
          />

          <TouchableOpacity
            onPress={() => router.push('/(auth)/reset-password')}
            style={styles.forgotBtn}
          >
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={isLoading} />

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => router.push('/(auth)/register')}>
              <Text style={styles.registerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.background,
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
    marginTop: SPACING.xl,
  },
  logoWrap: {
    width: 80,
    height: 80,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logoText: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.white,
  },
  brandName: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  tagline: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: SPACING.md,
    marginTop: -4,
  },
  forgotText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '600',
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  registerText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  registerLink: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.primary,
    fontWeight: '700',
  },
});
