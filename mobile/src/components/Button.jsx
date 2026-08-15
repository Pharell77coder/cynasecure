import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';

const VARIANTS = {
  primary: 'bg-blue-600 active:bg-blue-500 border border-transparent',
  secondary: 'bg-gray-700 active:bg-gray-600 border border-transparent',
  outline: 'bg-transparent active:bg-gray-800 border border-gray-700',
  ghost: 'bg-transparent active:bg-gray-800/60 border border-transparent',
  danger: 'bg-red-950/50 active:bg-red-900/50 border border-red-800/40'
};

const TEXT_VARIANTS = {
  primary: 'text-white',
  secondary: 'text-white',
  outline: 'text-gray-100',
  ghost: 'text-gray-300',
  danger: 'text-red-400'
};

const SIZES = {
  sm: 'px-3 py-1.5',
  md: 'px-4 py-2',
  lg: 'px-6 py-3'
};

const TEXT_SIZES = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base'
};

/**
 * Bouton réutilisable.
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth
 * @param {boolean} loading
 */
export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onPress,
  className = ''
}) {
  return (
    <TouchableOpacity
      disabled={disabled || loading}
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center justify-center gap-2 rounded-lg ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${disabled || loading ? 'opacity-50' : ''} ${className}`}
    >
      {loading && <ActivityIndicator size="small" color="#fff" />}
      <Text className={`font-medium ${TEXT_VARIANTS[variant]} ${TEXT_SIZES[size]}`}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}