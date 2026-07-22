'use client'

import { type Easing, motion, useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BookMenuPage = {
  id: string
  front: string
  back: string
  label: string
}

type BookMenuProps = {
  pages: BookMenuPage[]
  className?: string
}

type PhysicalSheet = {
  id: string
  frontPage: ReactNode
  backPage: ReactNode
  label: string
  hard?: boolean
}

type SheetSide = 'left' | 'right'
type SheetFace = 'front' | 'back'

type TurnState = {
  index: number
  direction: 'next' | 'previous'
  nextTurnedCount: number
  visibleFace: SheetFace
}

type SheetRenderState = {
  side: SheetSide
  rotation: number
  zIndex: number
  visibleFace: SheetFace
  isTurning: boolean
}

type ViewMode = 'spread' | 'single'

type SingleTurnState = {
  direction: 'next' | 'previous'
}

type SinglePage = {
  content: ReactNode
  label: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DESKTOP_TURN_DURATION_MS = 860
const TABLET_TURN_DURATION_MS = 800
const MOBILE_TURN_DURATION_MS = 700
const TURN_EASE: [number, number, number, number] = [0.65, 0, 0.35, 1]
const PAPER_PEEL_TIMES = [0, 0.15, 0.5, 0.85, 1]
const PAPER_PEEL_EASING: Easing[] = ['easeOut', 'easeIn', 'easeOut', 'easeInOut']
const SWIPE_THRESHOLD = 44
const INITIAL_TURNED_COUNT = 1

// ---------------------------------------------------------------------------
// Hooks
// ---------------------------------------------------------------------------

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)
    const updateMatch = () => setMatches(mediaQuery.matches)

    updateMatch()
    mediaQuery.addEventListener('change', updateMatch)

    return () => mediaQuery.removeEventListener('change', updateMatch)
  }, [query])

  return matches
}

// ---------------------------------------------------------------------------
// Face Components (unchanged — shared by both modes)
// ---------------------------------------------------------------------------

function CoverFace({ variant }: { variant: 'front' | 'back' }) {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-r-[1.35rem] border border-[#d0aa57]/55 bg-[#254a33] px-4 text-center text-[#f8f0d8] shadow-[inset_0_0_34px_rgba(2,24,12,0.42)] sm:px-8">
      <div className="absolute inset-3 rounded-[0.9rem] border border-[#cba557]/80 sm:inset-5 sm:rounded-[1rem]" />
      <div className="absolute left-5 top-5 h-10 w-10 rounded-full border border-[#cba557]/70 sm:left-7 sm:top-7 sm:h-14 sm:w-14" />
      <div className="absolute bottom-6 right-6 h-14 w-1 rounded-full bg-[#8e2f26] sm:bottom-8 sm:right-8 sm:h-20 sm:w-1.5" />
      <p className="relative text-xs font-semibold uppercase tracking-[0.38em] text-[#dec27c]">
        Madhuban
      </p>
      <h3 className="relative mt-4 font-serif text-2xl leading-none text-[#fbf6e8] sm:mt-5 sm:text-5xl">
        {variant === 'front' ? 'Dining Menu' : 'Garden Resort'}
      </h3>
      <p className="relative mt-4 max-w-36 text-xs leading-5 text-[#efe3bd] sm:mt-5 sm:max-w-48 sm:text-sm sm:leading-6">
        {variant === 'front'
          ? 'Indoor and outdoor restaurant'
          : 'Thank you for dining with us'}
      </p>
    </div>
  )
}

