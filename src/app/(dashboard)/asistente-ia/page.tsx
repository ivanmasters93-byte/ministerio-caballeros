'use client'
import { useEffect, useState, useRef, useCallback } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChatBubble } from '@/components/ia/ChatBubble'
import { Send, Bot, Loader } from 'lucide-react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: Date
}

const suggestedQuestions = [
  '¿Qué eventos hay esta semana?',
  '¿Quién requiere seguimiento?',
  '¿Cuántos hermanos activos hay?',
  '¿Cuál es la próxima reunión?',
]

export default function AsistenteIAPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = useCallback(async (text?: string) => {
    const messageText = text || input
    if (!messageText.trim() || loading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: messageText,
      isUser: true,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setSessionStarted(true)

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageText }),
      })

      if (res.ok) {
        const data = await res.json()
        const aiMessage: Message = {
          id: crypto.randomUUID(),
          content: data.response,
          isUser: false,
          timestamp: new Date(),
        }
        setMessages(prev => [...prev, aiMessage])
      }
    } catch (error) {
      console.error('Error sending message:', error)
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: 'Lo siento, hubo un error procesando tu mensaje. Intenta de nuevo.',
        isUser: false,
        timestamp: new Date(),
      }
      setMessages(prev => [...prev, errorMessage])
    }

    setLoading(false)
  }, [input, loading])

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col space-y-4">
      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4">
          {!sessionStarted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-8">
              <div className="w-16 h-16 rounded-full bg-blue-950 flex items-center justify-center mb-4">
                <Bot size={32} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Asistente de IA</h3>
              <p className="text-gray-600 text-sm max-w-sm mb-6">
                Bienvenido al asistente inteligente de GEDEONES. Puedo ayudarte a gestionar hermanos, eventos, redes y más.
              </p>

              <div className="w-full max-w-sm space-y-2">
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Preguntas sugeridas:</p>
                {suggestedQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left px-3 py-2 rounded-lg bg-gray-50 hover:bg-gray-100 text-sm text-gray-700 transition-colors text-balance"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map(msg => (
                <ChatBubble
                  key={msg.id}
                  message={msg.content}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                />
              ))}
              {loading && (
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0">
                    <Loader size={16} className="text-white animate-spin" />
                  </div>
                  <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-800 rounded-tl-sm">
                    <p className="text-sm">Procesando tu pregunta...</p>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Input Area */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Escribe tu pregunta..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSendMessage()
              }
            }}
            disabled={loading}
            className="pr-12"
          />
        </div>
        <Button
          onClick={() => handleSendMessage()}
          disabled={loading || !input.trim()}
          size="sm"
          className="px-3"
        >
          <Send size={16} />
        </Button>
      </div>
    </div>
  )
}
