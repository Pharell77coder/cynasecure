import { StyleSheet } from 'react-native';

export const colors = {
  primary:        '#1E1B74',
  primaryLight:   '#2D2A9B',
  secondary:      '#7B3FE4',
  secondaryLight: '#9B6FF0',
  accent:         '#A855F7',

  bgDark:   '#0D0B3B',
  bgDark2:  '#13104A',
  bgLight:  '#F5F3FF',
  bgWhite:  '#FFFFFF',

  textPrimary: '#1A1A2E',
  textLight:   '#FFFFFF',
  textMuted:   '#6B7280',

  success: '#10B981',
  danger:  '#EF4444',
  warning: '#F59E0B',
  info:    '#3B82F6',

  border:     '#E5E7EB',
  borderDark: 'rgba(255,255,255,0.1)',
};

export const typography = {
  xs: 10, sm: 12, base: 14, lg: 16, xl: 18, '2xl': 22, '3xl': 28, '4xl': 34,
};

export const spacing = {
  1: 4, 2: 8, 3: 12, 4: 16, 5: 20, 6: 24, 8: 32, 10: 40, 12: 48, 16: 64,
};

export const radius = {
  sm: 6, md: 10, lg: 14, xl: 20, full: 999,
};

export const shadow = {
  sm: { shadowColor: '#1E1B74', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 },
  md: { shadowColor: '#1E1B74', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 10, elevation: 5 },
  lg: { shadowColor: '#1E1B74', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.18, shadowRadius: 20, elevation: 10 },
};

export const common = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bgLight },
  container: { paddingHorizontal: spacing[4] },
  row: { flexDirection: 'row', alignItems: 'center' },
  center: { alignItems: 'center', justifyContent: 'center' },
  card: { backgroundColor: colors.bgWhite, borderRadius: radius.lg, padding: spacing[4], ...shadow.sm },
  sectionTitle: { fontSize: typography['2xl'], fontWeight: '800', color: colors.primary, letterSpacing: -0.5, marginBottom: spacing[4] },
  badge: { paddingHorizontal: spacing[3], paddingVertical: spacing[1], borderRadius: radius.full, alignSelf: 'flex-start' },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing[3] },
});
