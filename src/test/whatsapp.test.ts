import { describe, it, expect, beforeEach } from 'vitest'
import { MockWhatsAppAdapter } from '@/lib/whatsapp/mock'
import { resetAdapter } from '@/lib/whatsapp/adapter'

describe('MockWhatsAppAdapter', () => {
  let adapter: MockWhatsAppAdapter

  beforeEach(() => {
    adapter = new MockWhatsAppAdapter()
    resetAdapter()
  })

  // ===== sendMessage =====
  it('sends text message successfully', async () => {
    const result = await adapter.sendMessage({
      to: '+5071234567',
      body: 'Hola hermano',
      type: 'text',
    })
    expect(result.success).toBe(true)
    expect(result.messageId).toBeTruthy()
  })

  it('records sent messages in log', async () => {
    await adapter.sendMessage({
      to: '+5071234567',
      body: 'Test message',
      type: 'text',
    })
    const log = adapter.getMessageLog()
    expect(log).toHaveLength(1)
    expect(log[0].body).toBe('Test message')
    expect(log[0].direction).toBe('outgoing')
  })

  it('assigns unique message IDs', async () => {
    const r1 = await adapter.sendMessage({ to: '+507', body: 'msg1', type: 'text' })
    const r2 = await adapter.sendMessage({ to: '+507', body: 'msg2', type: 'text' })
    expect(r1.messageId).not.toBe(r2.messageId)
  })

  // ===== sendTemplate =====
  it('sends template message successfully', async () => {
    const result = await adapter.sendTemplate('+5071234567', {
      name: 'bienvenida',
      language: { code: 'es_ES' },
    })
    expect(result.success).toBe(true)
    expect(result.messageId).toBeTruthy()
  })

  it('includes template name in message body', async () => {
    await adapter.sendTemplate('+507', { name: 'recordatorio' })
    const log = adapter.getMessageLog()
    expect(log[0].body).toContain('recordatorio')
  })

  // ===== sendInteractiveMessage =====
  it('sends button interactive message', async () => {
    const result = await adapter.sendInteractiveMessage('+507', {
      type: 'button',
      body: '¿Asistirás al culto?',
      action: {
        buttons: [
          { type: 'reply', reply: { id: 'yes', title: 'Sí' } },
          { type: 'reply', reply: { id: 'no', title: 'No' } },
        ],
      },
    })
    expect(result.success).toBe(true)
  })

  it('sends list interactive message', async () => {
    const result = await adapter.sendInteractiveMessage('+507', {
      type: 'list',
      body: 'Selecciona tu red:',
      action: {
        sections: [
          {
            title: 'Redes',
            rows: [
              { id: 'menor', title: 'Red Menor' },
              { id: 'media', title: 'Red Media' },
              { id: 'mayor', title: 'Red Mayor' },
            ],
          },
        ],
      },
    })
    expect(result.success).toBe(true)
  })

  // ===== getStatus =====
  it('returns mock status', () => {
    const status = adapter.getStatus()
    expect(status.connected).toBe(false)
    expect(status.provider).toBe('mock')
  })

  // ===== Conversation tracking =====
  it('tracks conversations by phone number', async () => {
    await adapter.sendMessage({ to: '+507A', body: 'Msg 1', type: 'text' })
    await adapter.sendMessage({ to: '+507B', body: 'Msg 2', type: 'text' })

    const convA = adapter.getConversation('+507A')
    const convB = adapter.getConversation('+507B')

    expect(convA).toBeTruthy()
    expect(convB).toBeTruthy()
    expect(convA!.messageCount).toBe(1)
    expect(convB!.messageCount).toBe(1)
  })

  it('increments message count per conversation', async () => {
    await adapter.sendMessage({ to: '+507A', body: 'Msg 1', type: 'text' })
    await adapter.sendMessage({ to: '+507A', body: 'Msg 2', type: 'text' })
    await adapter.sendMessage({ to: '+507A', body: 'Msg 3', type: 'text' })

    const conv = adapter.getConversation('+507A')
    expect(conv!.messageCount).toBe(3)
  })

  // ===== Incoming message simulation =====
  it('adds incoming message', () => {
    const msg = adapter.addIncomingMessage('+507', 'Hola, necesito info')
    expect(msg.direction).toBe('incoming')
    expect(msg.body).toBe('Hola, necesito info')
  })

  it('returns conversation messages filtered by phone', async () => {
    await adapter.sendMessage({ to: '+507A', body: 'Out A', type: 'text' })
    adapter.addIncomingMessage('+507A', 'In A')
    await adapter.sendMessage({ to: '+507B', body: 'Out B', type: 'text' })

    const msgsA = adapter.getConversationMessages('+507A')
    expect(msgsA).toHaveLength(2)
    expect(msgsA[0].body).toBe('Out A')
    expect(msgsA[1].body).toBe('In A')
  })

  // ===== Reset =====
  it('clears all data on reset', async () => {
    await adapter.sendMessage({ to: '+507', body: 'Test', type: 'text' })
    adapter.reset()
    expect(adapter.getMessageLog()).toHaveLength(0)
  })

  it('clears specific conversation', async () => {
    await adapter.sendMessage({ to: '+507A', body: 'Msg', type: 'text' })
    await adapter.sendMessage({ to: '+507B', body: 'Msg', type: 'text' })
    adapter.clearConversation('+507A')

    expect(adapter.getConversation('+507A')).toBeUndefined()
    expect(adapter.getConversation('+507B')).toBeTruthy()
  })

  // ===== Recent messages =====
  it('returns recent messages with limit', async () => {
    for (let i = 0; i < 15; i++) {
      await adapter.sendMessage({ to: '+507', body: `Msg ${i}`, type: 'text' })
    }
    const recent = adapter.getRecentMessages(5)
    expect(recent).toHaveLength(5)
  })

  // ===== All conversations =====
  it('returns all conversations', async () => {
    await adapter.sendMessage({ to: '+507A', body: 'A', type: 'text' })
    await adapter.sendMessage({ to: '+507B', body: 'B', type: 'text' })
    // +1234567890 is pre-initialized in mock

    const all = adapter.getAllConversations()
    expect(all.length).toBeGreaterThanOrEqual(2)
  })
})
