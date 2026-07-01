import React, { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PhaseStepper from '../components/PhaseStepper'
import { useAudio } from '../context/AudioContext'
import { useProgress } from '../context/ProgressContext'
import { worlds } from '../data/worlds'
import { narrationScripts, getReflectNarration } from '../utils/narration'

function CircleRing({ percent }) {
  const r = 52, cx = 64, cy = 64
  const circ = 2 * Math.PI * r
  const dash = (percent / 100) * circ
  return (
    <svg width={128} height={128} style={{ overflow: 'visible' }}>
      <circle cx={cx} cy={cy} r={r} fill="none"
        stroke="rgba(255,255,255,0.1)" strokeWidth={8} />
      <motion.circle
        cx={cx} cy={cy} r={r} fill="none"
        stroke="url(#ringGrad)" strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.2, ease: 'easeOut', delay: 0.3 }}
        style={{ transformOrigin: `${cx}px ${cy}px`, transform: 'rotate(-90deg)' }}
      />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F5A623" />
          <stop offset="100%" stopColor="#FFC94A" />
        </linearGradient>
      </defs>
      <text x={cx} y={cy - 8} textAnchor="middle"
        fill="#F5A623" fontFamily='"Baloo 2"' fontWeight="800" fontSize="20">
        {percent}%
      </text>
      <text x={cx} y={cy + 10} textAnchor="middle"
        fill="rgba(255,255,255,0.6)" fontFamily='"Baloo 2"' fontWeight="600" fontSize="11">
        Score
      </text>
    </svg>
  )
}

function Stars({ n }) {
  return (
    <div style={{ display: 'flex', gap: '3px' }}>
      {[0,1,2].map(i => (
        <span key={i} style={{ fontSize: '0.9rem', opacity: i < n ? 1 : 0.2 }}>⭐</span>
      ))}
    </div>
  )
}

