import React from 'react'
import { useAudio } from '../context/AudioContext'

export default function SpeakerButton() {
  const { muted, toggleMute } = useAudio()
  return (
    <button
      className="speaker-btn"
      onClick={toggleMute}
      aria-label={muted ? 'Unmute narration' : 'Mute narration'}
      title={muted ? 'Unmute' : 'Mute'}
    >
      {muted ? '🔇' : '🔊'}
    </button>
  )
}
