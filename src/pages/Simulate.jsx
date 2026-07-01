import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PhaseStepper from '../components/PhaseStepper'
import BarGraph from '../components/BarGraph'
import { useAudio } from '../context/AudioContext'
import { useProgress } from '../context/ProgressContext'
import { narrationScripts } from '../utils/narration'

// ── Datasets for simulations ────────────────────────────────────────────────
const DATASETS = [
  [
    { label:'Cats', value:6, color:'#FF6B6B' },
    { label:'Dogs', value:9, color:'#FFD93D' },
    { label:'Birds', value:4, color:'#6BCB77' },
    { label:'Fish', value:7, color:'#4D96FF' },
  ],
  [
    { label:'Red', value:8, color:'#FF6B6B' },
    { label:'Blue', value:5, color:'#4D96FF' },
    { label:'Green', value:10, color:'#6BCB77' },
    { label:'Yellow', value:3, color:'#FFD93D' },
  ],
  [
    { label:'Mon', value:7, color:'#C77DFF' },
    { label:'Tue', value:4, color:'#FF9F43' },
    { label:'Wed', value:9, color:'#00D2FF' },
    { label:'Thu', value:6, color:'#FF6B9D' },
  ],
]
function getDS(idx) { return DATASETS[idx % DATASETS.length] }

// ── Station A questions (Bar Builder) ───────────────────────────────────────
const BUILDER_Qs = [
  { q:'Drag the bars so Cats=6, Dogs=9, Birds=4, Fish=7. Match all bars!', dsIdx:0 },
  { q:'Make the Red bar reach 8, Blue=5, Green=10, Yellow=3. Go!', dsIdx:1 },
  { q:'Set Mon=7, Tue=4, Wed=9, Thu=6 on the bar graph below.', dsIdx:2 },
]

// ── Station B questions (Scale Slider) ──────────────────────────────────────
const SCALE_Qs = [
  {
    q:'The scale is set to 2. How many units does the tallest bar (Dogs = 9) show? Move the slider to scale=2 and read the Dogs bar.',
    answer: '9', hint: 'The data stays the same — only the gridlines change!',
    dsIdx: 0,
  },
  {
    q:'Change the scale to 5. How many gridlines does the Green bar (value=10) cross?',
    answer: '2', hint: 'At scale=5, gridlines are at 0, 5, 10 — so 2 gridlines.',
    dsIdx: 1,
  },
  {
    q:'Set scale to 1. Which bar is the tallest, and what is its value?',
    answer: 'Wed, 9', hint: 'At scale=1 every unit shows — find the highest bar!',
    dsIdx: 2,
  },
]

// ── Station C questions (Orientation Flip) ──────────────────────────────────
const ORIENT_Qs = [
  {
    q:'Flip to HORIZONTAL. Which animal now has the longest bar?',
    answer: 'Dogs', hint: 'Dogs = 9 — the longest horizontal bar.',
    dsIdx: 0,
  },
  {
    q:'In VERTICAL view, which bar is the shortest?',
    answer: 'Yellow', hint: 'Yellow = 3 — the lowest bar.',
    dsIdx: 1,
  },
  {
    q:'Flip between vertical and horizontal. Does the data (the numbers) change?',
    answer: 'No', hint: 'Orientation only changes how the graph looks, not the data!',
    dsIdx: 2,
  },
]

