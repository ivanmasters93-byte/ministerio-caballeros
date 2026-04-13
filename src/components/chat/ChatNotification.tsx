'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'

interface ChatNotif {
  id: string
  roomName: string
  senderName: string
  content: string
  roomId: string
}

export function ChatNotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<ChatNotif[]>([])
  const lastCheckRef = useRef<string>(new Date().toISOString())

  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  useEffect(() => {
    const checkNewMessages = async () => {
      try {
        const res = await fetch(`/api/chat/notifications?since=${encodeURIComponent(lastCheckRef.current)}`)
        if (res.ok) {
          const data = await res.json()
          if (data.messages && data.messages.length > 0) {
            lastCheckRef.current = new Date().toISOString()

            for (const msg of data.messages) {
              const notif: ChatNotif = {
                id: msg.id,
                roomName: msg.roomName,
                senderName: msg.senderName,
                content: msg.content,
                roomId: msg.roomId,
              }

              setNotifications(prev => [...prev, notif])

              // Browser notification
              if ('Notification' in window && window.Notification.permission === 'granted') {
                new window.Notification(msg.senderName, {
                  body: msg.content.substring(0, 100),
                  icon: '/icons/icon-192x192.png',
                  tag: msg.roomId,
                })
              }

              // Auto-dismiss after 5s
              setTimeout(() => {
                setNotifications(prev => prev.filter(n => n.id !== msg.id))
              }, 5000)
            }
          }
        }
      } catch { /* ignore */ }
    }

    const interval = setInterval(checkNewMessages, 5000)
    return () => clearInterval(interval)
  }, [])

  const dismiss = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  return (
    <>
      {children}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-[100] space-y-2 pointer-events-none" style={{ maxWidth: 360 }}>
        {notifications.map(notif => (
          <div
            key={notif.id}
            className="pointer-events-auto rounded-xl p-3 flex items-start gap-3 shadow-2xl animate-slide-in-right cursor-pointer"
            style={{
              background: 'var(--color-bg-card)',
              border: '1px solid var(--color-border-subtle)',
              backdropFilter: 'blur(12px)',
            }}
            onClick={() => {
              window.location.href = '/chat'
              dismiss(notif.id)
            }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(201, 168, 76, 0.15)' }}
            >
              <MessageCircle size={16} style={{ color: 'var(--color-accent-gold)' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                {notif.senderName}
              </p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {notif.content}
              </p>
            </div>
            <button
              onClick={e => { e.stopPropagation(); dismiss(notif.id) }}
              className="flex-shrink-0 cursor-pointer"
              style={{ color: 'var(--color-text-muted)' }}
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
