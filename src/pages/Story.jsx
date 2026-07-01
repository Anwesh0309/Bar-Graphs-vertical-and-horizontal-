import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PhaseStepper from '../components/PhaseStepper'
import BarGraph from '../components/BarGraph'
import { useAudio } from '../context/AudioContext'
import { useProgress } from '../context/ProgressContext'
import { storyPages } from '../data/storyContent'
import { narrationScripts } from '../utils/narration'

const SCENE_ILLUSTRATIONS = {
  'fruit-stall': {
    emoji: '🍎🥭🍈',
    bg: 'linear-gradient(135deg,rgba(255,107,107,0.15),rgba(255,217,61,0.10))',
    items: ['🍎','🍎','🥭','🥭','🍈','🛒','👩‍🦰'],
  },
  'drawing-axes': {
    emoji: '📏✏️📐',
    bg: 'linear-gradient(135deg,rgba(78,205,196,0.15),rgba(100,200,255,0.10))',
    items: ['📐','✏️','📏','📋'],
  },
  'bars-rising': {
    emoji: '📊📈🌟',
    bg: 'linear-gradient(135deg,rgba(168,85,247,0.15),rgba(245,166,35,0.10))',
    items: ['📊','📈','⬆️','🌟'],
  },
  'completed-graph': {
    emoji: '🎉📊🦉',
    bg: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(245,166,35,0.10))',
    items: ['🎉','🏆','🦉','📊','✅'],
  },
}

export default function Story() {
  const navigate = useNavigate()
  const { speak, stopAll } = useAudio()
  const { dispatch } = useProgress()
  const [page, setPage] = useState(0)
  const playedRef = useRef({})

  const current = storyPages[page]

  // Play narration ONLY when page changes and user triggered it
  const playPageAudio = (pg) => {
    const pageData = storyPages[pg]
    const key = `story.page${pg+1}`
    const scripts = narrationScripts.story[`page${pg+1}`]
    stopAll()
    if (scripts) speak(scripts)
    playedRef.current[pg] = true
  }

  useEffect(() => {
    // Play only on mount for page 0 automatically
    playPageAudio(0)
    return () => stopAll()
  }, [])

  const goToPage = (newPage) => {
    stopAll()
    setPage(newPage)
    // Play audio for the new page after navigation
    setTimeout(() => playPageAudio(newPage), 100)
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

  const ill = SCENE_ILLUSTRATIONS[current.scene] || SCENE_ILLUSTRATIONS['fruit-stall']
  const progress = ((page + 1) / storyPages.length) * 100

  return (
    <div className="page-frame">
      <PhaseStepper active="story" />

      {/* Progress bar */}
      <div style={{
        height:4, background:'rgba(255,255,255,0.1)', flexShrink:0,
      }}>
        <motion.div
          animate={{ width:`${progress}%` }}
          transition={{ duration:0.4 }}
          style={{ height:'100%', background:'linear-gradient(90deg,#F5A623,#FFC94A)' }}
        />
      </div>

      <div className="content-area" style={{
        alignItems:'center', justifyContent:'center',
        padding:'8px 12px', gap:'10px',
      }}>
        {/* Page dots */}
        <div style={{ display:'flex', gap:'6px', flexShrink:0 }}>
          {storyPages.map((_,i) => (
            <div key={i} style={{
              width: i===page ? 20 : 8, height:8,
              borderRadius:'50px',
              background: i===page ? '#F5A623' : i<page ? '#4ADE80' : 'rgba(255,255,255,0.2)',
              transition:'all 0.3s',
            }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={page}
            initial={{ opacity:0, x:30 }} animate={{ opacity:1, x:0 }}
            exit={{ opacity:0, x:-30 }}
            transition={{ duration:0.35 }}
            style={{
              width:'100%', maxWidth:560,
              background:'rgba(255,255,255,0.05)',
              border:'1px solid rgba(255,255,255,0.1)',
              borderRadius:'20px',
              overflow:'hidden',
              display:'flex', flexDirection:'column',
              flexShrink:0,
            }}
          >
            {/* Scene illustration */}
            <div style={{
              background: ill.bg,
              padding:'14px',
              display:'flex', flexDirection:'column', alignItems:'center', gap:'8px',
            }}>
              <div style={{
                fontSize:'1.4rem',
                display:'flex', gap:'6px', justifyContent:'center',
                flexWrap:'wrap',
              }}>
                {ill.items.map((em,i) => (
                  <motion.span key={i}
                    initial={{ opacity:0, y:-6 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ delay:i*0.08 }}
                    style={{ filter:'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}
                  >
                    {em}
                  </motion.span>
                ))}
              </div>

              {/* Show bar graph on pages 3 and 4 */}
              {current.data && (
                <div style={{
                  background:'rgba(0,0,0,0.3)', borderRadius:'12px', padding:'6px',
                }}>
                  <BarGraph
                    orientation="vertical"
                    categories={current.data}
                    scale={2}
                    maxValue={10}
                    animated={true}
                    showValues={true}
                    title={page===3 ? "Aunty Lin's Fruit Sales" : undefined}
                    compact={true}
                  />
                </div>
              )}
            </div>

            {/* Text */}
            <div style={{ padding:'12px 16px', display:'flex', flexDirection:'column', gap:'8px' }}>
              <div style={{
                fontFamily:'"Baloo 2"', fontWeight:700,
                fontSize:'clamp(0.9rem,2vw,1rem)', color:'white',
                lineHeight:1.5, textAlign:'center',
              }}>
                {current.text}
              </div>

              {/* Owl says */}
              <div style={{
                display:'flex', alignItems:'center', gap:'8px',
                background:'rgba(245,166,35,0.1)',
                border:'1px solid rgba(245,166,35,0.25)',
                borderRadius:'12px', padding:'8px 12px',
              }}>
                <span style={{ fontSize:'1.4rem', flexShrink:0 }}>🦉</span>
                <span style={{
                  fontFamily:'"Baloo 2"', fontWeight:700,
                  fontSize:'0.88rem', color:'#FFC94A', fontStyle:'italic',
                }}>{current.owlSays}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div style={{ display:'flex', gap:'10px', flexShrink:0, alignItems:'center' }}>
          <button
            onClick={handleBack}
            style={{
              background:'rgba(255,255,255,0.08)',
              border:'2px solid rgba(255,255,255,0.15)',
              borderRadius:'50px', padding:'10px 20px',
              fontFamily:'"Baloo 2"', fontWeight:700,
              fontSize:'0.95rem', color:'white',
              cursor:'pointer', transition:'all 0.2s',
            }}
          >
            ← Back
          </button>

          <div style={{
            fontFamily:'"Baloo 2"', fontWeight:700,
            color:'rgba(255,255,255,0.5)', fontSize:'0.85rem',
          }}>
            {page+1} / {storyPages.length}
          </div>

          <motion.button
            whileHover={{ scale:1.04 }} whileTap={{ scale:0.97 }}
            onClick={handleNext}
            style={{
              background:'linear-gradient(135deg,#F5A623,#FFC94A)',
              border:'none', borderRadius:'50px',
              padding:'10px 22px',
              fontFamily:'"Baloo 2"', fontWeight:800,
              fontSize:'0.95rem', color:'#1a1030',
              cursor:'pointer',
              boxShadow:'0 4px 16px rgba(245,166,35,0.4)',
            }}
          >
            {page < storyPages.length - 1 ? 'Next →' : 'Start Exploring →'}
          </motion.button>
        </div>
      </div>
    </div>
  )
}
