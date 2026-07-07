'use client'

import { useState } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core'
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react'
import type { BlockDef } from '@/lib/cms-schema'
import { FieldRenderer } from '../content/PageEditor'

type BlockData = {
  id: string
  type: string
  props: Record<string, unknown>
}

type BlockEditorProps = {
  availableBlocks: BlockDef[]
  value: BlockData[]
  onChange: (value: BlockData[]) => void
}

export function BlockEditor({ availableBlocks, value, onChange }: BlockEditorProps) {
  const [showAddMenu, setShowAddMenu] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = value.findIndex((b) => b.id === active.id)
      const newIndex = value.findIndex((b) => b.id === over.id)
      onChange(arrayMove(value, oldIndex, newIndex))
    }
  }

  function addBlock(blockDef: BlockDef) {
    const newBlock: BlockData = {
      id: crypto.randomUUID(),
      type: blockDef.type,
      props: {},
    }
    onChange([...value, newBlock])
    setShowAddMenu(false)
  }

  function updateBlock(id: string, props: Record<string, unknown>) {
    onChange(value.map((b) => (b.id === id ? { ...b, props } : b)))
  }

  function removeBlock(id: string) {
    onChange(value.filter((b) => b.id !== id))
  }

  return (
    <div className="space-y-4">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={value.map((b) => b.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {value.map((block) => {
              const def = availableBlocks.find((b) => b.type === block.type)
              if (!def) return null
              return (
                <SortableBlockItem
                  key={block.id}
                  block={block}
                  def={def}
                  onChange={(props) => updateBlock(block.id, props)}
                  onRemove={() => removeBlock(block.id)}
                />
              )
            })}
          </div>
        </SortableContext>
      </DndContext>

      <div className="relative">
        <button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 text-sm font-medium text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors"
        >
          <Plus size={16} /> Add Block
        </button>

        {showAddMenu && (
          <div className="absolute top-full mt-2 w-full z-10 rounded-lg border border-border bg-card shadow-lg p-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 px-2 pt-1">Select a block</p>
            <div className="grid grid-cols-2 gap-2">
              {availableBlocks.map((block) => (
                <button
                  key={block.type}
                  type="button"
                  onClick={() => addBlock(block)}
                  className="flex flex-col items-start rounded-md px-3 py-2 hover:bg-muted transition-colors text-left"
                >
                  <span className="text-sm font-medium text-foreground">{block.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function SortableBlockItem({
  block,
  def,
  onChange,
  onRemove,
}: {
  block: BlockData
  def: BlockDef
  onChange: (props: Record<string, unknown>) => void
  onRemove: () => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id })
  const [expanded, setExpanded] = useState(false)

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-lg border bg-card transition-colors ${
        isDragging ? 'border-primary shadow-lg ring-1 ring-primary/20' : 'border-border shadow-sm'
      }`}
    >
      <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-t-lg border-b border-border">
        <div {...attributes} {...listeners} className="cursor-grab hover:bg-muted p-1.5 rounded-md text-muted-foreground active:cursor-grabbing">
          <GripVertical size={16} />
        </div>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 items-center gap-2 font-medium text-sm text-foreground hover:opacity-80"
        >
          {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          {def.label}
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="p-1.5 text-muted-foreground hover:text-red-500 rounded-md hover:bg-red-500/10 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {expanded && (
        <div className="p-5 space-y-5">
          {def.fields.map((field) => (
            <FieldRenderer
              key={field.field}
              def={field}
              value={block.props[field.field]}
              onChange={(v: unknown) => onChange({ ...block.props, [field.field]: v })}
            />
          ))}
        </div>
      )}
    </div>
  )
}
