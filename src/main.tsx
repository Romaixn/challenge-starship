import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Canvas } from '@react-three/fiber'
import Experience from './Experience.tsx'

import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Canvas>
        <Experience />
    </Canvas>
  </StrictMode>,
)