export default function Reflect() {
  const navigate = useNavigate()
  const { speak, stopAll } = useAudio()
  const { state, dispatch } = useProgress()
  const confettiRef = useRef(false)

  // Compute totals
  const worldStats = state.worldStats || {}
  const playedWorlds = worlds.filter(w => worldStats[w.id])
  const totalCorrect = playedWorlds.reduce((s, w) => s + (worldStats[w.id]?.correct || 0), 0)
  const totalQuestions = playedWorlds.reduce((s, w) => s + (worldStats[w.id]?.total || 0), 0)
  const pct = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0
  const worldsMastered = worlds.filter(w => (state.starsByWorld[w.id] || 0) === 3).length

  const owlMsg = pct >= 90
    ? 'Outstanding! You\'re a true Data Detective! 🕵️📊'
    : pct >= 60
    ? 'Great progress! A little more practice and you\'ll master every bar! 📈'
    : 'Good start! Let\'s revisit the Story and Simulate to build confidence. 🌱'

  useEffect(() => {
    dispatch({ type: 'COMPLETE_PHASE', phase: 'reflect' })

    // Confetti
    if (!confettiRef.current && pct > 0) {
      confettiRef.current = true
      import('canvas-confetti').then(({ default: confetti }) => {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.5 }, colors: ['#F5A623','#FFC94A','#4ADE80','#60A5FA','#E85D8C'] })
      }).catch(() => {})
    }

    const script = [
      ...narrationScripts.reflect.complete,
      ...getReflectNarration(pct),
    ]
    speak(script)
    return () => stopAll()
  }, [])

  const handlePlayAgain = () => {
    stopAll()
    dispatch({ type: 'RESET_ALL' })
    navigate('/')
  }

  const handleHome = () => {
    stopAll()
    navigate('/')
  }

  return (
    <div className="page-frame">
      <PhaseStepper active="reflect" />
      <div className="content-area" style={{
        padding: '8px 12px', gap: '8px',
        alignItems: 'center', justifyContent: 'flex-start',
        overflow: 'hidden',
      }}>
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', flexShrink: 0 }}
        >
          <h2 style={{
            fontFamily: '"Baloo 2"', fontWeight: 800,
            fontSize: 'clamp(1rem,2.5vw,1.3rem)', color: 'white', margin: '0 0 2px',
          }}>🏆 Journey Complete! You finished all 5 phases!</h2>
        </motion.div>

        {/* Score + Owl row */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}
          style={{
            display: 'flex', alignItems: 'center', gap: '16px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(245,166,35,0.3)',
            borderRadius: '20px', padding: '12px 20px',
            width: '100%', maxWidth: 560, flexShrink: 0,
            flexWrap: 'wrap', justifyContent: 'center',
          }}
        >
          <CircleRing percent={pct} />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '2rem' }}>🦉</span>
              <span style={{
                fontFamily: '"Baloo 2"', fontWeight: 700,
                fontSize: 'clamp(0.8rem,1.8vw,0.95rem)', color: '#FFC94A',
                maxWidth: 220, lineHeight: 1.4,
              }}>{owlMsg}</span>
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {[
                { label: 'XP Earned', value: state.xp + ' XP', icon: '⭐' },
                { label: 'Max Streak', value: state.maxStreak, icon: '🔥' },
                { label: 'Worlds Mastered', value: `${worldsMastered}/10`, icon: '🏆' },
              ].map(stat => (
                <div key={stat.label} style={{
                  background: 'rgba(255,255,255,0.07)',
                  borderRadius: '10px', padding: '6px 10px',
                  textAlign: 'center', minWidth: 70,
                }}>
                  <div style={{ fontSize: '1rem' }}>{stat.icon}</div>
                  <div style={{
                    fontFamily: '"Baloo 2"', fontWeight: 800,
                    fontSize: '0.95rem', color: '#F5A623',
                  }}>{stat.value}</div>
                  <div style={{
                    fontFamily: '"Poppins"', fontSize: '0.6rem',
                    color: 'rgba(255,255,255,0.5)',
                  }}>{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* World-by-world scoreboard */}
        <motion.div
          initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          style={{
            width: '100%', maxWidth: 560, flexShrink: 0,
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '16px', overflow: 'hidden',
          }}
        >
          <div style={{
            padding: '8px 14px',
            background: 'rgba(245,166,35,0.1)',
            fontFamily: '"Baloo 2"', fontWeight: 800,
            fontSize: '0.8rem', color: '#FFC94A',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            letterSpacing: '0.05em',
          }}>
            📊 WORLD SCOREBOARD
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0' }}>
            {worlds.map((world, i) => {
              const ws = worldStats[world.id]
              const stars = state.starsByWorld[world.id] || 0
              const played = !!ws
              return (
                <motion.div
                  key={world.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.04 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '7px 12px',
                    borderBottom: i < worlds.length - 2 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    borderRight: i % 2 === 0 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                    opacity: played ? 1 : 0.35,
                  }}
                >
                  <span style={{ fontSize: '1rem' }}>{world.icon}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: '"Baloo 2"', fontWeight: 700,
                      fontSize: '0.7rem', color: 'white',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}>{world.name}</div>
                    {played ? (
                      <div style={{
                        fontFamily: '"Baloo 2"', fontSize: '0.65rem',
                        color: 'rgba(255,255,255,0.5)',
                      }}>{ws.correct}/{ws.total}</div>
                    ) : (
                      <div style={{ fontFamily: '"Baloo 2"', fontSize: '0.6rem', color: 'rgba(255,255,255,0.3)' }}>
                        🔒 Locked
                      </div>
                    )}
                  </div>
                  {played && <Stars n={stars} />}
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* CTA buttons */}
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ display: 'flex', gap: '10px', flexShrink: 0, flexWrap: 'wrap', justifyContent: 'center' }}
        >
          <button
            onClick={handleHome}
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '2px solid rgba(255,255,255,0.2)',
              borderRadius: '50px', padding: '10px 24px',
              fontFamily: '"Baloo 2"', fontWeight: 800,
              fontSize: '0.95rem', color: 'white', cursor: 'pointer',
            }}
          >🏠 Home</button>
          <motion.button
            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
            onClick={handlePlayAgain}
            style={{
              background: 'linear-gradient(135deg,#F5A623,#FFC94A)',
              border: 'none', borderRadius: '50px',
              padding: '10px 24px',
              fontFamily: '"Baloo 2"', fontWeight: 800,
              fontSize: '0.95rem', color: '#1a1030', cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(245,166,35,0.4)',
            }}
          >🔁 Play Again</motion.button>
        </motion.div>
      </div>
    </div>
  )
}
