import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import type { Dispatch, MutableRefObject } from 'react'
import {
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type {
  SubHeadingsDragState,
  SubheadingsBoardAction,
  SubheadingsBoardState,
} from '../types'
import { parseCellId, findItemPosition } from '../utils/position-calculator'
import {
  computeInsertIndexFromPointer,
  getPointerClientYFromDragEvent,
  isSameGroupManualSortNoOp,
} from '../utils/insert-index-from-pointer'

export interface DragEndResult {
  itemId: string | number
  targetGroupKey: string
  dragSource: { itemId: string | number; groupKey: string; rowIndex: number } | null
}

export interface UseSubHeadingsDndReturn {
  sensors: ReturnType<typeof useSensors>
  dragState: SubHeadingsDragState
  handleDragStart: (event: DragStartEvent) => void
  handleDragOver: (event: DragOverEvent) => void
  handleDragEnd: (event: DragEndEvent) => DragEndResult | null
  handleDragCancel: () => void
}

export interface UseSubHeadingsDndConfig<T = unknown> {
  manualSorting: boolean
  dispatch?: Dispatch<SubheadingsBoardAction>
  groupedData?: Record<string, T[]>
  idKey?: string
  boardState?: SubheadingsBoardState<T>
  pointerCoordinatesRef?: MutableRefObject<{ x: number; y: number } | null>
}

function useSensorsInternal() {
  return useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  )
}

