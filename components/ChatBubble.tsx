import { ConversationMessage } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

interface ChatBubbleProps {
  message: ConversationMessage
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isAssistant = message.role === 'assistant'

  return (
    <div className={`flex ${isAssistant ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className="max-w-[80%]">
        <div
          className="rounded-2xl px-4 py-3 text-sm leading-relaxed"
          style={
            isAssistant
              ? {
                  background: 'rgba(0,229,255,0.15)',
                  border: '1px solid rgba(0,229,255,0.25)',
                  color: '#E8EAF0',
                  borderBottomRightRadius: '4px',
                }
              : {
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  color: '#E8EAF0',
                  borderBottomLeftRadius: '4px',
                }
          }
        >
          {message.content}
        </div>
        <div
          className={`text-xs mt-1 ${isAssistant ? 'text-right' : 'text-left'}`}
          style={{ color: '#8892A4' }}
        >
          {isAssistant ? 'AI · ' : 'Caller · '}
          {formatDate(message.sent_at)}
        </div>
      </div>
    </div>
  )
}
