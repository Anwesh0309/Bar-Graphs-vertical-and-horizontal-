import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useProgress } from '../context/ProgressContext'

const PHASES = [
  { key: 'wonder',   label: 'Wonder',   num: '01', icon: '🔮', route: '/wonder' },
  { key: 'story',    label: 'Story',    num: '02', icon: '📖', route: '/story' },
  { key: 'simulate', label: 'Simulate', num: '03', icon: '✏️', route: '/simulate' },
  { key: 'play',     label: 'Play',     num: '04', icon: '🎮', route: '/play' },
  { key: 'reflect',  label: 'Reflect',  num: '05', icon: '📋', route: '/reflect' },
]

export default function PhaseStepper({ active, showHome = true }) {
  const navigate = useNavigate()
  const { state } = useProgress()
  const completed = state.completedPhases || []

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '7px 12px 5px',
      gap: '0',
      background: 'transparent',
      borderBottom: 'none',
      flexShrink: 0,
      position: 'relative',
      minHeight: 48,
    }}>
      {/* Home button — shown on all phases except Home itself */}
      {showHome && (
        <button
          onClick={() => navigate('/')}
          style={{
            position: 'absolute',
            left: 10,
            display: 'flex', alignItems: 'center', gap: '5px',
            background: 'rgba(245,166,35,0.18)',
            border: '1.5px solid rgba(245,166,35,0.5)',
            borderRadius: '20px',
            padding: '5px 13px',
            fontFamily: '"Baloo 2", sans-serif',
            fontWeight: 800, fontSize: '0.82rem',
            color: '#FFC94A',
            cursor: 'pointer',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
          }}
          aria-label="Go to Home"
        >
          🏠 <span>Home</span>
        </button>
      )}

      {/* Phase steps — matching screenshot exactly */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
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
                  alignItems: 'center',
                  gap: '5px',
                  background: isActive
                    ? 'rgba(245,166,35,0.22)'
                    : isDone ? 'rgba(74,222,128,0.1)' : 'transparent',
                  border: isActive
                    ? '1.5px solid rgba(245,166,35,0.6)'
                    : isDone ? '1.5px solid rgba(74,222,128,0.4)' : 'none',
                  borderRadius: '20px',
                  padding: '4px 10px',
                  cursor: isLocked ? 'default' : 'pointer',
                  opacity: isLocked ? 0.38 : 1,
                  transition: 'all 0.2s',
                }}
                aria-label={`Phase ${phase.num}: ${phase.label}`}
              >
                {/* Number badge */}
                <span style={{
                  fontFamily: '"Baloo 2", sans-serif',
                  fontWeight: 800,
                  fontSize: '0.72rem',
                  color: isActive ? '#F5A623' : isDone ? '#4ADE80' : 'rgba(255,255,255,0.35)',
                  letterSpacing: '0.03em',
                }}>{phase.num}</span>

                {/* Icon */}
                <span style={{
                  fontSize: '0.85rem',
                  filter: isLocked ? 'grayscale(1) opacity(0.4)' : 'none',
                }}>{phase.icon}</span>

                {/* Label */}
                <span style={{
                  fontFamily: '"Baloo 2", sans-serif',
                  fontWeight: isActive ? 800 : 700,
                  fontSize: '0.78rem',
                  color: isActive ? '#F5A623' : isDone ? '#4ADE80' : 'rgba(255,255,255,0.45)',
                }}>{phase.label}</span>

                {/* Done checkmark */}
                {isDone && (
                  <span style={{
                    fontSize: '0.7rem', color: '#4ADE80', fontWeight: 900,
                  }}>✓</span>
                )}
              </button>

              {/* Connector dot */}
              {i < PHASES.length - 1 && (
                <div style={{
                  width: 12, height: 2,
                  background: isDone ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.1)',
                  borderRadius: 2,
                  flexShrink: 0,
                  margin: '0 1px',
                }} />
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
