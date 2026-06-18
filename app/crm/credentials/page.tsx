'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import Navbar from '@/components/Navbar'
import { createClient } from '@/lib/supabase'

type DocStatus = 'ready' | 'expiring' | 'missing'
type Priority = 'critical' | 'watch' | 'clear'

type CredentialDoc = {
  id: string
  name: string
  owner: string
  expires: string
  status: DocStatus
  note: string
}

type CredentialAccount = {
  id: string
  company: string
  contact: string
  email: string
  job: string
  value: number
  dueDate: string
  priority: Priority
  docs: CredentialDoc[]
}

const C = {
  bg: '#050814',
  cyan: '#00E5FF',
  gold: '#FFD700',
  green: '#00FF88',
  red: '#FF6B6B',
  blue: '#3B82F6',
  text: '#E2E8F0',
  muted: '#94A3B8',
  panel: 'rgba(255,255,255,0.035)',
  border: 'rgba(255,255,255,0.08)',
}

const PANEL: React.CSSProperties = {
  background: C.panel,
  border: `1px solid ${C.border}`,
  borderRadius: '20px',
  padding: '22px',
}

const INPUT: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.05)',
  border: `1px solid ${C.border}`,
  borderRadius: '10px',
  padding: '11px 12px',
  color: C.text,
  fontSize: '13px',
  outline: 'none',
  fontFamily: 'inherit',
}

const defaultAccounts: CredentialAccount[] = [
  {
    id: 'northgate',
    company: 'Northgate Retail Group',
    contact: 'Mel Ramirez',
    email: 'mel.ramirez@example.com',
    job: '12-store maintenance packet',
    value: 18400,
    dueDate: '2026-06-24',
    priority: 'critical',
    docs: [
      { id: 'coi', name: 'Certificate of insurance', owner: 'Broker', expires: '2026-07-06', status: 'expiring', note: 'Needs client listed as certificate holder' },
      { id: 'w9', name: 'W-9', owner: 'Office', expires: '2027-01-31', status: 'ready', note: 'Signed and matched to legal entity' },
      { id: 'safety', name: 'Safety plan', owner: 'Operations', expires: '2026-12-31', status: 'ready', note: 'Includes after-hours property access protocol' },
      { id: 'license', name: 'Business license', owner: 'Owner', expires: '2026-06-20', status: 'expiring', note: 'Renewal receipt required before packet send' },
    ],
  },
  {
    id: 'mason-creek',
    company: 'Mason Creek HOA',
    contact: 'Dana Yu',
    email: 'dana.yu@example.com',
    job: 'Eviction cleanout vendor onboarding',
    value: 9200,
    dueDate: '2026-06-28',
    priority: 'watch',
    docs: [
      { id: 'hoa-coi', name: 'Certificate of insurance', owner: 'Broker', expires: '2026-10-12', status: 'ready', note: 'General liability and auto included' },
      { id: 'waste', name: 'Waste disposal policy', owner: 'Operations', expires: '2027-01-01', status: 'missing', note: 'Add landfill diversion language' },
      { id: 'hoa-w9', name: 'W-9', owner: 'Office', expires: '2027-01-31', status: 'ready', note: 'Use current signed form' },
    ],
  },
]

