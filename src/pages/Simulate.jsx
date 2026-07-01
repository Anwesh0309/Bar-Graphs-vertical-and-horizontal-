import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PhaseStepper from '../components/PhaseStepper'
import MascotBubble from '../components/MascotBubble'
import BarBuilder from '../components/BarBuilder'
import ScaleSlider from '../components/ScaleSlider'
import OrientationFlip from '../components/OrientationFlip'
import SpotError from '../components/SpotError'
import { useAudio } from '../context/AudioContext'
import { useProgress } from '../context/ProgressContext'
import { narrationScripts } from '../utils/narration'

const TABS = [
  { id: 'builder',     icon: '🧱', label: 'Bar Builder',      hint: 'Drag each bar to match the data table!' },
  { id: 'scale',       icon: '📏', label: 'Scale Slider',     hint: 'See how scale changes the graph look!' },
  { id: 'orientation', icon: '🔄', label: 'Orientation Flip', hint: 'Same data — vertical or horizontal!' },
  { id: 'error',       icon: '🔎', label: 'Spot the Error',   hint: 'Find the mistake in the graph!' },
]

const DATASETS = [
  [
    { label:'Cats',    value:6, color:'#FF6B6B' },
    { label:'Dogs',    value:9, color:'#FFD93D' },
    { label:'Birds',   value:4, color:'#6BCB77' },
    { label:'Fish',    value:7, color:'#4D96FF' },
  ],
  [
    { label:'Red',     value:8, color:'#FF6B6B' },
    { label:'Blue',    value:5, color:'#4D96FF' },
    { label:'Green',   value:10, color:'#6BCB77' },
    { label:'Yellow',  value:3, color:'#FFD93D' },
  ],
  [
    { label:'Mon',     value:7, color:'#C77DFF' },
    { label:'Tue',     value:4, color:'#FF9F43' },
    { label:'Wed',     value:9, color:'#00D2FF' },
    { label:'Thu',     value:6, color:'#FF6B9D' },
  ],
]

function getDataset(idx) {
  return DATASETS[idx % DATASETS.length]
}

export default function Simulate() {
  const navigate = useNavigate()
  const { speak, stopAll } = useAudio()
  const { dispatch } = useProgress()
  const [activeTab, setActiveTab] = useState('builder')
  const [dataIdx, setDataIdx] = useState(0)

  const dataset = getDataset(dataIdx)

  const handleNewData = useCallback(() => {
    setDataIdx(i => i + 1)
  }, [])

  const handleTabChange = (tabId) => {
    stopAll()
    setActiveTab(tabId)
    const scripts = {
      builder: narrationScripts.simulate.barBuilder,
      scale: narrationScripts.simulate.scaleSlider,
      orientation: narrationScripts.simulate.orientation,
      error: narrationScripts.simulate.spotError,
    }
    if (scripts[tabId]) speak(scripts[tabId])
  }

  React.useEffect(() => {
    speak(narrationScripts.simulate.welcome)
    return () => stopAll()
  }, [])

  const handleContinue = () => {
    stopAll()
    dispatch({ type: 'COMPLETE_PHASE', phase: 'simulate' })
    navigate('/play')
  }

  const owlMessages = {
    builder: 'Drag each bar up or down to match the data! 🧱',
    scale: 'Watch the bars change as you move the scale slider! 📏',
    orientation: 'Toggle the switch to flip between vertical and horizontal! 🔄',
    error: 'One bar in this graph is wrong — can you find it? 🔎',
  }

  return (
    <div className="page-frame">
      <PhaseStepper active="simulate" />
      <div className="content-area" style={{
        padding: '8px 12px', gap: '8px',
        alignItems: 'center', justifyContent: 'flex-start',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%', maxWidth: 600, flexShrink: 0,
        }}>
          <div>
            <h2 style={{
              fontFamily: '"Baloo 2"', fontWeight: 800,
              fontSize: 'clamp(1rem,2.5vw,1.3rem)', color: 'white', margin: 0,
            }}>✏️ Simulate</h2>
            <p style={{
              fontFamily: '"Poppins"', fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.55)', margin: 0,
            }}>Explore — no wrong answers here!</p>
          </div>
          <MascotBubble message={owlMessages[activeTab]} size="sm" />
        </div>

        {/* Tab bar */}
        <div style={{
          display: 'flex', gap: '6px', flexShrink: 0,
          overflowX: 'auto', width: '100%', maxWidth: 600,
          paddingBottom: '2px',
        }} className="no-scrollbar">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '5px',
                padding: '7px 14px',
                borderRadius: '50px', border: 'none', cursor: 'pointer',
                fontFamily: '"Baloo 2"', fontWeight: 700, fontSize: '0.78rem',
                whiteSpace: 'nowrap', flexShrink: 0,
                transition: 'all 0.2s',
                background: activeTab === tab.id
                  ? 'linear-gradient(135deg,#F5A623,#FFC94A)'
                  : 'rgba(255,255,255,0.08)',
                color: activeTab === tab.id ? '#1a1030' : 'rgba(255,255,255,0.7)',
                boxShadow: activeTab === tab.id
                  ? '0 2px 12px rgba(245,166,35,0.4)' : 'none',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div style={{
          flex: 1,
          width: '100%', maxWidth: 600,
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '20px', padding: '14px',
          overflow: 'hidden',
          display: 'flex', flexDirection: 'column',
          position: 'relative',
        }}>
          <div style={{
            fontFamily: '"Baloo 2"', fontWeight: 700, fontSize: '0.78rem',
            color: 'rgba(255,255,255,0.5)', marginBottom: '10px', flexShrink: 0,
          }}>
            💡 {TABS.find(t=>t.id===activeTab)?.hint}
          </div>

          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab + dataIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                style={{ width: '100%', display: 'flex', justifyContent: 'center' }}
              >
                {activeTab === 'builder' && (
                  <BarBuilder dataset={dataset} scale={1} onNewData={handleNewData} />
                )}
                {activeTab === 'scale' && (
                  <ScaleSlider dataset={dataset} onNewData={handleNewData} />
                )}
                {activeTab === 'orientation' && (
                  <OrientationFlip dataset={dataset} scale={1} onNewData={handleNewData} />
                )}
                {activeTab === 'error' && (
                  <SpotError onNewData={handleNewData} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
          <button
            onClick={() => { stopAll(); navigate('/story') }}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '2px solid rgba(255,255,255,0.15)',
              borderRadius: '50px', padding: '9px 20px',
              fontFamily: '"Baloo 2"', fontWeight: 700, fontSize: '0.9rem',
              color: 'white', cursor: 'pointer',
            }}
          >
            ← Story
          </button>
          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={handleContinue}
            style={{
              background: 'linear-gradient(135deg,#F5A623,#FFC94A)',
              border: 'none', borderRadius: '50px', padding: '9px 24px',
              fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '0.9rem',
              color: '#1a1030', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(245,166,35,0.4)',
            }}
          >
            Play! 🎮 →
          </motion.button>
        </div>
      </div>
    </div>
  )
}
