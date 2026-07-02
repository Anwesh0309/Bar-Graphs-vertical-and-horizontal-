import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PhaseStepper from '../components/PhaseStepper'
import BarGraph from '../components/BarGraph'
import { useAudio } from '../context/AudioContext'
import { useProgress } from '../context/ProgressContext'
import { storyPages } from '../data/storyContent'
import { narrationScripts } from '../utils/narration'

const SCENE_BG = {
  'fruit-stall':    'linear-gradient(135deg,rgba(255,107,107,0.2),rgba(255,217,61,0.12))',
  'drawing-axes':   'linear-gradient(135deg,rgba(78,205,196,0.2),rgba(100,200,255,0.12))',
  'bars-rising':    'linear-gradient(135deg,rgba(168,85,247,0.2),rgba(245,166,35,0.12))',
  'completed-graph':'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(74,222,128,0.1))',
}

const SCENE_EMOJI = {
  'fruit-stall':    { items: ['🍎','🥭','🍈','🛒','👩‍🦰','🧺'], big: '🛍️' },
  'drawing-axes':   { items: ['📏','✏️','📐','📋','🔢'], big: '📊' },
  'bars-rising':    { items: ['📊','📈','⬆️','🌟','✨'], big: '📈' },
  'completed-graph':{ items: ['🎉','🏆','✅','😊','📊'], big: '🏆' },
}

export default function Story() {
  const navigate = useNavigate()
  const { speak, stopAll } = useAudio()
  const { dispatch } = useProgress()
  const [page, setPage] = useState(0)
  const current = storyPages[page]
  const ill = SCENE_EMOJI[current.scene] || SCENE_EMOJI['fruit-stall']
  const sceneBg = SCENE_BG[current.scene] || SCENE_BG['fruit-stall']
  const progress = ((page + 1) / storyPages.length) * 100

  const playPageAudio = (pg) => {
    const scripts = narrationScripts.story[`page${pg + 1}`]
    stopAll()
    if (scripts) speak(scripts)
  }

  useEffect(() => {
    playPageAudio(0)
    return () => stopAll()
  }, [])

  const goToPage = (newPage) => {
    stopAll()
    setPage(newPage)
    setTimeout(() => playPageAudio(newPage), 80)
  }

  const handleNext = () => {
    if (page < storyPages.length - 1) {
      goToPage(page + 1)
    } else {
      stopAll()
      dispatch({ type: 'COMPLETE_PHASE', phase: 'story' })
      navigate('/simulate')
    }
  }

  const handleBack = () => {
    if (page > 0) goToPage(page - 1)
    else { stopAll(); navigate('/wonder') }
  }

  return (
    <div className="page-frame" style={{ 
      background: 'linear-gradient(135deg, #1b103c 0%, #291b5c 100%)',
      fontFamily: '"Poppins", sans-serif'
    }}>
      <PhaseStepper active="story" />

      {/* Progress bar */}
      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', background: 'linear-gradient(90deg,#F5A623,#FFC94A)', borderRadius: 3 }}
        />
      </div>

      {/* Main content */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '24px 20px', gap: '24px', overflow: 'hidden',
      }}>
        
        {/* Story card - Two column layout */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.35 }}
            style={{
              width: '100%', maxWidth: 850, height: '420px',
              background: '#241a4a', // Dark interior like screenshot
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'row',
              flexShrink: 0,
              boxShadow: '0 12px 32px rgba(0,0,0,0.4)',
            }}
          >
            {/* Left side: Illustration */}
            <div style={{
              flex: '1.2', // Slightly wider left side
              position: 'relative',
              background: sceneBg,
              overflow: 'hidden'
            }}>
              {current.image && (
                <img 
                  src={current.image} 
                  alt={current.title}
                  style={{
                    width: '100%', height: '100%', objectFit: 'cover'
                  }}
                />
              )}
              {/* Fallback emoji if no image */}
              {!current.image && (
                <div style={{
                  width: '100%', height: '100%', display: 'flex', 
                  alignItems: 'center', justifyContent: 'center', fontSize: '6rem'
                }}>
                  {ill.big}
                </div>
              )}
            </div>

            {/* Right side: Text area */}
            <div style={{
              flex: '1',
              padding: '32px 32px 32px 24px',
              display: 'flex', flexDirection: 'column',
              justifyContent: 'center',
            }}>
              
              {/* Title */}
              <h2 style={{
                fontFamily: '"Baloo 2", sans-serif', fontWeight: 800,
                fontSize: '2rem', color: '#FFC94A', 
                margin: '0 0 16px 0', lineHeight: 1.2,
                textShadow: '0 2px 4px rgba(0,0,0,0.3)'
              }}>
                {current.title}
              </h2>

              {/* Main story text */}
              <div style={{
                fontFamily: '"Poppins", sans-serif', fontWeight: 400,
                fontSize: '1.05rem',
                color: 'rgba(255,255,255,0.75)', lineHeight: 1.6,
                marginBottom: '28px'
              }}>
                {current.text}
              </div>

              {/* Interactive prompt button (simulate the long button) */}
              <motion.button 
                whileHover={{ scale: 1.02 }}
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  border: '1.5px solid rgba(255,166,50,0.3)',
                  borderRadius: 12, padding: '12px 16px',
                  fontFamily: '"Baloo 2", sans-serif', fontWeight: 700,
                  fontSize: '1.1rem', color: '#FFC94A',
                  cursor: 'pointer', textAlign: 'center',
                  marginBottom: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                }}
              >
                ✨ "Let's explore this!" ✨
              </motion.button>

              {/* Owl says (Speech bubble) */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '12px', marginTop: 'auto'
              }}>
                <div style={{
                  width: 48, height: 48, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #F5A623, #FFC94A)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem', flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(245,166,35,0.3)'
                }}>
                  🦉
                </div>
                <div style={{
                  background: 'white',
                  borderRadius: '16px 16px 16px 4px',
                  padding: '12px 16px',
                  position: 'relative'
                }}>
                  <span style={{
                    fontFamily: '"Poppins", sans-serif', fontWeight: 500,
                    fontSize: '0.9rem', color: '#333', lineHeight: 1.4,
                  }}>{current.owlSays}</span>
                </div>
              </div>

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation bottom bar */}
        <div style={{
          width: '100%', maxWidth: 850,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: '8px'
        }}>
          {/* Back button */}
          <button
            onClick={handleBack}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 50, padding: '10px 24px',
              fontFamily: '"Poppins", sans-serif', fontWeight: 500,
              fontSize: '0.95rem', color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)', e.currentTarget.style.color = '#fff' }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'transparent', e.currentTarget.style.color = 'rgba(255,255,255,0.7)' }}
          >‹ Back</button>

          {/* Page dots */}
          <div style={{ display: 'flex', gap: '8px' }}>
            {storyPages.map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8,
                borderRadius: '50%',
                background: i === page ? '#FFC94A' : 'rgba(255,255,255,0.2)',
                transition: 'all 0.3s',
                transform: i === page ? 'scale(1.2)' : 'none'
              }} />
            ))}
          </div>

          {/* Next button */}
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            style={{
              background: 'linear-gradient(135deg,#F5A623,#FFC94A)',
              border: 'none', borderRadius: 50, padding: '10px 28px',
              fontFamily: '"Poppins", sans-serif', fontWeight: 600,
              fontSize: '0.95rem', color: '#1a1030',
              cursor: 'pointer', boxShadow: '0 4px 12px rgba(245,166,35,0.25)',
            }}
          >
            {page < storyPages.length - 1 ? 'Next ›' : 'Start ›'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
