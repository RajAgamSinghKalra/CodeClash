import { NextRequest, NextResponse } from 'next/server'
import { updateDetectionCount } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { publicUrl, count } = await req.json()
  if (!publicUrl || typeof count !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  await updateDetectionCount(publicUrl, count)

  return NextResponse.json({ success: true })
}
