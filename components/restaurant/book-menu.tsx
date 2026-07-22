'use client'

import { ContactShadows, useCursor, useTexture } from '@react-three/drei'
import { Canvas, type ThreeEvent, useFrame, useThree } from '@react-three/fiber'
import { useReducedMotion } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  Bone,
  BoxGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  Group,
  MathUtils,
  MeshPhysicalMaterial,
  MeshStandardMaterial,
  PerspectiveCamera,
  Skeleton,
  SkinnedMesh,
  SRGBColorSpace,
  Uint16BufferAttribute,
  Vector3,
} from 'three'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

const PAGE_WIDTH = 1.24
const PAGE_HEIGHT = 1.68
const PAGE_DEPTH = 0.006
const PAGE_SEGMENTS = 24
const PAGE_SEGMENT_WIDTH = PAGE_WIDTH / PAGE_SEGMENTS
const COVER_OVERHANG = 0.07
const COVER_DEPTH = 0.048
const BOOK_WIDTH = PAGE_WIDTH * 2 + COVER_OVERHANG * 2
const BOOK_HEIGHT = PAGE_HEIGHT + COVER_OVERHANG * 2
const PAGE_TURN_DURATION = 0.62

const paperColor = new Color('#fffaf0')
const paperEdgeColor = new Color('#e2d5bc')
const coverColor = new Color('#254a33')
const brassColor = new Color('#af8437')

const pageGeometry = new BoxGeometry(
  PAGE_WIDTH,
  PAGE_HEIGHT,
  PAGE_DEPTH,
  PAGE_SEGMENTS,
  1,
  1,
)

pageGeometry.translate(PAGE_WIDTH / 2, 0, 0)

const vertex = new Vector3()
const skinIndexes: number[] = []
const skinWeights: number[] = []

for (
  let index = 0;
  index < pageGeometry.attributes.position.count;
  index += 1
) {
  vertex.fromBufferAttribute(pageGeometry.attributes.position, index)
  const segment = Math.min(
    PAGE_SEGMENTS - 1,
    Math.max(0, Math.floor(vertex.x / PAGE_SEGMENT_WIDTH)),
  )
  const segmentProgress = MathUtils.clamp(
    (vertex.x - segment * PAGE_SEGMENT_WIDTH) / PAGE_SEGMENT_WIDTH,
    0,
    1,
  )

  skinIndexes.push(segment, segment + 1, 0, 0)
  skinWeights.push(1 - segmentProgress, segmentProgress, 0, 0)
}

pageGeometry.setAttribute(
  'skinIndex',
  new Uint16BufferAttribute(skinIndexes, 4),
)
pageGeometry.setAttribute(
  'skinWeight',
  new Float32BufferAttribute(skinWeights, 4),
)

function easeInOutQuint(progress: number) {
  return progress < 0.5 ? 16 * progress ** 5 : 1 - (-2 * progress + 2) ** 5 / 2
}

function FixedMenuCamera() {
  const { camera, size } = useThree()

  useLayoutEffect(() => {
    const perspectiveCamera = camera as PerspectiveCamera
    const fov = 32
    const aspect = Math.max(size.width / size.height, 0.7)
    const distance = Math.max(
      3.8,
      Math.min(
        6.8,
        BOOK_WIDTH / 2.05 / (Math.tan((fov * Math.PI) / 360) * aspect),
      ),
    )

    perspectiveCamera.fov = fov
    perspectiveCamera.position.set(0, 0.05, distance)
    perspectiveCamera.lookAt(0, 0, 0)
    perspectiveCamera.updateProjectionMatrix()
  }, [camera, size.height, size.width])

  return null
}

