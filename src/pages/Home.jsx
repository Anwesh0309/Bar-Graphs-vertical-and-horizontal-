import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAudio } from '../context/AudioContext'
import { useProgress } from '../context/ProgressContext'
import { narrationScripts } from '../utils/narration'

const PHASES = [
  { icon:'🔎', label:'Wonder',   desc:'Spark your curiosity' },
  { icon:'📖', label:'Story',    desc:'Hear the tale' },
  { icon:'✏️', label:'Simulate', desc:'Explore & discover' },
  { icon:'🎮', label:'Play',     desc:'Test your skills' },
  { icon:'📋', label:'Reflect',  desc:'What did you learn?' },
]

export default function Home() {
  const navigate = useNavigate()
  const { speak } = useAudio()
  const { dispatch } = useProgress()

  useEffect(() => {
    speak(narrationScripts.home)
  }, [])

  const handleBegin = () => {
    dispatch({ type: 'RESET_ALL' })
    navigate('/wonder')
  }

  return (
    <div className="page-frame" style={{
      background: 'linear-gradient(135deg, #1a1030 0%, #2b1b4e 100%)',
      padding: '0',
      overflow: 'hidden',
    }}>
      <div style={{
        height: '100vh', width: '100vw',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        gap: '12px',
        overflow: 'hidden',
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          style={{
            background: 'rgba(245,166,35,0.15)',
            border: '1px solid rgba(245,166,35,0.4)',
            borderRadius: '50px', padding: '5px 16px',
            fontFamily: '"Baloo 2"', fontWeight: 700, fontSize: '0.8rem',
            color: '#FFC94A', letterSpacing:'0.05em',
          }}
        >
          ✨ Grade 2 Mathematics — Bar Graphs (vertical and horizontal)
        </motion.div>

        {/* Hero title */}
        <motion.div
          initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          style={{ textAlign:'center', lineHeight:1.1 }}
        >
          <h1 style={{
            fontFamily:'"Baloo 2"', fontWeight:800, fontSize:'clamp(1.6rem,4vw,2.4rem)',
            color:'white', margin:0,
          }}>
            Data Handling with{' '}
            <span style={{
              color:'#F5A623',
              textShadow:'0 0 20px rgba(245,166,35,0.5)',
            }}>Bar Graphs</span>
          </h1>
        </motion.div>

        {/* Mascot + bubble */}
        <motion.div
          initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3 }}
          style={{ display:'flex', alignItems:'center', gap:'10px' }}
        >
          <span style={{ fontSize:'clamp(2rem,5vw,3rem)' }}>🦉</span>
          <div style={{
            background:'rgba(255,255,255,0.1)', border:'1px solid rgba(255,255,255,0.2)',
            borderRadius:'16px', borderBottomLeftRadius:'4px',
            padding:'8px 16px',
            fontFamily:'"Baloo 2"', fontWeight:700, fontSize:'clamp(0.85rem,2vw,1rem)',
            color:'#FFC94A',
          }}>
            Ready to uncover hidden stories in data? 📊
          </div>
        </motion.div>

        {/* Blurb */}
        <motion.p
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          style={{
            fontFamily:'"Poppins"', fontWeight:600, fontSize:'clamp(0.8rem,1.8vw,0.95rem)',
            color:'rgba(255,255,255,0.75)', textAlign:'center', maxWidth:520,
            lineHeight:1.5, margin:0,
          }}
        >
          Join Chart the Owl on a data adventure! Learn to read, build, and compare bar graphs
          through real stories, hands-on simulations, and 10 exciting worlds of practice.
        </motion.p>

        {/* Journey cards */}
        <motion.div
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          style={{
            background:'rgba(255,255,255,0.05)',
            border:'1px solid rgba(255,255,255,0.1)',
            borderRadius:'18px', padding:'12px 16px',
            width:'100%', maxWidth:560,
          }}
        >
          <div style={{
            fontFamily:'"Baloo 2"', fontWeight:800, fontSize:'0.75rem',
            color:'rgba(255,255,255,0.5)', letterSpacing:'0.1em',
            textAlign:'center', marginBottom:'8px',
          }}>
            YOUR LEARNING JOURNEY
          </div>
          <div style={{
            display:'grid',
            gridTemplateColumns:'repeat(5,1fr)',
            gap:'6px',
          }}>
            {PHASES.map((p, i) => (
              <div key={p.label} style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:'3px',
                background:'rgba(255,255,255,0.04)',
                borderRadius:'12px', padding:'8px 4px',
                border:'1px solid rgba(255,255,255,0.08)',
              }}>
                <span style={{ fontSize:'1.3rem' }}>{p.icon}</span>
                <span style={{
                  fontFamily:'"Baloo 2"', fontWeight:800, fontSize:'0.7rem',
                  color:'white', textAlign:'center',
                }}>{p.label}</span>
                <span style={{
                  fontFamily:'"Poppins"', fontSize:'0.58rem',
                  color:'rgba(255,255,255,0.5)', textAlign:'center', lineHeight:1.2,
                }}>{p.desc}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          whileHover={{ scale:1.05, boxShadow:'0 8px 30px rgba(245,166,35,0.7)' }}
          whileTap={{ scale:0.97 }}
          onClick={handleBegin}
          style={{
            background:'linear-gradient(135deg,#F5A623,#FFC94A)',
            color:'#1a1030', border:'none', borderRadius:'50px',
            padding:'12px 36px',
            fontFamily:'"Baloo 2"', fontWeight:800,
            fontSize:'clamp(1rem,2.5vw,1.2rem)',
            cursor:'pointer',
            boxShadow:'0 4px 20px rgba(245,166,35,0.45)',
            letterSpacing:'0.02em',
          }}
        >
          🚀 Begin Your Journey!
        </motion.button>

        {/* Feature chips */}
        <motion.div
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.7 }}
          style={{ display:'flex', gap:'8px', flexWrap:'wrap', justifyContent:'center' }}
        >
          {['📊 Read & Build','🧱 Bar Blocks','🌍 10 Data Worlds'].map(chip => (
            <span key={chip} style={{
              background:'rgba(255,255,255,0.08)',
              border:'1px solid rgba(255,255,255,0.15)',
              borderRadius:'50px', padding:'4px 14px',
              fontFamily:'"Baloo 2"', fontWeight:700, fontSize:'0.78rem',
              color:'rgba(255,255,255,0.8)',
            }}>{chip}</span>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
