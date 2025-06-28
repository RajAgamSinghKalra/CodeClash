import { NextRequest, NextResponse } from 'next/server'
import { getItems, updateItemQuantity, upsertItem } from '@/lib/db'

const DEFAULT_ITEMS = [
  { name: 'Fire Extinguisher', quantity: 0 },
  { name: 'Toolbox', quantity: 0 },
  { name: 'Oxygen Tank', quantity: 0 }
]

export async function GET() {
  try {
  const items = await getItems()
    
    // Check if we have all the default items, if not, initialize them
    const hasAllDefaults = DEFAULT_ITEMS.every(defaultItem => 
      items.some(item => item.name.toLowerCase() === defaultItem.name.toLowerCase())
    )
    
    if (!hasAllDefaults) {
      console.log('Initializing database with default items...')
      // Add missing default items
      for (const defaultItem of DEFAULT_ITEMS) {
        const exists = items.some(item => item.name.toLowerCase() === defaultItem.name.toLowerCase())
        if (!exists) {
          await upsertItem(defaultItem.name, defaultItem.quantity)
        }
      }
      // Fetch updated items
      const updatedItems = await getItems()
      return NextResponse.json(updatedItems)
    }
    
  return NextResponse.json(items)
  } catch (error) {
    console.error('Error in GET /api/items:', error)
    return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
  const { name, id, quantity } = await req.json()
  if (!name && typeof id !== 'number') {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }
  if (id) {
    const item = await updateItemQuantity(id, quantity)
    return NextResponse.json(item)
  } else if (name) {
    const item = await upsertItem(name, quantity)
    return NextResponse.json(item)
    }
  } catch (error) {
    console.error('Error in POST /api/items:', error)
    return NextResponse.json({ error: 'Failed to update items' }, { status: 500 })
  }
}
