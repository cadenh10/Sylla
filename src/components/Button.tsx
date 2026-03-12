/**
 * Reusable primary button component
 */
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}

export function Button({ title, onPress, loading = false, disabled = false, variant = 'primary' }: ButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === 'secondary' && styles.secondary,
        variant === 'outline' && styles.outline,
        isDisabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? '#6366f1' : '#fff'} />
      ) : (
        <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#6366f1',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  secondary: {
    backgroundColor: '#64748b',
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#6366f1',
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  outlineText: {
    color: '#6366f1',
  },
});
