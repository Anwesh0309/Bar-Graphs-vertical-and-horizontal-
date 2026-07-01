// GraphQuest 360 — ElevenLabs Audio Generation Script
// Run: node scripts/generate_audio.js
// Requires: VITE_ELEVENLABS_API_KEY in .env.local

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')

// Load env
const envPath = path.join(ROOT, '.env.local')
let API_KEY = ''
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8')
  const match = envContent.match(/VITE_ELEVENLABS_API_KEY=(.+)/)
  if (match) API_KEY = match[1].trim()
}
if (!API_KEY) { console.error('No VITE_ELEVENLABS_API_KEY found'); process.exit(1) }

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'
const MODEL_ID = 'eleven_multilingual_v2'

const STYLE_SETTINGS = {
  statement:    { stability: 0.55, similarity_boost: 0.80, style: 0.20 },
  question:     { stability: 0.45, similarity_boost: 0.80, style: 0.30 },
  encouragement:{ stability: 0.50, similarity_boost: 0.82, style: 0.35 },
  emphasis:     { stability: 0.40, similarity_boost: 0.85, style: 0.40 },
  thinking:     { stability: 0.60, similarity_boost: 0.78, style: 0.15 },
  celebration:  { stability: 0.35, similarity_boost: 0.88, style: 0.50 },
}

const phrases = [
  // Home
  { text: "Ready to uncover hidden stories in data?", style: 'encouragement', file: 'home_ready' },
  { text: "Join Chart the Owl on a data adventure! Learn to read, build, and compare bar graphs through real stories, hands-on simulations, and 10 exciting worlds of practice.", style: 'statement', file: 'home_blurb' },

  // Wonder
  { text: "Hmm... I wonder...", style: 'thinking', file: 'wonder_hmm' },
  { text: "Mrs. Tan's class voted for their favourite fruit. How can she show everyone the results at a glance?", style: 'question', file: 'wonder_q1' },
  { text: "The Pet Shop sold 6 goldfish, 9 hamsters, and 4 rabbits this week. Which pet was the most popular?", style: 'question', file: 'wonder_q2' },
  { text: "Our school's Sports Day scores are all mixed up! How could a graph help us see who scored the most points?", style: 'question', file: 'wonder_q3' },
  { text: "What if we could turn numbers into pictures?", style: 'thinking', file: 'wonder_followup1' },
  { text: "What if a picture could tell the story better than numbers?", style: 'thinking', file: 'wonder_followup2' },
  { text: "Numbers in a list can be hard to compare — what if bars did the work?", style: 'thinking', file: 'wonder_followup3' },
  { text: "Let's find out!", style: 'encouragement', file: 'wonder_letsfind' },

  // Story
  { text: "Aunty Lin sold fruits at the market today. She counted 8 apples, 5 mangoes, and 3 longans sold.", style: 'statement', file: 'story_p1_text' },
  { text: "Let's help Aunty Lin show her sales!", style: 'encouragement', file: 'story_p1_owl' },
  { text: "Aunty Lin draws a line up — the vertical axis — and a line across — the horizontal axis — to make her graph.", style: 'statement', file: 'story_p2_text' },
  { text: "Every graph needs two axes to stand on!", style: 'emphasis', file: 'story_p2_owl' },
  { text: "She draws one bar for each fruit. The taller the bar, the more fruits she sold!", style: 'statement', file: 'story_p3_text' },
  { text: "Look — Apples have the tallest bar!", style: 'emphasis', file: 'story_p3_owl' },
  { text: "Now everyone can see at a glance which fruit sold the most — just by looking at the bars!", style: 'statement', file: 'story_p4_text' },
  { text: "That's the power of a bar graph!", style: 'celebration', file: 'story_p4_owl' },

  // Simulate
  { text: "Welcome to the Simulator! Explore bar graphs with no wrong answers here.", style: 'encouragement', file: 'sim_welcome' },
  { text: "Drag each bar to match the data in the table. When it matches, you'll see a green check!", style: 'statement', file: 'sim_barbuilder' },
  { text: "Watch how changing the scale changes the look of the graph — but not the data!", style: 'emphasis', file: 'sim_scale' },
  { text: "Toggle between vertical and horizontal to see the same data in two ways!", style: 'statement', file: 'sim_orient' },
  { text: "Can you spot the mistake in this graph? Tap on the error to find out!", style: 'question', file: 'sim_error' },
  { text: "Great job! You found the error!", style: 'celebration', file: 'sim_found_error' },
  { text: "Try a new data set!", style: 'encouragement', file: 'sim_newdata' },

  // Play
  { text: "Choose a world and answer 8 questions to earn stars and XP!", style: 'encouragement', file: 'play_intro' },
  { text: "Fantastic! That's correct!", style: 'celebration', file: 'play_correct' },
  { text: "Almost! Let's try again!", style: 'encouragement', file: 'play_wrong' },
  { text: "Amazing streak! Keep going!", style: 'celebration', file: 'play_streak' },
  { text: "You've completed this world!", style: 'celebration', file: 'play_world_done' },

  // Reflect
  { text: "Journey Complete! You finished all 5 phases!", style: 'celebration', file: 'reflect_complete' },
  { text: "Outstanding! You're a true Data Detective!", style: 'celebration', file: 'reflect_high' },
  { text: "Great progress! A little more practice and you'll master every bar!", style: 'encouragement', file: 'reflect_mid' },
  { text: "Good start! Let's revisit the Story and Simulate to build confidence.", style: 'encouragement', file: 'reflect_low' },
]