export function useSubHeadingsDnd<T = unknown>(
  config: UseSubHeadingsDndConfig<T> = { manualSorting: false }
): UseSubHeadingsDndReturn {
  const {
    manualSorting,
    dispatch,
    groupedData,
    idKey = 'id',
    boardState,
    pointerCoordinatesRef,
  } = config

  const sensors = useSensorsInternal()

  const [legacyDragState, setLegacyDragState] = useState<SubHeadingsDragState>({
    activeId: null,
    dragSource: null,
    overId: null,
  })

  const legacySourceRef = useRef<SubHeadingsDragState['dragSource']>(null)

  useEffect(() => {
    legacySourceRef.current = legacyDragState.dragSource
  }, [legacyDragState.dragSource])

  const handleDragStartLegacy = useCallback((event: DragStartEvent) => {
    const { active } = event
    const itemId = active.id as string | number
    const dragSource = active.data.current as {
      groupKey: string
      rowIndex: number
    } | null

    if (!dragSource) {
      console.error('Subheadings DnD: missing drag source on active item')
      return
    }

    const next: SubHeadingsDragState = {
      activeId: String(itemId),
      dragSource: { itemId, groupKey: dragSource.groupKey, rowIndex: dragSource.rowIndex },
      overId: null,
    }
    legacySourceRef.current = next.dragSource
    setLegacyDragState(next)
  }, [])

  const handleDragOverLegacy = useCallback((event: DragOverEvent) => {
    const { over } = event
    if (!over) {
      setLegacyDragState((prev) => ({ ...prev, overId: null }))
      return
    }
    setLegacyDragState((prev) => ({
      ...prev,
      overId: String(over.id),
    }))
  }, [])

  const handleDragEndLegacy = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    const prevSource = legacySourceRef.current

    setLegacyDragState({
      activeId: null,
      dragSource: null,
      overId: null,
    })
    legacySourceRef.current = null

    if (!over) return null

    return {
      itemId: active.id as string | number,
      targetGroupKey: String(over.id),
      dragSource: prevSource,
    }
  }, [])

  const handleDragCancelLegacy = useCallback(() => {
    setLegacyDragState({
      activeId: null,
      dragSource: null,
      overId: null,
    })
    legacySourceRef.current = null
  }, [])

  const handleDragStartManual = useCallback(
    (event: DragStartEvent) => {
      if (!dispatch || !groupedData) return
      const itemId = String(event.active.id)
      const position = findItemPosition(itemId, groupedData, idKey)
      if (!position) return

      dispatch({
        type: 'DRAG_START',
        payload: {
          itemId,
          groupKey: position.groupKey,
          rowIndex: position.rowIndex,
        },
      })
    },
    [dispatch, groupedData, idKey]
  )

  const handleDragOverManual = useCallback(
    (event: DragOverEvent) => {
      if (!dispatch || !groupedData) return

      if (!event.over) {
        dispatch({ type: 'CLEAR_VIRTUAL_PLACEHOLDER' })
        return
      }

      const pos = parseCellId(String(event.over.id))
      if (!pos) {
        dispatch({ type: 'CLEAR_VIRTUAL_PLACEHOLDER' })
        return
      }

      const src = boardState?.dragSource
      if (
        src &&
        pos.groupKey === src.groupKey &&
        pos.rowIndex === src.rowIndex
      ) {
        dispatch({ type: 'CLEAR_VIRTUAL_PLACEHOLDER' })
        return
      }

      const groupLength = groupedData[pos.groupKey]?.length ?? 0
      const pointerYFromCollision = pointerCoordinatesRef?.current?.y ?? null
      const pointerYLegacy = getPointerClientYFromDragEvent(event)
      const pointerY = pointerYFromCollision ?? pointerYLegacy
      const overRect = event.over.rect
      const insertIndex = computeInsertIndexFromPointer({
        overRect,
        pointerClientY: pointerY,
        cellRowIndex: pos.rowIndex,
        groupLength,
      })

      if (
        src &&
        isSameGroupManualSortNoOp(
          groupedData,
          idKey,
          src.groupKey,
          src.rowIndex,
          pos.groupKey,
          insertIndex
        )
      ) {
        dispatch({ type: 'CLEAR_VIRTUAL_PLACEHOLDER' })
        return
      }

      dispatch({
        type: 'DRAG_OVER',
        payload: { groupKey: pos.groupKey, insertIndex },
      })
    },
    [dispatch, groupedData, boardState?.dragSource, idKey, pointerCoordinatesRef]
  )

  const handleDragEndManual = useCallback(
    (event: DragEndEvent) => {
      if (!dispatch || !groupedData) return null
      const itemId = String(event.active.id)
      if (!event.over) {
        dispatch({ type: 'DRAG_CANCEL' })
        return null
      }

      const target = parseCellId(String(event.over.id))
      if (!target) {
        dispatch({ type: 'DRAG_CANCEL' })
        return null
      }

      const groupLength = groupedData[target.groupKey]?.length ?? 0
      const pointerY =
        pointerCoordinatesRef?.current?.y ??
        getPointerClientYFromDragEvent(event)
      const targetInsertIndex = computeInsertIndexFromPointer({
        overRect: event.over.rect,
        pointerClientY: pointerY,
        cellRowIndex: target.rowIndex,
        groupLength,
      })

      const dragSrc = boardState?.dragSource
      if (
        dragSrc &&
        isSameGroupManualSortNoOp(
          groupedData,
          idKey,
          dragSrc.groupKey,
          dragSrc.rowIndex,
          target.groupKey,
          targetInsertIndex
        )
      ) {
        dispatch({ type: 'DRAG_CANCEL' })
        return null
      }

      dispatch({
        type: 'DRAG_END',
        payload: {
          itemId,
          targetGroup: target.groupKey,
          targetInsertIndex,
          manualSorting: true,
        },
      })
      return null
    },
    [dispatch, groupedData, idKey, pointerCoordinatesRef, boardState?.dragSource]
  )

  const handleDragCancelManual = useCallback(() => {
    dispatch?.({ type: 'DRAG_CANCEL' })
  }, [dispatch])

  const manualDragState = useMemo((): SubHeadingsDragState => {
    if (!boardState) {
      return { activeId: null, dragSource: null, overId: null }
    }
    return {
      activeId: boardState.activeId,
      dragSource: boardState.dragSource,
      overId:
        boardState.virtualPlaceholder != null
          ? `${boardState.virtualPlaceholder.groupKey}::#${boardState.virtualPlaceholder.insertIndex}`
          : null,
    }
  }, [boardState])

  if (!manualSorting) {
    return {
      sensors,
      dragState: legacyDragState,
      handleDragStart: handleDragStartLegacy,
      handleDragOver: handleDragOverLegacy,
      handleDragEnd: handleDragEndLegacy,
      handleDragCancel: handleDragCancelLegacy,
    }
  }

  return {
    sensors,
    dragState: manualDragState,
    handleDragStart: handleDragStartManual,
    handleDragOver: handleDragOverManual,
    handleDragEnd: handleDragEndManual,
    handleDragCancel: handleDragCancelManual,
  }
}
