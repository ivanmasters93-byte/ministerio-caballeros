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
        <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-xs font-bold">AM</span>
        </div>
      )}
      {isUser && <Avatar name="Tú" size="sm" />}
      <div className={cn(
        "max-w-[75%] rounded-2xl px-4 py-3 text-sm",
        isUser
          ? "bg-blue-900 text-white rounded-tr-sm"
          : "bg-gray-100 text-gray-800 rounded-tl-sm"
      )}>
        <p className="whitespace-pre-wrap">{message}</p>
        {timestamp && (
          <p className={cn("text-xs mt-1", isUser ? "text-blue-200" : "text-gray-400")}>
            {timestamp.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
          </p>
        )}
      </div>
    </div>
  )
}
