import { promises as fs } from 'fs'
import path from 'path'

export interface Item {
  id: number
  name: string
  quantity: number
}

export interface UploadedImage {
  id: number
  file_name: string
  storage_path: string
  public_url: string
  content_type: string
  size_bytes: number
  detection_count: number
  created_at: string
}

interface Database {
  items: Item[]
  uploaded_images: UploadedImage[]
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')

async function readDB(): Promise<Database> {
  try {
    const data = await fs.readFile(DB_PATH, 'utf8')
    return JSON.parse(data) as Database
  } catch (err) {
    return { items: [], uploaded_images: [] }
  }
}

async function writeDB(db: Database) {
  await fs.mkdir(path.dirname(DB_PATH), { recursive: true })
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2))
}

export async function getItems(): Promise<Item[]> {
  const db = await readDB()
  return db.items
}

export async function setItems(items: Item[]): Promise<void> {
  const db = await readDB()
  db.items = items
  await writeDB(db)
}

export async function getUploadedImages(): Promise<UploadedImage[]> {
  const db = await readDB()
  return db.uploaded_images
}

export async function setUploadedImages(images: UploadedImage[]): Promise<void> {
  const db = await readDB()
  db.uploaded_images = images
  await writeDB(db)
}

export async function upsertItem(name: string, quantity: number) {
  const items = await getItems()
  let item = items.find(i => i.name.toLowerCase() === name.toLowerCase())
  if (item) {
    item.quantity = item.quantity + quantity
  } else {
    item = { id: Date.now(), name, quantity }
    items.push(item)
  }
  await setItems(items)
  return item
}

export async function updateItemQuantity(id: number, delta: number) {
  const items = await getItems()
  const item = items.find(i => i.id === id)
  if (!item) return null
  item.quantity = Math.max(0, item.quantity + delta)
  await setItems(items)
  return item
}

export async function addUploadedImage(image: UploadedImage) {
  const images = await getUploadedImages()
  images.push(image)
  await setUploadedImages(images)
}

export async function updateDetectionCount(publicUrl: string, count: number) {
  const images = await getUploadedImages()
  const image = images.find(img => img.public_url === publicUrl)
  if (image) {
    image.detection_count = count
    await setUploadedImages(images)
  }
}
