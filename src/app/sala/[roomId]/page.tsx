'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import { Video, Mic, MicOff, Camera, CameraOff, ArrowRight, Wifi, Shield } from 'lucide-react'
import Image from 'next/image'
import { Logo } from '@/components/ui/logo'
import { buildJitsiEmbedUrl } from '@/lib/jitsi/config'

export default function SalaPublica() {
  const { roomId } = useParams()
  const [nombre, setNombre] = useState('')
  const [micMuted, setMicMuted] = useState(true)
  const [camOn, setCamOn] = useState(true)

  const room = typeof roomId === 'string' ? roomId : ''

  const joinMeeting = () => {
    if (!nombre.trim()) return
    const url = buildJitsiEmbedUrl(room, {
      displayName: nombre.trim(),
    })
    // Open directly — works perfectly on mobile and desktop
    window.location.href = url
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white flex items-center justify-center p-4">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/[0.02] rounded-full blur-[150px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Logo hero */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <div
              style={{
                borderRadius: 20,
                padding: 3,
                background: 'linear-gradient(135deg, rgba(201,168,76,0.4), rgba(201,168,76,0.08))',
              }}
            >
              <Logo size="xl" animated />
            </div>
          </div>
          <div>
            <h1
              className="text-2xl font-bold tracking-widest gold-text"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              GEDEONES GP
            </h1>
            <p className="text-white/25 text-[10px] tracking-[0.3em] uppercase mt-1">Reunion en Vivo</p>
          </div>
        </div>

        {/* Main card */}
        <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          {/* Preview */}
          <div className="aspect-[16/10] bg-[#0d1117] flex items-center justify-center relative">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center ${camOn ? 'bg-white/[0.08]' : 'bg-red-500/10'}`}>
              {camOn ? <Camera size={24} className="text-white/30" /> : <CameraOff size={24} className="text-red-400/50" />}
            </div>
            {nombre && (
              <p className="absolute bottom-2.5 left-3 text-[11px] text-white/25 bg-black/30 px-2 py-0.5 rounded">{nombre}</p>
            )}
          </div>

          <div className="p-5 space-y-4">
            {/* Name */}
            <input
              type="text"
              value={nombre}
              onChange={e => setNombre(e.target.value)}
              placeholder="Tu nombre"
              className="w-full bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/15 focus:outline-none focus:border-white/15 transition-all"
              autoFocus
              onKeyDown={e => { if (e.key === 'Enter') joinMeeting() }}
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setMicMuted(!micMuted)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  micMuted ? 'bg-red-500/15 text-red-400/80' : 'bg-white/[0.06] text-white/50'
                }`}
              >
                {micMuted ? <MicOff size={18} /> : <Mic size={18} />}
              </button>
              <button
                onClick={() => setCamOn(!camOn)}
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                  !camOn ? 'bg-red-500/15 text-red-400/80' : 'bg-white/[0.06] text-white/50'
                }`}
              >
                {camOn ? <Camera size={18} /> : <CameraOff size={18} />}
              </button>
            </div>

            {/* Join */}
            <button
              onClick={joinMeeting}
              disabled={!nombre.trim()}
              className={`w-full py-3.5 rounded-xl text-sm font-medium tracking-wide transition-all flex items-center justify-center gap-2 ${
                nombre.trim()
                  ? 'bg-gradient-to-r from-green-600/90 to-green-500/80 text-white hover:from-green-500 hover:to-green-400 shadow-lg shadow-green-900/20'
                  : 'bg-white/[0.03] text-white/15 cursor-not-allowed'
              }`}
            >
              <Video size={16} />
              Unirme a la reunion
              {nombre.trim() && <ArrowRight size={14} className="opacity-40" />}
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="flex items-center justify-center gap-6 text-white/15">
          <div className="flex items-center gap-1.5 text-[10px]">
            <Wifi size={10} /> HD
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <Shield size={10} /> Seguro
          </div>
          <div className="flex items-center gap-1.5 text-[10px]">
            <Mic size={10} /> Anti-ruido
          </div>
        </div>
      </div>
    </div>
  )
}
