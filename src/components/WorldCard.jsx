import React from 'react'
import { motion } from 'framer-motion'

export default function WorldCard({ world, starsEarned = 0, locked = true, onClick }) {
  return (
    <motion.button
      whileHover={locked ? {} : { scale: 1.04, y: -3 }}
      whileTap={locked ? {} : { scale: 0.97 }}
      onClick={locked ? undefined : onClick}
      style={{
        position: 'relative',
        background: locked
          ? 'rgba(255,255,255,0.04)'
          : `linear-gradient(135deg, ${world.color}22, rgba(255,255,255,0.06))`,
        border: `2px solid ${locked ? 'rgba(255,255,255,0.08)' : world.color + '66'}`,
        borderRadius: '16px',
        padding: '12px 10px',
        cursor: locked ? 'not-allowed' : 'pointer',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '5px',
        opacity: locked ? 0.45 : 1,
        transition: 'all 0.2s',
        minWidth: 0,
        overflow: 'hidden',
      }}
      aria-label={`${world.name}${locked ? ' (locked)' : `, ${starsEarned} stars`}`}
      disabled={locked}
    >
      {locked && (
        <div style={{
          position: 'absolute', top: 6, right: 8,
          fontSize: '0.9rem', opacity: 0.7
        }}>🔒</div>
      )}
      <span style={{ fontSize: '1.8rem', lineHeight: 1 }}>{world.icon}</span>
      <span style={{
        fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '0.72rem',
        color: 'white', textAlign: 'center', lineHeight: 1.2,
      }}>{world.name}</span>
      <div style={{ display: 'flex', gap: '2px' }}>
        {[0,1,2].map(i => (
          <span key={i} style={{ fontSize: '0.75rem', opacity: i < starsEarned ? 1 : 0.2 }}>⭐</span>
        ))}
      </div>
    </motion.button>
  )
}