// ── Station D questions (Spot the Error) ────────────────────────────────────
const ERROR_SCENARIOS = [
  {
    title:'Pet Shop Sales',
    correct:  [{ label:'Cats',value:6,color:'#FF6B6B' },{ label:'Dogs',value:9,color:'#FFD93D' },{ label:'Birds',value:4,color:'#6BCB77' }],
    corrupted:[{ label:'Cats',value:3,color:'#FF6B6B' },{ label:'Dogs',value:9,color:'#FFD93D' },{ label:'Birds',value:4,color:'#6BCB77' }],
    errorIdx:0, q:'One bar is wrong! Cats were sold 6 times but the graph shows something different. Tap the wrong bar!',
    explanation:'The Cats bar shows 3, but 6 cats were sold. The bar should be twice as tall!',
  },
  {
    title:'Colour Votes',
    correct:  [{ label:'Red',value:8,color:'#FF6B6B' },{ label:'Blue',value:5,color:'#4D96FF' },{ label:'Green',value:10,color:'#6BCB77' }],
    corrupted:[{ label:'Red',value:8,color:'#FF6B6B' },{ label:'Blue',value:5,color:'#4D96FF' },{ label:'Green',value:5,color:'#6BCB77' }],
    errorIdx:2, q:'Green got 10 votes but the graph looks wrong. Find the mistake!',
    explanation:'Green should reach 10, not 5. The bar was drawn only half as high as it should be!',
  },
  {
    title:'Days of Sun',
    correct:  [{ label:'Mon',value:7,color:'#C77DFF' },{ label:'Tue',value:4,color:'#FF9F43' },{ label:'Wed',value:9,color:'#00D2FF' }],
    corrupted:[{ label:'Mon',value:7,color:'#C77DFF' },{ label:'Tue',value:9,color:'#FF9F43' },{ label:'Wed',value:9,color:'#00D2FF' }],
    errorIdx:1, q:'Tuesday had 4 sunny hours, but the bar shows something else. Which bar is wrong?',
    explanation:'Tuesday shows 9, but it should show 4. Someone drew the bar too tall!',
  },
]

