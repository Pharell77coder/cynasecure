import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, spacing, typography } from '../theme';

/**
 * Composant Button natif Cyna
 * @param {'primary'|'secondary'|'outline'|'ghost'|'danger'} variant
 * @param {'sm'|'md'|'lg'} size
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
  style,
}) => {
  const sizeStyle = sizes[size];

  if (variant === 'primary') {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={disabled || loading}
        activeOpacity={0.85}
        style={[fullWidth && { width: '100%' }, style]}
      >
        <LinearGradient
          colors={disabled ? ['#9CA3AF', '#9CA3AF'] : ['#1E1B74', '#7B3FE4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.base, sizeStyle, fullWidth && styles.full]}
        >
          {loading
            ? <ActivityIndicator color="white" size="small" />
            : <Text style={[styles.text, styles.textLight, { fontSize: sizeStyle.fontSize }]}>{children}</Text>}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  const variantStyles = {
    secondary: { bg: colors.secondary, text: 'white' },
    outline:   { bg: 'transparent', text: colors.primary, border: colors.primary },
    ghost:     { bg: 'transparent', text: colors.secondary },
    danger:    { bg: colors.danger, text: 'white' },
  };

  const v = variantStyles[variant] || variantStyles.ghost;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        sizeStyle,
        { backgroundColor: v.bg },
        v.border && { borderWidth: 2, borderColor: v.border },
        fullWidth && styles.full,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading
        ? <ActivityIndicator color={v.text} size="small" />
        : <Text style={[styles.text, { color: v.text, fontSize: sizeStyle.fontSize }]}>{children}</Text>}
    </TouchableOpacity>
  );
};

const sizes = {
  sm: { paddingVertical: spacing[2], paddingHorizontal: spacing[4], fontSize: typography.sm, borderRadius: radius.md },
  md: { paddingVertical: spacing[3], paddingHorizontal: spacing[6], fontSize: typography.base, borderRadius: radius.md },
  lg: { paddingVertical: spacing[4], paddingHorizontal: spacing[8], fontSize: typography.lg, borderRadius: radius.lg },
};

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8 },
  full: { width: '100%' },
  text: { fontWeight: '700', letterSpacing: 0.2 },
  textLight: { color: 'white' },
  disabled: { opacity: 0.45 },
});

export default Button;
