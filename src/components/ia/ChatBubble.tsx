import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/avatar"

interface ChatBubbleProps {
  message: string
  isUser: boolean
  timestamp?: Date
}

export function ChatBubble({ message, isUser, timestamp }: ChatBubbleProps) {
  return (
    <div className={cn("flex gap-3 mb-4", isUser ? "flex-row-reverse" : "flex-row")}>
      {!isUser && (
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--color-accent-blue-soft)' }}
        >
          <span style={{ color: 'var(--color-accent-blue)' }} className="text-xs font-bold">IA</span>
        </div>
      )}
      {isUser && <Avatar name="Tu" size="sm" />}
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
        isUser
          ? "rounded-tr-sm"
          : "rounded-tl-sm"
      )}
        style={isUser
          ? { background: 'var(--color-accent-blue)', color: '#ffffff' }
          : { background: 'var(--color-bg-elevated)', color: 'var(--color-text-primary)' }
        }
      >
        <p className="whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <p className="text-xs mt-1" style={{ opacity: 0.6 }}>
            {timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
