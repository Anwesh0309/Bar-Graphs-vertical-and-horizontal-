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
    // Try to find the audio file for this question by stem text
    const stemUrl = audioMap[question.stem]
    // Also try by worldId + question index pattern
    const worldKey = worldId ? `/assets/audio/play_${worldId}_q${questionNum}.mp3` : null
    const url = stemUrl || worldKey
    if (url) {
      setTimeout(() => speak([url]), 200)
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
    }, 4000)
  }

  if (!question) return null
  const { graph, stem, options, correctAnswer, explanation } = question

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
      {/* Question stem */}
      <div style={{
        background: 'rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '12px 16px',
        fontFamily: '"Baloo 2"',
        fontWeight: 800,
        fontSize: 'clamp(1rem,2.4vw,1.2rem)',
        color: 'white',
        lineHeight: 1.5,
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: '#FFC94A', marginRight: '6px', fontWeight: 900 }}>Q{questionNum}.</span>
        {stem}
      </div>

      {/* Bar graph */}
      <div style={{
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        background: 'rgba(0,0,0,0.3)', borderRadius: '14px',
        padding: '8px', flexShrink: 0,
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
          let bg = 'rgba(255,255,255,0.08)'
          let border = '2px solid rgba(255,255,255,0.15)'
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
