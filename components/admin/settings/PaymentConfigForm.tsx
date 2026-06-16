'use client'

import { useEffect, useState } from 'react'
import { Save, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

import { FormCard } from '@/components/admin/shared/form-card'
import { Field, TextInput } from '@/components/admin/shared/form-field'
import { Toggle } from '@/components/admin/shared/toggle'
import { GATEWAY_CONFIG, GATEWAY_NAMES } from '@/lib/schemas/settings'

type GatewayKey = (typeof GATEWAY_NAMES)[number]

type PaymentConfig = {
  active_gateway: GatewayKey
  gateways: Record<string, unknown>
}

export function PaymentConfigForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeGateway, setActiveGateway] = useState<GatewayKey>('razorpay')
  const [gatewayFields, setGatewayFields] = useState<Record<string, string>>({})
  const [gatewayEnabled, setGatewayEnabled] = useState<Record<string, boolean>>({})
  const [expanded, setExpanded] = useState<GatewayKey | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings/payment')
      .then((r) => r.json())
      .then((d) => {
        const cfg: PaymentConfig = d.config
        setActiveGateway(cfg.active_gateway)
        setGatewayFields(
          Object.fromEntries(
            Object.entries(cfg.gateways || {}).filter(([, v]) => typeof v === 'string').map(([k, v]) => [k, v as string]),
          ),
        )
        const enabled: Record<string, boolean> = {}
        for (const g of GATEWAY_NAMES) {
          const key = `${g}_enabled`
          enabled[g] = !!(cfg.gateways as Record<string, unknown>)[key]
        }
        setGatewayEnabled(enabled)
        setExpanded(cfg.active_gateway)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  function setField(key: string, value: string) {
    setGatewayFields((f) => ({ ...f, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const gateways: Record<string, unknown> = { ...gatewayFields }
      for (const g of GATEWAY_NAMES) {
        gateways[`${g}_enabled`] = !!gatewayEnabled[g]
      }
      const res = await fetch('/api/admin/settings/payment', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          active_gateway: activeGateway,
          gateways,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Save failed')
        return
      }
      toast.success('Payment settings updated')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="h-[400px] bg-card rounded-2xl animate-pulse" />
  }

  return (
    <div className="max-w-[800px] space-y-5">
      <FormCard
        title="Active gateway"
        description="The gateway selected here will process new online bookings. Only enabled gateways can be activated."
      >
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {GATEWAY_NAMES.map((g) => {
            const isActive = activeGateway === g
            const isEnabled = gatewayEnabled[g]
            return (
              <button
                key={g}
                type="button"
                onClick={() => setActiveGateway(g)}
                disabled={!isEnabled}
                className={`px-3 py-2.5 rounded-lg text-[12px] font-semibold border transition-colors text-center ${
                  isActive
                    ? 'bg-accent text-foreground border-accent-deep'
                    : isEnabled
                    ? 'bg-card text-foreground border-border hover:border-accent-deep/40'
                    : 'bg-sage-soft/30 text-muted-foreground/50 border-border cursor-not-allowed'
                }`}
                title={isEnabled ? '' : 'Enable this gateway first'}
              >
                {GATEWAY_CONFIG[g].label}
              </button>
            )
          })}
        </div>
      </FormCard>

      {GATEWAY_NAMES.map((g) => {
        const cfg = GATEWAY_CONFIG[g]
        const isOpen = expanded === g
        const isEnabled = gatewayEnabled[g]
        return (
          <div key={g} className="bg-card rounded-2xl shadow-[0_1px_2px_rgba(45,55,30,0.04)]">
            <button
              type="button"
              onClick={() => setExpanded(isOpen ? null : g)}
              className="w-full px-6 py-4 flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-3">
                <span className="text-[14px] font-semibold text-foreground">{cfg.label}</span>
                {activeGateway === g && (
                  <span className="text-[10px] font-semibold text-foreground bg-accent px-2 py-0.5 rounded">
                    ACTIVE
                  </span>
                )}
                {!isEnabled && (
                  <span className="text-[10px] font-semibold text-muted-foreground bg-sage-soft px-2 py-0.5 rounded">
                    DISABLED
                  </span>
                )}
              </div>
              {isOpen ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
            </button>

            {isOpen && (
              <div className="px-6 pb-5 space-y-4 border-t border-border/50 pt-4">
                <Toggle
                  checked={isEnabled}
                  onChange={(v) => setGatewayEnabled({ ...gatewayEnabled, [g]: v })}
                  label="Enabled"
                  description="Disabling will prevent this gateway from being activated."
                />

                {cfg.fields.map((field) => (
                  <Field key={field.key} label={field.label} required={field.required}>
                    <TextInput
                      type={field.type || 'text'}
                      value={gatewayFields[field.key] || ''}
                      onChange={(e) => setField(field.key, e.target.value)}
                      placeholder={`Enter your ${field.label.toLowerCase()}`}
                      autoComplete="off"
                    />
                  </Field>
                ))}
              </div>
            )}
          </div>
        )
      })}

      <div className="flex items-center justify-end">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold bg-accent hover:bg-accent-deep text-foreground rounded-lg transition-colors disabled:opacity-50"
        >
          <Save size={14} /> {saving ? 'Saving...' : 'Save payment settings'}
        </button>
      </div>
    </div>
  )
}
