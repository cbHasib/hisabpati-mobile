import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useAppDispatch, useAppSelector } from '@/src/redux/hooks';
import { useGetUserByIdQuery, useUpdateUserMutation } from '@/src/redux/api.config/userApi';
import { useChangePasswordMutation, useLogoutMutation } from '@/src/redux/features/auth/authApi';
import { logout } from '@/src/redux/features/auth/authSlice';
import BottomSheetModal from '@/src/components/ui/BottomSheetModal';
import ControlledTextInput from '@/src/components/form/ControlledTextInput';
import Button from '@/src/components/ui/Button';
import { changePasswordSchema, ChangePasswordFormData } from '@/src/utils/validation';
import { COLORS, FONT_SIZE, SPACING, RADIUS } from '@/src/theme/theme.config';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((state) => state.auth);

  const [showPwdModal, setShowPwdModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: userData, refetch, isLoading } = useGetUserByIdQuery(user?._id ?? '', {
    skip: !user?._id,
  });
  const [updateUser, { isLoading: updating }] = useUpdateUserMutation();
  const [changePassword, { isLoading: changingPwd }] = useChangePasswordMutation();
  const [logoutApi] = useLogoutMutation();

  const profile = userData?.data ?? user;
  const discreet = profile?.settings?.discreetMode ?? false;

  const { control, handleSubmit, reset, formState: { errors } } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const onChangePassword = async (data: ChangePasswordFormData) => {
    try {
      await changePassword({ oldPassword: data.oldPassword, newPassword: data.newPassword }).unwrap();
      Alert.alert('Success', 'Password changed successfully.');
      reset();
      setShowPwdModal(false);
    } catch (err: any) {
      Alert.alert('Error', err?.data?.message ?? 'Failed to change password.');
    }
  };

  const handleToggleDiscreet = async () => {
    try {
      await updateUser({
        id: profile?._id ?? '',
        body: { settings: { discreetMode: !discreet, language: profile?.settings?.language ?? 'en' } } as any,
      }).unwrap();
      refetch();
    } catch {
      Alert.alert('Error', 'Could not update setting.');
    }
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try { await logoutApi().unwrap(); } catch {}
          dispatch(logout());
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator color={COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: insets.bottom + 90 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Avatar & Name */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarWrap}>
            {profile?.profile?.image ? (
              <Image source={{ uri: profile.profile.image }} style={styles.avatarImg} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {(profile?.name ?? 'U').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={[styles.pkgBadge, { backgroundColor: getPkgColor(profile?.package) }]}>
              <Text style={styles.pkgText}>{(profile?.package ?? 'free').toUpperCase()}</Text>
            </View>
          </View>
          <Text style={styles.profileName}>{profile?.name ?? '—'}</Text>
          <Text style={styles.profileEmail}>{profile?.email ?? '—'}</Text>
          {profile?.phone ? <Text style={styles.profilePhone}>{profile.phone}</Text> : null}
        </View>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(profile?.accounts ?? []).length}</Text>
            <Text style={styles.statLabel}>Wallets</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{(profile?.categories ?? []).length}</Text>
            <Text style={styles.statLabel}>Categories</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{profile?.smsBalance ?? 0}</Text>
            <Text style={styles.statLabel}>SMS Credits</Text>
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          <View style={styles.settingRow}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.primary + '15' }]}>
                <Ionicons name="eye-off-outline" size={20} color={COLORS.primary} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Discreet Mode</Text>
                <Text style={styles.settingDesc}>Hide all amounts</Text>
              </View>
            </View>
            <Switch
              value={discreet}
              onValueChange={handleToggleDiscreet}
              trackColor={{ true: COLORS.primary, false: COLORS.borderLight }}
              thumbColor={COLORS.white}
            />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.settingRow} onPress={() => setShowPwdModal(true)}>
            <View style={styles.settingLeft}>
              <View style={[styles.settingIcon, { backgroundColor: COLORS.income + '15' }]}>
                <Ionicons name="lock-closed-outline" size={20} color={COLORS.income} />
              </View>
              <View>
                <Text style={styles.settingLabel}>Change Password</Text>
                <Text style={styles.settingDesc}>Update your password</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Account Info */}
        {profile?.profile && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Details</Text>
            {profile.profile.address && (
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{profile.profile.address}</Text>
              </View>
            )}
            {profile.profile.dob && (
              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{profile.profile.dob}</Text>
              </View>
            )}
            {profile.profile.gender && (
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={16} color={COLORS.textSecondary} />
                <Text style={styles.infoText}>{profile.profile.gender}</Text>
              </View>
            )}
          </View>
        )}

        {/* Logout */}
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.expense} />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Change Password Modal */}
      <BottomSheetModal visible={showPwdModal} onClose={() => setShowPwdModal(false)} title="Change Password">
        <ControlledTextInput control={control} name="oldPassword" label="Current Password" placeholder="Enter current password" isPassword leftIcon="lock-closed-outline" error={errors.oldPassword?.message} />
        <ControlledTextInput control={control} name="newPassword" label="New Password" placeholder="Enter new password" isPassword leftIcon="lock-open-outline" error={errors.newPassword?.message} />
        <ControlledTextInput control={control} name="confirmPassword" label="Confirm Password" placeholder="Re-enter new password" isPassword leftIcon="checkmark-circle-outline" error={errors.confirmPassword?.message} />
        <Button title="Update Password" onPress={handleSubmit(onChangePassword)} loading={changingPwd} />
      </BottomSheetModal>
    </View>
  );
}

