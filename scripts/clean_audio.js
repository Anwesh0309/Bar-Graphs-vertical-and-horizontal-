// Removes orphaned .mp3 files not referenced in audioMap.js
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.join(__dirname, '..')
const AUDIO_DIR = path.join(ROOT, 'public', 'assets', 'audio')
const MAP_PATH = path.join(ROOT, 'src', 'utils', 'audioMap.js')

const mapContent = fs.readFileSync(MAP_PATH, 'utf8')
const referenced = new Set()
const regex = /\/assets\/audio\/([^"]+\.mp3)/g
let m
while ((m = regex.exec(mapContent)) !== null) referenced.add(m[1])

if (!fs.existsSync(AUDIO_DIR)) { console.log('No audio dir found.'); process.exit(0) }

const files = fs.readdirSync(AUDIO_DIR).filter(f => f.endsWith('.mp3'))
let removed = 0
for (const f of files) {
  if (!referenced.has(f)) {
    fs.unlinkSync(path.join(AUDIO_DIR, f))
    console.log(`  🗑️  Removed orphan: ${f}`)
    removed++
  }
}
console.log(`\n✅ Clean complete. ${removed} files removed, ${files.length - removed} kept.`)
