'use client'

import { useState } from 'react'

const COLORS = {
  bg: '#050814',
  cyan: '#00E5FF',
  gold: '#FFD700',
  green: '#00FF88',
  purple: '#A855F7',
  text: '#E2E8F0',
  muted: '#94A3B8',
  panel: 'rgba(255,255,255,0.03)',
  border: 'rgba(255,255,255,0.08)',
}

const STATUS_COLORS: Record<string, string> = {
  new: COLORS.cyan,
  contacted: COLORS.gold,
  qualified: COLORS.green,
  closed: '#FF6B6B',
  lost: COLORS.muted,
}

interface StatsData {
  betaSignups: number
  leads: number
  callEvents: number
  messages: number
  byTrade: { trade: string; count: number }[]
  last14Days: { date: string; count: number }[]
  leadsByStatus: { status: string; count: number }[]
}

const containerStyle: React.CSSProperties = {
  minHeight: '100vh',
  backgroundColor: COLORS.bg,
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  color: COLORS.text,
  padding: '0',
  margin: '0',
  position: 'relative',
  overflow: 'auto',
}

const glowStyle: React.CSSProperties = {
  position: 'fixed',
  top: '-20%',
  left: '50%',
  transform: 'translateX(-50%)',
  width: '800px',
  height: '500px',
  background: 'radial-gradient(ellipse, rgba(0,229,255,0.06) 0%, rgba(5,8,20,0) 70%)',
  pointerEvents: 'none',
  zIndex: 0,
}

const glowStyle2: React.CSSProperties = {
  position: 'fixed',
  bottom: '-10%',
  right: '-10%',
  width: '600px',
  height: '400px',
  background: 'radial-gradient(ellipse, rgba(255,215,0,0.04) 0%, rgba(5,8,20,0) 70%)',
  pointerEvents: 'none',
  zIndex: 0,
}

