import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ProgressProvider } from './context/ProgressContext'
import { AudioProvider } from './context/AudioContext'
import SpeakerButton from './components/SpeakerButton'

const Home     = lazy(() => import('./pages/Home'))
const Wonder   = lazy(() => import('./pages/Wonder'))
const Story    = lazy(() => import('./pages/Story'))
const Simulate = lazy(() => import('./pages/Simulate'))
const Play     = lazy(() => import('./pages/Play'))
const Reflect  = lazy(() => import('./pages/Reflect'))

function LoadingScreen() {
  return (
    <div style={{
      height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1a1030 0%, #2b1b4e 100%)',
      color: 'white', fontFamily: '"Baloo 2", sans-serif', fontSize: '1.5rem'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🦉</div>
        <div>Loading GraphQuest 360...</div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ProgressProvider>
      <AudioProvider>
        <BrowserRouter>
          <SpeakerButton />
          <Suspense fallback={<LoadingScreen />}>
            <Routes>
              <Route path="/"         element={<Home />} />
              <Route path="/wonder"   element={<Wonder />} />
              <Route path="/story"    element={<Story />} />
              <Route path="/simulate" element={<Simulate />} />
              <Route path="/play"     element={<Play />} />
              <Route path="/reflect"  element={<Reflect />} />
              <Route path="*"         element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AudioProvider>
    </ProgressProvider>
  )
}
