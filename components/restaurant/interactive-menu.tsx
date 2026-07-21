'use client'

import React, { useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { Environment, Loader, ContactShadows } from '@react-three/drei'
import { MenuBook, menuPages } from './menu-book'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function InteractiveMenu() {
  const [page, setPage] = useState(0)
  const [hasInteracted, setHasInteracted] = useState(false)

  const goToNextPage = () => {
    setHasInteracted(true)
    if (page < menuPages.length) {
      setPage((p) => p + 1)
    }
  }

  const goToPrevPage = () => {
    setHasInteracted(true)
    if (page > 0) {
      setPage((p) => p - 1)
    }
  }

  const handleBookClick = (newPage: number) => {
    setHasInteracted(true)
    setPage(newPage)
  }

  return (
    <div className="relative w-full max-w-6xl mx-auto aspect-square sm:aspect-[4/3] lg:aspect-[16/10] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#fffefa] to-[#f4f1e1] rounded-2xl overflow-hidden border border-[#e8e4d3] shadow-sm">
      <Suspense fallback={null}>
        <Canvas shadows camera={{ position: [-0.5, 1, 4], fov: 45 }}>
          <group position-y={0}>
            {/* Lighting from original repo */}
            <Environment preset="studio" />
            <directionalLight
              position={[2, 5, 2]}
              intensity={2.5}
              castShadow
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
              shadow-bias={-0.0001}
            />
            
            {/* Shadow plane from original repo */}
            <mesh position-y={-1.5} rotation-x={-Math.PI / 2} receiveShadow>
              <planeGeometry args={[100, 100]} />
              <shadowMaterial transparent opacity={0.2} />
            </mesh>

            {/* The Book (Stationary but tilted like the original Float) */}
            <group rotation-x={-Math.PI / 4}>
              <MenuBook page={page} setPage={handleBookClick} />
            </group>
          </group>
        </Canvas>
      </Suspense>

      {/* Loading Overlay from drei */}
      <Loader />

      {/* UI Navigation Overlay */}
      <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-8 pointer-events-none z-10">
        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-md pointer-events-auto h-12 w-12 border-[#e8e4d3] bg-white text-primary-deep hover:bg-gold hover:text-white hover:border-gold transition-colors duration-300"
          onClick={goToPrevPage}
          disabled={page === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        
        <div className="bg-white/90 backdrop-blur-md px-6 py-2.5 rounded-full shadow-md border border-[#e8e4d3] text-sm font-semibold tracking-wider uppercase text-primary-deep pointer-events-auto">
          Page {page} of {menuPages.length}
        </div>

        <Button
          variant="outline"
          size="icon"
          className="rounded-full shadow-md pointer-events-auto h-12 w-12 border-[#e8e4d3] bg-white text-primary-deep hover:bg-gold hover:text-white hover:border-gold transition-colors duration-300"
          onClick={goToNextPage}
          disabled={page === menuPages.length}
        >
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {!hasInteracted && (
        <div className="absolute top-10 left-0 right-0 flex justify-center pointer-events-none z-10">
          <div className="animate-pulse bg-primary-deep/90 backdrop-blur-md px-6 py-3 rounded-full shadow-lg text-sm font-medium tracking-wide text-white">
            Turn the pages to explore our dining menu
          </div>
        </div>
      )}
    </div>
  )
}
