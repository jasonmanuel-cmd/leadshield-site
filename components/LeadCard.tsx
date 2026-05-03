import Link from 'next/link'
import { Lead } from '@/lib/supabase'
import { formatPhone, timeAgo } from '@/lib/utils'
import StatusBadge from './StatusBadge'
import UrgencyBadge from './UrgencyBadge'

interface LeadCardProps {
  lead: Lead
  showStatus?: boolean
}

export default function LeadCard({ lead, showStatus = false }: LeadCardProps) {
  const displayName = lead.contact_name || formatPhone(lead.phone_number)

  return (
    <Link href={`/leads/${lead.id}`}>
      <div
        className="rounded-xl p-4 transition-all cursor-pointer group"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}
        onMouseEnter={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.background = 'rgba(255,255,255,0.07)'
          el.style.borderColor = 'rgba(0,229,255,0.3)'
        }}
        onMouseLeave={(e) => {
          const el = e.currentTarget as HTMLDivElement
          el.style.background = 'rgba(255,255,255,0.04)'
          el.style.borderColor = 'rgba(255,255,255,0.08)'
        }}
      >
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="min-w-0">
            <div className="font-semibold truncate" style={{ color: '#E8EAF0' }}>
              {displayName}
            </div>
            {lead.contact_name && (
              <div className="text-xs mt-0.5" style={{ color: '#8892A4' }}>
                {formatPhone(lead.phone_number)}
              </div>
            )}
          </div>
          <UrgencyBadge urgency={lead.urgency_level} />
        </div>

        {lead.service_needed && (
          <div className="text-sm mb-2" style={{ color: '#8892A4' }}>
            {lead.service_needed}
            {lead.city && ` · ${lead.city}`}
          </div>
        )}

        <div className="flex items-center justify-between gap-2 mt-3">
          <span className="text-xs" style={{ color: '#8892A4' }}>
            {timeAgo(lead.created_at)}
          </span>
          {showStatus && <StatusBadge status={lead.status} size="sm" />}
        </div>
      </div>
    </Link>
  )
}
