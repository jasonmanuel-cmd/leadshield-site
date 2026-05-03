interface StatsCardProps {
  label: string
  value: number | string
  accent?: 'cyan' | 'gold' | 'green' | 'red'
  icon?: React.ReactNode
}

export default function StatsCard({ label, value, accent = 'cyan', icon }: StatsCardProps) {
  const accentColors = {
    cyan: '#00E5FF',
    gold: '#FFD700',
    green: '#00C853',
    red: '#FF4444',
  }

  const color = accentColors[accent]

  return (
    <div
      className="rounded-2xl p-4 flex flex-col gap-2 glass-panel surface-glow"
      style={{
        background: 'linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))',
        borderColor: 'rgba(255,255,255,0.08)',
      }}
    >
      <div className="h-1 w-14 rounded-full mb-1" style={{ background: color }} />
      {icon && (
        <div className="mb-1" style={{ color }}>
          {icon}
        </div>
      )}
      <div className="text-3xl font-bold tracking-tight font-mono-ui" style={{ color }}>
        {value}
      </div>
      <div className="text-sm font-medium" style={{ color: '#8892A4' }}>
        {label}
      </div>
    </div>
  )
}
