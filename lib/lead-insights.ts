import type { LeadLog } from '@/lib/supabase'

export type LeadScore = 0 | 1 | 2

const HOT_KEYWORDS = [
  'urgent',
  'emergency',
  'asap',
  'today',
  'now',
  'flooding',
  'leaking',
  'no heat',
  'broken',
  'burst',
  'help',
  'immediately',
  'right away',
  'desperate',
]

const WARM_KEYWORDS = [
  'quote',
  'estimate',
  'available',
  'schedule',
  'appointment',
  'next week',
  'how much',
  'price',
  'cost',
  'interested',
  'address',
]

export function scoreLead(lead: LeadLog): LeadScore {
  const text = [
    lead.contact_name,
    lead.notes,
    lead.call_status,
    lead.sms_sent_status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()

  if (HOT_KEYWORDS.some((keyword) => text.includes(keyword))) return 2
  if (WARM_KEYWORDS.some((keyword) => text.includes(keyword))) return 1
  return 0
}

export function getScoreMeta(score: LeadScore) {
  switch (score) {
    case 2:
      return { label: 'Hot', color: '#FF6B6B' }
    case 1:
      return { label: 'Warm', color: '#FFD700' }
    default:
      return { label: 'Cold', color: '#94A3B8' }
  }
}

export function isMissedCall(lead: LeadLog) {
  const status = lead.call_status?.toLowerCase() ?? ''
  return status.includes('no-answer') || status.includes('missed') || status.includes('incoming')
}

export function isOpenLead(lead: LeadLog) {
  const status = lead.status ?? 'new'
  return status !== 'called_back' && status !== 'booked' && status !== 'lost'
}

export function isCallbackOverdue(lead: LeadLog, callbackWindowMinutes = 60) {
  if (!isOpenLead(lead)) return false
  const receivedAt = new Date(lead.timestamp).getTime()
  if (!Number.isFinite(receivedAt)) return false
  return Date.now() - receivedAt >= callbackWindowMinutes * 60 * 1000
}

export function callbackAgeMinutes(lead: LeadLog) {
  const receivedAt = new Date(lead.timestamp).getTime()
  if (!Number.isFinite(receivedAt)) return 0
  return Math.max(0, Math.floor((Date.now() - receivedAt) / 60000))
}

export function getMissedCallStats(leads: LeadLog[]) {
  const missedCalls = leads.filter(isMissedCall)
  const openLeads = leads.filter(isOpenLead)
  const overdueLeads = leads.filter((lead) => isCallbackOverdue(lead))
  const hotLeads = leads.filter((lead) => scoreLead(lead) === 2)
  const failedSms = leads.filter((lead) => lead.sms_sent_status === 'failed')
  const sentSms = leads.filter((lead) => lead.sms_sent_status === 'sent' || lead.sms_sent_status === 'dispatched')

  return {
    missedCalls: missedCalls.length,
    openLeads: openLeads.length,
    overdueLeads: overdueLeads.length,
    hotLeads: hotLeads.length,
    failedSms: failedSms.length,
    sentSms: sentSms.length,
    captureRate: missedCalls.length ? Math.round((sentSms.length / missedCalls.length) * 100) : 0,
  }
}
