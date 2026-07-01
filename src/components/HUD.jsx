import React from 'react'

export default function HUD({ stars, hearts, streak, questionNum, totalQuestions, xp }) {
  const maxHearts = 3
  const streakMultiplier = streak >= 6 ? '2x' : streak >= 3 ? '1.5x' : '1x'

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '8px 16px',
      background: 'rgba(0,0,0,0.4)',
      borderRadius: '14px',
      margin: '0 0 8px 0',
      flexShrink: 0,
      gap: '8px',
    }}>
      {/* Stars / XP */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{ fontSize: '1.1rem' }}>⭐</span>
        <span style={{
          fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '1rem',
          color: '#F5A623'
        }}>{xp} XP</span>
      </div>

      {/* Hearts */}
      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
        {Array.from({ length: maxHearts }).map((_, i) => (
          <span key={i} style={{
            fontSize: '1.2rem',
            opacity: i < hearts ? 1 : 0.2,
            filter: i < hearts ? 'none' : 'grayscale(100%)',
            transition: 'all 0.3s',
          }}>❤️</span>
        ))}
      </div>

      {/* Streak */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
        <span style={{ fontSize: '1.1rem' }}>🔥</span>
        <span style={{
          fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '0.9rem',
          color: streak >= 3 ? '#FF9F43' : 'rgba(255,255,255,0.6)'
        }}>{streak > 0 ? `${streak} · ${streakMultiplier}` : streakMultiplier}</span>
      </div>

      {/* Progress */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span style={{
          fontFamily: '"Baloo 2"', fontWeight: 700, fontSize: '0.85rem',
          color: 'rgba(255,255,255,0.7)'
        }}>Q {questionNum}/{totalQuestions}</span>
      </div>
    </div>
  )
}
