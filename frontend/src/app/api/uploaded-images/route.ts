import { NextResponse } from 'next/server'
import { getUploadedImages } from '@/lib/db'

export async function GET() {
  const images = await getUploadedImages()
  return NextResponse.json(images)
}
