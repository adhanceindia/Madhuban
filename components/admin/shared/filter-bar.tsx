'use client'

import { Search, CalendarRange } from 'lucide-react'

export type FilterOption = { value: string; label: string }

export type FilterConfig =
  | { kind: 'select'; key: string; label: string; options: FilterOption[] }
  | { kind: 'dateRange'; startKey: string; endKey: string }
  | { kind: 'search'; key: string; placeholder?: string }

type FilterBarProps<T extends Record<string, string>> = {
  filters: T
  onChange: (filters: T) => void
  config: FilterConfig[]
}

export function FilterBar<T extends Record<string, string>>({ filters, onChange, config }: FilterBarProps<T>) {
  function set(key: string, value: string) {
    onChange({ ...filters, [key]: value })
  }

  return (
    <div className="flex items-center gap-2 flex-wrap mb-4 font-admin">
      {config.map((item, i) => {
        if (item.kind === 'search') {
          return (
            <div key={i} className="relative flex-1 min-w-[200px] max-w-[280px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/70" />
              <input
                type="search"
                value={filters[item.key] || ''}
                onChange={(e) => set(item.key, e.target.value)}
                placeholder={item.placeholder || 'Search...'}
                className="w-full pl-8 pr-3 py-1.5 text-[12px] bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-deep/30 focus:border-accent-deep"
              />
            </div>
          )
        }
        if (item.kind === 'select') {
          return (
            <select
              key={i}
              value={filters[item.key] || ''}
              onChange={(e) => set(item.key, e.target.value)}
              className="px-3 py-1.5 text-[12px] font-medium bg-card border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-deep/30 cursor-pointer"
              aria-label={item.label}
            >
              {item.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          )
        }
        if (item.kind === 'dateRange') {
          return (
            <div
              key={i}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-accent rounded-lg text-[12px] font-semibold text-foreground"
            >
              <CalendarRange size={14} />
              <input
                type="date"
                value={filters[item.startKey] || ''}
                onChange={(e) => set(item.startKey, e.target.value)}
                className="bg-transparent outline-none w-[110px]"
              />
              <span className="text-foreground/60">→</span>
              <input
                type="date"
                value={filters[item.endKey] || ''}
                onChange={(e) => set(item.endKey, e.target.value)}
                className="bg-transparent outline-none w-[110px]"
              />
            </div>
          )
        }
        return null
      })}
    </div>
  )
}
