import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const errorScenarios = [
  {
    title: "Fruit Sales Graph",
    correct: [
      { label:'Apples', value:8, color:'#FF6B6B' },
      { label:'Mangoes', value:5, color:'#FFD93D' },
      { label:'Longans', value:3, color:'#6BCB77' },
    ],
    corrupted: [
      { label:'Apples', value:4, color:'#FF6B6B' }, // wrong height
      { label:'Mangoes', value:5, color:'#FFD93D' },
      { label:'Longans', value:3, color:'#6BCB77' },
    ],
    errorIndex: 0,
    errorType: 'wrong-height',
    explanation: 'The Apples bar shows 4, but Aunty Lin sold 8 apples! The bar height should reach the 8 mark.',
  },
  {
    title: "Pet Shop Survey",
    correct: [
      { label:'Goldfish', value:6, color:'#4D96FF' },
      { label:'Hamsters', value:9, color:'#FFD93D' },
      { label:'Rabbits', value:4, color:'#C77DFF' },
    ],
    corrupted: [
      { label:'Goldfish', value:6, color:'#4D96FF' },
      { label:'Hamsters', value:9, color:'#FFD93D' },
      { label:'Rabbits', value:9, color:'#C77DFF' }, // wrong height
    ],
    errorIndex: 2,
    errorType: 'wrong-height',
    explanation: 'Rabbits should show 4, not 9! Look at the data table — only 4 rabbits were sold.',
  },
  {
    title: "Sports Day Scores",
    correct: [
      { label:'Red', value:10, color:'#FF6B6B' },
      { label:'Blue', value:7, color:'#4D96FF' },
      { label:'Green', value:5, color:'#6BCB77' },
    ],
    corrupted: [
      { label:'Red', value:10, color:'#FF6B6B' },
      { label:'Blue', value:7, color:'#4D96FF' },
      { label:'Green', value:10, color:'#6BCB77' }, // same as Red, wrong
    ],
    errorIndex: 2,
    errorType: 'wrong-height',
    explanation: 'The Green team scored 5 points, not 10! The bar is drawn too tall — it should only reach the 5 mark.',
  },
]

export default function SpotError({ onNewData }) {
  const [scenarioIdx, setScenarioIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const scenario = errorScenarios[scenarioIdx % errorScenarios.length]

  const handleBarClick = (idx) => {
    if (revealed) return
    setSelected(idx)
    if (idx === scenario.errorIndex) {
      setRevealed(true)
    }
  }

  const handleNew = () => {
    setScenarioIdx(i => i + 1)
    setSelected(null)
    setRevealed(false)
    onNewData && onNewData()
  }

  const cats = scenario.corrupted
  const maxVal = Math.max(...cats.map(c=>c.value), ...scenario.correct.map(c=>c.value)) + 2
  const graphH = 140
  const barW = 48

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
      <div style={{
        background:'rgba(232,93,140,0.12)', border:'1px solid rgba(232,93,140,0.3)',
        borderRadius:'12px', padding:'8px 16px', textAlign:'center',
        fontFamily:'"Baloo 2"', fontWeight:700, fontSize:'0.9rem', color:'#E85D8C',
      }}>
        🔎 One bar in this graph is WRONG! Tap the incorrect bar to find it!
      </div>

      {/* Bar graph with clickable bars */}
      <div style={{
        display:'flex', gap:'16px', alignItems:'flex-end', height: graphH + 40,
        background:'rgba(0,0,0,0.3)', borderRadius:'14px', padding:'10px 16px',
        position:'relative',
      }}>
        {cats.map((cat, i) => {
          const bh = Math.max(4, (cat.value / maxVal) * graphH)
          const isWrong = i === scenario.errorIndex
          const isSelected = selected === i
          let bg = `linear-gradient(to top, ${cat.color}cc, ${cat.color})`
          if (isSelected && !isWrong) bg = 'linear-gradient(to top,rgba(232,93,140,0.5),rgba(232,93,140,0.8))'
          if (revealed && isWrong) bg = 'linear-gradient(to top,rgba(232,93,140,0.8),#E85D8C)'

          return (
            <div key={cat.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
              <button
                onClick={() => handleBarClick(i)}
                style={{
                  height: bh, width: barW,
                  background: bg,
                  borderRadius:'4px 4px 0 0',
                  border: (revealed && isWrong) ? '2px solid #E85D8C' : '2px solid transparent',
                  cursor: revealed ? 'default' : 'pointer',
                  transition:'all 0.3s',
                  boxShadow: revealed && isWrong ? '0 0 12px #E85D8C' : 'none',
                }}
                aria-label={`${cat.label} bar: ${cat.value}`}
              />
              <span style={{
                fontFamily:'"Baloo 2"', fontSize:'0.75rem', fontWeight:700,
                color:'rgba(255,255,255,0.7)',
              }}>{cat.label}</span>
              <span style={{
                fontFamily:'"Baloo 2"', fontSize:'0.8rem', fontWeight:800, color:'white'
              }}>{cat.value}</span>
              {revealed && isWrong && (
                <motion.span initial={{scale:0}} animate={{scale:1}} style={{ fontSize:'1rem' }}>❌</motion.span>
              )}
            </div>
          )
        })}
      </div>

      {/* Wrong guess feedback */}
      {selected !== null && !revealed && (
        <motion.div
          initial={{opacity:0,y:4}} animate={{opacity:1,y:0}}
          style={{
            background:'rgba(232,93,140,0.15)', border:'1px solid rgba(232,93,140,0.3)',
            borderRadius:'10px', padding:'8px 16px',
            fontFamily:'"Baloo 2"', fontWeight:700, fontSize:'0.85rem',
            color:'rgba(255,255,255,0.8)', textAlign:'center',
          }}
        >
          That bar looks okay — keep looking! 🔍
        </motion.div>
      )}

      {/* Reveal explanation */}
      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{opacity:0,y:6}} animate={{opacity:1,y:0}}
            style={{
              background:'linear-gradient(135deg,rgba(74,222,128,0.15),rgba(16,185,129,0.1))',
              border:'2px solid rgba(74,222,128,0.4)',
              borderRadius:'14px', padding:'12px 16px',
              fontFamily:'"Baloo 2"', fontWeight:700, fontSize:'0.9rem',
              color:'white', textAlign:'center', lineHeight:1.4,
            }}
          >
            <div style={{ fontSize:'1.3rem', marginBottom:'4px' }}>✅ You found it!</div>
            <div style={{ color:'rgba(255,255,255,0.85)' }}>{scenario.explanation}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <button onClick={handleNew} className="btn-gold" style={{ fontSize:'0.85rem', padding:'8px 20px' }}>
        🔄 New Error Graph
      </button>
    </div>
  )
}
