'use client'

import { useState } from 'react'
import { ConversationMessage } from '@/lib/supabase'
import { formatPhone, timeAgo } from '@/lib/utils'
import ChatBubble from './ChatBubble'
import Link from 'next/link'

interface ConversationGroup {
  phone_number: string
  contact_name: string | null
  lead_id: string | null
  messages: ConversationMessage[]
  latest_at: string
}

interface ConversationThreadProps {
  group: ConversationGroup
}

export default function ConversationThread({ group }: ConversationThreadProps) {
  const [expanded, setExpanded] = useState(false)

  const firstMessage = group.messages[group.messages.length - 1]
  const preview = firstMessage?.content?.slice(0, 80) + (firstMessage?.content?.length > 80 ? '...' : '')
  const displayName = group.contact_name || formatPhone(group.phone_number)

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      <button
        className="w-full text-left p-4 transition-all"
        onClick={() => setExpanded(!expanded)}
        style={{ background: 'transparent' }}
        onMouseEnter={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.03)'
        }}
        onMouseLeave={(e) => {
          ;(e.currentTarget as HTMLButtonElement).style.background = 'transparent'
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-sm" style={{ color: '#E8EAF0' }}>
                {displayName}
              </span>
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(0,229,255,0.12)', color: '#00E5FF', border: '1px solid rgba(0,229,255,0.25)' }}
              >
                {group.messages.length} msg{group.messages.length !== 1 ? 's' : ''}
              </span>
            </div>
            <p className="text-xs line-clamp-2" style={{ color: '#8892A4' }}>
              {preview}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-xs" style={{ color: '#8892A4' }}>
              {timeAgo(group.latest_at)}
            </span>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#8892A4"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </div>
        </div>
      </button>

      {expanded && (
        <div
          className="px-4 pb-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <div className="pt-4 max-h-96 overflow-y-auto">
            {[...group.messages].reverse().map((msg) => (
              <ChatBubble key={msg.id} message={msg} />
            ))}
          </div>
          {group.lead_id && (
            <div className="mt-3 flex justify-end">
              <Link
                href={`/leads/${group.lead_id}`}
                className="text-sm px-4 py-2 rounded-lg font-medium transition-all"
                style={{
                  background: 'rgba(0,229,255,0.12)',
                  color: '#00E5FF',
                  border: '1px solid rgba(0,229,255,0.25)',
                }}
              >
                View Lead Detail →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
