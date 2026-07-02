// Generate simulation wrong-answer explanation audio files
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const AUDIO_DIR = path.join(ROOT, 'public', 'assets', 'audio')
if (!fs.existsSync(AUDIO_DIR)) fs.mkdirSync(AUDIO_DIR, { recursive: true })

const envPath = path.join(ROOT, '.env.local')
let API_KEY = ''
if (fs.existsSync(envPath)) {
  const m = fs.readFileSync(envPath,'utf8').match(/VITE_ELEVENLABS_API_KEY=(.+)/)
  if (m) API_KEY = m[1].trim()
}
if (!API_KEY) { console.error('No API key'); process.exit(1) }

const VOICE_ID = 'Xb7hH8MSUJpSbSDYk0k2'
const MODEL = 'eleven_multilingual_v2'

const phrases = [
  // Station B — Scale Slider wrong-answer explanations
  { text: "The answer is 9. No matter what scale you choose, the Dogs bar always represents 9 units. The scale only changes the gridlines, not the data!", file: 'sim_exp_scale_q1', style: 'encouragement' },
  { text: "The answer is 2. At scale 5, gridlines appear at 0, 5, and 10. The Green bar with value 10 crosses exactly 2 gridlines!", file: 'sim_exp_scale_q2', style: 'emphasis' },
  { text: "The answer is Wed, 9. Wednesday has the tallest bar, reaching the value 9 on the scale!", file: 'sim_exp_scale_q3', style: 'statement' },
  // Station C — Orientation Flip wrong-answer explanations
  { text: "The answer is Dogs. Dogs has the value 9, the highest number, so its bar is the longest in both vertical and horizontal views!", file: 'sim_exp_orient_q1', style: 'encouragement' },
  { text: "The answer is Yellow. Yellow has the value 3, the smallest number, so it has the shortest bar in the graph!", file: 'sim_exp_orient_q2', style: 'statement' },
  { text: "The answer is No. Flipping the orientation never changes the data. The numbers stay exactly the same — only the direction of the bars changes!", file: 'sim_exp_orient_q3', style: 'emphasis' },
]

const STYLE = {
  statement:    { stability:0.55, similarity_boost:0.80, style:0.20 },
  encouragement:{ stability:0.50, similarity_boost:0.82, style:0.35 },
  emphasis:     { stability:0.40, similarity_boost:0.85, style:0.40 },
}

async function gen(phrase) {
  const out = path.join(AUDIO_DIR, `${phrase.file}.mp3`)
  if (fs.existsSync(out)) { console.log(`  ✓ exists: ${phrase.file}.mp3`); return }
  const vs = STYLE[phrase.style] || STYLE.statement
  const body = { text: phrase.text, model_id: MODEL,
    voice_settings: { stability:vs.stability, similarity_boost:vs.similarity_boost, style:vs.style, use_speaker_boost:true } }
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,{
      method:'POST',
      headers:{ 'xi-api-key':API_KEY, 'Content-Type':'application/json', 'Accept':'audio/mpeg' },
      body: JSON.stringify(body),
    })
    if (!res.ok) { console.error(`  ✗ ${phrase.file}: ${res.status}`); return }
    fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()))
    console.log(`  ✓ generated: ${phrase.file}.mp3`)
  } catch(e) { console.error(`  ✗ ${phrase.file}:`, e.message) }
}

async function main() {
  console.log(`\n🎙️  Generating ${phrases.length} simulation explanation audio files...\n`)
  for (const p of phrases) { await gen(p); await new Promise(r=>setTimeout(r,380)) }
  console.log('\n✅ Done!')
}
main().catch(console.error)
