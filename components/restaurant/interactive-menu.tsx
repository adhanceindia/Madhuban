'use client'

import React, { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Loader } from '@react-three/drei'
import { MenuBook, menuPages } from './menu-book'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function InteractiveMenu() {
  const [page, setPage] = useState(0)

  const goToNextPage = () => {
    if (page < menuPages.length) {
      setPage((p) => p + 1)
    }
  }

  const goToPrevPage = () => {
    if (page > 0) {
      setPage((p) => p - 1)
    }
  }

  return (
    <div className="relative w-full h-[70vh] min-h-[500px] max-h-[800px] bg-neutral-100 rounded-2xl overflow-hidden border border-border shadow-inner">
      <Suspense fallback={null}>
        <Canvas shadows camera={{ position: [0, 2.5, 4], fov: 45 }}>
          {/* Lighting */}
          <Environment preset="studio" />
          <directionalLight
            position={[2, 5, 2]}
            intensity={2.5}
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-bias={-0.0001}
          />
          
          {/* Table Surface for Shadow */}
          <mesh position-y={-0.2} rotation-x={-Math.PI / 2} receiveShadow>
            <planeGeometry args={[10, 10]} />
            <shadowMaterial transparent opacity={0.25} />
          </mesh>

          {/* The Book */}
          {/* We position the book slightly adjusted to fit nicely in the frame */}
          <group position={[0, -0.2, 0.5]}>
            <MenuBook page={page} setPage={setPage} />
          </group>
        </Canvas>
      </Suspense>

      {/* Loading Overlay from drei */}
      <Loader />

      {/* UI Navigation Overlay */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6 pointer-events-none">
        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg pointer-events-auto h-12 w-12 hover:bg-white"
          onClick={goToPrevPage}
          disabled={page === 0}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg text-sm font-medium text-neutral-600 pointer-events-auto">
          Page {page} of {menuPages.length}
        </div>

        <Button
          variant="secondary"
          size="icon"
          className="rounded-full shadow-lg pointer-events-auto h-12 w-12 hover:bg-white"
          onClick={goToNextPage}
          disabled={page === menuPages.length}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      <div className="absolute top-6 left-6 pointer-events-none">
        <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-neutral-600">
          Tip: Click the edges of the book to flip pages.
        </div>
      </div>
    </div>
  )
}
