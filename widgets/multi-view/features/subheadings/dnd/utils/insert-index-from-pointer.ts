/**
 * Insert index from pointer position over a row droppable
 */

export function getPointerClientYFromDragEvent(event: {
  activatorEvent: Event
  delta: { x: number; y: number }
}): number | null {
  const ae = event.activatorEvent
  if (typeof PointerEvent !== 'undefined' && ae instanceof PointerEvent) {
    return ae.clientY + event.delta.y
  }
  if (typeof MouseEvent !== 'undefined' && ae instanceof MouseEvent) {
    return ae.clientY + event.delta.y
  }
  if (typeof TouchEvent !== 'undefined' && ae instanceof TouchEvent && ae.touches[0]) {
    return ae.touches[0].clientY + event.delta.y
  }
  return null
}

export interface ComputeInsertIndexArgs {
  overRect: { top: number; height: number }
  pointerClientY: number | null
  cellRowIndex: number
  groupLength: number
}

export function computeInsertIndexFromPointer({
  overRect,
  pointerClientY,
  cellRowIndex,
  groupLength,
}: ComputeInsertIndexArgs): number {
  const isAppendSlot = cellRowIndex === groupLength && groupLength > 0
  const isEmptyGroupSlot = groupLength === 0 && cellRowIndex === 0

  if (isEmptyGroupSlot) {
    return 0
  }
  if (isAppendSlot) {
    return groupLength
  }

  const midY = overRect.top + overRect.height / 2
  const y = pointerClientY ?? overRect.top + overRect.height * 0.75
  return y < midY ? cellRowIndex : cellRowIndex + 1
}

export function adjustInsertIndexAfterSameGroupRemoval(
  rawInsert: number,
  sourceRow: number
): number {
  if (sourceRow < rawInsert) {
    return rawInsert - 1
  }
  return rawInsert
}

export function isSameGroupManualSortNoOp<T>(
  groupedData: Record<string, T[]>,
  idKey: string,
  sourceGroup: string,
  sourceRow: number,
  targetGroup: string,
  rawInsertIndex: number
): boolean {
  if (sourceGroup !== targetGroup) return false

  const items = groupedData[sourceGroup]
  if (!items || sourceRow < 0 || sourceRow >= items.length) return false

  const getId = (item: T) =>
    String((item as Record<string, unknown>)[idKey] ?? '')

  const idsBefore = items.map(getId)

  const working = [...items]
  const dragged = working.splice(sourceRow, 1)[0]
  if (dragged === undefined) return false

  let insertIndex = adjustInsertIndexAfterSameGroupRemoval(
    rawInsertIndex,
    sourceRow
  )
  insertIndex = Math.max(0, Math.min(insertIndex, working.length))
  working.splice(insertIndex, 0, dragged)

  const idsAfter = working.map(getId)
  if (idsBefore.length !== idsAfter.length) return false
  return idsBefore.every((id, i) => id === idsAfter[i])
}
