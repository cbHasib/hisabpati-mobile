import React, { useState } from 'react';
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
import { z } from 'zod';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ControlledTextInput from '@/src/components/form/ControlledTextInput';
import Button from '@/src/components/ui/Button';
import { useResetPasswordEmailMutation } from '@/src/redux/features/auth/authApi';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';

const resetSchema = z.object({ email: z.string().email('Enter a valid email') });
type ResetFormData = z.infer<typeof resetSchema>;

export default function ResetPasswordScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [emailSent, setEmailSent] = useState(false);
  const [resetEmail, { isLoading }] = useResetPasswordEmailMutation();

  const { control, handleSubmit, formState: { errors } } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
  });

  const onSubmit = async (data: ResetFormData) => {
    try {
      await resetEmail({ email: data.email }).unwrap();
      setEmailSent(true);
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Could not send reset email. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: COLORS.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + 12 }]}
        keyboardShouldPersistTaps="handled"
      >
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Login</Text>
        </TouchableOpacity>

        <View style={styles.card}>
          {emailSent ? (
            <View style={styles.success}>
              <Text style={styles.successIcon}>✉️</Text>
              <Text style={styles.successTitle}>Email Sent!</Text>
              <Text style={styles.successText}>
                We've sent a password reset link to your email. Please check your inbox.
              </Text>
              <Button
                title="Back to Login"
                onPress={() => router.replace('/(auth)/login')}
                variant="outline"
                style={{ marginTop: SPACING.lg }}
              />
            </View>
          ) : (
            <>
              <Text style={styles.title}>Forgot Password?</Text>
              <Text style={styles.subtitle}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>
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
              <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={isLoading} />
            </>
          )}
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
    paddingBottom: 40,
  },
  backBtn: { paddingVertical: 8, marginBottom: SPACING.lg },
  backText: { fontSize: FONT_SIZE.base, color: COLORS.primary, fontWeight: '600' },
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
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.lg,
    lineHeight: 20,
  },
  success: { alignItems: 'center', paddingVertical: SPACING.lg },
  successIcon: { fontSize: 52, marginBottom: 16 },
  successTitle: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 8 },
  successText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 20 },
});
