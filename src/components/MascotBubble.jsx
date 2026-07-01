import React from 'react'
import { motion } from 'framer-motion'

export default function MascotBubble({ message, size = 'md' }) {
  const sizes = {
    sm: { owl: '2rem', text: '0.8rem', padding: '8px 14px' },
    md: { owl: '2.8rem', text: '0.95rem', padding: '10px 18px' },
    lg: { owl: '3.5rem', text: '1.1rem', padding: '12px 22px' },
  }
  const s = sizes[size] || sizes.md

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}
    >
      <span style={{ fontSize: s.owl }}>🦉</span>
      <div style={{
        background: 'rgba(255,255,255,0.1)',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: '16px',
        borderBottomLeftRadius: '4px',
        padding: s.padding,
        fontFamily: '"Baloo 2", sans-serif',
        fontSize: s.text,
        fontWeight: 600,
        color: '#FFC94A',
        maxWidth: 340,
        lineHeight: 1.4,
        backdropFilter: 'blur(8px)',
      }}>
        {message}
      </div>
    </motion.div>
  )
}
