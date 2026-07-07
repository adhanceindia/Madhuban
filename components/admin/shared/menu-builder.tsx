'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverlay,
  DragMoveEvent,
  DragEndEvent,
  MeasuringStrategy,
} from '@dnd-kit/core'
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2, ChevronRight, ChevronDown, Image as ImageIcon } from 'lucide-react'
import { TextInput } from './form-field'
import type { MenuItem } from '@/lib/types'
import { ImageUploader } from './image-uploader'

// -- Types & Utilities --

type FlattenedItem = MenuItem & {
  depth: number
  collapsed: boolean
}

// Convert a flat list (parentId) to a flattened tree list (with depth)
function buildFlattenedTree(items: MenuItem[], collapsedIds: string[] = []): FlattenedItem[] {
  const rootItems = items.filter((i) => !i.parentId).sort((a, b) => a.sort_order - b.sort_order)
  const flattened: FlattenedItem[] = []

  function addChildren(parentId: string | null, depth: number) {
    const children = items.filter((i) => i.parentId === parentId).sort((a, b) => a.sort_order - b.sort_order)
    for (const child of children) {
      const isCollapsed = collapsedIds.includes(child.id)
      flattened.push({ ...child, depth, collapsed: isCollapsed })
      if (!isCollapsed) {
        addChildren(child.id, depth + 1)
      }
    }
  }

  for (const root of rootItems) {
    const isCollapsed = collapsedIds.includes(root.id)
    flattened.push({ ...root, depth: 0, collapsed: isCollapsed })
    if (!isCollapsed) {
      addChildren(root.id, 1)
    }
  }

  return flattened
}

// -- Sortable Item Component --

interface SortableItemProps {
  item: FlattenedItem
  isDragging?: boolean
  isDragOverlay?: boolean
  indentationWidth: number
  onRemove: (id: string) => void
  onUpdate: (id: string, updates: Partial<MenuItem>) => void
  onToggleCollapse: (id: string) => void
  hasChildren: boolean
}