function getPkgColor(pkg?: string) {
  if (pkg === 'premium') return '#F59E0B';
  if (pkg === 'basic') return '#6C63FF';
  return '#6B7280';
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: SPACING.md,
    paddingBottom: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  headerTitle: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.textPrimary },
  scroll: { padding: SPACING.md },
  avatarSection: { alignItems: 'center', marginBottom: SPACING.lg },
  avatarWrap: { position: 'relative', marginBottom: SPACING.sm },
  avatarImg: { width: 90, height: 90, borderRadius: 45 },
  avatarPlaceholder: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primary + '20',
    alignItems: 'center', justifyContent: 'center',
  },
  avatarInitial: { fontSize: 36, fontWeight: '900', color: COLORS.primary },
  pkgBadge: {
    position: 'absolute', bottom: 0, right: -4,
    paddingHorizontal: 8, paddingVertical: 3,
    borderRadius: RADIUS.full,
  },
  pkgText: { fontSize: 9, fontWeight: '900', color: COLORS.white },
  profileName: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.textPrimary },
  profileEmail: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  profilePhone: { fontSize: FONT_SIZE.sm, color: COLORS.textMuted, marginTop: 2 },
  statsRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  statItem: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: FONT_SIZE.xl, fontWeight: '800', color: COLORS.primary },
  statLabel: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, marginTop: 2 },
  statDivider: { width: 1, backgroundColor: COLORS.borderLight },
  section: {
    backgroundColor: COLORS.white,
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionTitle: { fontSize: FONT_SIZE.base, fontWeight: '800', color: COLORS.textPrimary, marginBottom: 14 },
  settingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settingLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  settingIcon: { width: 40, height: 40, borderRadius: RADIUS.lg, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontSize: FONT_SIZE.sm, fontWeight: '700', color: COLORS.textPrimary },
  settingDesc: { fontSize: FONT_SIZE.xs, color: COLORS.textMuted },
  divider: { height: 1, backgroundColor: COLORS.borderLight, marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  infoText: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.expense + '10',
    borderRadius: RADIUS.xl,
    padding: SPACING.md,
    marginTop: SPACING.sm,
  },
  logoutText: { fontSize: FONT_SIZE.base, fontWeight: '700', color: COLORS.expense },
});
