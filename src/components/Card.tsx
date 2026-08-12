import { forwardRef } from 'react'
import type { ReactNode, Ref } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export const Card = forwardRef(function Card(
  { children, className = '' }: CardProps,
  ref: Ref<HTMLDivElement>,
) {
  return (
    <div ref={ref} className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm ${className}`}>
      {children}
    </div>
  )
})
