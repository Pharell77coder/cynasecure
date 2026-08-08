import { forwardRef } from 'react';

const VARIANTS = {
  primary: 'bg-blue-600 hover:bg-blue-500 text-white border border-transparent',
  outline: 'bg-transparent hover:bg-gray-800 text-gray-100 border border-gray-700',
  danger: 'bg-red-950/50 hover:bg-red-900/50 text-red-400 border border-red-800/40',
  ghost: 'bg-transparent hover:bg-gray-800/60 text-gray-300 border border-transparent'
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={`inline-flex items-center justify-center gap-2 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${VARIANTS[variant]} ${SIZES[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
});

export default Button;