const AUDIO_DIR = path.join(ROOT, 'public', 'assets', 'audio')
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true })

async function generateAudio(phrase) {
  const outFile = path.join(AUDIO_DIR, `${phrase.file}.mp3`)
  if (fs.existsSync(outFile)) {
    console.log(`  ✓ Already exists: ${phrase.file}.mp3`)
    return
  }

  const settings = STYLE_SETTINGS[phrase.style] || STYLE_SETTINGS.statement
  const body = {
    text: phrase.text,
    model_id: MODEL_ID,
    voice_settings: {
      stability: settings.stability,
      similarity_boost: settings.similarity_boost,
      style: settings.style,
      use_speaker_boost: true,
    }
  }

  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`, {
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'audio/mpeg',
      },
      body: JSON.stringify(body),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error(`  ✗ Failed ${phrase.file}: ${res.status} ${err}`)
      return
    }

    const buffer = await res.arrayBuffer()
    fs.writeFileSync(outFile, Buffer.from(buffer))
    console.log(`  ✓ Generated: ${phrase.file}.mp3 (${phrase.text.slice(0, 40)}...)`)
  } catch (e) {
    console.error(`  ✗ Error ${phrase.file}:`, e.message)
  }
}

async function main() {
  console.log(`\n🎙️  GraphQuest 360 — Audio Generation`)
  console.log(`Voice: Alice (${VOICE_ID})`)
  console.log(`Generating ${phrases.length} audio files...\n`)

  for (const phrase of phrases) {
    await generateAudio(phrase)
    // Small delay to avoid rate limits
    await new Promise(r => setTimeout(r, 400))
  }

  // Regenerate audioMap.js
  const mapEntries = phrases.map(p =>
    `  ${JSON.stringify(p.text)}: "/assets/audio/${p.file}.mp3"`
  ).join(',\n')

  const mapContent = `// AUTO-GENERATED by scripts/generate_audio.js — DO NOT EDIT MANUALLY\nexport const audioMap = {\n${mapEntries}\n}\n`
  fs.writeFileSync(path.join(ROOT, 'src', 'utils', 'audioMap.js'), mapContent)

  console.log(`\n✅ Done! audioMap.js updated with ${phrases.length} entries.`)
}

main().catch(console.error)
