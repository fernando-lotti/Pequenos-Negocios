import type { ButtonHTMLAttributes } from 'react'

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger'
}

const variantClass = {
  primary: 'bg-emerald-700 text-white hover:bg-emerald-800',
  secondary: 'bg-slate-100 text-slate-900 hover:bg-slate-200',
  danger: 'bg-red-50 text-red-700 hover:bg-red-100',
}

export function PrimaryButton({ variant = 'primary', className = '', ...buttonProps }: PrimaryButtonProps) {
  return (
    <button
      {...buttonProps}
      className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${variantClass[variant]} ${className}`}
    />
  )
}
