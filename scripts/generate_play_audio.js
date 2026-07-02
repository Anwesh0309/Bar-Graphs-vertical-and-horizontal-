// Generate narration audio for all 10 worlds × 10 questions
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

const WORLDS = [
  { id:'fruit-stall', name:'Fruit Stall Market', questions:[
    'How many apples did Aunty Lin sell?',
    'Which fruit did Aunty Lin sell the most?',
    'Which fruit did Aunty Lin sell the least?',
    'How many more apples than mangoes did Aunty Lin sell?',
    'How many fewer longans than apples were sold?',
    'The scale on the graph goes up by two. How many apples were sold?',
    'How many apples and mangoes were sold altogether?',
    'If two more apples were sold, how many apples would there be in total?',
    'How many apples and longans were sold altogether?',
    'The apples bar is how many times taller than the longans bar?',
  ]},
  { id:'pet-shop', name:'Pet Shop Survey', questions:[
    'How many more hamsters than goldfish were sold at the pet shop?',
    'How many fewer goldfish than rabbits were sold?',
    'Which pet was the most popular at the shop?',
    'How many hamsters were sold at the pet shop?',
    'How many goldfish and rabbits were sold altogether?',
    'The pet shop sold goldfish and hamsters. What is the difference in the number sold?',
    'Which two pets were sold the same number of times?',
    'If three more goldfish were sold, would goldfish still be fewer than hamsters?',
    'The shop sold the fewest of which pet?',
    'How many pets were sold in total across goldfish, hamsters, and rabbits?',
  ]},
  { id:'toy-town', name:'Toy Town Tally', questions:[
    'How many children chose cars as their favourite toy?',
    'Which toy was the most popular in Toy Town?',
    'Which toy was the least popular?',
    'How many more children chose dolls than blocks?',
    'How many children chose cars or puzzles altogether?',
    'The scale shows every two toys. How many more cars than robots?',
    'In the horizontal bar graph, which bar reaches exactly six on the axis?',
    'If four more children chose cars, how many would choose cars in total?',
    'How many fewer children chose blocks than dolls?',
    'What is the total number of children who chose cars, dolls, and blocks?',
  ]},
  { id:'weather', name:'Weather Watchers', questions:[
    'How many sunny hours were recorded on Monday?',
    'On which day were the most sunny hours recorded?',
    'How many more hours of sun on Wednesday than on Tuesday?',
    'The scale on this graph goes up by five. What is the value halfway between ten and fifteen?',
    'How many sunny hours were recorded on Monday and Wednesday combined?',
    'On which day were there the fewest sunny hours?',
    'If there were five more sunny hours on Friday, what would the total be?',
    'How many hours are shown by a bar that reaches the third gridline? Scale equals five.',
    'What is the difference in sunny hours between the highest and lowest day?',
    'What is the total sunny hours across all five days?',
  ]},
  { id:'class-survey', name:'Class Survey Corner', questions:[
    'How many students in the class chose reading as their hobby?',
    'Which hobby was chosen by exactly eight students?',
    'How many more students chose sports than singing?',
    'How many students chose drawing or dancing as their hobby?',
    'The graph uses a scale of two. How many students chose reading?',
    'Which two hobbies were chosen by the same number of students?',
    'If three more students chose drawing, how many would choose it in total?',
    'How many students chose reading and sports altogether?',
    'Which hobby did the fewest students choose?',
    'What is the total number of students surveyed for all four hobbies shown?',
  ]},
  { id:'space-mission', name:'Space Mission Data', questions:[
    'A rocket visited Mercury and Venus. How many planets did it visit in total?',
    'If four more missions were sent to Mars, what is the new total?',
    'Six missions to Jupiter were cancelled. How many Jupiter missions remain?',
    'How many more missions went to Saturn than to Mercury?',
    'How many missions went to Mars, Venus, and Saturn in total?',
    'After eight successful missions return from Jupiter, how many are still out?',
    'How many missions in total went to the top two destinations?',
    'If missions to Mars and Venus were combined into one planet, what is the total?',
    'Which planet received the most missions? How many did it receive?',
    'What is the total number of missions shown across all planets?',
  ]},
  { id:'art-class', name:'Art Class Colours', questions:[
    'How many students used red paint in art class?',
    'In the vertical graph, which colour bar is the tallest?',
    'How many more students used blue than yellow?',
    'Which colour was used by exactly four more students than red?',
    'How many students used green or purple paint?',
    'The scale is two. How many students used blue paint?',
    'If five more students used yellow, how many use it now?',
    'Which colour was used the least?',
    'What is the total number of students who used red, blue, and green?',
    'How many fewer students used yellow than green?',
  ]},
  { id:'sports-day', name:'Sports Day Scores', questions:[
    'What is the total score for Team Red and Team Blue combined?',
    'Which team scored the highest on Sports Day?',
    'How many more points did Team Green score than Team Yellow?',
    'What are the total points scored by the top three teams?',
    'What is the total score across all teams shown?',
    'Which team scored the lowest?',
    'If Team Red scored five more points, what would their total be?',
    'What is the difference between the highest and lowest scores?',
    'Scale equals five. How many points did Team Blue score?',
    'Team Green and Team Yellow will share their points equally. How many each?',
  ]},
  { id:'nature-trail', name:'Nature Trail Count', questions:[
    'How many butterflies were spotted on the nature trail?',
    'Which animal was spotted the most on the trail?',
    'Which animal was spotted the least?',
    'How many more birds than frogs were spotted?',
    'How many beetles and squirrels were spotted altogether?',
    'The scale is two. How many more butterflies than frogs?',
    'If six more butterflies were spotted, how many would there be?',
    'How many animals were counted across beetles, birds, and frogs?',
    'How many fewer frogs than birds were spotted?',
    'What is the total number of all animals spotted on the trail?',
  ]},
  { id:'data-castle', name:'Data Castle Challenge', questions:[
    'How many knights live in Data Castle?',
    'How many more wizards than archers are there in the castle?',
    'How many knights and dragons live in the castle in total?',
    'If eight more fairies join the castle, how many will there be?',
    'Which group in the castle is the largest?',
    'Six knights went on a quest. How many knights remain in the castle?',
    'The scale is four. How many fairies live in Data Castle?',
    'What is the combined total of wizards, archers, and dragons?',
    'What is the difference between the largest and smallest groups?',
    'What is the grand total of ALL groups in Data Castle?',
  ]},
]

