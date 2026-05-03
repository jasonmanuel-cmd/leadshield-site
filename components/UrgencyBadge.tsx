interface UrgencyBadgeProps {
  urgency: string
}

export default function UrgencyBadge({ urgency }: UrgencyBadgeProps) {
  if (urgency !== 'urgent') return null

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold tracking-wide"
      style={{
        color: '#FF4444',
        background: 'rgba(255,68,68,0.15)',
        border: '1px solid rgba(255,68,68,0.4)',
      }}
    >
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
      URGENT
    </span>
  )
}
