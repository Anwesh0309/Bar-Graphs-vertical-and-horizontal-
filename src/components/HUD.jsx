import React from 'react'

export default function HUD({ stars, hearts, streak, questionNum, totalQuestions, xp }) {
  const maxHearts = 3
  const streakLabel = streak >= 6 ? '2x 🔥🔥' : streak >= 3 ? '1.5x 🔥' : '1x'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      background: 'rgba(0,0,0,0.45)',
      borderRadius: '14px',
      margin: '0 0 6px 0',
      flexShrink: 0,
      gap: '8px',
    }}>
      {/* Stars / XP */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '1.2rem' }}>⭐</span>
        <span style={{
          fontFamily: '"Baloo 2"', fontWeight: 900, fontSize: 'clamp(1rem,2.5vw,1.2rem)',
          color: '#F5A623',
        }}>{xp}</span>
      </div>

      {/* Hearts */}
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        {Array.from({ length: maxHearts }).map((_, i) => (
          <span key={i} style={{
            fontSize: 'clamp(1.1rem,3vw,1.4rem)',
            opacity: i < hearts ? 1 : 0.18,
            filter: i < hearts ? 'none' : 'grayscale(100%)',
            transition: 'all 0.35s',
          }}>❤️</span>
        ))}
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '1.1rem' }}>🔥</span>
        <span style={{
          fontFamily: '"Baloo 2"', fontWeight: 900,
          fontSize: 'clamp(0.9rem,2.2vw,1.05rem)',
          color: streak >= 3 ? '#FF9F43' : 'rgba(255,255,255,0.55)',
        }}>{streakLabel}</span>
      </div>

      {/* Progress */}
      <div style={{
        fontFamily: '"Baloo 2"', fontWeight: 800,
        fontSize: 'clamp(0.85rem,2vw,1rem)',
        color: 'rgba(255,255,255,0.75)',
      }}>
        Q {questionNum}/{totalQuestions}
      </div>
    </div>
  )
}