async function generateOne(text, file) {
  const out = path.join(AUDIO_DIR, file)
  if (fs.existsSync(out)) { console.log(`  ✓ exists: ${file}`); return }
  const body = {
    text,
    model_id: MODEL,
    voice_settings: { stability:0.50, similarity_boost:0.82, style:0.25, use_speaker_boost:true }
  }
  try {
    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,{
      method:'POST',
      headers:{ 'xi-api-key':API_KEY, 'Content-Type':'application/json', 'Accept':'audio/mpeg' },
      body: JSON.stringify(body),
    })
    if (!res.ok) { console.error(`  ✗ ${file}: ${res.status}`); return }
    const buf = await res.arrayBuffer()
    fs.writeFileSync(out, Buffer.from(buf))
    console.log(`  ✓ generated: ${file}`)
  } catch(e) { console.error(`  ✗ ${file}:`, e.message) }
}

// Build phrase list
const phrases = []
const audioMapEntries = []

for (const world of WORLDS) {
  for (let qi = 0; qi < world.questions.length; qi++) {
    const text = world.questions[qi]
    const file = `play_${world.id}_q${qi+1}.mp3`
    phrases.push({ text, file })
    audioMapEntries.push(`  ${JSON.stringify(text)}: "/assets/audio/${file}"`)
  }
}

async function main() {
  console.log(`\n🎙️  Generating ${phrases.length} play question audio files...\n`)
  for (const p of phrases) {
    await generateOne(p.text, p.file)
    await new Promise(r=>setTimeout(r,380))
  }

  // Read existing audioMap and append new entries
  const mapPath = path.join(ROOT,'src','utils','audioMap.js')
  let existing = fs.readFileSync(mapPath,'utf8')
  // Remove closing }
  existing = existing.replace(/\n\}\s*$/, '')
  const newEntries = audioMapEntries.join(',\n')
  const newMap = existing + ',\n' + newEntries + '\n}\n'
  fs.writeFileSync(mapPath, newMap)
  console.log(`\n✅ Done! ${phrases.length} play audio files generated, audioMap.js updated.`)
}

main().catch(console.error)