const money = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function daysUntil(date: string) {
  const target = new Date(`${date}T00:00:00`)
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function computedStatus(doc: CredentialDoc): DocStatus {
  if (doc.status === 'missing') return 'missing'
  return daysUntil(doc.expires) <= 30 ? 'expiring' : 'ready'
}

function packetScore(account: CredentialAccount) {
  const ready = account.docs.filter((doc) => computedStatus(doc) === 'ready').length
  return Math.round((ready / Math.max(account.docs.length, 1)) * 100)
}

function newDoc(): CredentialDoc {
  return {
    id: crypto.randomUUID(),
    name: 'New document',
    owner: 'Owner',
    expires: new Date(Date.now() + 45 * 86400000).toISOString().slice(0, 10),
    status: 'missing',
    note: 'Add what the buyer requested',
  }
}

function buildPacket(account: CredentialAccount) {
  const ready = account.docs.filter((doc) => computedStatus(doc) === 'ready')
  const blockers = account.docs.filter((doc) => computedStatus(doc) !== 'ready')

  return `Credential packet for ${account.company}

Prepared for: ${account.contact} <${account.email}>
Opportunity: ${account.job}
Estimated value: ${money.format(account.value)}
Target send date: ${account.dueDate}

Included documents:
${ready.map((doc) => `- ${doc.name}: current through ${doc.expires}. ${doc.note}`).join('\n') || '- No ready documents yet.'}

Open items:
${blockers.map((doc) => `- ${doc.name}: ${computedStatus(doc)}. Owner: ${doc.owner}. ${doc.note}`).join('\n') || '- No open items.'}

Recommended email:
Hi ${account.contact},

Attached is our vendor credential packet for ${account.job}. It includes the current tax, insurance, safety, license, and policy documents requested for onboarding.

${blockers.length ? blockers.map((doc) => `- ${doc.name}: ${doc.note}`).join('\n') : '- No open items are pending on our side.'}

Please reply with any changes your risk or procurement team needs and we will update the packet same day.`
}

function loadAccounts() {
  if (typeof window === 'undefined') return defaultAccounts
  const stored = window.localStorage.getItem('leadshield.credential_accounts')
  if (!stored) return defaultAccounts

  try {
    const parsed = JSON.parse(stored) as CredentialAccount[]
    return parsed.length ? parsed : defaultAccounts
  } catch {
    return defaultAccounts
  }
}

export default function CredentialsPage() {
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [accounts, setAccounts] = useState<CredentialAccount[]>([])
  const [selectedId, setSelectedId] = useState('')
  const [notice, setNotice] = useState('Build vendor packets for commercial jobs that stall after the quote.')

  const verifySession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/signon')
      return
    }

    const loaded = loadAccounts()
    setAccounts(loaded)
    setSelectedId(loaded[0]?.id ?? '')
    setLoading(false)
  }, [router, supabase])

  useEffect(() => { verifySession() }, [verifySession])

  useEffect(() => {
    if (accounts.length) {
      window.localStorage.setItem('leadshield.credential_accounts', JSON.stringify(accounts))
    }
  }, [accounts])

  const selected = accounts.find((account) => account.id === selectedId) ?? accounts[0]

  const metrics = useMemo(() => {
    const value = accounts.reduce((sum, account) => sum + account.value, 0)
    const blockers = accounts.reduce((sum, account) => sum + account.docs.filter((doc) => computedStatus(doc) !== 'ready').length, 0)
    const ready = accounts.filter((account) => packetScore(account) === 100).length
    return { value, blockers, ready }
  }, [accounts])

  function updateAccount(id: string, patch: Partial<CredentialAccount>) {
    setAccounts((current) => current.map((account) => account.id === id ? { ...account, ...patch } : account))
  }

  function updateDoc(accountId: string, docId: string, patch: Partial<CredentialDoc>) {
    setAccounts((current) => current.map((account) => account.id === accountId
      ? { ...account, docs: account.docs.map((doc) => doc.id === docId ? { ...doc, ...patch } : doc) }
      : account))
  }

  function addAccount() {
    const id = crypto.randomUUID()
    const account: CredentialAccount = {
      id,
      company: 'New commercial buyer',
      contact: 'Procurement lead',
      email: 'buyer@example.com',
      job: 'Vendor onboarding packet',
      value: 5000,
      dueDate: new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10),
      priority: 'watch',
      docs: [newDoc()],
    }
    setAccounts((current) => [account, ...current])
    setSelectedId(id)
  }

  async function copyPacket() {
    if (!selected) return
    await navigator.clipboard.writeText(buildPacket(selected))
    setNotice(`Copied ${selected.company} packet text to clipboard.`)
  }

  function downloadPacket() {
    if (!selected) return
    const blob = new Blob([buildPacket(selected)], { type: 'text/plain;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selected.company.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-credential-packet.txt`
    a.click()
    URL.revokeObjectURL(url)
    setNotice(`Downloaded ${selected.company} packet.`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: C.bg }}>
        <div className="w-10 h-10 rounded-full border-2 animate-spin" style={{ borderColor: C.cyan, borderTopColor: 'transparent' }} />
      </div>
    )
  }

  if (!selected) {
    return (
      <div className="min-h-screen" style={{ background: C.bg }}>
        <Navbar />
        <main className="relative pt-22 pb-24 px-4 max-w-4xl mx-auto text-center">
          <div style={{ ...PANEL, padding: '48px 24px' }}>
            <h1 className="font-display text-3xl font-bold" style={{ color: C.text }}>No credential packets yet</h1>
            <p style={{ color: C.muted, marginTop: '8px' }}>Create a commercial buyer packet to start tracking onboarding documents.</p>
            <button onClick={addAccount} style={primaryButton}>Create Packet</button>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: C.bg }}>
      <div className="pointer-events-none fixed inset-0"
        style={{ background: 'radial-gradient(circle at top left, rgba(0,229,255,0.08), transparent 30%), radial-gradient(circle at bottom right, rgba(255,215,0,0.06), transparent 28%)' }} />
      <Navbar />
      <main className="relative pt-22 pb-24 px-4 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em]" style={{ color: C.cyan }}>LeadShield Credentials</p>
            <h1 className="font-display text-3xl md:text-4xl font-bold mt-2" style={{ color: C.text }}>
              Vendor packets for commercial jobs.
            </h1>
            <p style={{ color: C.muted, fontSize: '14px', marginTop: '8px', maxWidth: '680px' }}>
              Track W-9s, insurance certificates, licenses, bonds, and safety docs before onboarding paperwork costs the job.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={copyPacket} style={secondaryButton}>Copy packet</button>
            <button onClick={downloadPacket} style={primaryButton}>Export packet</button>
          </div>
        </div>

        <div style={{ ...PANEL, padding: '12px 14px', marginBottom: '16px', borderColor: 'rgba(0,229,255,0.2)', background: 'rgba(0,229,255,0.05)' }}>
          <p style={{ color: C.text, fontSize: '13px', margin: 0 }}>{notice}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          <Stat label="Commercial value protected" value={money.format(metrics.value)} accent={C.gold} />
          <Stat label="Open document blockers" value={String(metrics.blockers)} accent={metrics.blockers ? C.red : C.green} />
          <Stat label="Ready packets" value={`${metrics.ready}/${accounts.length}`} accent={C.green} />
          <Stat label="Active buyers" value={String(accounts.length)} accent={C.cyan} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[300px_minmax(0,1fr)_420px] gap-4 items-start">
          <aside style={PANEL}>
            <button onClick={addAccount} style={{ ...primaryButton, width: '100%', marginBottom: '14px' }}>New buyer packet</button>
            <div className="flex flex-col gap-2">
              {accounts.map((account) => {
                const score = packetScore(account)
                const active = account.id === selected.id
                return (
                  <button
                    key={account.id}
                    onClick={() => setSelectedId(account.id)}
                    className="text-left"
                    style={{
                      border: `1px solid ${active ? 'rgba(0,229,255,0.35)' : C.border}`,
                      background: active ? 'rgba(0,229,255,0.08)' : 'rgba(255,255,255,0.025)',
                      borderRadius: '14px',
                      padding: '13px',
                      cursor: 'pointer',
                    }}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <strong style={{ color: C.text, fontSize: '13px' }}>{account.company}</strong>
                      <span style={{ color: score === 100 ? C.green : score >= 67 ? C.gold : C.red, fontSize: '12px', fontWeight: 800 }}>{score}%</span>
                    </div>
                    <p style={{ color: C.muted, margin: '4px 0 0', fontSize: '12px' }}>{account.job}</p>
                  </button>
                )
              })}
            </div>
          </aside>

          <section style={PANEL}>
            <div className="flex items-center justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>Active packet</p>
                <h2 className="font-display text-2xl font-bold mt-1" style={{ color: C.text }}>{selected.company}</h2>
              </div>
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', border: `8px solid rgba(0,229,255,0.18)`, display: 'grid', placeItems: 'center', color: C.cyan, fontWeight: 900 }}>
                {packetScore(selected)}%
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
              <Field label="Company"><input value={selected.company} onChange={(e) => updateAccount(selected.id, { company: e.target.value })} style={INPUT} /></Field>
              <Field label="Contact"><input value={selected.contact} onChange={(e) => updateAccount(selected.id, { contact: e.target.value })} style={INPUT} /></Field>
              <Field label="Email"><input type="email" value={selected.email} onChange={(e) => updateAccount(selected.id, { email: e.target.value })} style={INPUT} /></Field>
              <Field label="Opportunity"><input value={selected.job} onChange={(e) => updateAccount(selected.id, { job: e.target.value })} style={INPUT} /></Field>
              <Field label="Value"><input type="number" value={selected.value} onChange={(e) => updateAccount(selected.id, { value: Number(e.target.value) })} style={INPUT} /></Field>
              <Field label="Due date"><input type="date" value={selected.dueDate} onChange={(e) => updateAccount(selected.id, { dueDate: e.target.value })} style={INPUT} /></Field>
            </div>

            <div className="flex items-center justify-between gap-3 mb-3">
              <h3 className="font-display text-lg font-bold" style={{ color: C.text }}>Documents</h3>
              <button onClick={() => updateAccount(selected.id, { docs: [...selected.docs, newDoc()] })} style={secondaryButton}>Add document</button>
            </div>

            <div className="flex flex-col gap-3">
              {selected.docs.map((doc) => {
                const status = computedStatus(doc)
                const color = status === 'ready' ? C.green : status === 'expiring' ? C.gold : C.red
                return (
                  <article key={doc.id} style={{ border: `1px solid ${C.border}`, borderLeft: `4px solid ${color}`, borderRadius: '14px', padding: '14px', background: 'rgba(255,255,255,0.025)' }}>
                    <div className="grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.8fr_auto] gap-2 items-end">
                      <Field label="Document"><input value={doc.name} onChange={(e) => updateDoc(selected.id, doc.id, { name: e.target.value })} style={INPUT} /></Field>
                      <Field label="Owner"><input value={doc.owner} onChange={(e) => updateDoc(selected.id, doc.id, { owner: e.target.value })} style={INPUT} /></Field>
                      <Field label="Expires"><input type="date" value={doc.expires} onChange={(e) => updateDoc(selected.id, doc.id, { expires: e.target.value })} style={INPUT} /></Field>
                      <Field label="Status">
                        <select value={doc.status} onChange={(e) => updateDoc(selected.id, doc.id, { status: e.target.value as DocStatus })} style={INPUT}>
                          <option value="ready">Ready</option>
                          <option value="expiring">Expiring</option>
                          <option value="missing">Missing</option>
                        </select>
                      </Field>
                      <button
                        onClick={() => updateAccount(selected.id, { docs: selected.docs.filter((item) => item.id !== doc.id) })}
                        style={{ ...ghostButton, height: '40px' }}
                        aria-label={`Remove ${doc.name}`}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-2">
                      <Field label="Note"><input value={doc.note} onChange={(e) => updateDoc(selected.id, doc.id, { note: e.target.value })} style={INPUT} /></Field>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>

          <aside style={{ ...PANEL, position: 'sticky', top: '84px' }}>
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em]" style={{ color: C.muted }}>Client-ready output</p>
                <h2 className="font-display text-xl font-bold mt-1" style={{ color: C.text }}>Packet brief</h2>
              </div>
              <Link href="/crm" style={{ color: C.cyan, fontSize: '12px', textDecoration: 'none', fontWeight: 700 }}>Back to CRM</Link>
            </div>
            <pre style={{
              whiteSpace: 'pre-wrap',
              background: 'rgba(0,0,0,0.34)',
              border: `1px solid ${C.border}`,
              borderRadius: '14px',
              padding: '16px',
              color: C.text,
              fontSize: '12px',
              lineHeight: 1.55,
              maxHeight: '680px',
              overflow: 'auto',
              margin: 0,
            }}>
              {buildPacket(selected)}
            </pre>
          </aside>
        </div>
      </main>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'grid', gap: '7px', color: C.muted, fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
      {label}
      {children}
    </label>
  )
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div style={{ ...PANEL, padding: '18px' }}>
      <p style={{ color: C.muted, margin: 0, fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 800 }}>{label}</p>
      <strong className="font-display" style={{ color: accent, fontSize: '26px', display: 'block', marginTop: '7px' }}>{value}</strong>
    </div>
  )
}

const primaryButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 16px',
  borderRadius: '12px',
  border: 'none',
  background: 'linear-gradient(135deg,#00E5FF,#0070FF)',
  color: '#050814',
  fontWeight: 800,
  fontSize: '13px',
  cursor: 'pointer',
}

const secondaryButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '10px 14px',
  borderRadius: '12px',
  border: `1px solid ${C.border}`,
  background: 'rgba(255,255,255,0.04)',
  color: C.text,
  fontWeight: 700,
  fontSize: '13px',
  cursor: 'pointer',
}

const ghostButton: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '8px 10px',
  borderRadius: '10px',
  border: `1px solid ${C.border}`,
  background: 'transparent',
  color: C.muted,
  fontWeight: 700,
  fontSize: '12px',
  cursor: 'pointer',
}
