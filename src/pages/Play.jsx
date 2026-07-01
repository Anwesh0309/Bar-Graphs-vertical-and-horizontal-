import React, { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PhaseStepper from '../components/PhaseStepper'
import WorldCard from '../components/WorldCard'
import HUD from '../components/HUD'
import QuestionCard from '../components/QuestionCard'
import { useAudio } from '../context/AudioContext'
import { useProgress } from '../context/ProgressContext'
import { worlds } from '../data/worlds'
import { questionBank } from '../data/questionBank'
import { pickQuestionsForWorld } from '../utils/randomize'
import { narrationScripts } from '../utils/narration'

function computeStars(correct, total) {
  const acc = total > 0 ? correct / total : 0
  if (acc >= 0.875) return 3
  if (acc >= 0.625) return 2
  if (acc >= 0.375) return 1
  return 0
}

export default function Play() {
  const navigate = useNavigate()
  const { speak, stopAll } = useAudio()
  const { state, dispatch } = useProgress()

  const [view, setView] = useState('worlds') // 'worlds' | 'playing' | 'done'
  const [activeWorld, setActiveWorld] = useState(null)
  const [questions, setQuestions] = useState([])
  const [qIdx, setQIdx] = useState(0)
  const [sessionHearts, setSessionHearts] = useState(3)
  const [sessionStreak, setSessionStreak] = useState(0)
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionXp, setSessionXp] = useState(0)

  React.useEffect(() => {
    if (view === 'worlds') {
      speak(narrationScripts.play.intro)
    }
    return () => stopAll()
  }, [view])

  const handleWorldSelect = useCallback((world) => {
    const qs = pickQuestionsForWorld(world.id, questionBank, 8)
    setActiveWorld(world)
    setQuestions(qs)
    setQIdx(0)
    setSessionHearts(3)
    setSessionStreak(0)
    setSessionCorrect(0)
    setSessionXp(0)
    dispatch({ type: 'RESET_HEARTS' })
    setView('playing')
  }, [dispatch])

  const handleAnswer = useCallback((opt, isCorrect) => {
    if (isCorrect) {
      const bonus = sessionStreak >= 2 ? 5 : 0
      const gained = 10 + bonus
      dispatch({ type: 'CORRECT_ANSWER' })
      setSessionStreak(s => s + 1)
      setSessionCorrect(s => s + 1)
      setSessionXp(xp => xp + gained)

      if (sessionStreak + 1 >= 3) {
        setTimeout(() => speak(narrationScripts.play.streak), 300)
      }
    } else {
      dispatch({ type: 'WRONG_ANSWER' })
      setSessionStreak(0)
      setSessionHearts(h => {
        const next = h - 1
        if (next <= 0) {
          setTimeout(() => finishWorld(sessionCorrect, qIdx + 1), 1400)
        }
        return next
      })
    }

    const nextIdx = qIdx + 1
    if (nextIdx >= questions.length) {
      setTimeout(() => finishWorld(
        isCorrect ? sessionCorrect + 1 : sessionCorrect,
        questions.length
      ), 1400)
    } else {
      setTimeout(() => setQIdx(nextIdx), 1400)
    }
  }, [qIdx, questions, sessionCorrect, sessionStreak, dispatch])

  const finishWorld = useCallback((correct, total) => {
    const stars = computeStars(correct, total)
    dispatch({
      type: 'SET_WORLD_STARS',
      worldId: activeWorld.id,
      stars, correct, total,
    })
    dispatch({ type: 'COMPLETE_PHASE', phase: 'play' })
    stopAll()
    speak(narrationScripts.play.worldDone)
    setTimeout(() => setView('done'), 800)
  }, [activeWorld, dispatch, speak, stopAll])

  const handleNextWorld = () => {
    setView('worlds')
  }

  const handleToReflect = () => {
    stopAll()
    dispatch({ type: 'COMPLETE_PHASE', phase: 'play' })
    navigate('/reflect')
  }

  // ── Worlds grid ──
  if (view === 'worlds') {
    return (
      <div className="page-frame">
        <PhaseStepper active="play" />
        <div className="content-area" style={{
          padding: '10px 14px', gap: '10px',
          alignItems: 'center', justifyContent: 'flex-start',
          overflow: 'hidden',
        }}>
          <div style={{ textAlign: 'center', flexShrink: 0 }}>
            <h2 style={{
              fontFamily: '"Baloo 2"', fontWeight: 800,
              fontSize: 'clamp(1.1rem,3vw,1.4rem)', color: 'white', margin: '0 0 2px',
            }}>🎮 Play — Choose Your World!</h2>
            <p style={{
              fontFamily: '"Poppins"', fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.55)', margin: 0,
            }}>Answer questions in each world. Earn stars and XP! ⭐</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            width: '100%', maxWidth: 580,
            flexShrink: 0,
          }}>
            {worlds.map(world => {
              const locked = !state.unlockedWorlds.includes(world.id)
              const stars = state.starsByWorld[world.id] || 0
              return (
                <WorldCard
                  key={world.id}
                  world={world}
                  starsEarned={stars}
                  locked={locked}
                  onClick={() => handleWorldSelect(world)}
                />
              )
            })}
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0,
            flexWrap: 'wrap', justifyContent: 'center',
          }}>
            <div style={{
              display: 'flex', gap: '12px',
              fontFamily: '"Baloo 2"', fontSize: '0.85rem', fontWeight: 700,
              color: 'rgba(255,255,255,0.7)',
            }}>
              <span>⭐ {state.xp} XP</span>
              <span>🔥 Best: {state.maxStreak}</span>
            </div>
            <button
              onClick={handleToReflect}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.15)',
                borderRadius: '50px', padding: '7px 18px',
                fontFamily: '"Baloo 2"', fontWeight: 700, fontSize: '0.85rem',
                color: 'white', cursor: 'pointer',
              }}
            >
              📋 View Results →
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Playing ──
  if (view === 'playing') {
    const q = questions[qIdx]
    return (
      <div className="page-frame">
        <PhaseStepper active="play" />
        <div className="content-area" style={{
          padding: '8px 12px', gap: '8px',
          overflow: 'hidden',
        }}>
          {/* World header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0,
          }}>
            <button
              onClick={() => { stopAll(); setView('worlds') }}
              style={{
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                fontFamily: '"Baloo 2"', fontWeight: 700, fontSize: '0.85rem',
                cursor: 'pointer', padding: '4px 8px',
              }}
            >← Worlds</button>
            <span style={{ fontSize: '1.2rem' }}>{activeWorld?.icon}</span>
            <span style={{
              fontFamily: '"Baloo 2"', fontWeight: 800, fontSize: '0.95rem', color: 'white',
            }}>{activeWorld?.name}</span>
          </div>

          {/* HUD */}
          <HUD
            stars={sessionCorrect}
            hearts={sessionHearts}
            streak={sessionStreak}
            questionNum={qIdx + 1}
            totalQuestions={questions.length}
            xp={state.xp + sessionXp}
          />

          {/* Progress bar */}
          <div style={{
            height: 4, background: 'rgba(255,255,255,0.1)',
            borderRadius: 2, overflow: 'hidden', flexShrink: 0,
          }}>
            <motion.div
              animate={{ width: `${((qIdx) / questions.length) * 100}%` }}
              style={{ height: '100%', background: 'linear-gradient(90deg,#F5A623,#FFC94A)' }}
            />
          </div>

          {/* Question */}
          <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
            <AnimatePresence mode="wait">
              <motion.div
                key={qIdx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.25 }}
                style={{ height: '100%' }}
              >
                {q && (
                  <QuestionCard
                    question={q}
                    onAnswer={handleAnswer}
                    questionNum={qIdx + 1}
                    total={questions.length}
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    )
  }

  // ── World done ──
  const worldStats = state.worldStats[activeWorld?.id] || { correct: sessionCorrect, total: questions.length }
  const stars = computeStars(worldStats.correct, worldStats.total)

  return (
    <div className="page-frame">
      <PhaseStepper active="play" />
      <div className="content-area" style={{
        alignItems: 'center', justifyContent: 'center',
        padding: '16px', gap: '14px',
      }}>
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            textAlign: 'center',
            background: 'rgba(255,255,255,0.06)',
            border: '2px solid rgba(245,166,35,0.3)',
            borderRadius: '24px',
            padding: '28px 32px',
            maxWidth: 400, width: '100%',
          }}
        >
          <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{activeWorld?.icon}</div>
          <h2 style={{
            fontFamily: '"Baloo 2"', fontWeight: 800,
            fontSize: '1.4rem', color: 'white', margin: '0 0 6px',
          }}>{activeWorld?.name}</h2>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '12px' }}>
            {[0,1,2].map(i => (
              <motion.span
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.15 }}
                style={{ fontSize: '1.8rem', opacity: i < stars ? 1 : 0.2 }}
              >⭐</motion.span>
            ))}
          </div>
          <div style={{
            fontFamily: '"Baloo 2"', fontWeight: 800,
            fontSize: '1.8rem', color: '#F5A623', marginBottom: '6px',
          }}>
            {worldStats.correct}/{worldStats.total} correct
          </div>
          <div style={{
            fontFamily: '"Poppins"', fontSize: '0.85rem',
            color: 'rgba(255,255,255,0.6)', marginBottom: '20px',
          }}>
            +{sessionXp} XP earned this round
          </div>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={handleNextWorld}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '2px solid rgba(255,255,255,0.2)',
                borderRadius: '50px', padding: '10px 22px',
                fontFamily: '"Baloo 2"', fontWeight: 800,
                fontSize: '0.95rem', color: 'white', cursor: 'pointer',
              }}
            >🌍 More Worlds</button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={handleToReflect}
              style={{
                background: 'linear-gradient(135deg,#F5A623,#FFC94A)',
                border: 'none', borderRadius: '50px',
                padding: '10px 22px',
                fontFamily: '"Baloo 2"', fontWeight: 800,
                fontSize: '0.95rem', color: '#1a1030', cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(245,166,35,0.4)',
              }}
            >📋 See Results!</motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
