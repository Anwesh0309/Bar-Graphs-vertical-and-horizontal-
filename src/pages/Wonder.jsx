import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import PhaseStepper from '../components/PhaseStepper'
import MascotBubble from '../components/MascotBubble'
import { useAudio } from '../context/AudioContext'
import { useProgress } from '../context/ProgressContext'
import { wonderPrompts } from '../data/wonderPrompts'
import { narrationScripts } from '../utils/narration'

export default function Wonder() {
  const navigate = useNavigate()
  const { speak, stopAll } = useAudio()
  const { dispatch } = useProgress()
  const [promptIdx] = useState(() => Math.floor(Math.random() * wonderPrompts.length))
  const prompt = wonderPrompts[promptIdx]

  useEffect(() => {
    speak([...narrationScripts.wonder.intro, prompt.audio, prompt.followUp])
    return () => stopAll()
  }, [])

  const handleInvestigate = () => {
    stopAll()
    dispatch({ type: 'COMPLETE_PHASE', phase: 'wonder' })
    navigate('/story')
  }

  return (
    <div className="page-frame">
      <PhaseStepper active="wonder" showHome={false} />
      <div className="content-area" style={{
        alignItems:'center', justifyContent:'center',
        padding:'12px 16px', gap:'14px',
      }}>
        {/* Mascot */}
        <motion.div
          initial={{ opacity:0, y:-8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
        >
          <MascotBubble message="Hmm... I wonder... 🤔" size="md" />
        </motion.div>

        {/* Mystery question card */}
        <motion.div
          initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.2 }}
          style={{
            background:'rgba(255,255,255,0.07)',
            border:'2px solid rgba(245,166,35,0.4)',
            borderRadius:'20px',
            padding:'22px 28px',
            maxWidth:580, width:'100%',
            textAlign:'center',
            boxShadow:'0 0 30px rgba(245,166,35,0.18)',
          }}
        >
          <div style={{
            fontFamily:'"Baloo 2"', fontWeight:900,
            fontSize:'clamp(1.05rem,2.8vw,1.35rem)',
            color:'#ffffff', lineHeight:1.55,
            marginBottom:'14px',
          }}>
            {prompt.question}
          </div>

          <div style={{
            fontFamily:'"Poppins"', fontStyle:'italic', fontWeight:600,
            fontSize:'clamp(0.9rem,2vw,1.05rem)',
            color:'rgba(255,255,255,0.72)',
            marginBottom:'14px',
            lineHeight:1.45,
          }}>
            {prompt.followUp}
          </div>

          <div style={{
            background:'linear-gradient(135deg,rgba(245,166,35,0.22),rgba(255,201,74,0.15))',
            border:'1.5px solid rgba(245,166,35,0.5)',
            borderRadius:'50px', padding:'9px 22px',
            fontFamily:'"Baloo 2"', fontWeight:900,
            fontSize:'clamp(0.9rem,2vw,1.05rem)',
            color:'#FFC94A',
            display:'inline-block',
          }}>
            {prompt.hint}
          </div>
        </motion.div>

        {/* Visual teaser — mini bar preview */}
        <motion.div
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          style={{
            display:'flex', alignItems:'flex-end', gap:'8px',
            background:'rgba(0,0,0,0.3)', borderRadius:'14px',
            padding:'12px 20px',
          }}
        >
          {[
            { label:'🍎', h:80, color:'#FF6B6B' },
            { label:'🥭', h:50, color:'#FFD93D' },
            { label:'🍈', h:30, color:'#6BCB77' },
          ].map((b,i) => (
            <motion.div key={i}
              initial={{ height:0 }} animate={{ height:b.h }}
              transition={{ delay:0.5+i*0.15, duration:0.5, ease:'easeOut' }}
              style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}
            >
              <div style={{
                width:36, height:b.h,
                background:`linear-gradient(to top,${b.color}cc,${b.color})`,
                borderRadius:'4px 4px 0 0',
                boxShadow:`0 0 8px ${b.color}88`,
              }} />
              <span style={{ fontSize:'1.2rem' }}>{b.label}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.button
          initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6 }}
          whileHover={{ scale:1.05 }} whileTap={{ scale:0.97 }}
          onClick={handleInvestigate}
          className="btn-gold"
          style={{ fontSize:'1.1rem', padding:'12px 32px' }}
        >
          🔍 Let's Investigate!
        </motion.button>
      </div>
    </div>
  )
}