// ── Mini inline BarBuilder (drag-free, click-to-set version for simplicity) ─
function MiniBarBuilder({ dataset, onAllMatch }) {
  const [vals, setVals] = useState(() => dataset.map(() => 0))
  const maxV = Math.max(...dataset.map(d=>d.value)) + 2
  const match = dataset.every((d,i) => vals[i] === d.value)

  React.useEffect(() => { if (match) onAllMatch && onAllMatch() }, [match])

  const adjust = (i, delta) => {
    setVals(prev => {
      const n=[...prev]; n[i]=Math.max(0,Math.min(maxV, n[i]+delta)); return n
    })
  }
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
      {match && (
        <motion.div initial={{scale:0}} animate={{scale:1}}
          style={{background:'rgba(74,222,128,0.2)',border:'2px solid #4ADE80',borderRadius:12,
            padding:'6px 18px',fontFamily:'"Baloo 2"',fontWeight:800,color:'#4ADE80',fontSize:'1rem'}}>
          ✅ Perfect Match!
        </motion.div>
      )}
      <div style={{display:'flex',gap:14,alignItems:'flex-end'}}>
        {dataset.map((d,i)=>(
          <div key={d.label} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
            <span style={{fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.85rem',color:vals[i]===d.value?'#4ADE80':'#FFC94A'}}>{vals[i]}</span>
            <div style={{width:36,height:120,background:'rgba(255,255,255,0.06)',borderRadius:6,display:'flex',flexDirection:'column',justifyContent:'flex-end',position:'relative'}}>
              <div style={{position:'absolute',bottom:(d.value/maxV)*120-1.5,left:0,right:0,height:3,background:'rgba(255,255,255,0.35)',borderTop:'2px dashed rgba(255,255,255,0.5)'}}/>
              <div style={{height:Math.max(2,(vals[i]/maxV)*120),background:vals[i]===d.value?`linear-gradient(to top,${d.color},#4ADE80)`:`linear-gradient(to top,${d.color}cc,${d.color})`,borderRadius:'4px 4px 0 0',transition:'height 0.2s'}}/>
            </div>
            <div style={{display:'flex',gap:3}}>
              <button onClick={()=>adjust(i,1)} style={{width:24,height:24,background:'rgba(245,166,35,0.2)',border:'1px solid #F5A623',borderRadius:4,color:'#F5A623',fontWeight:900,cursor:'pointer',fontSize:'0.9rem'}}>+</button>
              <button onClick={()=>adjust(i,-1)} style={{width:24,height:24,background:'rgba(232,93,140,0.15)',border:'1px solid #E85D8C',borderRadius:4,color:'#E85D8C',fontWeight:900,cursor:'pointer',fontSize:'0.9rem'}}>−</button>
            </div>
            <span style={{fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.7rem',color:'rgba(255,255,255,0.7)'}}>{d.label}</span>
            {vals[i]===d.value&&<span style={{fontSize:'0.8rem'}}>✅</span>}
          </div>
        ))}
      </div>
      <div style={{fontFamily:'"Baloo 2"',fontSize:'0.78rem',color:'rgba(255,255,255,0.5)',fontStyle:'italic'}}>
        Target: {dataset.map(d=>`${d.label}=${d.value}`).join(', ')}
      </div>
    </div>
  )
}

// ── Station A Component (3 questions, Bar Builder) ──────────────────────────
function StationA({ onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [done, setDone] = useState([false,false,false])
  const allDone = done.every(Boolean)
  const q = BUILDER_Qs[qIdx]

  const handleMatch = () => {
    setDone(prev=>{ const n=[...prev]; n[qIdx]=true; return n })
    setTimeout(()=>{
      if (qIdx < BUILDER_Qs.length-1) setQIdx(i=>i+1)
      else if (!allDone) {}
    }, 800)
  }

  React.useEffect(()=>{ if(allDone) onComplete() },[allDone])

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:480}}>
      <div style={{display:'flex',gap:5,justifyContent:'center'}}>
        {BUILDER_Qs.map((_,i)=>(
          <div key={i} style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.75rem',
            background:done[i]?'#4ADE80':i===qIdx?'rgba(245,166,35,0.3)':'rgba(255,255,255,0.08)',
            border:done[i]?'2px solid #4ADE80':i===qIdx?'2px solid #F5A623':'2px solid rgba(255,255,255,0.12)',
            color:done[i]?'#1a1030':i===qIdx?'#F5A623':'rgba(255,255,255,0.4)',
          }}>{done[i]?'✓':i+1}</div>
        ))}
      </div>
      <div style={{background:'rgba(245,166,35,0.1)',border:'1.5px solid rgba(245,166,35,0.3)',borderRadius:14,padding:'10px 14px',
        fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'clamp(0.88rem,2vw,1rem)',color:'white',textAlign:'center',lineHeight:1.45}}>
        🧱 {q.q}
      </div>
      <MiniBarBuilder key={qIdx} dataset={getDS(q.dsIdx)} onAllMatch={handleMatch} />
      {allDone&&(
        <div style={{textAlign:'center',fontFamily:'"Baloo 2"',fontWeight:800,color:'#4ADE80',fontSize:'1rem'}}>
          🎉 All 3 challenges complete! Move to the next station →
        </div>
      )}
    </div>
  )
}

