// Randomisation engine for question generation

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function sample(arr, n) {
  const shuffled = [...arr].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(n, arr.length))
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5)
}

const BAR_COLORS = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF9F43','#00D2FF','#FF6B9D']

function computeAnswer(type, dataset, template) {
  const sorted = [...dataset].sort((a,b) => b.value - a.value)
  switch(type) {
    case 'read-value': {
      const cat = template.catA || dataset[0].label
      const found = dataset.find(d => d.label === cat)
      return found ? found.value : dataset[0].value
    }
    case 'compare': {
      const a = dataset.find(d => d.label === template.catA)
      const b = dataset.find(d => d.label === template.catB)
      if (a && b) return Math.abs(a.value - b.value)
      return Math.abs(sorted[0].value - sorted[1].value)
    }
    case 'two-step': {
      if (template.catA && template.catB && template.catC) {
        const a = dataset.find(d=>d.label===template.catA)
        const b = dataset.find(d=>d.label===template.catB)
        const c = dataset.find(d=>d.label===template.catC)
        return (a?.value||0)+(b?.value||0)+(c?.value||0)
      }
      if (template.catA && template.catB) {
        const a = dataset.find(d=>d.label===template.catA)
        const b = dataset.find(d=>d.label===template.catB)
        if (template.stemTemplate && template.stemTemplate.includes('share')) {
          return Math.round(((a?.value||0)+(b?.value||0))/2)
        }
        return (a?.value||0)+(b?.value||0)
      }
      if (template.val !== undefined && template.catA) {
        const a = dataset.find(d=>d.label===template.catA)
        if (template.stemTemplate && template.stemTemplate.includes('remain')) {
          return (a?.value||0) - template.val
        }
        return (a?.value||0) + template.val
      }
      return dataset.reduce((s,d)=>s+d.value,0)
    }
    default:
      return dataset[0].value
  }
}

function generateDistractors(strategy, dataset, correct, scale) {
  const distractors = new Set()
  const sc = scale || 1

  const addSafe = (v) => {
    if (v !== correct && v > 0) distractors.add(v)
  }

  if (strategy === 'off-by-scale') {
    addSafe(correct + sc)
    addSafe(correct - sc)
    addSafe(correct + sc * 2)
    addSafe(correct - sc * 2)
  } else if (strategy === 'off-by-one-bar') {
    dataset.forEach(d => { if (d.value !== correct) addSafe(d.value) })
    addSafe(correct + 1)
    addSafe(correct - 1)
  } else {
    // wrong-category
    dataset.forEach(d => { if (d.value !== correct) addSafe(d.value) })
    addSafe(correct + sc)
    addSafe(correct - sc)
  }

  const result = [...distractors].filter(v => v > 0 && v !== correct)
  while (result.length < 3) {
    const r = correct + randomInt(1, 4) * (Math.random() > 0.5 ? 1 : -1)
    if (r > 0 && r !== correct && !result.includes(r)) result.push(r)
  }
  return result.slice(0, 3)
}

function fillTemplate(tmpl, binding) {
  let out = tmpl
  Object.entries(binding).forEach(([k,v]) => {
    out = out.replace(new RegExp(`\\{${k}\\}`, 'g'), v)
  })
  return out
}

export function instantiateQuestion(template) {
  const numCats = template.stemTemplate.includes('{catC}') ? 4 : 
                  template.stemTemplate.includes('{catB}') ? 3 : 2
  const cats = sample(template.categoryPool, Math.max(numCats, 3))
  const scale = pick(template.scaleOptions)

  const values = cats.map(() => {
    let v = randomInt(template.valueRange[0], template.valueRange[1])
    v = Math.round(v / scale) * scale || scale
    return v
  })

  const dataset = cats.map((label, i) => ({
    label,
    value: values[i],
    color: BAR_COLORS[i % BAR_COLORS.length]
  }))

  const val = randomInt(1, 4) * scale

  const binding = {
    catA: cats[0],
    catB: cats[1] || cats[0],
    catC: cats[2] || cats[1],
    scale,
    val,
    val1: scale * 2,
    val2: scale * 4,
  }

  const stem = fillTemplate(template.stemTemplate, binding)
  const explanation = fillTemplate(template.explanation || '', binding)

  // Compute correct answer
  let correct
  const type = template.type

  if (template.stemTemplate.includes('most') || template.stemTemplate.includes('highest') || template.stemTemplate.includes('tallest') || template.stemTemplate.includes('longest') || template.stemTemplate.includes('most popular') || template.stemTemplate.includes('largest')) {
    const max = dataset.reduce((a,b) => a.value > b.value ? a : b)
    correct = max.label
    const wrong = dataset.filter(d=>d.label!==max.label).map(d=>d.label)
    while(wrong.length < 3) wrong.push(dataset[Math.floor(Math.random()*dataset.length)].label)
    const options = shuffle([correct, ...wrong.slice(0,3)])
    const orient = template.orientation === 'mixed' ? (Math.random()>0.5?'vertical':'horizontal') : template.orientation
    return { id: template.id, stem, explanation, graph: { orientation: orient, categories: dataset, scale }, options, correctAnswer: correct, type }
  }

  if (template.stemTemplate.includes('least') || template.stemTemplate.includes('fewest') || template.stemTemplate.includes('lowest') || template.stemTemplate.includes('smallest') || template.stemTemplate.includes('shortest')) {
    const min = dataset.reduce((a,b) => a.value < b.value ? a : b)
    correct = min.label
    const wrong = dataset.filter(d=>d.label!==min.label).map(d=>d.label)
    while(wrong.length < 3) wrong.push(dataset[Math.floor(Math.random()*dataset.length)].label)
    const options = shuffle([correct, ...wrong.slice(0,3)])
    const orient = template.orientation === 'mixed' ? (Math.random()>0.5?'vertical':'horizontal') : template.orientation
    return { id: template.id, stem, explanation, graph: { orientation: orient, categories: dataset, scale }, options, correctAnswer: correct, type }
  }

  const augBindings = { catA: cats[0], catB: cats[1], catC: cats[2], val }
  correct = computeAnswer(type, dataset, augBindings)
  if (typeof correct !== 'number' || isNaN(correct) || correct < 0) correct = dataset[0].value

  const distractors = generateDistractors(template.distractorStrategy, dataset, correct, scale)
  const options = shuffle([correct, ...distractors])
  const orient = template.orientation === 'mixed' ? (Math.random()>0.5?'vertical':'horizontal') : template.orientation

  return {
    id: template.id,
    stem,
    explanation,
    graph: { orientation: orient, categories: dataset, scale },
    options: options.map(String),
    correctAnswer: String(correct),
    type
  }
}

export function pickQuestionsForWorld(worldId, bank, count = 8) {
  const pool = bank.filter(t => t.worldId === worldId)
  const shuffled = shuffle(pool)
  const selected = shuffled.slice(0, Math.min(count, shuffled.length))
  return selected.map(t => instantiateQuestion(t))
}
