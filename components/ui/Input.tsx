'use client'

import { classNames } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export default function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-semibold text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={classNames(
          'w-full px-4 py-3 rounded-card border-2 border-gray-200 bg-surface text-text-primary',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
          'transition-all duration-300 placeholder:text-text-secondary/50',
          error && 'border-red-400 focus:border-red-400 focus:ring-red-400/20',
          className
        )}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