function InsideCoverFace() {
  return (
    <div className="relative flex h-full w-full flex-col justify-center overflow-hidden rounded-l-[1.35rem] border border-[#dfd5bd] bg-[#f7f4e8] px-4 text-center shadow-[inset_0_0_22px_rgba(75,91,45,0.12)] sm:px-8">
      <div className="absolute inset-3 rounded-[0.9rem] border border-[#cba557]/65 sm:inset-5 sm:rounded-[1rem]" />
      <div className="absolute left-5 top-5 h-[calc(100%-2.5rem)] w-1 rounded-full bg-[#cba557]/80 sm:left-7 sm:top-7 sm:h-[calc(100%-3.5rem)]" />
      <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-[#7a8b55]">
        Welcome
      </p>
      <h3 className="relative mx-auto mt-3 max-w-36 font-serif text-xl leading-tight text-[#254a33] sm:mt-4 sm:max-w-72 sm:text-3xl">
        Madhuban Garden Dining
      </h3>
      <div className="relative mx-auto my-4 h-px w-24 bg-[#b99242] sm:my-5 sm:w-44" />
      <p className="relative mx-auto max-w-36 text-xs leading-5 text-[#68764f] sm:max-w-72 sm:text-sm sm:leading-6">
        Fresh vegetarian favourites, garden-side comfort, and easy family dining
        at the resort.
      </p>
    </div>
  )
}

function ClosingFace() {
  return (
    <div className="relative flex h-full w-full flex-col items-center justify-center overflow-hidden rounded-r-[1.35rem] border border-[#dfd5bd] bg-[#fbf8ed] px-4 text-center shadow-[inset_0_0_22px_rgba(75,91,45,0.1)] sm:px-8">
      <div className="absolute inset-3 rounded-[0.9rem] border border-[#cba557]/60 sm:inset-5 sm:rounded-[1rem]" />
      <p className="relative text-xs font-semibold uppercase tracking-[0.28em] text-[#7a8b55]">
        Madhuban Garden Resort
      </p>
      <h3 className="relative mt-3 font-serif text-xl leading-tight text-[#254a33] sm:mt-4 sm:text-3xl">
        We hope every meal feels peaceful.
      </h3>
      <p className="relative mt-4 max-w-36 text-xs leading-5 text-[#68764f] sm:mt-5 sm:max-w-72 sm:text-sm sm:leading-6">
        Ask our team for seasonal specials, Jain preparations, and event dining
        options.
      </p>
    </div>
  )
}

function MenuArtwork({
  src,
  label,
  priority = false,
}: {
  src: string
  label: string
  priority?: boolean
}) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-[#fbf8ed]">
      <Image
        src={src}
        alt={label}
        fill
        priority={priority}
        sizes="(max-width: 767px) 85vw, (max-width: 1023px) 65vw, (max-width: 1280px) 46vw, 560px"
        className="object-contain"
      />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Spread-mode page surface (unchanged)
// ---------------------------------------------------------------------------

function PageSurface({
  children,
  side,
  hard = false,
}: {
  children: ReactNode
  side: 'front' | 'back'
  hard?: boolean
}) {
  return (
    <div
      className={cn(
        'absolute inset-0 overflow-hidden bg-[#fbf8ed]',
        side === 'front' ? 'rounded-r-[1.35rem]' : 'rounded-l-[1.35rem]',
        hard
          ? 'shadow-[0_18px_40px_rgba(26,38,20,0.24)]'
          : 'shadow-[inset_9px_0_22px_rgba(74,52,24,0.08),0_12px_28px_rgba(34,44,24,0.14)]',
      )}
      style={{
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
      }}
    >
      <div
        className={cn(
          'pointer-events-none absolute inset-y-0 z-10 w-12',
          side === 'front'
            ? 'left-0 bg-gradient-to-r from-[rgba(70,48,26,0.16)] to-transparent'
            : 'right-0 bg-gradient-to-l from-[rgba(70,48,26,0.16)] to-transparent',
        )}
      />
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Sheet model (unchanged — shared by both modes)
// ---------------------------------------------------------------------------

function buildPhysicalSheets(pages: BookMenuPage[]): PhysicalSheet[] {
  return [
    {
      id: 'cover-sheet',
      frontPage: <CoverFace variant="front" />,
      backPage: <InsideCoverFace />,
      label: 'Madhuban dining cover',
      hard: true,
    },
    ...pages.map((page, index) => ({
      id: page.id,
      frontPage: (
        <MenuArtwork
          src={page.front}
          label={`${page.label} front`}
          priority={index === 0}
        />
      ),
      backPage: (
        <MenuArtwork
          src={page.back}
          label={`${page.label} back`}
          priority={index === 0}
        />
      ),
      label: page.label,
    })),
    {
      id: 'closing-sheet',
      frontPage: <ClosingFace />,
      backPage: <CoverFace variant="back" />,
      label: 'Madhuban dining closing cover',
      hard: true,
    },
  ]
}

// ---------------------------------------------------------------------------
// Spread-mode utilities (unchanged)
// ---------------------------------------------------------------------------

function getSheetZIndex({
  index,
  sheetCount,
  turnedCount,
  isTurning,
}: {
  index: number
  sheetCount: number
  turnedCount: number
  isTurning: boolean
}) {
  if (isTurning) return 80
  if (index < turnedCount) return 20 + index
  return 20 + sheetCount - index
}

function getSheetRenderState({
  index,
  sheetCount,
  turnedCount,
  turning,
}: {
  index: number
  sheetCount: number
  turnedCount: number
  turning: TurnState | null
}): SheetRenderState {
  const isTurning = turning?.index === index
  const isOnLeft = index < turnedCount
  const side = isOnLeft ? 'left' : 'right'
  const rotation = isTurning
    ? turning.direction === 'next'
      ? -180
      : 0
    : isOnLeft
      ? -180
      : 0

  return {
    side,
    rotation,
    isTurning,
    visibleFace: isTurning ? turning.visibleFace : isOnLeft ? 'back' : 'front',
    zIndex: getSheetZIndex({
      index,
      sheetCount,
      turnedCount,
      isTurning,
    }),
  }
}

// ---------------------------------------------------------------------------
// Spread-mode sheet renderer (unchanged)
// ---------------------------------------------------------------------------

function PhysicalSheetView({
  sheet,
  state,
  durationMs,
  reducedMotion,
}: {
  sheet: PhysicalSheet
  state: SheetRenderState
  durationMs: number
  reducedMotion: boolean
}) {
  return (
    <motion.div
      aria-hidden
      data-book-sheet={sheet.id}
      data-book-sheet-side={state.side}
      data-book-sheet-face={state.visibleFace}
      data-book-sheet-turning={state.isTurning ? 'true' : undefined}
      className="absolute inset-y-0 left-1/2 w-1/2 origin-left will-change-transform [transform-style:preserve-3d]"
      style={{
        zIndex: state.zIndex,
        transformOrigin: 'left center',
        transformStyle: 'preserve-3d',
      }}
      initial={false}
      animate={{
        rotateY: state.rotation,
      }}
      transition={{
        duration: reducedMotion ? 0.01 : durationMs / 1000,
        ease: TURN_EASE,
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(0deg) translateZ(1px)',
          transformStyle: 'preserve-3d',
          visibility: state.visibleFace === 'front' ? 'visible' : 'hidden',
        }}
      >
        <PageSurface side="front" hard={sheet.hard}>
          {sheet.frontPage}
        </PageSurface>
      </div>

      <div
        className="absolute inset-0"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg) translateZ(1px)',
          transformStyle: 'preserve-3d',
          visibility: state.visibleFace === 'back' ? 'visible' : 'hidden',
        }}
      >
        <PageSurface side="back" hard={sheet.hard}>
          {sheet.backPage}
        </PageSurface>
      </div>

      <motion.div
        className="pointer-events-none absolute inset-0 rounded-r-[1.35rem] mix-blend-multiply"
        style={{
          backfaceVisibility: 'hidden',
          WebkitBackfaceVisibility: 'hidden',
          background:
            'linear-gradient(90deg, rgba(72,50,22,0.28), rgba(255,255,255,0.1) 48%, rgba(33,28,18,0.2))',
        }}
        initial={false}
        animate={{ opacity: state.isTurning ? 0.58 : 0 }}
        transition={{
          duration: reducedMotion ? 0.01 : durationMs / 1000,
          ease: TURN_EASE,
        }}
      />

      <div className="pointer-events-none absolute inset-y-[1px] -right-[2px] w-[3px] bg-[#e5d7bc] shadow-[0_0_5px_rgba(52,38,18,0.22)]" />
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Single-page mode utilities
// ---------------------------------------------------------------------------

/** Flatten the physical sheets into a sequential reading-order page list. */
function buildSinglePages(
  sheets: PhysicalSheet[],
  maxTurnedCount: number,
): SinglePage[] {
  const pages: SinglePage[] = []
  for (let tc = INITIAL_TURNED_COUNT; tc <= maxTurnedCount; tc++) {
    // Left page of spread (back face of turned sheet)
    pages.push({
      content: sheets[tc - 1].backPage,
      label: `${sheets[tc - 1].label} (inner)`,
    })
    // Right page of spread (front face of next sheet)
    pages.push({
      content: sheets[tc].frontPage,
      label: sheets[tc].label,
    })
  }
  return pages
}

// ---------------------------------------------------------------------------
// Single-page flip renderer
// ---------------------------------------------------------------------------

function SinglePageFlipContent({
  pages,
  pageIndex,
  turning,
  durationMs,
  reducedMotion,
}: {
  pages: SinglePage[]
  pageIndex: number
  turning: SingleTurnState | null
  durationMs: number
  reducedMotion: boolean
}) {
  const current = pages[pageIndex]
  if (!current) return null

  // ---- Idle state: show current page ----
  if (!turning) {
    return (
      <div className="absolute inset-0 z-[15] overflow-hidden rounded-[1.35rem] bg-[#fbf8ed] shadow-[inset_0_0_22px_rgba(74,52,24,0.06),0_6px_18px_rgba(34,44,24,0.12)]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[rgba(70,48,26,0.12)] to-transparent" />
        {current.content}
      </div>
    )
  }

  // ---- Turning state: two-layer flip ----
  const isNext = turning.direction === 'next'
  const targetIdx = isNext ? pageIndex + 1 : pageIndex - 1
  const target = pages[targetIdx]
  if (!target) return null

  // Under page: visible through the gap during the flip
  const underContent = isNext ? target.content : current.content

  // Over page faces:
  const overFront = isNext ? current.content : target.content

  // Keyframes for Paper Peel:
  // 1. Start (0 or -180)
  // 2. Lift/Anticipation (curls slightly towards user)
  // 3. Peak/Midpoint (crosses vertical axis)
  // 4. Land/Settle (reaches opposite side but still lifted)
  // 5. Rest (0 or -180)
  const overRotateY = isNext
    ? [0, -15, -90, -165, -180]
    : [-180, -165, -90, -15, 0]
  
  const overTranslateZ = [1, 30, 60, 30, 1]

  const animTransition = {
    duration: reducedMotion ? 0.01 : durationMs / 1000,
    times: PAPER_PEEL_TIMES,
    ease: PAPER_PEEL_EASING,
  }

  return (
    <>
      {/* Under page (static, revealed during flip) */}
      <div className="absolute inset-0 z-[10] overflow-hidden rounded-[1.35rem] bg-[#fbf8ed] shadow-[inset_0_0_22px_rgba(74,52,24,0.06)]">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[rgba(70,48,26,0.12)] to-transparent" />
        {underContent}
        {/* Dynamic drop shadow cast by the flipping page */}
        <motion.div
          className="pointer-events-none absolute inset-0 mix-blend-multiply"
          style={{
            background: isNext
              ? 'linear-gradient(to right, rgba(0,0,0,0.4) 0%, transparent 40%)'
              : 'linear-gradient(to left, rgba(0,0,0,0.4) 0%, transparent 40%)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.3, 0.8, 0.3, 0] }}
          transition={animTransition}
        />
      </div>

      {/* Over page (flipping) */}
      <motion.div
        className="absolute inset-0 z-[20] origin-left will-change-transform [transform-style:preserve-3d]"
        style={{
          transformOrigin: 'left center',
          transformStyle: 'preserve-3d',
        }}
        initial={{
          rotateY: overRotateY[0],
          translateZ: overTranslateZ[0],
        }}
        animate={{
          rotateY: overRotateY,
          translateZ: overTranslateZ,
        }}
        transition={animTransition}
      >
        {/* Front face */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[1.35rem] bg-[#fbf8ed] shadow-[inset_0_0_22px_rgba(74,52,24,0.06),0_6px_18px_rgba(34,44,24,0.12)]"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(0deg) translateZ(1px)',
          }}
        >
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[rgba(70,48,26,0.12)] to-transparent" />
          {overFront}
        </div>

        {/* Back face (Blank Paper) */}
        <div
          className="absolute inset-0 overflow-hidden rounded-[1.35rem] bg-[#fbf8ed] shadow-[inset_0_0_22px_rgba(74,52,24,0.06),0_6px_18px_rgba(34,44,24,0.12)]"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg) translateZ(1px)',
          }}
        >
          {/* Spine shadow on the back face is on the right edge */}
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[rgba(70,48,26,0.12)] to-transparent" />
        </div>

        {/* Shadow overlay on the flipping page itself */}
        <motion.div
          className="pointer-events-none absolute inset-0 rounded-[1.35rem] mix-blend-multiply"
          style={{
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden',
            background:
              'linear-gradient(90deg, rgba(72,50,22,0.28), rgba(255,255,255,0.1) 48%, rgba(33,28,18,0.2))',
            transform: 'translateZ(2px)',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.4, 0.6, 0.4, 0] }}
          transition={animTransition}
        />

        {/* Page edge line */}
        <div
          className="pointer-events-none absolute inset-y-[1px] -right-[2px] w-[2px] bg-[#e5d7bc] shadow-[0_0_4px_rgba(52,38,18,0.18)]"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        />
      </motion.div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BookMenu({ pages, className }: BookMenuProps) {
  const sheets = useMemo(() => buildPhysicalSheets(pages), [pages])
  const prefersReducedMotion = useReducedMotion()

  // -- View mode detection --
  const isSinglePage = useMediaQuery('(max-width: 1023px)')
  const isMobile = useMediaQuery('(max-width: 767px)')
  const viewMode: ViewMode = isSinglePage ? 'single' : 'spread'

  // -- Spread-mode state (unchanged) --
  const [turnedCount, setTurnedCount] = useState(INITIAL_TURNED_COUNT)
  const [turning, setTurning] = useState<TurnState | null>(null)
  const turnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const faceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const maxTurnedCount = Math.max(INITIAL_TURNED_COUNT, sheets.length - 1)
  const totalSpreads = Math.max(1, sheets.length - 1)
  const canGoPrevious = turnedCount > INITIAL_TURNED_COUNT
  const canGoNext = turnedCount < maxTurnedCount

  // -- Single-mode state --
  const singlePages = useMemo(
    () => buildSinglePages(sheets, maxTurnedCount),
    [sheets, maxTurnedCount],
  )
  const totalSinglePages = singlePages.length
  const [singlePageIdx, setSinglePageIdx] = useState(0)
  const [singleTurning, setSingleTurning] = useState<SingleTurnState | null>(
    null,
  )
  const singleTurnTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const canGoSinglePrevious = singlePageIdx > 0
  const canGoSingleNext = singlePageIdx < totalSinglePages - 1

  // -- Shared state --
  const swipeStart = useRef<number | null>(null)

  // -- Animation durations per mode --
  const spreadDurationMs = DESKTOP_TURN_DURATION_MS
  const singleDurationMs = isMobile
    ? MOBILE_TURN_DURATION_MS
    : TABLET_TURN_DURATION_MS

  // -- Derived state for controls --
  const isAnimating =
    viewMode === 'spread' ? turning !== null : singleTurning !== null
  const canPrev =
    viewMode === 'spread' ? canGoPrevious : canGoSinglePrevious
  const canNext = viewMode === 'spread' ? canGoNext : canGoSingleNext

  // -- Mode-switch sync --
  const prevViewModeRef = useRef(viewMode)
  const turnedCountRef = useRef(turnedCount)
  const singlePageIdxRef = useRef(singlePageIdx)
  turnedCountRef.current = turnedCount
  singlePageIdxRef.current = singlePageIdx

  useEffect(() => {
    if (prevViewModeRef.current === viewMode) return
    const prevMode = prevViewModeRef.current
    prevViewModeRef.current = viewMode

    // Clear any in-progress animations
    setTurning(null)
    setSingleTurning(null)
    if (turnTimer.current) clearTimeout(turnTimer.current)
    if (faceTimer.current) clearTimeout(faceTimer.current)
    if (singleTurnTimer.current) clearTimeout(singleTurnTimer.current)

    // Sync position between modes
    if (prevMode === 'spread' && viewMode === 'single') {
      const tc = turnedCountRef.current
      setSinglePageIdx((tc - INITIAL_TURNED_COUNT) * 2)
    } else if (prevMode === 'single' && viewMode === 'spread') {
      const sp = singlePageIdxRef.current
      setTurnedCount(Math.floor(sp / 2) + INITIAL_TURNED_COUNT)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode])

  // -- Timer cleanup on unmount --
  useEffect(
    () => () => {
      if (turnTimer.current) clearTimeout(turnTimer.current)
      if (faceTimer.current) clearTimeout(faceTimer.current)
      if (singleTurnTimer.current) clearTimeout(singleTurnTimer.current)
    },
    [],
  )

  // -- Spread-mode turn (unchanged logic) --
  const turnBook = (direction: 'next' | 'previous') => {
    if (turning) return
    if (direction === 'next' && !canGoNext) return
    if (direction === 'previous' && !canGoPrevious) return

    const sheetIndex =
      direction === 'next' ? turnedCount : Math.max(0, turnedCount - 1)
    const nextTurnedCount =
      direction === 'next' ? turnedCount + 1 : turnedCount - 1

    if (turnTimer.current) clearTimeout(turnTimer.current)
    if (faceTimer.current) clearTimeout(faceTimer.current)

    setTurning({
      index: sheetIndex,
      direction,
      nextTurnedCount,
      visibleFace: direction === 'next' ? 'front' : 'back',
    })

    faceTimer.current = setTimeout(
      () => {
        setTurning((current) =>
          current?.index === sheetIndex
            ? {
                ...current,
                visibleFace: direction === 'next' ? 'back' : 'front',
              }
            : current,
        )
        faceTimer.current = null
      },
      prefersReducedMotion ? 1 : spreadDurationMs / 2,
    )

    turnTimer.current = setTimeout(
      () => {
        setTurnedCount(nextTurnedCount)
        setTurning(null)
        turnTimer.current = null
      },
      prefersReducedMotion ? 1 : spreadDurationMs,
    )
  }

  // -- Single-mode turn --
  const turnSinglePage = (direction: 'next' | 'previous') => {
    if (singleTurning) return
    if (direction === 'next' && !canGoSingleNext) return
    if (direction === 'previous' && !canGoSinglePrevious) return

    const nextIdx =
      direction === 'next' ? singlePageIdx + 1 : singlePageIdx - 1

    if (singleTurnTimer.current) clearTimeout(singleTurnTimer.current)

    setSingleTurning({
      direction,
    })

    singleTurnTimer.current = setTimeout(
      () => {
        setSinglePageIdx(nextIdx)
        setSingleTurning(null)
        singleTurnTimer.current = null
      },
      prefersReducedMotion ? 1 : singleDurationMs,
    )
  }

  // -- Unified navigation --
  const handlePrevious = () => {
    if (viewMode === 'spread') turnBook('previous')
    else turnSinglePage('previous')
  }

  const handleNext = () => {
    if (viewMode === 'spread') turnBook('next')
    else turnSinglePage('next')
  }

  // -- Keyboard navigation --
  const handlePrevRef = useRef(handlePrevious)
  const handleNextRef = useRef(handleNext)
  handlePrevRef.current = handlePrevious
  handleNextRef.current = handleNext

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        handlePrevRef.current()
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        handleNextRef.current()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // -- Swipe --
  const finishSwipe = (endX: number) => {
    if (swipeStart.current === null) return
    const distance = endX - swipeStart.current
    swipeStart.current = null
    if (Math.abs(distance) < SWIPE_THRESHOLD) return
    if (distance > 0) handlePrevious()
    else handleNext()
  }

  // -- Page indicator --
  const pageIndicator =
    viewMode === 'spread'
      ? `Spread ${turnedCount} of ${totalSpreads}`
      : `Page ${singlePageIdx + 1} of ${totalSinglePages}`

  // Stacked-pages edge count for single mode (decreases as you read)
  const remainingEdgeLines = Math.min(
    4,
    totalSinglePages - singlePageIdx - 1,
  )

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return (
    <section
      aria-label="Interactive dining menu"
      className={cn('mx-auto w-full max-w-6xl', className)}
      onPointerDown={(event) => {
        swipeStart.current = event.clientX
      }}
      onPointerUp={(event) => finishSwipe(event.clientX)}
    >
      {/* ================================================================= */}
      {/* SPREAD MODE — desktop (≥1024px), unchanged                        */}
      {/* ================================================================= */}
      {viewMode === 'spread' && (
        <div
          className={cn(
            'relative overflow-hidden rounded-[1.5rem] border border-content-border/80 bg-[#f1eadb] shadow-[0_26px_70px_rgba(37,74,51,0.16)]',
            'aspect-[16/10] px-6 py-8 lg:px-10',
            turning && 'pointer-events-none',
          )}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.72),transparent_34%),linear-gradient(135deg,rgba(76,175,80,0.1),transparent_34%,rgba(175,132,55,0.1))]" />
          <div
            className="relative mx-auto h-full max-w-5xl"
            style={{ perspective: '2600px' }}
          >
            <div className="absolute inset-x-6 bottom-0 h-10 rounded-[50%] bg-[#1f301f]/20 blur-2xl" />
            <div className="relative h-full w-full [transform-style:preserve-3d] [transform:rotateX(3deg)]">
              <div className="absolute inset-0 rounded-[1.45rem] bg-[#254a33] shadow-[0_22px_46px_rgba(26,38,20,0.24)]" />
              <div className="absolute inset-y-0 left-[calc(50%-0.875rem)] z-[90] w-7 rounded-full bg-[#1b3826] shadow-[inset_7px_0_14px_rgba(255,255,255,0.12),inset_-8px_0_16px_rgba(0,0,0,0.28)]" />
              <div className="absolute inset-y-7 left-[calc(50%-0.5px)] z-[91] w-px bg-[#cba557]/40" />

              {sheets.map((sheet, index) => (
                <PhysicalSheetView
                  key={sheet.id}
                  sheet={sheet}
                  state={getSheetRenderState({
                    index,
                    sheetCount: sheets.length,
                    turnedCount,
                    turning,
                  })}
                  durationMs={spreadDurationMs}
                  reducedMotion={Boolean(prefersReducedMotion)}
                />
              ))}

              <button
                type="button"
                aria-label="Previous menu page"
                disabled={!canGoPrevious || turning !== null}
                onClick={handlePrevious}
                className="absolute inset-y-8 left-0 z-[100] w-24 cursor-w-resize rounded-l-[1.35rem] outline-none transition-colors hover:bg-[#af8437]/10 focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-0"
              />
              <button
                type="button"
                aria-label="Next menu page"
                disabled={!canGoNext || turning !== null}
                onClick={handleNext}
                className="absolute inset-y-8 right-0 z-[100] w-24 cursor-e-resize rounded-r-[1.35rem] outline-none transition-colors hover:bg-[#af8437]/10 focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* SINGLE MODE — tablet (768–1023px) and mobile (<768px)             */}
      {/* ================================================================= */}
      {viewMode === 'single' && (
        <div className="mx-auto w-full max-w-[30rem]">
          <div
            className={cn(
              'relative rounded-[1.5rem] border border-content-border/80 bg-[#f1eadb] shadow-[0_26px_70px_rgba(37,74,51,0.16)]',
              'aspect-[3/4] px-3 py-4 sm:px-4 sm:py-5',
              singleTurning && 'pointer-events-none',
            )}
          >
            {/* Background needs its own overflow-hidden to respect rounded corners without breaking 3D descendants */}
            <div className="absolute inset-0 overflow-hidden rounded-[1.5rem]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(255,255,255,0.72),transparent_34%),linear-gradient(135deg,rgba(76,175,80,0.1),transparent_34%,rgba(175,132,55,0.1))]" />
            </div>
            
            <div
              className="relative mx-auto h-full"
              style={{
                perspective: isMobile ? '1400px' : '1800px',
              }}
            >
              {/* Shadow under book */}
              <div className="absolute inset-x-4 bottom-0 h-8 rounded-[50%] bg-[#1f301f]/16 blur-xl" />

              <div className="relative h-full w-full [transform-style:preserve-3d]">
                {/* Hardcover background */}
                <div className="absolute inset-0 rounded-[1.45rem] bg-[#254a33] shadow-[0_22px_46px_rgba(26,38,20,0.24)]" />

                {/* Stacked-pages edge (right side) — simulates remaining pages */}
                <div className="pointer-events-none absolute inset-y-2 right-0 z-[5]">
                  {Array.from({ length: remainingEdgeLines }, (_, i) => (
                    <div
                      key={i}
                      className="absolute inset-y-0"
                      style={{
                        right: i * 1.5 + 1,
                        width: 1,
                        backgroundColor: `rgba(218,204,178,${0.5 - i * 0.1})`,
                      }}
                    />
                  ))}
                </div>

                {/* Page content with flip animation */}
                <SinglePageFlipContent
                  pages={singlePages}
                  pageIndex={singlePageIdx}
                  turning={singleTurning}
                  durationMs={singleDurationMs}
                  reducedMotion={Boolean(prefersReducedMotion)}
                />

                {/* Touch zones — left third / right third */}
                <button
                  type="button"
                  aria-label="Previous menu page"
                  disabled={!canGoSinglePrevious || singleTurning !== null}
                  onClick={handlePrevious}
                  className="absolute inset-y-4 left-0 z-[100] w-1/3 cursor-w-resize rounded-l-[1.35rem] outline-none transition-colors hover:bg-[#af8437]/10 focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-0"
                />
                <button
                  type="button"
                  aria-label="Next menu page"
                  disabled={!canGoSingleNext || singleTurning !== null}
                  onClick={handleNext}
                  className="absolute inset-y-4 right-0 z-[100] w-1/3 cursor-e-resize rounded-r-[1.35rem] outline-none transition-colors hover:bg-[#af8437]/10 focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-0"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* Controls — shared, adaptive                                       */}
      {/* ================================================================= */}
      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm text-primary-deep sm:flex sm:flex-wrap sm:justify-center sm:gap-x-6">
        <Button
          type="button"
          variant="ghost"
          className="h-12 gap-2 justify-self-end px-3 text-primary-deep hover:bg-primary-100 hover:text-primary-800 sm:justify-self-auto lg:h-11"
          onClick={handlePrevious}
          disabled={!canPrev || isAnimating}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
        <output
          aria-live="polite"
          className="min-w-36 rounded-full border border-content-border bg-white px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-primary-800"
        >
          {pageIndicator}
        </output>
        <Button
          type="button"
          variant="ghost"
          className="h-12 gap-2 justify-self-start px-3 text-primary-deep hover:bg-primary-100 hover:text-primary-800 sm:justify-self-auto lg:h-11"
          onClick={handleNext}
          disabled={!canNext || isAnimating}
        >
          Next
          <ChevronRight className="size-4" aria-hidden="true" />
        </Button>
      </div>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        Use the page edges, controls, or a gentle swipe to explore the menu.
      </p>
    </section>
  )
}
