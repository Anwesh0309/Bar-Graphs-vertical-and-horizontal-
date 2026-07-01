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
    <div className="page-frame">
      <PhaseStepper active="story" />

      {/* Progress bar */}
      <div style={{ height: 5, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.4 }}
          style={{ height: '100%', background: 'linear-gradient(90deg,#F5A623,#FFC94A)', borderRadius: 3 }}
        />
      </div>

      {/* Main content — fixed height, NO scroll */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'flex-start',
        padding: '10px 14px 8px', gap: '8px', overflow: 'hidden',
      }}>
        {/* Page dots */}
        <div style={{ display: 'flex', gap: '7px', flexShrink: 0 }}>
          {storyPages.map((_, i) => (
            <div key={i} style={{
              width: i === page ? 22 : 9, height: 9,
              borderRadius: 50,
              background: i === page ? '#F5A623' : i < page ? '#4ADE80' : 'rgba(255,255,255,0.2)',
              transition: 'all 0.3s',
            }} />
          ))}
        </div>

        {/* Story card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.32 }}
            style={{
              width: '100%', maxWidth: 580,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 22,
              overflow: 'hidden',
              display: 'flex', flexDirection: 'column',
              flexShrink: 0,
            }}
          >
            {/* Illustration area */}
            <div style={{
              background: sceneBg,
              padding: '16px 20px 12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '16px', flexShrink: 0,
            }}>
              {/* Big emoji */}
              <span style={{
                fontSize: 'clamp(2.5rem,6vw,3.5rem)',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))',
              }}>{ill.big}</span>

              {/* Item emojis */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: 180 }}>
                {ill.items.map((em, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    style={{ fontSize: 'clamp(1.2rem,3vw,1.6rem)' }}
                  >{em}</motion.span>
                ))}
              </div>

              {/* Bar graph on pages 3 and 4 */}
              {current.data && (
                <div style={{
                  background: 'rgba(0,0,0,0.35)',
                  borderRadius: 14, padding: '6px 8px', flexShrink: 0,
                }}>
                  <BarGraph
                    orientation="vertical"
                    categories={current.data}
                    scale={2}
                    maxValue={10}
                    animated={true}
                    showValues={true}
                    title={page === 3 ? "Aunty Lin's Sales" : undefined}
                    compact={true}
                  />
                </div>
              )}
            </div>

            {/* Text area */}
            <div style={{
              padding: '14px 20px 12px',
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              {/* Page label */}
              <div style={{
                fontFamily: '"Baloo 2"', fontWeight: 800,
                fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>Page {page + 1} of {storyPages.length} — {current.title}</div>

              {/* Main story text — LARGE & BOLD */}
              <div style={{
                fontFamily: '"Baloo 2"', fontWeight: 800,
                fontSize: 'clamp(1rem,2.4vw,1.2rem)',
                color: '#ffffff', lineHeight: 1.55,
                textAlign: 'center',
              }}>
                {current.text}
              </div>

              {/* Owl says */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                background: 'rgba(245,166,35,0.12)',
                border: '1.5px solid rgba(245,166,35,0.3)',
                borderRadius: 14, padding: '10px 14px',
              }}>
                <span style={{ fontSize: '1.6rem', flexShrink: 0 }}>🦉</span>
                <span style={{
                  fontFamily: '"Baloo 2"', fontWeight: 700,
                  fontSize: 'clamp(0.88rem,2vw,1rem)',
                  color: '#FFC94A', fontStyle: 'italic', lineHeight: 1.4,
                }}>{current.owlSays}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{
          display: 'flex', gap: '12px', flexShrink: 0, alignItems: 'center',
        }}>
          <button
            onClick={handleBack}
            style={{
              background: 'rgba(255,255,255,0.09)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: 50, padding: '10px 22px',
              fontFamily: '"Baloo 2"', fontWeight: 700,
              fontSize: 'clamp(0.9rem,2vw,1rem)', color: 'white',
              cursor: 'pointer',
            }}
          >← Back</button>

          <div style={{
            fontFamily: '"Baloo 2"', fontWeight: 800,
            color: 'rgba(255,255,255,0.45)',
            fontSize: '0.9rem',
          }}>
            {page + 1} / {storyPages.length}
          </div>

          <motion.button
            whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
            onClick={handleNext}
            style={{
              background: 'linear-gradient(135deg,#F5A623,#FFC94A)',
              border: 'none', borderRadius: 50, padding: '10px 24px',
              fontFamily: '"Baloo 2"', fontWeight: 900,
              fontSize: 'clamp(0.9rem,2vw,1rem)', color: '#1a1030',
              cursor: 'pointer', boxShadow: '0 4px 16px rgba(245,166,35,0.4)',
            }}
          >
            {page < storyPages.length - 1 ? 'Next →' : 'Start Exploring →'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
