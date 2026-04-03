declare module '@cashfreepayments/cashfree-js' {
  interface CashfreeInstance {
    checkout(options: {
      paymentSessionId: string
      redirectTarget?: '_self' | '_modal' | HTMLElement
      appearance?: { width?: string; height?: string }
    }): Promise<{
      error?: unknown
      paymentDetails?: unknown
      redirect?: boolean
    }>
  }

  export function load(config: {
    mode: 'sandbox' | 'production'
  }): Promise<CashfreeInstance>
}
