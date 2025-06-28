import { NextRequest, NextResponse } from 'next/server'
import { getItems, upsertItem } from '@/lib/db'

export async function POST(req: NextRequest) {
  const { detections } = await req.json()
  if (!detections || !Array.isArray(detections)) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
  }

  const classToItemMap: Record<string, string> = {
    FireExtinguisher: 'Fire Extinguisher',
    ToolBox: 'Toolbox',
    OxygenTank: 'Oxygen Tank',
  }

  const detectedItems: Record<string, number> = {}
  for (const d of detections) {
    const itemName = classToItemMap[d.class_name] || d.class_name
    detectedItems[itemName] = (detectedItems[itemName] || 0) + 1
  }

  const currentItems = await getItems()

  for (const [itemName, count] of Object.entries(detectedItems)) {
    let existing = currentItems?.find((i: any) => i.name === itemName)
    if (!existing) {
      existing = currentItems?.find(
        (i: any) => i.name.toLowerCase() === itemName.toLowerCase()
      )
    }

    if (existing) {
      await upsertItem(existing.name, count)
    } else {
      await upsertItem(itemName, count)
    }
  }

  return NextResponse.json({ success: true })
}