// ── Station B Component (3 questions, Scale Slider) ─────────────────────────
const SCALE_OPTIONS = [1,2,5,10]
function StationB({ onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [answers, setAnswers] = useState(['','',''])
  const [results, setResults] = useState([null,null,null])
  const [scaleIdx, setScaleIdx] = useState(0)
  const allDone = results.every(r=>r===true)
  const q = SCALE_Qs[qIdx]
  const scale = SCALE_OPTIONS[scaleIdx]
  const ds = getDS(q.dsIdx)

  React.useEffect(()=>{ if(allDone) onComplete() },[allDone])

  const handleCheck = () => {
    const correct = answers[qIdx].trim().toLowerCase() === q.answer.toLowerCase()
    setResults(prev=>{ const n=[...prev]; n[qIdx]=correct; return n })
    if(correct) setTimeout(()=>{ if(qIdx<SCALE_Qs.length-1) setQIdx(i=>i+1); setScaleIdx(0) },900)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:480,alignItems:'center'}}>
      <div style={{display:'flex',gap:5,justifyContent:'center'}}>
        {SCALE_Qs.map((_,i)=>(
          <div key={i} style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.75rem',
            background:results[i]===true?'#4ADE80':i===qIdx?'rgba(245,166,35,0.3)':'rgba(255,255,255,0.08)',
            border:results[i]===true?'2px solid #4ADE80':i===qIdx?'2px solid #F5A623':'2px solid rgba(255,255,255,0.12)',
            color:results[i]===true?'#1a1030':i===qIdx?'#F5A623':'rgba(255,255,255,0.4)',
          }}>{results[i]===true?'✓':i+1}</div>
        ))}
      </div>
      <div style={{background:'rgba(96,165,250,0.12)',border:'1.5px solid rgba(96,165,250,0.3)',borderRadius:14,padding:'10px 14px',
        fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'clamp(0.88rem,2vw,1rem)',color:'white',textAlign:'center',width:'100%'}}>
        📏 {q.q}
      </div>
      {/* Scale buttons */}
      <div style={{display:'flex',gap:6}}>
        {SCALE_OPTIONS.map((s,i)=>(
          <button key={s} onClick={()=>setScaleIdx(i)} style={{
            background:scaleIdx===i?'linear-gradient(135deg,#F5A623,#FFC94A)':'rgba(255,255,255,0.08)',
            border:`2px solid ${scaleIdx===i?'#F5A623':'rgba(255,255,255,0.15)'}`,
            borderRadius:10,padding:'5px 12px',fontFamily:'"Baloo 2"',fontWeight:800,
            color:scaleIdx===i?'#1a1030':'white',cursor:'pointer',fontSize:'0.9rem',
          }}>{s}</button>
        ))}
      </div>
      <BarGraph orientation="vertical" categories={ds} scale={scale}
        maxValue={Math.ceil(Math.max(...ds.map(d=>d.value))/scale)*scale+scale}
        animated={false} showValues={true} compact={true} />
      <div style={{fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.78rem',color:'#FFC94A',
        background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.2)',borderRadius:10,padding:'5px 14px'}}>
        Scale = {scale} — each gridline = {scale} unit{scale>1?'s':''}
      </div>
      {results[qIdx]===false&&(
        <div style={{color:'#E85D8C',fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.85rem',textAlign:'center'}}>
          Not quite! Hint: {q.hint}
        </div>
      )}
      {!results[qIdx] && (
        <div style={{display:'flex',gap:8,alignItems:'center',width:'100%',maxWidth:280}}>
          <input value={answers[qIdx]} onChange={e=>setAnswers(prev=>{const n=[...prev];n[qIdx]=e.target.value;return n})}
            placeholder="Your answer..." onKeyDown={e=>e.key==='Enter'&&handleCheck()}
            style={{flex:1,background:'rgba(255,255,255,0.1)',border:'2px solid rgba(255,255,255,0.2)',borderRadius:10,
              padding:'8px 12px',color:'white',fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'1rem',outline:'none'}} />
          <button onClick={handleCheck} style={{background:'linear-gradient(135deg,#F5A623,#FFC94A)',border:'none',
            borderRadius:10,padding:'8px 16px',fontFamily:'"Baloo 2"',fontWeight:800,color:'#1a1030',cursor:'pointer'}}>
            Check ✓
          </button>
        </div>
      )}
      {allDone&&<div style={{textAlign:'center',fontFamily:'"Baloo 2"',fontWeight:800,color:'#4ADE80',fontSize:'1rem'}}>🎉 All 3 done! Next station →</div>}
    </div>
  )
}

// ── Station C Component (3 questions, Orientation Flip) ─────────────────────
function StationC({ onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [orient, setOrient] = useState('vertical')
  const [answers, setAnswers] = useState(['','',''])
  const [results, setResults] = useState([null,null,null])
  const allDone = results.every(r=>r===true)
  const q = ORIENT_Qs[qIdx]
  const ds = getDS(q.dsIdx)

  React.useEffect(()=>{ if(allDone) onComplete() },[allDone])

  const handleCheck = () => {
    const correct = answers[qIdx].trim().toLowerCase() === q.answer.toLowerCase()
    setResults(prev=>{ const n=[...prev]; n[qIdx]=correct; return n })
    if(correct) setTimeout(()=>{ if(qIdx<ORIENT_Qs.length-1){setQIdx(i=>i+1);setOrient('vertical')} },900)
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:480,alignItems:'center'}}>
      <div style={{display:'flex',gap:5,justifyContent:'center'}}>
        {ORIENT_Qs.map((_,i)=>(
          <div key={i} style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.75rem',
            background:results[i]===true?'#4ADE80':i===qIdx?'rgba(245,166,35,0.3)':'rgba(255,255,255,0.08)',
            border:results[i]===true?'2px solid #4ADE80':i===qIdx?'2px solid #F5A623':'2px solid rgba(255,255,255,0.12)',
            color:results[i]===true?'#1a1030':i===qIdx?'#F5A623':'rgba(255,255,255,0.4)',
          }}>{results[i]===true?'✓':i+1}</div>
        ))}
      </div>
      <div style={{background:'rgba(168,85,247,0.12)',border:'1.5px solid rgba(168,85,247,0.3)',borderRadius:14,padding:'10px 14px',
        fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'clamp(0.88rem,2vw,1rem)',color:'white',textAlign:'center',width:'100%'}}>
        🔄 {q.q}
      </div>
      {/* Toggle */}
      <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.06)',borderRadius:50,padding:'6px 12px',border:'1px solid rgba(255,255,255,0.1)'}}>
        <span style={{fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.85rem',color:orient==='vertical'?'#F5A623':'rgba(255,255,255,0.4)'}}>📊 Vertical</span>
        <button onClick={()=>setOrient(o=>o==='vertical'?'horizontal':'vertical')} style={{
          width:48,height:26,borderRadius:50,background:orient==='horizontal'?'linear-gradient(135deg,#F5A623,#FFC94A)':'rgba(255,255,255,0.15)',
          border:'none',cursor:'pointer',position:'relative',transition:'all 0.3s'}}>
          <motion.div animate={{x:orient==='horizontal'?22:2}} style={{width:20,height:20,borderRadius:'50%',background:'white',position:'absolute',top:3,boxShadow:'0 2px 6px rgba(0,0,0,0.3)'}}/>
        </button>
        <span style={{fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.85rem',color:orient==='horizontal'?'#F5A623':'rgba(255,255,255,0.4)'}}>📊 Horizontal</span>
      </div>
      <BarGraph orientation={orient} categories={ds} scale={1}
        maxValue={Math.max(...ds.map(d=>d.value))+2} animated={true} showValues={true} compact={true} />
      {results[qIdx]===false&&(
        <div style={{color:'#E85D8C',fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.85rem',textAlign:'center'}}>Not quite! Hint: {q.hint}</div>
      )}
      {!results[qIdx] && (
        <div style={{display:'flex',gap:8,alignItems:'center',width:'100%',maxWidth:280}}>
          <input value={answers[qIdx]} onChange={e=>setAnswers(prev=>{const n=[...prev];n[qIdx]=e.target.value;return n})}
            placeholder="Your answer..." onKeyDown={e=>e.key==='Enter'&&handleCheck()}
            style={{flex:1,background:'rgba(255,255,255,0.1)',border:'2px solid rgba(255,255,255,0.2)',borderRadius:10,
              padding:'8px 12px',color:'white',fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'1rem',outline:'none'}} />
          <button onClick={handleCheck} style={{background:'linear-gradient(135deg,#F5A623,#FFC94A)',border:'none',
            borderRadius:10,padding:'8px 16px',fontFamily:'"Baloo 2"',fontWeight:800,color:'#1a1030',cursor:'pointer'}}>Check ✓</button>
        </div>
      )}
      {allDone&&<div style={{textAlign:'center',fontFamily:'"Baloo 2"',fontWeight:800,color:'#4ADE80',fontSize:'1rem'}}>🎉 All 3 done! Next station →</div>}
    </div>
  )
}

// ── Station D Component (3 questions, Spot the Error) ───────────────────────
function StationD({ onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [selected, setSelected] = useState(null)
  const [revealed, setRevealed] = useState(false)
  const [done, setDone] = useState([false,false,false])
  const allDone = done.every(Boolean)
  const sc = ERROR_SCENARIOS[qIdx]

  React.useEffect(()=>{ if(allDone) onComplete() },[allDone])

  const handleBarClick = (idx) => {
    if (revealed) return
    setSelected(idx)
    if (idx === sc.errorIdx) {
      setRevealed(true)
      setDone(prev=>{ const n=[...prev]; n[qIdx]=true; return n })
      setTimeout(()=>{
        if(qIdx<ERROR_SCENARIOS.length-1){setQIdx(i=>i+1);setSelected(null);setRevealed(false)}
      },1600)
    }
  }

  const cats = sc.corrupted
  const maxV = Math.max(...cats.map(c=>c.value),...sc.correct.map(c=>c.value))+2
  const gH = 110

  return (
    <div style={{display:'flex',flexDirection:'column',gap:10,width:'100%',maxWidth:460,alignItems:'center'}}>
      <div style={{display:'flex',gap:5,justifyContent:'center'}}>
        {ERROR_SCENARIOS.map((_,i)=>(
          <div key={i} style={{width:28,height:28,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',
            fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.75rem',
            background:done[i]?'#4ADE80':i===qIdx?'rgba(232,93,140,0.3)':'rgba(255,255,255,0.08)',
            border:done[i]?'2px solid #4ADE80':i===qIdx?'2px solid #E85D8C':'2px solid rgba(255,255,255,0.12)',
            color:done[i]?'#1a1030':i===qIdx?'#E85D8C':'rgba(255,255,255,0.4)',
          }}>{done[i]?'✓':i+1}</div>
        ))}
      </div>
      <div style={{background:'rgba(232,93,140,0.1)',border:'1.5px solid rgba(232,93,140,0.3)',borderRadius:14,padding:'10px 14px',
        fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'clamp(0.88rem,2vw,1rem)',color:'white',textAlign:'center',width:'100%'}}>
        🔎 {sc.q}
      </div>
      {/* Clickable bars */}
      <div style={{display:'flex',gap:14,alignItems:'flex-end',background:'rgba(0,0,0,0.3)',borderRadius:14,padding:'12px 18px'}}>
        {cats.map((cat,i)=>{
          const bh = Math.max(4,(cat.value/maxV)*gH)
          const isWrong = i===sc.errorIdx
          const isSel = selected===i
          let bg = `linear-gradient(to top,${cat.color}cc,${cat.color})`
          if(revealed&&isWrong) bg='linear-gradient(to top,rgba(232,93,140,0.9),#E85D8C)'
          return (
            <div key={cat.label} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <button onClick={()=>handleBarClick(i)} style={{
                height:bh,width:42,background:bg,
                border:revealed&&isWrong?'2px solid #E85D8C':isSel&&!revealed?'2px solid rgba(255,255,255,0.6)':'2px solid transparent',
                borderRadius:'4px 4px 0 0',cursor:revealed?'default':'pointer',
                transition:'all 0.3s',boxShadow:revealed&&isWrong?'0 0 14px #E85D8C':'none',
              }}/>
              <span style={{fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.72rem',color:'rgba(255,255,255,0.7)'}}>{cat.label}</span>
              <span style={{fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.85rem',color:'white'}}>{cat.value}</span>
              {revealed&&isWrong&&<motion.span initial={{scale:0}} animate={{scale:1}} style={{fontSize:'0.9rem'}}>❌</motion.span>}
            </div>
          )
        })}
      </div>
      {selected!==null&&!revealed&&(
        <div style={{color:'rgba(255,255,255,0.6)',fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.85rem',textAlign:'center'}}>
          That looks okay — keep looking! 🔍
        </div>
      )}
      {revealed&&(
        <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} style={{
          background:'rgba(74,222,128,0.12)',border:'2px solid rgba(74,222,128,0.4)',borderRadius:14,
          padding:'10px 16px',fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.88rem',color:'white',textAlign:'center'}}>
          ✅ Found it! {sc.explanation}
        </motion.div>
      )}
      {allDone&&<div style={{textAlign:'center',fontFamily:'"Baloo 2"',fontWeight:800,color:'#4ADE80',fontSize:'1rem'}}>🎉 All errors found! You can now go to Play! 🎮</div>}
    </div>
  )
}

// ── Main Simulate Page ───────────────────────────────────────────────────────
const TABS = [
  { id:'builder',     icon:'🧱', label:'Bar Builder',      station:'A' },
  { id:'scale',       icon:'📏', label:'Scale Slider',     station:'B' },
  { id:'orientation', icon:'🔄', label:'Orientation Flip', station:'C' },
  { id:'error',       icon:'🔎', label:'Spot the Error',   station:'D' },
]

export default function Simulate() {
  const navigate = useNavigate()
  const { speak, stopAll } = useAudio()
  const { dispatch } = useProgress()
  const [activeTab, setActiveTab] = useState('builder')
  // Track which stations are completed
  const [stationsDone, setStationsDone] = useState({ builder:false, scale:false, orientation:false, error:false })
  const allDone = Object.values(stationsDone).every(Boolean)

  const markDone = (tab) => setStationsDone(prev=>({...prev,[tab]:true}))

  React.useEffect(()=>{
    speak(narrationScripts.simulate.welcome)
    return ()=>stopAll()
  },[])

  const handleTabChange = (tabId) => {
    stopAll(); setActiveTab(tabId)
    const scripts = {
      builder: narrationScripts.simulate.barBuilder,
      scale: narrationScripts.simulate.scaleSlider,
      orientation: narrationScripts.simulate.orientation,
      error: narrationScripts.simulate.spotError,
    }
    if (scripts[tabId]) speak(scripts[tabId])
  }

  const handlePlayNow = () => {
    stopAll()
    dispatch({ type: 'COMPLETE_PHASE', phase: 'simulate' })
    navigate('/play')
  }

  const tabIdx = TABS.findIndex(t=>t.id===activeTab)

  const goNext = () => {
    if (tabIdx < TABS.length-1) handleTabChange(TABS[tabIdx+1].id)
  }
  const goPrev = () => {
    if (tabIdx > 0) handleTabChange(TABS[tabIdx-1].id)
  }

  const owlMsg = {
    builder:'Adjust the bars using + and − to match the target values! 🧱',
    scale:'Move the scale to see how the graph changes — the data stays the same! 📏',
    orientation:'Toggle vertical/horizontal and see it is the same data! 🔄',
    error:'Tap the bar that has the wrong height — find the mistake! 🔎',
  }

  return (
    <div className="page-frame">
      <PhaseStepper active="simulate" />
      <div style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'8px 12px 6px',gap:6,overflow:'hidden'}}>

        {/* Header row */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',width:'100%',maxWidth:600,flexShrink:0}}>
          <div>
            <div style={{fontFamily:'"Baloo 2"',fontWeight:900,fontSize:'clamp(1.1rem,2.5vw,1.4rem)',color:'white'}}>
              ✏️ Simulate — Explore!
            </div>
            <div style={{fontFamily:'"Poppins"',fontWeight:600,fontSize:'0.78rem',color:'rgba(255,255,255,0.55)'}}>
              Complete all 4 stations to unlock Play 🎮
            </div>
          </div>
          {/* Owl bubble */}
          <div style={{display:'flex',alignItems:'center',gap:7,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:14,borderBottomRightRadius:4,padding:'6px 12px',maxWidth:220}}>
            <span style={{fontSize:'1.4rem',flexShrink:0}}>🦉</span>
            <span style={{fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.72rem',color:'#FFC94A',lineHeight:1.35}}>{owlMsg[activeTab]}</span>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{display:'flex',gap:5,flexShrink:0,width:'100%',maxWidth:600}} className="no-scrollbar">
          {TABS.map((tab,i)=>(
            <button key={tab.id} onClick={()=>handleTabChange(tab.id)} style={{
              flex:1, display:'flex',alignItems:'center',justifyContent:'center',gap:4,
              padding:'7px 8px', borderRadius:12, border:'none',cursor:'pointer',
              fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.72rem',
              whiteSpace:'nowrap',transition:'all 0.2s',
              background: activeTab===tab.id ? 'linear-gradient(135deg,#F5A623,#FFC94A)' : 'rgba(255,255,255,0.07)',
              color: activeTab===tab.id ? '#1a1030' : 'rgba(255,255,255,0.65)',
              boxShadow: activeTab===tab.id ? '0 2px 10px rgba(245,166,35,0.4)' : 'none',
              position:'relative',
            }}>
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {stationsDone[tab.id]&&(
                <span style={{position:'absolute',top:2,right:4,fontSize:'0.6rem',color:activeTab===tab.id?'#1a1030':'#4ADE80'}}>✓</span>
              )}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div style={{
          flex:1,width:'100%',maxWidth:600,
          background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.09)',
          borderRadius:20,padding:'12px 14px',
          overflow:'hidden',display:'flex',flexDirection:'column',
          position:'relative',
        }}>
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}} transition={{duration:0.22}}
              style={{flex:1,overflow:'hidden',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'flex-start',gap:8}}>
              {activeTab==='builder'    && <StationA onComplete={()=>markDone('builder')} />}
              {activeTab==='scale'      && <StationB onComplete={()=>markDone('scale')} />}
              {activeTab==='orientation'&& <StationC onComplete={()=>markDone('orientation')} />}
              {activeTab==='error'      && <StationD onComplete={()=>markDone('error')} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation row */}
        <div style={{display:'flex',gap:8,flexShrink:0,alignItems:'center',justifyContent:'center'}}>
          {tabIdx>0&&(
            <button onClick={goPrev} style={{background:'rgba(255,255,255,0.08)',border:'2px solid rgba(255,255,255,0.15)',
              borderRadius:50,padding:'8px 18px',fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.88rem',color:'white',cursor:'pointer'}}>
              ← Prev
            </button>
          )}
          {tabIdx<TABS.length-1&&(
            <button onClick={goNext} style={{background:'rgba(255,255,255,0.08)',border:'2px solid rgba(255,255,255,0.2)',
              borderRadius:50,padding:'8px 18px',fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.88rem',color:'white',cursor:'pointer'}}>
              Next →
            </button>
          )}
          {/* Play button ONLY after all stations done */}
          {allDone&&(
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.97}} onClick={handlePlayNow}
              style={{background:'linear-gradient(135deg,#F5A623,#FFC94A)',border:'none',borderRadius:50,
                padding:'10px 26px',fontFamily:'"Baloo 2"',fontWeight:900,fontSize:'1rem',color:'#1a1030',
                cursor:'pointer',boxShadow:'0 4px 18px rgba(245,166,35,0.5)'}}>
              🎮 Play Now! →
            </motion.button>
          )}
        </div>
      </div>
    </div>
  )
}
