import React, { useState, useCallback } from 'react'
import { motion } from 'framer-motion'

const BAR_COLORS = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF']

export default function BarBuilder({ dataset, scale, onNewData }) {
  const [userValues, setUserValues] = useState(() => dataset.map(() => 0))
  const maxVal = Math.max(...dataset.map(d => d.value)) + scale * 2
  const graphH = 160
  const barW = Math.min(44, (260 / dataset.length) - 12)

  const handleDrag = useCallback((idx, e, info) => {
    const pxPerUnit = graphH / maxVal
    const delta = -info.delta.y
    const change = Math.round(delta / pxPerUnit / scale) * scale
    setUserValues(prev => {
      const next = [...prev]
      next[idx] = Math.max(0, Math.min(maxVal, (next[idx] || 0) + change))
      return next
    })
  }, [maxVal, scale, graphH])

  const allMatch = dataset.every((d, i) => userValues[i] === d.value)

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
      {allMatch && (
        <motion.div
          initial={{ scale:0 }} animate={{ scale:1 }}
          style={{
            background:'rgba(74,222,128,0.2)', border:'2px solid #4ADE80',
            borderRadius:'12px', padding:'8px 20px',
            fontFamily:'"Baloo 2"', fontWeight:800, color:'#4ADE80', fontSize:'1rem',
          }}
        >
          ✓ Perfect Match! Well done! 🎉
        </motion.div>
      )}

      {/* Data table */}
      <div style={{
        display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center',
        background:'rgba(255,255,255,0.05)', borderRadius:'12px', padding:'8px 12px',
      }}>
        {dataset.map((d, i) => (
          <div key={d.label} style={{
            display:'flex', alignItems:'center', gap:'4px',
            fontFamily:'"Baloo 2"', fontSize:'0.85rem', fontWeight:700,
          }}>
            <span style={{ color: BAR_COLORS[i % BAR_COLORS.length] }}>■</span>
            <span style={{ color:'rgba(255,255,255,0.8)' }}>{d.label}:</span>
            <span style={{ color:'white' }}>{d.value}</span>
          </div>
        ))}
      </div>

      {/* Bar building area */}
      <div style={{ display:'flex', gap:'16px', alignItems:'flex-end', height: graphH + 40 }}>
        {dataset.map((d, i) => {
          const targetH = (d.value / maxVal) * graphH
          const userH = Math.max(2, (userValues[i] / maxVal) * graphH)
          const match = userValues[i] === d.value
          const color = BAR_COLORS[i % BAR_COLORS.length]

          return (
            <div key={d.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
              {/* Match indicator */}
              <span style={{ fontSize:'1rem', minHeight:'1.2rem' }}>{match ? '✅' : ''}</span>

              {/* Bar container */}
              <div style={{
                position:'relative', width: barW, height: graphH,
                background:'rgba(255,255,255,0.05)', borderRadius:'6px',
                border:'1px solid rgba(255,255,255,0.1)',
                display:'flex', flexDirection:'column', justifyContent:'flex-end',
                overflow:'hidden',
              }}>
                {/* Target line */}
                <div style={{
                  position:'absolute', bottom: targetH - 2, left:0, right:0,
                  height:2, background:'rgba(255,255,255,0.3)',
                  borderTop:'2px dashed rgba(255,255,255,0.4)',
                  zIndex:1,
                }} />

                {/* User bar */}
                <motion.div
                  drag="y"
                  dragConstraints={{ top: -(graphH - userH), bottom: userH - 4 }}
                  dragElastic={0}
                  onDrag={(e, info) => handleDrag(i, e, info)}
                  style={{
                    height: userH, width:'100%',
                    background: match
                      ? `linear-gradient(to top, ${color}, #4ADE80)`
                      : `linear-gradient(to top, ${color}cc, ${color})`,
                    borderRadius:'4px 4px 0 0',
                    cursor:'ns-resize',
                    display:'flex', alignItems:'flex-start', justifyContent:'center',
                    paddingTop:'4px',
                    boxShadow: match ? `0 0 12px ${color}` : 'none',
                    transition:'background 0.3s, box-shadow 0.3s',
                  }}
                >
                  <span style={{ fontSize:'0.7rem', userSelect:'none', opacity:0.8 }}>▲</span>
                </motion.div>
              </div>

              <span style={{
                fontFamily:'"Baloo 2"', fontSize:'0.7rem', fontWeight:700,
                color:'rgba(255,255,255,0.7)', textAlign:'center', maxWidth: barW,
              }}>
                {d.label.slice(0,6)}
              </span>
              <span style={{
                fontFamily:'"Baloo 2"', fontSize:'0.8rem', fontWeight:800,
                color: match ? '#4ADE80' : '#FFC94A',
              }}>
                {userValues[i]}
              </span>
            </div>
          )
        })}
      </div>

      <button onClick={onNewData} className="btn-gold" style={{ fontSize:'0.85rem', padding:'8px 20px' }}>
        🔄 New Data Set
      </button>
    </div>
  )
}
