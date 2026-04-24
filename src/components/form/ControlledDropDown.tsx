import React from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, RADIUS } from '@/src/theme/theme.config';

interface Option {
  label: string;
  value: string;
}

interface ControlledDropDownProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label?: string;
  error?: string;
  options: Option[];
  placeholder?: string;
}

export default function ControlledDropDown<T extends FieldValues>({
  control,
  name,
  label,
  error,
  options,
  placeholder = 'Select an option',
}: ControlledDropDownProps<T>) {
  const [visible, setVisible] = React.useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, value } }) => {
          const selected = options.find((o) => o.value === value);
          return (
            <>
              <TouchableOpacity
                onPress={() => setVisible(true)}
                style={[styles.selector, error ? styles.selectorError : styles.selectorNormal]}
              >
                <Text style={[styles.selectorText, !selected && styles.placeholder]}>
                  {selected ? selected.label : placeholder}
                </Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.textSecondary} />
              </TouchableOpacity>
              <Modal visible={visible} transparent animationType="fade">
                <TouchableOpacity
                  style={styles.backdrop}
                  activeOpacity={1}
                  onPress={() => setVisible(false)}
                >
                  <View style={styles.modal}>
                    <Text style={styles.modalTitle}>{label ?? 'Select'}</Text>
                    <FlatList
                      data={options}
                      keyExtractor={(item) => item.value}
                      renderItem={({ item }) => (
                        <TouchableOpacity
                          style={[styles.option, item.value === value && styles.optionSelected]}
                          onPress={() => {
                            onChange(item.value);
                            setVisible(false);
                          }}
                        >
                          <Text style={[styles.optionText, item.value === value && styles.optionTextSelected]}>
                            {item.label}
                          </Text>
                          {item.value === value && (
                            <Ionicons name="checkmark" size={18} color={COLORS.primary} />
                          )}
                        </TouchableOpacity>
                      )}
                    />
                  </View>
                </TouchableOpacity>
              </Modal>
            </>
          );
        }}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 14 },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.textPrimary, marginBottom: 6 },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    height: 52,
  },
  selectorNormal: { borderColor: COLORS.border },
  selectorError: { borderColor: COLORS.error },
  selectorText: { fontSize: FONT_SIZE.base, color: COLORS.textPrimary, flex: 1 },
  placeholder: { color: COLORS.textMuted },
  errorText: { marginTop: 4, fontSize: FONT_SIZE.xs, color: COLORS.error },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    maxHeight: '70%',
    paddingTop: 16,
    paddingBottom: 32,
  },
  modalTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    marginBottom: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  optionSelected: { backgroundColor: COLORS.primaryLight },
  optionText: { fontSize: FONT_SIZE.base, color: COLORS.textPrimary },
  optionTextSelected: { color: COLORS.primary, fontWeight: '600' },
});
