import React, { createContext, useContext, useState, useRef, useCallback } from 'react'
import { audioMap } from '../utils/audioMap'

const AudioContext = createContext(null)

export function AudioProvider({ children }) {
  const [muted, setMuted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef(null)
  const queueRef = useRef([])
  const isPlayingRef = useRef(false)

  const stopAll = useCallback(() => {
    queueRef.current = []
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }
    isPlayingRef.current = false
    setPlaying(false)
  }, [])

  const playNext = useCallback(() => {
    if (queueRef.current.length === 0) {
      isPlayingRef.current = false
      setPlaying(false)
      return
    }
    const text = queueRef.current.shift()
    const url = audioMap[text]
    if (!url || muted) {
      playNext()
      return
    }
    isPlayingRef.current = true
    setPlaying(true)
    const audio = new Audio(url)
    audioRef.current = audio
    audio.onended = () => { playNext() }
    audio.onerror = () => { playNext() }
    audio.play().catch(() => { playNext() })
  }, [muted])

  const speak = useCallback((texts) => {
    stopAll()
    if (muted) return
    const arr = Array.isArray(texts) ? texts : [texts]
    queueRef.current = [...arr]
    playNext()
  }, [muted, stopAll, playNext])

  const toggleMute = useCallback(() => {
    setMuted(m => {
      if (!m) stopAll()
      return !m
    })
  }, [stopAll])

  return (
    <AudioContext.Provider value={{ muted, toggleMute, speak, stopAll, playing }}>
      {children}
    </AudioContext.Provider>
  )
}

export function useAudio() {
  return useContext(AudioContext)
}