function SortableItem(props: SortableItemProps) {
  const {
    item,
    isDragging,
    isDragOverlay,
    indentationWidth,
    onRemove,
    onUpdate,
    onToggleCollapse,
    hasChildren,
  } = props

  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition: transition || undefined,
    marginLeft: `${item.depth * indentationWidth}px`,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex flex-col gap-3 rounded-lg border bg-card p-4 shadow-sm ${
        isDragging ? 'opacity-50' : ''
      } ${isDragOverlay ? 'opacity-100 shadow-xl cursor-grabbing scale-[1.02]' : ''}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
          {...attributes}
          {...listeners}
        >
          <GripVertical size={16} />
        </button>

        <button
          type="button"
          onClick={() => onToggleCollapse(item.id)}
          className={`p-1 rounded-sm hover:bg-muted transition-colors ${
            !hasChildren ? 'opacity-0 pointer-events-none' : ''
          }`}
        >
          {item.collapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
        </button>

        <div className="flex-1 grid grid-cols-2 gap-3">
          <TextInput
            value={item.label}
            onChange={(e) => onUpdate(item.id, { label: e.target.value })}
            placeholder="Menu label"
            className="text-sm font-medium h-9"
          />
          <TextInput
            value={item.href}
            onChange={(e) => onUpdate(item.id, { href: e.target.value })}
            placeholder="Link (e.g. /rooms)"
            className="text-sm h-9"
          />
        </div>

        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="text-muted-foreground hover:text-destructive p-2"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="pl-[68px] grid grid-cols-1 gap-3">
        <TextInput
          value={item.description || ''}
          onChange={(e) => onUpdate(item.id, { description: e.target.value })}
          placeholder="Description (optional, used in mega menu)"
          className="text-[13px] h-8 bg-muted/50"
        />
        {item.depth === 0 && (
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold tracking-wider flex items-center gap-1">
              <ImageIcon size={12} /> Category Image
            </span>
            <div className="w-24">
              <ImageUploader
                value={item.image ? [item.image] : []}
                onChange={(urls) => onUpdate(item.id, { image: urls[0] || '' })}
                multiple={false}
                maxImages={1}
                folder="menu"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// -- Main MenuBuilder Component --

const indentationWidth = 40

export function MenuBuilder({
  value,
  onChange,
}: {
  value: unknown
  onChange: (v: unknown) => void
}) {
  const [items, setItems] = useState<MenuItem[]>(() => {
    return (Array.isArray(value) ? value : []) as MenuItem[]
  })
  
  // Update parent when internal items state changes (debounced/effect)
  const isFirstRender = useRef(true)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    onChangeRef.current(items)
  }, [items])

  const [collapsedIds, setCollapsedIds] = useState<string[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const [offsetLeft, setOffsetLeft] = useState(0)

  const flattenedItems = useMemo(
    () => buildFlattenedTree(items, collapsedIds),
    [items, collapsedIds]
  )

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleAdd = () => {
    const newItem: MenuItem = {
      id: crypto.randomUUID(),
      label: 'New Item',
      href: '#',
      parentId: null,
      sort_order: items.length,
    }
    setItems([...items, newItem])
  }

  const handleRemove = (id: string) => {
    // recursively remove children too
    const toRemove = new Set<string>([id])
    let added = true
    while (added) {
      added = false
      for (const item of items) {
        if (item.parentId && toRemove.has(item.parentId) && !toRemove.has(item.id)) {
          toRemove.add(item.id)
          added = true
        }
      }
    }
    setItems(items.filter((i) => !toRemove.has(i.id)))
  }

  const handleUpdate = (id: string, updates: Partial<MenuItem>) => {
    setItems(items.map((i) => (i.id === id ? { ...i, ...updates } : i)))
  }

  const handleToggleCollapse = (id: string) => {
    setCollapsedIds((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    )
  }

  // --- Drag & Drop Logic ---

  const activeItem = activeId ? flattenedItems.find((i) => i.id === activeId) : null

  // Calculate the projected depth based on drag offset
  const projectedDepth = useMemo(() => {
    if (!activeId || !overId || !activeItem) return null
    const overIndex = flattenedItems.findIndex((i) => i.id === overId)
    
    const dragOffset = Math.round(offsetLeft / indentationWidth)
    let projectedDepth = activeItem.depth + dragOffset

    // Clamp depth bounds based on neighbors
    const previousItem = flattenedItems[overIndex - 1]
    const nextItem = flattenedItems[overIndex + 1]
    
    const maxDepth = previousItem ? previousItem.depth + 1 : 0
    const minDepth = nextItem ? nextItem.depth : 0

    if (projectedDepth > maxDepth) projectedDepth = maxDepth
    if (projectedDepth < minDepth) projectedDepth = minDepth

    return projectedDepth
  }, [activeId, overId, offsetLeft, flattenedItems, activeItem])


  const handleDragStart = (e: DragStartEvent) => {
    setActiveId(e.active.id as string)
    setOverId(e.active.id as string)
  }

  const handleDragMove = (e: DragMoveEvent) => {
    setOffsetLeft(e.delta.x)
    if (e.over?.id) {
      setOverId(e.over.id as string)
    }
  }

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e
    setActiveId(null)
    setOverId(null)
    setOffsetLeft(0)

    if (!over || projectedDepth === null) return

    const activeIndex = flattenedItems.findIndex((i) => i.id === active.id)
    const overIndex = flattenedItems.findIndex((i) => i.id === over.id)

    if (activeIndex !== overIndex || projectedDepth !== flattenedItems[activeIndex].depth) {
      // Build the new tree
      const newItems = [...items]
      const movedItem = newItems.find((i) => i.id === active.id)!

      // Find the new parent based on projected depth
      let newParentId: string | null = null
      
      // We look at the items above the drop position to find the correct parent at depth - 1
      const dropIndex = overIndex
      for (let i = dropIndex; i >= 0; i--) {
        const itemAtI = flattenedItems[i]
        // Skip the active item itself
        if (itemAtI.id === active.id) continue
        
        if (itemAtI.depth === projectedDepth - 1) {
          newParentId = itemAtI.id
          break
        }
      }
      
      if (projectedDepth === 0) {
        newParentId = null
      }

      movedItem.parentId = newParentId

      // Re-sort based on flat array
      const newFlattened = arrayMove(flattenedItems, activeIndex, overIndex)
      
      // Update sort_order for everyone
      newFlattened.forEach((flatItem, index) => {
        const realItem = newItems.find(i => i.id === flatItem.id)!
        realItem.sort_order = index
      })

      setItems(newItems)
    }
  }

  const handleDragCancel = () => {
    setActiveId(null)
    setOverId(null)
    setOffsetLeft(0)
  }

  return (
    <div className="space-y-4 bg-muted/20 p-4 rounded-xl border border-border">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        measuring={{
          droppable: { strategy: MeasuringStrategy.Always },
        }}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <SortableContext items={flattenedItems.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-2">
            {flattenedItems.map((item) => {
              // Calculate real-time depth during drag for the placeholder
              const isDragSource = item.id === activeId
              const displayDepth = isDragSource && projectedDepth !== null ? projectedDepth : item.depth
              
              // Determine if it has children for the collapse button
              const hasChildren = items.some(i => i.parentId === item.id)

              return (
                <SortableItem
                  key={item.id}
                  item={{ ...item, depth: displayDepth }}
                  isDragging={isDragSource}
                  indentationWidth={indentationWidth}
                  onRemove={handleRemove}
                  onUpdate={handleUpdate}
                  onToggleCollapse={handleToggleCollapse}
                  hasChildren={hasChildren}
                />
              )
            })}
          </div>
        </SortableContext>
        
        <DragOverlay>
          {activeItem ? (
            <SortableItem
              item={activeItem}
              isDragOverlay
              indentationWidth={indentationWidth}
              onRemove={() => {}}
              onUpdate={() => {}}
              onToggleCollapse={() => {}}
              hasChildren={false}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      <button
        type="button"
        onClick={handleAdd}
        className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold bg-background hover:bg-muted border border-border text-foreground rounded-lg transition-colors w-full"
      >
        <Plus size={16} /> Add Menu Item
      </button>
    </div>
  )
}
