import { getStatusColor, getStatusLabel } from '@/lib/utils'

interface StatusBadgeProps {
  status: string
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const color = getStatusColor(status)
  const label = getStatusLabel(status)

  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${padding}`}
      style={{
        color,
        background: `${color}18`,
        border: `1px solid ${color}40`,
      }}
    >
      {label}
    </span>
  )
}
