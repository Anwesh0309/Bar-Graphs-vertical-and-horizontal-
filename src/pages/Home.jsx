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
      background: 'radial-gradient(circle at center, #2e1d52 0%, #150a21 100%)',
      padding: '0',
      overflow: 'hidden',
      position: 'relative'
    }}>
      {/* Background Floating Numbers */}
      {[
        { val: '94', top: '8%', left: '12%', size: '1.5rem', opacity: 0.08 },
        { val: '91', top: '15%', left: '25%', size: '2.5rem', opacity: 0.12 },
        { val: '66', top: '12%', left: '32%', size: '2rem', opacity: 0.08 },
        { val: '90', top: '5%', left: '48%', size: '1.6rem', opacity: 0.06 },
        { val: '64', top: '6%', left: '60%', size: '2rem', opacity: 0.09 },
        { val: '30', top: '8%', left: '76%', size: '2.4rem', opacity: 0.12 },
        { val: '59', top: '12%', left: '85%', size: '1.4rem', opacity: 0.08 },
        { val: '93', top: '18%', left: '94%', size: '3rem', opacity: 0.15 },
      ].map((n, i) => (
        <span key={i} style={{
          position: 'absolute', top: n.top, left: n.left,
          fontFamily: '"Baloo 2"', fontWeight: 900, fontSize: n.size,
          color: 'white', opacity: n.opacity, userSelect: 'none'
        }}>{n.val}</span>
      ))}



      <div style={{
        position: 'relative',
        height: '100vh', width: '100vw',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '16px',
        gap: '24px',
        overflow: 'hidden',
        zIndex: 1
      }}>
        {/* Badge */}
        <motion.div
          initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
          style={{
            background: 'rgba(255,255,255,0.08)',
            borderRadius: '50px', padding: '6px 16px',
            fontFamily: '"Poppins"', fontWeight: 500, fontSize: '0.8rem',
            color: 'white', display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          ✨ Singapore MOE Curriculum - Grade 3
        </motion.div>

        {/* Hero title */}
        <motion.div
          initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          style={{ textAlign:'center', lineHeight:1 }}
        >
          <h1 style={{
            fontFamily:'"Baloo 2"', fontWeight:900, fontSize:'clamp(2.5rem,5vw,3.5rem)',
            color:'white', margin:0, letterSpacing: '-0.02em'
          }}>
            Data Handling with{' '}
            <span style={{ color:'#F5A623' }}>Bar Graphs</span>
          </h1>
        </motion.div>

        {/* Mascot + bubble */}
        <motion.div
          initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.3 }}
          style={{ display:'flex', alignItems:'center', gap:'16px' }}
        >
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%',
            background: '#F5A623', display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', boxShadow: '0 4px 12px rgba(245,166,35,0.3)'
          }}>
            🦉
          </div>
          <div style={{
            background:'white', borderRadius:'24px', borderTopLeftRadius:'4px',
            padding:'14px 24px', position: 'relative',
            fontFamily:'"Poppins"', fontWeight:600, fontSize:'0.9rem',
            color:'#1a1030', display: 'flex', alignItems: 'center', justifyContent: 'center',
            minWidth: '220px'
          }}>
            Ready for a data adventure? 🎉
          </div>
        </motion.div>

        {/* Blurb */}
        <motion.p
          initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.4 }}
          style={{
            fontFamily:'"Poppins"', fontWeight:500, fontSize:'0.9rem',
            color:'rgba(255,255,255,0.7)', textAlign:'center', maxWidth: 640,
            lineHeight:1.6, margin:0,
          }}
        >
          Join Chart the Owl on a journey to read, build, and compare bar graphs
          through stories, simulations, and fun games!
        </motion.p>

        {/* Journey cards glass morphic container */}
        <motion.div
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}
          style={{
            background:'rgba(255,255,255,0.03)',
            border:'1px solid rgba(255,255,255,0.08)',
            borderRadius:'24px', padding:'24px 32px',
            width:'100%', maxWidth: 700,
            display: 'flex', flexDirection: 'column', alignItems: 'center'
          }}
        >
          <div style={{
            fontFamily:'"Baloo 2"', fontWeight:900, fontSize:'0.85rem',
            color:'#F5A623', letterSpacing:'0.05em', textTransform: 'uppercase',
            textAlign:'center', marginBottom:'20px',
          }}>
            YOUR LEARNING JOURNEY
          </div>
          
          <div style={{
            display: 'flex', 
            flexWrap: 'wrap',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px'
          }}>
             {PHASES.map((p, i) => (
                <React.Fragment key={p.label}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%',
                      background: 'rgba(255,255,255,0.08)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '1.2rem'
                    }}>
                      {p.icon}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{
                        fontFamily:'"Baloo 2"', fontWeight:800, fontSize:'0.9rem',
                        color:'white', lineHeight: 1.1
                      }}>{p.label}</span>
                      <span style={{
                        fontFamily:'"Poppins"', fontSize:'0.65rem',
                        color:'rgba(255,255,255,0.5)', lineHeight: 1.2
                      }}>{p.desc}</span>
                    </div>
                  </div>
                  {i < PHASES.length - 1 && (
                    <div style={{ color: 'rgba(255,255,255,0.2)', margin: '0 4px', fontSize: '1.2rem' }}>→</div>
                  )}
                </React.Fragment>
             ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          whileHover={{ scale:1.05, boxShadow:'0 8px 30px rgba(245,166,35,0.6)' }}
          whileTap={{ scale:0.97 }}
          onClick={handleBegin}
          style={{
            background:'#F5A623',
            color:'#1a1030', border:'none', borderRadius:'50px',
            padding:'14px 44px',
            fontFamily:'"Baloo 2"', fontWeight:800,
            fontSize:'1.2rem',
            cursor:'pointer',
            boxShadow:'0 4px 20px rgba(245,166,35,0.4)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          🚀 Begin Your Journey!
        </motion.button>

        {/* 3 feature cards at bottom */}
        <motion.div
          initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.7 }}
          style={{ display:'flex', gap:'16px', flexWrap:'wrap', justifyContent:'center', marginTop: '8px' }}
        >
          {[
            {icon: '📊', text: 'Read & Build', color: 'rgba(96,165,250,0.15)' },
            {icon: '🧱', text: 'Simulations', color: 'rgba(248,113,113,0.15)' },
            {icon: '🏆', text: '10 Game Worlds', color: 'rgba(250,204,21,0.15)' }
          ].map((card, idx) => (
            <div key={idx} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '16px',
              width: '140px', height: '110px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.2s'
            }}>
              <div style={{
                  width: '44px', height: '44px', borderRadius: '12px',
                  background: card.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '1.5rem'
              }}>
                  {card.icon}
              </div>
              <span style={{
                fontFamily: '"Poppins"', fontSize: '0.8rem', fontWeight: 500,
                color: 'rgba(255,255,255,0.8)', textAlign: 'center'
              }}>
                {card.text}
              </span>
            </div>
          ))}
        </motion.div>

      </div>
    </div>
  )
}
