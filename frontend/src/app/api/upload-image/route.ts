import { NextResponse, NextRequest } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'
import { addUploadedImage, UploadedImage } from '@/lib/db'

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File | null;
  if (!file) {
    return NextResponse.json({ error: 'No file provided' }, { status: 400 });
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`
  const uploadDir = path.join(process.cwd(), 'public', 'uploads')
  await fs.mkdir(uploadDir, { recursive: true })
  const filePath = path.join(uploadDir, fileName)

  const buffer = Buffer.from(await file.arrayBuffer())
  await fs.writeFile(filePath, buffer)

  const publicUrl = `/uploads/${fileName}`

  const record: UploadedImage = {
    id: Date.now(),
    file_name: file.name,
    storage_path: filePath,
    public_url: publicUrl,
    content_type: file.type,
    size_bytes: file.size,
    detection_count: 0,
    created_at: new Date().toISOString()
  }

  await addUploadedImage(record)

  return NextResponse.json({ publicUrl })
}