function Hardcover() {
  const coverMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: coverColor,
        roughness: 0.48,
        metalness: 0.02,
        clearcoat: 0.05,
      }),
    [],
  )
  const trimMaterial = useMemo(
    () =>
      new MeshStandardMaterial({
        color: brassColor,
        roughness: 0.42,
        metalness: 0.52,
      }),
    [],
  )

  useEffect(
    () => () => {
      coverMaterial.dispose()
      trimMaterial.dispose()
    },
    [coverMaterial, trimMaterial],
  )

  const panelWidth = PAGE_WIDTH + COVER_OVERHANG * 2
  const panelOffset = PAGE_WIDTH / 2 + COVER_OVERHANG
  const trimWidth = panelWidth - 0.12
  const trimHeight = BOOK_HEIGHT - 0.12

  return (
    <group position-z={-0.055}>
      {[-1, 1].map((side) => (
        <group key={side} position-x={side * panelOffset}>
          <mesh castShadow receiveShadow material={coverMaterial}>
            <boxGeometry args={[panelWidth, BOOK_HEIGHT, COVER_DEPTH]} />
          </mesh>
          <group position-z={COVER_DEPTH / 2 + 0.002}>
            <mesh material={trimMaterial} position-y={trimHeight / 2}>
              <boxGeometry args={[trimWidth, 0.014, 0.008]} />
            </mesh>
            <mesh material={trimMaterial} position-y={-trimHeight / 2}>
              <boxGeometry args={[trimWidth, 0.014, 0.008]} />
            </mesh>
            <mesh material={trimMaterial} position-x={trimWidth / 2}>
              <boxGeometry args={[0.014, trimHeight, 0.008]} />
            </mesh>
            <mesh material={trimMaterial} position-x={-trimWidth / 2}>
              <boxGeometry args={[0.014, trimHeight, 0.008]} />
            </mesh>
          </group>
        </group>
      ))}
      <mesh castShadow receiveShadow material={coverMaterial}>
        <boxGeometry args={[0.11, BOOK_HEIGHT, COVER_DEPTH + 0.02]} />
      </mesh>
      <mesh material={trimMaterial} position-z={COVER_DEPTH / 2 + 0.008}>
        <boxGeometry args={[0.028, BOOK_HEIGHT - 0.14, 0.009]} />
      </mesh>
    </group>
  )
}

type LeafProps = {
  artwork: BookMenuPage
  index: number
  turnedLeaves: number
  reducedMotion: boolean
}

