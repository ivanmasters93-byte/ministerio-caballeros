'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import {
  MessageCircle, Send, Users, User, Search,
  Plus, ArrowLeft,
} from 'lucide-react'

interface ChatRoom {
  id: string
  nombre: string | null
  tipo: 'GRUPO' | 'PRIVADO'
  descripcion: string | null
  lastMessage?: { content: string; createdAt: string; sender: { name: string } }
  unreadCount: number
  miembros: Array<{ user: { id: string; name: string } }>
}

interface ChatMessage {
  id: string
  content: string
  tipo: string
  createdAt: string
  sender: { id: string; name: string }
}

interface Hermano {
  id: string
  userId: string
  user: { id: string; name: string }
}

export default function ChatPage() {
  const { data: session } = useSession()
  const currentUserId = session?.user?.id

  const [rooms, setRooms] = useState<ChatRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(true)
  const [sendingMsg, setSendingMsg] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [showNewChat, setShowNewChat] = useState(false)
  const [hermanos, setHermanos] = useState<Hermano[]>([])
  const [mobileShowChat, setMobileShowChat] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<NodeJS.Timeout | null>(null)

  const loadRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/rooms')
      if (res.ok) {
        const data = await res.json()
        setRooms(data)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [])

  const loadMessages = useCallback(async (roomId: string) => {
    try {
      const res = await fetch(`/api/chat/rooms/${roomId}/messages`)
      if (res.ok) {
        const data = await res.json()
        setMessages(data)
        fetch(`/api/chat/rooms/${roomId}/read`, { method: 'POST' }).catch(() => {})
      }
    } catch { /* ignore */ }
  }, [])

  useEffect(() => { loadRooms() }, [loadRooms])

  useEffect(() => {
    if (activeRoom) {
      loadMessages(activeRoom.id)
      pollRef.current = setInterval(() => {
        loadMessages(activeRoom.id)
        loadRooms()
      }, 3000)
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [activeRoom, loadMessages, loadRooms])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectRoom = (room: ChatRoom) => {
    setActiveRoom(room)
    setMobileShowChat(true)
  }

  const handleBack = () => {
    setMobileShowChat(false)
    setActiveRoom(null)
    if (pollRef.current) clearInterval(pollRef.current)
  }

  const handleSend = async () => {
    if (!input.trim() || !activeRoom || sendingMsg) return
    setSendingMsg(true)
    const text = input
    setInput('')

    const optimistic: ChatMessage = {
      id: 'temp-' + Date.now(),
      content: text,
      tipo: 'texto',
      createdAt: new Date().toISOString(),
      sender: { id: currentUserId || '', name: session?.user?.name || '' },
    }
    setMessages(prev => [...prev, optimistic])

    try {
      await fetch(`/api/chat/rooms/${activeRoom.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: text }),
      })
      await loadMessages(activeRoom.id)
    } catch { /* ignore */ }
    setSendingMsg(false)
  }

  const startPrivateChat = async (targetUserId: string) => {
    try {
      const res = await fetch('/api/chat/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'PRIVADO', targetUserId }),
      })
      if (res.ok) {
        const room = await res.json()
        setShowNewChat(false)
        await loadRooms()
        setActiveRoom(room)
        setMobileShowChat(true)
      }
    } catch { /* ignore */ }
  }

  const loadHermanos = async () => {
    try {
      const res = await fetch('/api/hermanos?limit=200')
      const data = await res.json()
      const list = Array.isArray(data) ? data : (data?.data ?? [])
      setHermanos(list)
    } catch { /* ignore */ }
  }

  const handleNewChat = () => {
    if (hermanos.length === 0) loadHermanos()
    setShowNewChat(true)
  }

  const getRoomDisplayName = (room: ChatRoom) => {
    if (room.tipo === 'GRUPO') return room.nombre || 'Chat Grupal'
    const other = room.miembros?.find(m => m.user.id !== currentUserId)
    return other?.user.name || 'Chat Privado'
  }

  const filteredRooms = rooms.filter(r => {
    if (!searchTerm) return true
    return getRoomDisplayName(r).toLowerCase().includes(searchTerm.toLowerCase())
  })

  const filteredHermanos = hermanos.filter(h => {
    if (!searchTerm) return true
    return h.user?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  })

  return (
    <div
      className="h-[calc(100vh-140px)] flex rounded-2xl overflow-hidden"
      style={{ background: 'var(--color-bg-card)', border: '1px solid var(--color-border-subtle)' }}
    >
      {/* ===== LEFT PANEL: Room List ===== */}
      <div
        className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col ${mobileShowChat ? 'hidden md:flex' : 'flex'}`}
        style={{ borderRight: '1px solid var(--color-border-subtle)' }}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-4" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
          <div className="flex items-center justify-between mb-3">
            <h2
              className="text-lg font-bold"
              style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-display)' }}
            >
              Chat
            </h2>
            <button
              onClick={handleNewChat}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer"
              style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-accent-gold)' }}
              title="Nuevo chat"
            >
              <Plus size={18} />
            </button>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="Buscar conversacion..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-3 text-sm rounded-xl outline-none transition-all"
              style={{
                background: 'var(--color-bg-elevated)',
                border: '1px solid var(--color-border-subtle)',
                color: 'var(--color-text-primary)',
              }}
            />
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto">
          {showNewChat ? (
            <div className="p-3">
              <div className="flex items-center gap-2 mb-3">
                <button onClick={() => setShowNewChat(false)} className="cursor-pointer" style={{ color: 'var(--color-text-muted)' }}>
                  <ArrowLeft size={18} />
                </button>
                <span className="text-sm font-medium" style={{ color: 'var(--color-text-secondary)' }}>Nuevo chat privado</span>
              </div>
              {filteredHermanos.map(h => (
                <button
                  key={h.id}
                  onClick={() => startPrivateChat(h.userId)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all cursor-pointer mb-1"
                  style={{ color: 'var(--color-text-primary)' }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--color-bg-elevated)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--color-bg-elevated)' }}>
                    <User size={18} style={{ color: 'var(--color-text-muted)' }} />
                  </div>
                  <span className="text-sm font-medium truncate">{h.user?.name}</span>
                </button>
              ))}
            </div>
          ) : loading ? (
            <div className="p-4 space-y-3">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-16 rounded-xl animate-pulse" style={{ background: 'var(--color-bg-elevated)' }} />
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="text-center py-12" style={{ color: 'var(--color-text-muted)' }}>
              <MessageCircle size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">No hay conversaciones</p>
              <p className="text-xs mt-1">Inicia un chat con el boton +</p>
            </div>
          ) : (
            <div className="p-2">
              {filteredRooms.map(room => {
                const isActive = activeRoom?.id === room.id
                return (
                  <button
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 cursor-pointer mb-0.5"
                    style={{
                      background: isActive ? 'var(--color-bg-elevated)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--color-accent-gold)' : '3px solid transparent',
                    }}
                    onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                    onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{
                        background: room.tipo === 'GRUPO'
                          ? 'linear-gradient(135deg, var(--color-accent-gold), rgba(201, 168, 76, 0.4))'
                          : 'var(--color-bg-elevated)',
                      }}
                    >
                      {room.tipo === 'GRUPO'
                        ? <Users size={18} style={{ color: 'var(--color-bg-base)' }} />
                        : <User size={18} style={{ color: 'var(--color-text-muted)' }} />
                      }
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                          {getRoomDisplayName(room)}
                        </span>
                        {room.lastMessage && (
                          <span className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
                            {new Date(room.lastMessage.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                          {room.lastMessage
                            ? `${room.tipo === 'GRUPO' ? room.lastMessage.sender.name + ': ' : ''}${room.lastMessage.content}`
                            : 'Sin mensajes'}
                        </p>
                        {room.unreadCount > 0 && (
                          <span
                            className="min-w-[20px] h-5 flex items-center justify-center rounded-full text-[10px] font-bold px-1.5 flex-shrink-0"
                            style={{ background: 'var(--color-accent-gold)', color: 'var(--color-bg-base)' }}
                          >
                            {room.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ===== RIGHT PANEL: Messages ===== */}
      <div className={`flex-1 flex flex-col ${!mobileShowChat && !activeRoom ? 'hidden md:flex' : 'flex'}`}>
        {activeRoom ? (
          <>
            {/* Chat Header */}
            <div className="flex-shrink-0 flex items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--color-border-subtle)' }}>
              <button
                onClick={handleBack}
                className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl cursor-pointer"
                style={{ background: 'var(--color-bg-elevated)', color: 'var(--color-text-secondary)' }}
              >
                <ArrowLeft size={18} />
              </button>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: activeRoom.tipo === 'GRUPO'
                    ? 'linear-gradient(135deg, var(--color-accent-gold), rgba(201, 168, 76, 0.4))'
                    : 'var(--color-bg-elevated)',
                }}
              >
                {activeRoom.tipo === 'GRUPO'
                  ? <Users size={18} style={{ color: 'var(--color-bg-base)' }} />
                  : <User size={18} style={{ color: 'var(--color-text-muted)' }} />
                }
              </div>
              <div>
                <p className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  {getRoomDisplayName(activeRoom)}
                </p>
                <p className="text-[11px]" style={{ color: 'var(--color-text-muted)' }}>
                  {activeRoom.tipo === 'GRUPO'
                    ? `${activeRoom.miembros?.length || 0} miembros`
                    : 'Chat privado'}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {messages.length === 0 ? (
                <div className="h-full flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
                  <div className="text-center">
                    <MessageCircle size={48} className="mx-auto mb-3 opacity-20" />
                    <p className="text-sm">Inicia la conversacion</p>
                  </div>
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isMine = msg.sender.id === currentUserId
                  const showName = !isMine && activeRoom.tipo === 'GRUPO'
                  const prevMsg = i > 0 ? messages[i - 1] : null
                  const sameAsPrev = prevMsg && prevMsg.sender.id === msg.sender.id

                  return (
                    <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} ${sameAsPrev ? 'mt-0.5' : 'mt-3'}`}>
                      <div className={`max-w-[75%]`}>
                        {showName && !sameAsPrev && (
                          <p className="text-[11px] font-medium mb-0.5 px-1" style={{ color: 'var(--color-accent-gold)' }}>
                            {msg.sender.name}
                          </p>
                        )}
                        <div
                          className={`px-3.5 py-2 rounded-2xl text-sm leading-relaxed ${isMine ? 'rounded-br-md' : 'rounded-bl-md'}`}
                          style={{
                            background: isMine
                              ? 'linear-gradient(135deg, var(--color-accent-gold), rgba(201, 168, 76, 0.8))'
                              : 'var(--color-bg-elevated)',
                            color: isMine ? 'var(--color-bg-base)' : 'var(--color-text-primary)',
                          }}
                        >
                          {msg.content}
                        </div>
                        <p className={`text-[10px] mt-0.5 px-1 ${isMine ? 'text-right' : 'text-left'}`} style={{ color: 'var(--color-text-muted)' }}>
                          {new Date(msg.createdAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex-shrink-0 px-4 py-3" style={{ borderTop: '1px solid var(--color-border-subtle)' }}>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escribe un mensaje..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                  className="flex-1 h-10 px-4 text-sm rounded-xl outline-none transition-all"
                  style={{
                    background: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-subtle)',
                    color: 'var(--color-text-primary)',
                  }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--color-accent-gold)' }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--color-border-subtle)' }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || sendingMsg}
                  className="w-10 h-10 flex items-center justify-center rounded-xl transition-all duration-200 cursor-pointer disabled:opacity-30"
                  style={{ background: 'var(--color-accent-gold)', color: 'var(--color-bg-base)' }}
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="h-full hidden md:flex items-center justify-center" style={{ color: 'var(--color-text-muted)' }}>
            <div className="text-center">
              <MessageCircle size={64} className="mx-auto mb-4 opacity-10" />
              <p className="text-lg font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>Selecciona una conversacion</p>
              <p className="text-sm">Elige un chat de la lista o inicia uno nuevo</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
