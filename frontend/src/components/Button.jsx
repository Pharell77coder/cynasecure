const VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white border border-transparent',
  secondary: 'bg-gray-700 hover:bg-gray-600 text-white border border-transparent',
  outline: 'bg-transparent hover:bg-gray-800 text-gray-100 border border-gray-700',
  ghost: 'bg-transparent hover:bg-gray-800/60 text-gray-300 border border-transparent',
  danger: 'bg-red-950/50 hover:bg-red-900/50 text-red-400 border border-red-800/40'
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

/**
 * Bouton réutilisable.
 * @param {string} variant - 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {boolean} fullWidth
 * @param {boolean} loading
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />}
      {children}
    </button>
  );
};

export default Button;
