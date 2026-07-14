'use client'

import { classNames } from '@/lib/utils'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: { value: string; label: string }[]
  error?: string
}

export default function Select({ label, options, error, className, id, ...props }: SelectProps) {
  const selectId = id || label?.toLowerCase().replace(/\s+/g, '-')

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-sm font-semibold text-text-primary mb-1.5">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={classNames(
          'w-full px-4 py-3 rounded-card border-2 border-gray-200 bg-surface text-text-primary',
          'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
          'transition-all duration-300',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
