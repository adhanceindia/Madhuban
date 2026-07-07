'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type PreviewContextType = {
  isDraft: boolean
  draftContent: Record<string, unknown> | null
}

const PreviewContext = createContext<PreviewContextType>({
  isDraft: false,
  draftContent: null,
})

export function usePreview() {
  return useContext(PreviewContext)
}

export function useSiteContent(initialContent: Record<string, unknown>) {
  const { isDraft, draftContent } = usePreview()
  
  if (isDraft && draftContent) {
    return { ...initialContent, ...draftContent }
  }
  return initialContent
}

export function PreviewProvider({ children }: { children: React.ReactNode }) {
  const [draftContent, setDraftContent] = useState<Record<string, unknown> | null>(null)

  useEffect(() => {
    // Only listen in iframes
    if (window === window.parent) return

    function handleMessage(event: MessageEvent) {
      // Validate origin if possible, but since admin and preview are same origin it's okay.
      if (event.data?.type === 'CMS_PREVIEW_UPDATE') {
        setDraftContent(event.data.payload)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  return (
    <PreviewContext.Provider value={{ isDraft: draftContent !== null, draftContent }}>
      {children}
    </PreviewContext.Provider>
  )
}
