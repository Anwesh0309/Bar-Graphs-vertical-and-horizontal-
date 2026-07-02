import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BarGraph from './BarGraph'
import { useAudio } from '../context/AudioContext'
import { audioMap } from '../utils/audioMap'
import { narrationScripts } from '../utils/narration'

export default function QuestionCard({ question, onAnswer, questionNum, total, worldId }) {
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState(null)
  const { speak, stopAll } = useAudio()
  const timerRef = useRef(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  // Narrate the question stem when it appears
  useEffect(() => {
    setSelected(null)
    setShowFeedback(false)
    setFeedbackType(null)
    if (!question) return
    
    // Play the narration by passing the question text directly,
    // which matches a key in the audioMap.
    if (question.stem) {
      setTimeout(() => speak([question.stem]), 200)
    }
  }, [question?.id, questionNum])

  const handleAnswer = (opt) => {
    if (selected !== null) return
    setSelected(opt)

    const isCorrect = String(opt) === String(question.correctAnswer)
    setFeedbackType(isCorrect ? 'correct' : 'wrong')
    setShowFeedback(true)

    stopAll()
    if (isCorrect) {
      speak(narrationScripts.play.correct)
    } else {
      speak(narrationScripts.play.wrong)
    }

    timerRef.current = setTimeout(() => {
      setShowFeedback(false)
      onAnswer(opt, isCorrect)
    }, 1000)
  }

  if (!question) return null
  const { graph, stem, options, correctAnswer, explanation } = question

  return (
    <div style={{ 
      display: 'flex', flexDirection: 'column', height: '100%', gap: '16px',
      background: 'rgba(255,255,255,0.03)', // subtle dark card background like SS
      border: '1px solid rgba(255,255,255,0.05)',
      borderRadius: '16px',
      padding: '24px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
    }}>
      {/* Question stem */}
      <h2 style={{
        fontFamily: '"Poppins", sans-serif',
        fontWeight: 700,
        fontSize: 'clamp(1.1rem,2.5vw,1.35rem)',
        color: 'white',
        lineHeight: 1.4,
        textAlign: 'center',
        margin: '0 0 8px 0'
      }}>
        {stem}
      </h2>

      {/* Bar graph */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'rgba(0,0,0,0.2)', borderRadius: '12px',
        padding: '12px', flexShrink: 0,
        margin: '0 auto', maxWidth: '100%', width: 'fit-content'
      }}>
        <BarGraph
          orientation={graph.orientation === 'mixed' ? 'vertical' : graph.orientation}
          categories={graph.categories}
          scale={graph.scale}
          maxValue={Math.ceil(Math.max(...graph.categories.map(c=>c.value)) / graph.scale) * graph.scale + graph.scale}
          animated={false}
          showValues={false}
          compact={true}
        />
      </div>

      {/* Answer options */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '8px',
        flexShrink: 0,
      }}>
        {options.map((opt, i) => {
          const isSelected = selected === opt
          const isCorrect = String(opt) === String(correctAnswer)
          let bg = 'rgba(255,255,255,0.06)'
          let border = '2px solid rgba(255,255,255,0.1)'
          if (isSelected) {
            if (isCorrect) { bg = 'rgba(74,222,128,0.25)'; border = '2px solid #4ADE80' }
            else { bg = 'rgba(232,93,140,0.25)'; border = '2px solid #E85D8C' }
          } else if (selected !== null && isCorrect) {
            bg = 'rgba(74,222,128,0.15)'; border = '2px solid #4ADE8066'
          }

          return (
            <motion.button
              key={opt}
              whileHover={selected === null ? { scale: 1.03 } : {}}
              whileTap={selected === null ? { scale: 0.97 } : {}}
              onClick={() => handleAnswer(opt)}
              disabled={selected !== null}
              style={{
                background: bg, border,
                borderRadius: '12px', padding: '24px 12px',
                fontFamily: '"Poppins", sans-serif', fontWeight: 700,
                fontSize: '1.4rem', color: 'white',
                cursor: selected !== null ? 'default' : 'pointer',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}
            >
              {opt}
            </motion.button>
          )
        })}
      </div>

      {/* Feedback popup — auto-dismiss after 1.2s, no continue button */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '14px',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <div style={{
              background: feedbackType === 'correct' ? '#4caf50' : '#e53935',
              borderRadius: '24px',
              padding: '30px 40px',
              textAlign: 'center',
              fontFamily: '"Poppins", sans-serif',
              boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
              width: '80%', maxWidth: '400px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px'
            }}>
              <div style={{ fontSize: '3.5rem', lineHeight: 1, filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))' }}>
                {feedbackType === 'correct' ? '🎉' : '🥺'}
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.8rem', color: 'white', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {feedbackType === 'correct' ? 'Correct!' : 'Not quite!'}
              </div>
              {explanation && (
                <div style={{
                  fontSize: '1rem', color: 'white',
                  fontWeight: 500, lineHeight: 1.5,
                  marginTop: '4px',
                }}>
                  {explanation}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
