import React from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, RADIUS } from '@/src/theme/theme.config';

interface ControlledTextInputProps<T extends FieldValues> extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: string;
  leftIcon?: keyof typeof Ionicons.glyphMap;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightIconPress?: () => void;
  isPassword?: boolean;
}

export default function ControlledTextInput<T extends FieldValues>({
  control,
  name,
  label,
  error,
  leftIcon,
  rightIcon,
  onRightIconPress,
  isPassword,
  ...inputProps
}: ControlledTextInputProps<T>) {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={[styles.inputWrapper, error ? styles.inputError : styles.inputNormal]}>
            {leftIcon && (
              <Ionicons name={leftIcon} size={18} color={COLORS.textSecondary} style={styles.leftIcon} />
            )}
            <TextInput
              {...inputProps}
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              secureTextEntry={isPassword && !showPassword}
              style={[styles.input, leftIcon ? styles.inputWithLeft : null]}
              placeholderTextColor={COLORS.textMuted}
            />
            {isPassword && (
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.rightIcon}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.textSecondary}
                />
              </TouchableOpacity>
            )}
            {!isPassword && rightIcon && (
              <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
                <Ionicons name={rightIcon} size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '500',
    color: COLORS.textPrimary,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    height: 52,
  },
  inputNormal: { borderColor: COLORS.border },
  inputError: { borderColor: COLORS.error },
  input: {
    flex: 1,
    fontSize: FONT_SIZE.base,
    color: COLORS.textPrimary,
    height: '100%',
  },
  inputWithLeft: { marginLeft: 8 },
  leftIcon: { marginRight: 4 },
  rightIcon: { marginLeft: 8 },
  errorText: {
    marginTop: 4,
    fontSize: FONT_SIZE.xs,
    color: COLORS.error,
  },
});
