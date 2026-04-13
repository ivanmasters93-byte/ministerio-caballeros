import { handlers } from '@/lib/auth'
import { NextRequest } from 'next/server'

const { GET: authGET, POST: authPOST } = handlers as {
  GET: (req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) => Promise<Response>
  POST: (req: NextRequest, ctx: { params: Promise<{ nextauth: string[] }> }) => Promise<Response>
}

export const GET = authGET
export const POST = authPOST
