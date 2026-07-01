import React, { createContext, useContext, useReducer, useEffect } from 'react'

const STORAGE_KEY = 'graphquest_progress_v1'

const initialState = {
  xp: 0,
  streak: 0,
  maxStreak: 0,
  hearts: 3,
  starsByWorld: {},
  unlockedWorlds: ['fruit-stall'],
  completedPhases: [],
  currentPhase: 'home',
  worldStats: {},
}

function reducer(state, action) {
  switch (action.type) {
    case 'COMPLETE_PHASE': {
      const phases = state.completedPhases.includes(action.phase)
        ? state.completedPhases
        : [...state.completedPhases, action.phase]
      return { ...state, completedPhases: phases, currentPhase: action.phase }
    }
    case 'CORRECT_ANSWER': {
      const newStreak = state.streak + 1
      const bonus = newStreak >= 3 ? 5 : 0
      const newXp = state.xp + 10 + bonus
      const maxS = Math.max(state.maxStreak, newStreak)
      return { ...state, xp: newXp, streak: newStreak, maxStreak: maxS }
    }
    case 'WRONG_ANSWER': {
      return { ...state, hearts: Math.max(0, state.hearts - 1), streak: 0 }
    }
    case 'RESET_HEARTS': {
      return { ...state, hearts: 3, streak: 0 }
    }
    case 'SET_WORLD_STARS': {
      const { worldId, stars, correct, total } = action
      const existing = state.starsByWorld[worldId] || 0
      const newStars = Math.max(existing, stars)
      const newStarsByWorld = { ...state.starsByWorld, [worldId]: newStars }
      const newWorldStats = {
        ...state.worldStats,
        [worldId]: { correct, total, stars: newStars }
      }
      // Unlock next world
      const worlds = [
        'fruit-stall','pet-shop','toy-town','weather','class-survey',
        'space-mission','art-class','sports-day','nature-trail','data-castle'
      ]
      const idx = worlds.indexOf(worldId)
      let newUnlocked = [...state.unlockedWorlds]
      if (stars >= 1 && idx >= 0 && idx < worlds.length - 1) {
        const next = worlds[idx + 1]
        if (!newUnlocked.includes(next)) newUnlocked.push(next)
      }
      return { ...state, starsByWorld: newStarsByWorld, unlockedWorlds: newUnlocked, worldStats: newWorldStats }
    }
    case 'RESET_ALL': {
      return { ...initialState }
    }
    case 'HYDRATE': {
      return { ...initialState, ...action.payload }
    }
    default:
      return state
  }
}

const ProgressContext = createContext(null)

export function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        dispatch({ type: 'HYDRATE', payload: JSON.parse(saved) })
      }
    } catch {}
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {}
  }, [state])

  return (
    <ProgressContext.Provider value={{ state, dispatch }}>
      {children}
    </ProgressContext.Provider>
  )
}

export function useProgress() {
  return useContext(ProgressContext)
}
