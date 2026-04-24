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
} from 'react-native';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ControlledTextInput from '@/src/components/form/ControlledTextInput';
import Button from '@/src/components/ui/Button';
import { registerSchema, RegisterFormData } from '@/src/utils/validation';
import { useRegisterMutation } from '@/src/redux/features/auth/authApi';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';

export default function RegisterScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [register, { isLoading }] = useRegisterMutation();

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({ resolver: zodResolver(registerSchema) });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await register(data).unwrap();
      Alert.alert(
        'Account Created!',
        'Please check your email to verify your account before logging in.',
        [{ text: 'OK', onPress: () => router.replace('/(auth)/login') }]
      );
    } catch (err: any) {
      Alert.alert('Registration Failed', err?.data?.message ?? 'Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.logoWrap}>
            <Text style={styles.logoText}>HP</Text>
          </View>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Join HisabPati and take control of your finances</Text>
        </View>

        <View style={styles.card}>
          <ControlledTextInput
            control={control}
            name="name"
            label="Full Name"
            placeholder="Your full name"
            leftIcon="person-outline"
            error={errors.name?.message}
          />
          <ControlledTextInput
            control={control}
            name="email"
            label="Email Address"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            leftIcon="mail-outline"
            error={errors.email?.message}
          />
          <ControlledTextInput
            control={control}
            name="phone"
            label="Phone Number"
            placeholder="01XXXXXXXXX"
            keyboardType="phone-pad"
            leftIcon="call-outline"
            error={errors.phone?.message}
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

          <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={isLoading} />

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
              <Text style={styles.loginLink}>Sign In</Text>
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
  backBtn: { paddingVertical: 8, marginBottom: 8 },
  backText: { fontSize: FONT_SIZE.base, color: COLORS.primary, fontWeight: '600' },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logoWrap: {
    width: 64,
    height: 64,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  logoText: { fontSize: 24, fontWeight: '800', color: COLORS.white },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
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
  loginRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  loginText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  loginLink: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '700' },
});
