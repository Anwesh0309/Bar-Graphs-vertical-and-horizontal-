import React, { useState } from 'react'
import BarGraph from './BarGraph'

const SCALE_OPTIONS = [1, 2, 5, 10]

export default function ScaleSlider({ dataset, onNewData }) {
  const [scaleIdx, setScaleIdx] = useState(1)
  const scale = SCALE_OPTIONS[scaleIdx]

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
      <div style={{
        background:'rgba(245,166,35,0.12)', border:'1px solid rgba(245,166,35,0.3)',
        borderRadius:'12px', padding:'8px 16px', textAlign:'center',
        fontFamily:'"Baloo 2"', fontWeight:700, fontSize:'0.9rem', color:'#FFC94A',
      }}>
        📏 Scale = <strong style={{ fontSize:'1.1rem', color:'#F5A623' }}>{scale}</strong> — Each gridline represents <strong>{scale}</strong> unit{scale>1?'s':''}
      </div>

      <BarGraph
        orientation="vertical"
        categories={dataset}
        scale={scale}
        maxValue={Math.ceil(Math.max(...dataset.map(d=>d.value)) / scale) * scale + scale}
        animated={true}
        showValues={true}
      />

      {/* Scale slider */}
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', width:'100%', maxWidth:280 }}>
        <div style={{ display:'flex', justifyContent:'space-between', width:'100%' }}>
          {SCALE_OPTIONS.map((s, i) => (
            <button
              key={s}
              onClick={() => setScaleIdx(i)}
              style={{
                background: scaleIdx === i
                  ? 'linear-gradient(135deg,#F5A623,#FFC94A)'
                  : 'rgba(255,255,255,0.08)',
                border: `2px solid ${scaleIdx === i ? '#F5A623' : 'rgba(255,255,255,0.15)'}`,
                borderRadius:'10px', padding:'6px 14px',
                fontFamily:'"Baloo 2"', fontWeight:800,
                color: scaleIdx === i ? '#1a1030' : 'white',
                cursor:'pointer', fontSize:'0.95rem',
                transition:'all 0.2s',
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <input
          type="range" min={0} max={3} value={scaleIdx}
          onChange={e => setScaleIdx(+e.target.value)}
          style={{ width:'100%', accentColor:'#F5A623' }}
          aria-label="Scale selector"
        />
      </div>

      <div style={{
        fontFamily:'"Baloo 2"', fontSize:'0.8rem', color:'rgba(255,255,255,0.6)',
        textAlign:'center', fontStyle:'italic',
      }}>
        ✨ The data doesn't change — only how it looks on the graph!
      </div>

      <button onClick={onNewData} className="btn-gold" style={{ fontSize:'0.85rem', padding:'8px 20px' }}>
        🔄 New Data Set
      </button>
    </div>
  )
}