const panelStyle: React.CSSProperties = {
  background: COLORS.panel,
  border: `1px solid ${COLORS.border}`,
  borderRadius: '20px',
  padding: '28px',
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string
  value: number
  accent: string
}) {
  return (
    <div
      style={{
        ...panelStyle,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flex: '1 1 180px',
      }}
    >
      <span
        style={{
          fontSize: '13px',
          color: COLORS.muted,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
      <span
        style={{ fontSize: '42px', fontWeight: 700, color: accent, lineHeight: 1 }}
      >
        {value.toLocaleString()}
      </span>
    </div>
  )
}

function TradeChart({ data }: { data: { trade: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div style={{ ...panelStyle, marginTop: '24px' }}>
      <h2
        style={{
          margin: '0 0 20px',
          fontSize: '16px',
          fontWeight: 600,
          color: COLORS.text,
        }}
      >
        Beta Signups by Trade
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.map(({ trade, count }) => (
          <div key={trade} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              style={{
                width: '120px',
                minWidth: '120px',
                fontSize: '13px',
                color: COLORS.muted,
                textAlign: 'right',
                textTransform: 'capitalize',
              }}
            >
              {trade}
            </span>
            <div
              style={{
                flex: 1,
                height: '22px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '4px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${(count / max) * 100}%`,
                  height: '100%',
                  background: COLORS.gold,
                  borderRadius: '4px',
                }}
              />
            </div>
            <span
              style={{
                fontSize: '13px',
                color: COLORS.gold,
                minWidth: '28px',
                textAlign: 'right',
              }}
            >
              {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function DailyChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map((d) => d.count), 1)
  return (
    <div style={{ ...panelStyle, marginTop: '24px' }}>
      <h2
        style={{
          margin: '0 0 20px',
          fontSize: '16px',
          fontWeight: 600,
          color: COLORS.text,
        }}
      >
        Signups Last 14 Days
      </h2>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '6px',
          height: '120px',
          paddingBottom: '24px',
        }}
      >
        {data.map(({ date, count }) => (
          <div
            key={date}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '4px',
              height: '100%',
            }}
          >
            <div
              style={{
                width: '100%',
                height: `${Math.max((count / max) * 80, count > 0 ? 4 : 0)}px`,
                background: COLORS.cyan,
                borderRadius: '3px 3px 0 0',
                opacity: 0.85,
              }}
            />
            <span
              style={{
                fontSize: '9px',
                color: COLORS.muted,
                transform: 'rotate(-45deg)',
                whiteSpace: 'nowrap',
                transformOrigin: 'center',
              }}
            >
              {date.slice(5)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function StatusPanel({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0) || 1
  return (
    <div style={{ ...panelStyle, marginTop: '24px' }}>
      <h2
        style={{
          margin: '0 0 20px',
          fontSize: '16px',
          fontWeight: 600,
          color: COLORS.text,
        }}
      >
        Lead Pipeline Status
      </h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {data.map(({ status, count }) => {
          const color = STATUS_COLORS[status.toLowerCase()] ?? COLORS.muted
          return (
            <div
              key={status}
              style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: color,
                  flexShrink: 0,
                }}
              />
              <span
                style={{
                  flex: 1,
                  fontSize: '14px',
                  textTransform: 'capitalize',
                  color: COLORS.text,
                }}
              >
                {status}
              </span>
              <span style={{ fontSize: '14px', color, fontWeight: 600 }}>
                {count}
              </span>
              <span
                style={{
                  fontSize: '12px',
                  color: COLORS.muted,
                  minWidth: '38px',
                  textAlign: 'right',
                }}
              >
                {Math.round((count / total) * 100)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PasswordGate({ onSuccess }: { onSuccess: (data: StatsData) => void }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (!password.trim()) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin-stats', {
        headers: { Authorization: `Bearer ${password}` },
      })
      if (res.status === 401) {
        setError('Wrong password')
        setLoading(false)
        return
      }
      if (!res.ok) {
        setError('Server error — try again')
        setLoading(false)
        return
      }
      const data: StatsData = await res.json()
      onSuccess(data)
    } catch {
      setError('Network error — try again')
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        ...containerStyle,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={glowStyle} />
      <div
        style={{
          ...panelStyle,
          width: '360px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>👑</div>
          <h1
            style={{
              margin: 0,
              fontSize: '22px',
              fontWeight: 700,
              color: COLORS.gold,
            }}
          >
            Master Dashboard
          </h1>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: COLORS.muted }}>
            Admin access required
          </p>
        </div>
        <input
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: `1px solid ${error ? '#FF6B6B' : COLORS.border}`,
            borderRadius: '10px',
            padding: '12px 16px',
            color: COLORS.text,
            fontSize: '15px',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
          }}
        />
        {error && (
          <p
            style={{
              margin: '-8px 0 0',
              fontSize: '13px',
              color: '#FF6B6B',
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        )}
        <button
          onClick={handleSubmit}
          disabled={loading}
          style={{
            background: loading ? 'rgba(0,229,255,0.2)' : COLORS.cyan,
            color: loading ? COLORS.muted : '#050814',
            border: 'none',
            borderRadius: '10px',
            padding: '12px',
            fontSize: '15px',
            fontWeight: 700,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s',
          }}
        >
          {loading ? 'Checking…' : 'Enter'}
        </button>
      </div>
    </div>
  )
}

function Dashboard({ data }: { data: StatsData }) {
  return (
    <div style={containerStyle}>
      <div style={glowStyle} />
      <div style={glowStyle2} />
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: '900px',
          margin: '0 auto',
          padding: '48px 24px 80px',
        }}
      >
        <div style={{ marginBottom: '36px' }}>
          <h1
            style={{
              margin: '0 0 8px',
              fontSize: '30px',
              fontWeight: 800,
              color: COLORS.gold,
            }}
          >
            👑 Master Dashboard
          </h1>
          <p style={{ margin: 0, fontSize: '14px', color: COLORS.muted }}>
            Site analytics · Beta signups · Lead data — numbers only, no personal info
          </p>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
          <StatCard label="Beta Signups" value={data.betaSignups} accent={COLORS.cyan} />
          <StatCard label="Total Leads" value={data.leads} accent={COLORS.gold} />
          <StatCard label="AI Conversations" value={data.callEvents} accent={COLORS.green} />
          <StatCard label="SMS Messages" value={data.messages} accent={COLORS.purple} />
        </div>

        {data.byTrade.length > 0 && <TradeChart data={data.byTrade} />}
        {data.last14Days.length > 0 && <DailyChart data={data.last14Days} />}
        {data.leadsByStatus.length > 0 && <StatusPanel data={data.leadsByStatus} />}

        <div
          style={{
            ...panelStyle,
            marginTop: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <span style={{ fontSize: '13px', color: COLORS.muted }}>
            Full page-view analytics available at{' '}
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: COLORS.cyan, textDecoration: 'none' }}
            >
              vercel.com/dashboard
            </a>
          </span>
          <a
            href="/dashboard"
            style={{
              color: COLORS.gold,
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Open CRM Dashboard →
          </a>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  const [stats, setStats] = useState<StatsData | null>(null)

  if (!stats) {
    return <PasswordGate onSuccess={setStats} />
  }

  return <Dashboard data={stats} />
}
