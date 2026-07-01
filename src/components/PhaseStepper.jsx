import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'

const PHASES = [
  { key: 'wonder',   label: 'Wonder',   icon: '🔎', route: '/wonder' },
  { key: 'story',    label: 'Story',    icon: '📖', route: '/story' },
  { key: 'simulate', label: 'Simulate', icon: '✏️', route: '/simulate' },
  { key: 'play',     label: 'Play',     icon: '🎮', route: '/play' },
  { key: 'reflect',  label: 'Reflect',  icon: '📋', route: '/reflect' },
]

export default function PhaseStepper({ active }) {
  const navigate = useNavigate()
  const { state } = useProgress()
  const completed = state.completedPhases || []

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '10px 16px 6px',
      gap: '0',
      background: 'rgba(0,0,0,0.3)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      flexShrink: 0,
    }}>
      {PHASES.map((phase, i) => {
        const isDone = completed.includes(phase.key)
        const isActive = phase.key === active
        const isLocked = !isDone && !isActive

        return (
          <React.Fragment key={phase.key}>
            <button
              onClick={() => { if (!isLocked) navigate(phase.route) }}
              disabled={isLocked}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '2px',
                background: 'none',
                border: 'none',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                padding: '4px 8px',
                opacity: isLocked ? 0.4 : 1,
              }}
              aria-label={`Phase ${i+1}: ${phase.label}${isDone?' (completed)':isActive?' (active)':' (locked)'}`}
            >
              <div style={{
                width: 34, height: 34,
                borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: '"Baloo 2", sans-serif',
                fontWeight: 800,
                fontSize: '0.75rem',
                transition: 'all 0.2s',
                ...(isDone ? {
                  background: '#4ADE80',
                  border: '2px solid #4ADE80',
                  color: '#1a1030',
                  fontSize: '1rem'
                } : isActive ? {
                  background: 'rgba(245,166,35,0.2)',
                  border: '2.5px solid #F5A623',
                  color: '#F5A623',
                } : {
                  background: 'rgba(255,255,255,0.06)',
                  border: '2px solid rgba(255,255,255,0.15)',
                  color: 'rgba(255,255,255,0.4)',
                })
              }}>
                {isDone ? '✓' : isActive ? phase.icon : (i + 1)}
              </div>
              <span style={{
                fontSize: '0.6rem',
                fontFamily: '"Baloo 2", sans-serif',
                fontWeight: isActive ? 800 : 600,
                color: isActive ? '#F5A623' : isDone ? '#4ADE80' : 'rgba(255,255,255,0.4)',
                letterSpacing: '0.03em',
              }}>
                {phase.label}
              </span>
            </button>
            {i < PHASES.length - 1 && (
              <div style={{
                width: 24, height: 2,
                background: isDone ? '#4ADE80' : 'rgba(255,255,255,0.12)',
                borderRadius: 2,
                flexShrink: 0,
              }} />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
