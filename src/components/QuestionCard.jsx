import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BarGraph from './BarGraph'
import { useAudio } from '../context/AudioContext'
import { narrationScripts } from '../utils/narration'

export default function QuestionCard({ question, onAnswer, questionNum, total }) {
  const [selected, setSelected] = useState(null)
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedbackType, setFeedbackType] = useState(null)
  const { speak, stopAll } = useAudio()
  const timerRef = useRef(null)

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [])

  useEffect(() => {
    setSelected(null)
    setShowFeedback(false)
    setFeedbackType(null)
  }, [question?.id])

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
    }, 1200)
  }

  if (!question) return null
  const { graph, stem, options, correctAnswer, explanation } = question

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '8px' }}>
      {/* Question stem */}
      <div style={{
        background: 'rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '10px 14px',
        fontFamily: '"Baloo 2"',
        fontWeight: 700,
        fontSize: '1rem',
        color: 'white',
        lineHeight: 1.4,
        textAlign: 'center',
        flexShrink: 0,
      }}>
        <span style={{ color: '#FFC94A', marginRight: '6px' }}>Q{questionNum}.</span>
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
                borderRadius: '12px', padding: '14px 8px',
                fontFamily: '"Baloo 2"', fontWeight: 800,
                fontSize: '1.2rem', color: 'white',
                cursor: selected !== null ? 'default' : 'pointer',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: '6px',
              }}
            >
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: 'rgba(255,255,255,0.12)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.75rem', fontWeight: 800, flexShrink: 0,
              }}>
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </motion.button>
          )
        })}
      </div>

      {/* Feedback popup — auto-dismiss after 1.2s, no continue button */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.55)',
              borderRadius: '20px',
              zIndex: 10,
              pointerEvents: 'none',
            }}
          >
            <div style={{
              background: feedbackType === 'correct'
                ? 'linear-gradient(135deg,rgba(74,222,128,0.95),rgba(16,185,129,0.95))'
                : 'linear-gradient(135deg,rgba(232,93,140,0.95),rgba(190,24,93,0.95))',
              borderRadius: '18px',
              padding: '20px 32px',
              textAlign: 'center',
              fontFamily: '"Baloo 2"',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              maxWidth: '80%',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '6px' }}>
                {feedbackType === 'correct' ? '🎉' : '💡'}
              </div>
              <div style={{ fontWeight: 800, fontSize: '1.3rem', color: 'white' }}>
                {feedbackType === 'correct' ? 'Correct!' : 'Not quite!'}
              </div>
              {feedbackType === 'wrong' && explanation && (
                <div style={{
                  marginTop: '6px', fontSize: '0.8rem', color: 'rgba(255,255,255,0.9)',
                  fontWeight: 600, lineHeight: 1.4,
                }}>
                  {explanation}
                </div>
              )}
              {feedbackType === 'correct' && (
                <div style={{ marginTop: '4px', color: 'rgba(255,255,255,0.85)', fontWeight: 600, fontSize: '0.85rem' }}>
                  +10 XP ⭐
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