function MenuLeaf({ artwork, index, turnedLeaves, reducedMotion }: LeafProps) {
  const [frontTexture, backTexture] = useTexture([artwork.front, artwork.back])
  const group = useRef<Group>(null)
  const mesh = useRef<SkinnedMesh>(null)
  const invalidate = useThree((state) => state.invalidate)
  const targetRotation = index < turnedLeaves ? -Math.PI : 0
  const targetRotationRef = useRef(targetRotation)
  const animation = useRef({ from: targetRotation, startedAt: 0 })

  frontTexture.colorSpace = SRGBColorSpace
  backTexture.colorSpace = SRGBColorSpace
  frontTexture.anisotropy = 8
  backTexture.anisotropy = 8

  const skinnedPage = useMemo(() => {
    const bones: Bone[] = []

    for (let boneIndex = 0; boneIndex <= PAGE_SEGMENTS; boneIndex += 1) {
      const bone = new Bone()
      bone.position.x = boneIndex === 0 ? 0 : PAGE_SEGMENT_WIDTH
      if (boneIndex > 0) {
        bones[boneIndex - 1].add(bone)
      }
      bones.push(bone)
    }

    const skeleton = new Skeleton(bones)
    const materials = [
      new MeshStandardMaterial({ color: paperEdgeColor, roughness: 0.78 }),
      new MeshStandardMaterial({ color: paperEdgeColor, roughness: 0.78 }),
      new MeshStandardMaterial({ color: paperEdgeColor, roughness: 0.78 }),
      new MeshStandardMaterial({ color: paperEdgeColor, roughness: 0.78 }),
      new MeshPhysicalMaterial({
        color: paperColor,
        map: frontTexture,
        roughness: 0.68,
        clearcoat: 0.02,
        side: DoubleSide,
      }),
      new MeshPhysicalMaterial({
        color: paperColor,
        map: backTexture,
        roughness: 0.68,
        clearcoat: 0.02,
        side: DoubleSide,
      }),
    ]
    const page = new SkinnedMesh(pageGeometry, materials)
    page.add(bones[0])
    page.bind(skeleton)
    page.castShadow = true
    page.receiveShadow = true
    page.frustumCulled = false

    return page
  }, [backTexture, frontTexture])

  useEffect(
    () => () => {
      const materials = skinnedPage.material as MeshStandardMaterial[]
      materials.forEach((material) => material.dispose())
    },
    [skinnedPage],
  )

  useEffect(() => {
    if (!group.current || targetRotationRef.current === targetRotation) return

    animation.current = {
      from: group.current.rotation.y,
      startedAt: performance.now() / 1000,
    }
    targetRotationRef.current = targetRotation
    invalidate()
  }, [invalidate, targetRotation])

  useFrame((state) => {
    if (!group.current) return

    const elapsed = state.clock.elapsedTime - animation.current.startedAt
    const progress = reducedMotion
      ? 1
      : MathUtils.clamp(elapsed / PAGE_TURN_DURATION, 0, 1)
    const eased = easeInOutQuint(progress)
    const rotation = MathUtils.lerp(
      animation.current.from,
      targetRotation,
      eased,
    )
    const curl = reducedMotion ? 0 : Math.sin(progress * Math.PI)
    const direction = targetRotation < animation.current.from ? -1 : 1

    group.current.rotation.y = rotation

    const bones = skinnedPage.skeleton.bones
    for (let boneIndex = 0; boneIndex < bones.length; boneIndex += 1) {
      const boneProgress = boneIndex / (bones.length - 1)
      const spineCurve = Math.sin(boneProgress * Math.PI)
      const tipCurve = boneProgress ** 1.7

      bones[boneIndex].rotation.y = direction * curl * spineCurve * 0.22
      bones[boneIndex].rotation.z = direction * curl * tipCurve * 0.09
    }

    if (progress < 1) invalidate()
  })

  const isTurned = index < turnedLeaves
  const pageOffset = isTurned
    ? 0.012 + index * PAGE_DEPTH
    : 0.012 + (turnedLeaves - index) * PAGE_DEPTH

  return (
    <group ref={group} position-z={pageOffset}>
      <primitive object={skinnedPage} ref={mesh} />
    </group>
  )
}

type EdgeControlProps = {
  side: 'previous' | 'next'
  enabled: boolean
  onActivate: () => void
}

function PageEdgeControl({ side, enabled, onActivate }: EdgeControlProps) {
  const [hovered, setHovered] = useState(false)
  useCursor(hovered && enabled)
  const isNext = side === 'next'

  return (
    <mesh
      position={[isNext ? PAGE_WIDTH - 0.09 : -PAGE_WIDTH + 0.09, 0, 0.14]}
      onPointerEnter={(event) => {
        event.stopPropagation()
        if (enabled) setHovered(true)
      }}
      onPointerLeave={() => setHovered(false)}
      onClick={(event) => {
        event.stopPropagation()
        if (enabled) onActivate()
      }}
    >
      <planeGeometry args={[0.2, PAGE_HEIGHT * 0.92]} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  )
}

type BookSceneProps = {
  pages: BookMenuPage[]
  spread: number
  reducedMotion: boolean
  onReady: () => void
  onPrevious: () => void
  onNext: () => void
  onSwipeStart: (x: number) => void
  onSwipeEnd: (x: number) => void
}

