import React, { useState } from 'react'
import { motion } from 'framer-motion'
import BarGraph from './BarGraph'

export default function OrientationFlip({ dataset, scale, onNewData }) {
  const [orientation, setOrientation] = useState('vertical')

  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'12px' }}>
      <div style={{
        display:'flex', alignItems:'center', gap:'12px',
        background:'rgba(255,255,255,0.06)', borderRadius:'50px',
        padding:'6px 10px', border:'1px solid rgba(255,255,255,0.12)',
      }}>
        <span style={{
          fontFamily:'"Baloo 2"', fontWeight:800, fontSize:'0.9rem',
          color: orientation==='vertical' ? '#F5A623' : 'rgba(255,255,255,0.4)',
        }}>📊 Vertical</span>

        <button
          onClick={() => setOrientation(o => o==='vertical'?'horizontal':'vertical')}
          style={{
            width:52, height:28, borderRadius:50,
            background: orientation==='horizontal'
              ? 'linear-gradient(135deg,#F5A623,#FFC94A)'
              : 'rgba(255,255,255,0.15)',
            border:'none', cursor:'pointer', position:'relative', transition:'all 0.3s',
          }}
          aria-label={`Switch to ${orientation==='vertical'?'horizontal':'vertical'} orientation`}
        >
          <motion.div
            animate={{ x: orientation==='horizontal' ? 24 : 2 }}
            style={{
              width:22, height:22, borderRadius:'50%',
              background:'white', position:'absolute', top:3,
              boxShadow:'0 2px 6px rgba(0,0,0,0.3)',
            }}
          />
        </button>

        <span style={{
          fontFamily:'"Baloo 2"', fontWeight:800, fontSize:'0.9rem',
          color: orientation==='horizontal' ? '#F5A623' : 'rgba(255,255,255,0.4)',
        }}>📊 Horizontal</span>
      </div>

      <div style={{
        background:'rgba(255,255,255,0.05)', borderRadius:'14px',
        padding:'4px', border:'1px solid rgba(255,255,255,0.1)',
      }}>
        <BarGraph
          orientation={orientation}
          categories={dataset}
          scale={scale}
          maxValue={Math.ceil(Math.max(...dataset.map(d=>d.value)) / scale) * scale + scale}
          animated={true}
          showValues={true}
        />
      </div>

      <div style={{
        fontFamily:'"Baloo 2"', fontSize:'0.85rem', fontWeight:700,
        color:'rgba(255,255,255,0.7)', textAlign:'center',
        background:'rgba(74,222,128,0.1)', border:'1px solid rgba(74,222,128,0.2)',
        borderRadius:'10px', padding:'6px 14px',
      }}>
        ✨ Same data — different orientation! Both show the same information.
      </div>

      <button onClick={onNewData} className="btn-gold" style={{ fontSize:'0.85rem', padding:'8px 20px' }}>
        🔄 New Data Set
      </button>
    </div>
  )
}
