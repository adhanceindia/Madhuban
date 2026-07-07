'use client';
import { useEffect } from 'react';

/** Dev-only: connect Reticle + install the React adapter, after hydration. */
export function ReticleDev() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void import('@reticlehq/core').then((mod: any) => {
      if (mod.install) mod.install();
      if (mod.reticle) mod.reticle.connect({ url: 'ws://localhost:3000/reticle', projectId: 'madhuban-garden-9f2c5c44' });
    });
  }, []);
  return null;
}