function BookScene({
  pages,
  spread,
  reducedMotion,
  onReady,
  onPrevious,
  onNext,
  onSwipeStart,
  onSwipeEnd,
}: BookSceneProps) {
  useEffect(() => {
    onReady()
  }, [onReady])

  return (
    <>
      <FixedMenuCamera />
      <ambientLight intensity={1.25} />
      <directionalLight
        castShadow
        position={[-2.5, 3.5, 5]}
        intensity={2.35}
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-bias={-0.0002}
      />
      <group
        rotation-x={-0.07}
        onPointerDown={(event: ThreeEvent<PointerEvent>) =>
          onSwipeStart(event.nativeEvent.clientX)
        }
        onPointerUp={(event: ThreeEvent<PointerEvent>) =>
          onSwipeEnd(event.nativeEvent.clientX)
        }
      >
        <Hardcover />
        {pages.map((page, index) => (
          <MenuLeaf
            key={page.id}
            artwork={page}
            index={index}
            turnedLeaves={spread}
            reducedMotion={reducedMotion}
          />
        ))}
        <PageEdgeControl
          side="previous"
          enabled={spread > 0}
          onActivate={onPrevious}
        />
        <PageEdgeControl
          side="next"
          enabled={spread < pages.length}
          onActivate={onNext}
        />
      </group>
      <ContactShadows
        position={[0, -PAGE_HEIGHT / 2 - 0.1, -0.22]}
        rotation={[Math.PI / 2, 0, 0]}
        opacity={0.24}
        scale={4.2}
        blur={2.7}
        far={3}
        frames={1}
        color="#27402c"
      />
    </>
  )
}

export function BookMenu({ pages, className }: BookMenuProps) {
  const [spread, setSpread] = useState(0)
  const [isReady, setIsReady] = useState(false)
  const reducedMotion = useReducedMotion()
  const swipeStart = useRef<number | null>(null)
  const totalSpreads = pages.length + 1

  const goToPrevious = () => setSpread((current) => Math.max(current - 1, 0))
  const goToNext = () =>
    setSpread((current) => Math.min(current + 1, pages.length))

  const finishSwipe = (endX: number) => {
    if (swipeStart.current === null) return

    const distance = endX - swipeStart.current
    swipeStart.current = null

    if (Math.abs(distance) < 44) return
    if (distance > 0) goToPrevious()
    else goToNext()
  }

  return (
    <section
      aria-label="Interactive dining menu"
      className={cn('mx-auto w-full max-w-6xl', className)}
    >
      <div className="relative aspect-[4/5] overflow-hidden rounded-[1.5rem] border border-content-border/80 bg-[#f5f0e5] sm:aspect-[5/4] lg:aspect-[16/10]">
        {!isReady && (
          <div
            className="absolute inset-0 grid place-items-center bg-[#f5f0e5] text-sm text-primary-deep"
            role="status"
          >
            Preparing the menu…
          </div>
        )}
        <Canvas
          shadows
          frameloop="demand"
          dpr={[1, 1.5]}
          gl={{ antialias: true, powerPreference: 'high-performance' }}
          fallback={
            <div className="grid h-full place-items-center px-6 text-center text-sm text-primary-deep">
              The visual menu is unavailable on this device. Please use the menu
              controls or contact us for today&apos;s selection.
            </div>
          }
        >
          <BookScene
            pages={pages}
            spread={spread}
            reducedMotion={Boolean(reducedMotion)}
            onReady={() => setIsReady(true)}
            onPrevious={goToPrevious}
            onNext={goToNext}
            onSwipeStart={(x) => {
              swipeStart.current = x
            }}
            onSwipeEnd={finishSwipe}
          />
        </Canvas>
      </div>

      <div className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-3 text-sm text-primary-deep sm:gap-x-6">
        <Button
          type="button"
          variant="ghost"
          className="h-11 gap-2 px-3 text-primary-deep hover:bg-primary-100 hover:text-primary-800"
          onClick={goToPrevious}
          disabled={spread === 0}
        >
          <ChevronLeft className="size-4" aria-hidden="true" />
          Previous
        </Button>
        <output
          aria-live="polite"
          className="min-w-36 rounded-full border border-content-border bg-white px-4 py-2 text-center text-xs font-semibold uppercase tracking-[0.12em] text-primary-800"
        >
          Spread {spread + 1} of {totalSpreads}
        </output>
        <Button
          type="button"
          variant="ghost"
          className="h-11 gap-2 px-3 text-primary-deep hover:bg-primary-100 hover:text-primary-800"
          onClick={goToNext}
          disabled={spread === pages.length}
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
