import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import PhaseStepper from '../components/PhaseStepper'
import { useAudio } from '../context/AudioContext'
import { useProgress } from '../context/ProgressContext'
import { narrationScripts } from '../utils/narration'

/* ─── shared colour palette for bars ──────────────────────────────────────── */
const BAR_COLORS = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF']

/* ─── datasets ────────────────────────────────────────────────────────────── */
const DS = [
  [ {l:'Cats',v:6,c:'#FF6B6B'},{l:'Dogs',v:9,c:'#FFD93D'},{l:'Birds',v:4,c:'#6BCB77'},{l:'Fish',v:7,c:'#4D96FF'} ],
  [ {l:'Red',v:8,c:'#FF6B6B'},{l:'Blue',v:5,c:'#4D96FF'},{l:'Green',v:10,c:'#6BCB77'},{l:'Yellow',v:3,c:'#FFD93D'} ],
  [ {l:'Mon',v:7,c:'#C77DFF'},{l:'Tue',v:4,c:'#FF9F43'},{l:'Wed',v:9,c:'#00D2FF'},{l:'Thu',v:6,c:'#FF6B9D'} ],
]

/* ─── compact SVG bar graph (no external BarGraph component, fully controlled) */
function MiniBarGraph({ data, orientation='vertical', highlightIdx=null }) {
  const W = orientation==='vertical' ? 260 : 240
  const H = 160
  const mL = orientation==='vertical' ? 28 : 64
  const mB = orientation==='vertical' ? 32 : 18
  const mT = 12; const mR = 14
  const gW = W - mL - mR; const gH = H - mT - mB
  const maxV = Math.max(...data.map(d=>d.v)) + 2

  if (orientation==='vertical') {
    const bSlot = gW / data.length
    return (
      <svg width={W} height={H} style={{overflow:'visible',display:'block'}}>
        {/* gridlines */}
        {[0,2,4,6,8,10].filter(v=>v<=maxV).map(v=>{
          const y = mT + gH - (v/maxV)*gH
          return <g key={v}>
            <line x1={mL} y1={y} x2={mL+gW} y2={y} stroke='rgba(255,255,255,0.12)' strokeWidth={v===0?1.5:0.7}/>
            <text x={mL-4} y={y+4} textAnchor='end' fill='rgba(255,255,255,0.55)' fontSize={9} fontFamily='"Baloo 2"' fontWeight='700'>{v}</text>
          </g>
        })}
        <line x1={mL} y1={mT} x2={mL} y2={mT+gH} stroke='rgba(255,255,255,0.4)' strokeWidth={1.5}/>
        <line x1={mL} y1={mT+gH} x2={mL+gW} y2={mT+gH} stroke='rgba(255,255,255,0.4)' strokeWidth={1.5}/>
        {data.map((d,i)=>{
          const bw = bSlot*0.6; const bh = (d.v/maxV)*gH
          const bx = mL + i*bSlot + (bSlot-bw)/2; const by = mT+gH-bh
          const col = highlightIdx===i ? '#E85D8C' : d.c
          return <g key={d.l}>
            <rect x={bx} y={by} width={bw} height={bh} fill={col} rx={3} style={{filter:`drop-shadow(0 0 4px ${col}88)`}}/>
            <text x={bx+bw/2} y={by-4} textAnchor='middle' fill='white' fontSize={9} fontFamily='"Baloo 2"' fontWeight='800'>{d.v}</text>
            <text x={bx+bw/2} y={mT+gH+13} textAnchor='middle' fill='rgba(255,255,255,0.75)' fontSize={9} fontFamily='"Baloo 2"' fontWeight='700'>
              {d.l.length>5?d.l.slice(0,5)+'…':d.l}
            </text>
          </g>
        })}
      </svg>
    )
  }
  // horizontal
  const bSlot = gH / data.length
  return (
    <svg width={W} height={H} style={{overflow:'visible',display:'block'}}>
      {[0,2,4,6,8,10].filter(v=>v<=maxV).map(v=>{
        const x = mL + (v/maxV)*gW
        return <g key={v}>
          <line x1={x} y1={mT} x2={x} y2={mT+gH} stroke='rgba(255,255,255,0.12)' strokeWidth={v===0?1.5:0.7}/>
          <text x={x} y={mT+gH+12} textAnchor='middle' fill='rgba(255,255,255,0.55)' fontSize={9} fontFamily='"Baloo 2"' fontWeight='700'>{v}</text>
        </g>
      })}
      <line x1={mL} y1={mT} x2={mL} y2={mT+gH} stroke='rgba(255,255,255,0.4)' strokeWidth={1.5}/>
      <line x1={mL} y1={mT+gH} x2={mL+gW} y2={mT+gH} stroke='rgba(255,255,255,0.4)' strokeWidth={1.5}/>
      {data.map((d,i)=>{
        const bh2 = bSlot*0.58; const bw2 = (d.v/maxV)*gW
        const by2 = mT + i*bSlot + (bSlot-bh2)/2
        const col = highlightIdx===i ? '#E85D8C' : d.c
        return <g key={d.l}>
          <rect x={mL} y={by2} width={bw2} height={bh2} fill={col} rx={3} style={{filter:`drop-shadow(0 0 4px ${col}88)`}}/>
          <text x={mL+bw2+4} y={by2+bh2/2+4} fill='white' fontSize={9} fontFamily='"Baloo 2"' fontWeight='800'>{d.v}</text>
          <text x={mL-4} y={by2+bh2/2+4} textAnchor='end' fill='rgba(255,255,255,0.75)' fontSize={9} fontFamily='"Baloo 2"' fontWeight='700'>
            {d.l.length>7?d.l.slice(0,6)+'…':d.l}
          </text>
        </g>
      })}
    </svg>
  )
}

/* ─── shared styles ───────────────────────────────────────────────────────── */
const S = {
  qBox: (col='rgba(245,166,35,0.12)', border='rgba(245,166,35,0.35)') => ({
    background: col, border:`2px solid ${border}`, borderRadius:14,
    padding:'10px 14px', fontFamily:'"Baloo 2"', fontWeight:800,
    fontSize:'clamp(0.92rem,2vw,1.05rem)', color:'white',
    lineHeight:1.5, textAlign:'center', width:'100%',
  }),
  badge: (done,active)=>({
    width:30,height:30,borderRadius:'50%',
    display:'flex',alignItems:'center',justifyContent:'center',
    fontFamily:'"Baloo 2"',fontWeight:900,fontSize:'0.8rem',
    background: done?'#4ADE80':active?'rgba(245,166,35,0.3)':'rgba(255,255,255,0.07)',
    border: done?'2px solid #4ADE80':active?'2px solid #F5A623':'2px solid rgba(255,255,255,0.12)',
    color: done?'#1a1030':active?'#F5A623':'rgba(255,255,255,0.35)',
    flexShrink:0,
  }),
  input: {
    flex:1, background:'rgba(255,255,255,0.1)',
    border:'2px solid rgba(255,255,255,0.25)',borderRadius:10,
    padding:'9px 13px',color:'white',fontFamily:'"Baloo 2"',
    fontWeight:800,fontSize:'1rem',outline:'none',
  },
  checkBtn: {
    background:'linear-gradient(135deg,#F5A623,#FFC94A)',border:'none',
    borderRadius:10,padding:'9px 18px',fontFamily:'"Baloo 2"',
    fontWeight:900,color:'#1a1030',cursor:'pointer',fontSize:'0.95rem',
    whiteSpace:'nowrap',
  },
}

/* ─── MiniBarBuilder with + / − buttons ──────────────────────────────────── */
function MiniBarBuilder({ dataset, onAllMatch }) {
  const [vals, setVals] = useState(() => dataset.map(()=>0))
  const maxV = Math.max(...dataset.map(d=>d.v)) + 2
  const H = 110
  const match = dataset.every((d,i)=>vals[i]===d.v)

  React.useEffect(()=>{ if(match && onAllMatch) onAllMatch() }, [match])

  const adj = (i,delta) => setVals(prev=>{
    const n=[...prev]; n[i]=Math.max(0,Math.min(maxV,n[i]+delta)); return n
  })

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:6}}>
      {match && (
        <motion.div initial={{scale:0}} animate={{scale:1}}
          style={{background:'rgba(74,222,128,0.2)',border:'2px solid #4ADE80',
            borderRadius:12,padding:'5px 20px',fontFamily:'"Baloo 2"',
            fontWeight:900,color:'#4ADE80',fontSize:'1rem'}}>
          ✅ Perfect Match!
        </motion.div>
      )}
      {/* Target label */}
      <div style={{fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.78rem',
        color:'rgba(255,255,255,0.55)',textAlign:'center',fontStyle:'italic'}}>
        Target: {dataset.map(d=>`${d.l}=${d.v}`).join(' · ')}
      </div>
      {/* Bars row */}
      <div style={{display:'flex',gap:10,alignItems:'flex-end',flexWrap:'nowrap'}}>
        {dataset.map((d,i)=>(
          <div key={d.l} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:3,flexShrink:0}}>
            {/* current value */}
            <span style={{fontFamily:'"Baloo 2"',fontWeight:900,fontSize:'0.9rem',
              color:vals[i]===d.v?'#4ADE80':'#FFC94A',minWidth:20,textAlign:'center'}}>{vals[i]}</span>
            {/* bar column */}
            <div style={{width:34,height:H,background:'rgba(255,255,255,0.06)',
              borderRadius:6,position:'relative',overflow:'hidden',flexShrink:0}}>
              {/* target dashed line */}
              <div style={{position:'absolute',bottom:`${(d.v/maxV)*100}%`,
                left:0,right:0,height:2,borderTop:'2px dashed rgba(255,255,255,0.45)',zIndex:2}}/>
              {/* user bar */}
              <div style={{
                position:'absolute',bottom:0,left:0,right:0,
                height:`${Math.max(1,(vals[i]/maxV)*100)}%`,
                background:vals[i]===d.v
                  ?`linear-gradient(to top,${d.c},#4ADE80)`
                  :`linear-gradient(to top,${d.c}bb,${d.c})`,
                transition:'height 0.15s ease',borderRadius:'4px 4px 0 0',
              }}/>
            </div>
            {/* +/- buttons */}
            <div style={{display:'flex',gap:2}}>
              <button onClick={()=>adj(i,1)} style={{width:26,height:26,background:'rgba(245,166,35,0.2)',
                border:'1.5px solid #F5A623',borderRadius:5,color:'#F5A623',
                fontWeight:900,cursor:'pointer',fontSize:'1rem',lineHeight:1}}>+</button>
              <button onClick={()=>adj(i,-1)} style={{width:26,height:26,background:'rgba(232,93,140,0.15)',
                border:'1.5px solid #E85D8C',borderRadius:5,color:'#E85D8C',
                fontWeight:900,cursor:'pointer',fontSize:'1rem',lineHeight:1}}>−</button>
            </div>
            <span style={{fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.72rem',
              color:'rgba(255,255,255,0.7)',maxWidth:40,textAlign:'center',
              overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.l}</span>
            {vals[i]===d.v && <span style={{fontSize:'0.8rem'}}>✅</span>}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Station A — Bar Builder ─────────────────────────────────────────────── */
const BUILDER_Qs = [
  { q:'🧱 Challenge 1: Set Cats = 6, Dogs = 9, Birds = 4, Fish = 7 using the + and − buttons!', dsIdx:0 },
  { q:'🧱 Challenge 2: Make Red = 8, Blue = 5, Green = 10, Yellow = 3. Match every bar!', dsIdx:1 },
  { q:'🧱 Challenge 3: Set Mon = 7, Tue = 4, Wed = 9, Thu = 6. Complete the graph!', dsIdx:2 },
]

function StationA({ onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [done, setDone] = useState([false,false,false])
  const allDone = done.every(Boolean)
  const q = BUILDER_Qs[qIdx]

  const handleMatch = () => {
    if (done[qIdx]) return
    const next = [...done]; next[qIdx]=true; setDone(next)
    setTimeout(()=>{ if(qIdx<BUILDER_Qs.length-1) setQIdx(qIdx+1) }, 900)
  }

  React.useEffect(()=>{ if(allDone) onComplete() },[allDone])

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8,width:'100%',alignItems:'center'}}>
      {/* Progress dots */}
      <div style={{display:'flex',gap:7,justifyContent:'center'}}>
        {BUILDER_Qs.map((_,i)=>(
          <div key={i} style={S.badge(done[i],i===qIdx)}>
            {done[i]?'✓':i+1}
          </div>
        ))}
      </div>
      {/* Question box */}
      <div style={S.qBox()}>
        {q.q}
      </div>
      {/* Bar builder */}
      <MiniBarBuilder key={qIdx} dataset={DS[q.dsIdx]} onAllMatch={handleMatch} />
      {allDone && (
        <div style={{fontFamily:'"Baloo 2"',fontWeight:900,color:'#4ADE80',fontSize:'1.05rem',textAlign:'center',marginTop:4}}>
          🎉 All 3 Bar Builder challenges complete!
        </div>
      )}
    </div>
  )
}

/* ─── Station B — Scale Slider ────────────────────────────────────────────── */
const SCALE_OPTIONS = [1,2,5,10]
const SCALE_Qs = [
  { q:'📏 Q1: Move the slider to Scale = 2. How many units does the DOGS bar show?',
    ans:'9', hint:'The data never changes — Dogs = 9 at any scale!',
    exp:'The answer is 9. No matter what scale you choose, the Dogs bar always represents 9 units — the scale only changes the gridlines, not the data!',
    dsIdx:0 },
  { q:'📏 Q2: Set Scale to 5. How many gridlines does the GREEN bar (value=10) cross?',
    ans:'2', hint:'Gridlines at 0, 5, 10 → Green bar crosses 2 gridlines.',
    exp:'The answer is 2. At scale 5, gridlines appear at 0, 5, and 10. The Green bar with value 10 crosses exactly 2 gridlines!',
    dsIdx:1 },
  { q:'📏 Q3: Set Scale to 1. Which day bar is the TALLEST, and what is its value? (write e.g. Wed, 9)',
    ans:'wed, 9', hint:'At scale=1 every unit is visible — find the tallest bar!',
    exp:'The answer is Wed, 9. Wednesday has the tallest bar, reaching the value 9 on the scale!',
    dsIdx:2 },
]

function StationB({ onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [scaleIdx, setScaleIdx] = useState(0)
  const [inp, setInp] = useState('')
  const [results, setResults] = useState([null,null,null])
  const [showExp, setShowExp] = useState(false)
  const { speak, stopAll } = useAudio()
  // completed = all questions have been attempted (right OR wrong)
  const allAttempted = results.every(r => r !== null)
  const allCorrect = results.every(r => r === true)
  const q = SCALE_Qs[qIdx]
  const scale = SCALE_OPTIONS[scaleIdx]
  const data = DS[q.dsIdx]

  React.useEffect(() => {
    if (allAttempted) onComplete()
  }, [allAttempted])

  const advance = (updatedResults) => {
    setShowExp(false)
    const nextIdx = qIdx + 1
    if (nextIdx < SCALE_Qs.length) {
      setQIdx(nextIdx); setInp(''); setScaleIdx(0)
    }
    // onComplete fires via the useEffect above when allAttempted
  }

  const handleCheck = () => {
    if (results[qIdx] !== null || showExp) return
    const ok = inp.trim().toLowerCase() === q.ans.toLowerCase()
    const nr = [...results]; nr[qIdx] = ok; setResults(nr)
    if (ok) {
      setTimeout(() => advance(nr), 900)
    } else {
      setShowExp(true)
      speak([`/assets/audio/sim_exp_scale_q${qIdx + 1}.mp3`])
      setTimeout(() => advance(nr), 2500)
    }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8,width:'100%',alignItems:'center'}}>
      <div style={{display:'flex',gap:7,justifyContent:'center'}}>
        {SCALE_Qs.map((_,i)=>(<div key={i} style={S.badge(results[i]!==null, i===qIdx)}>
        {results[i]===true ? '✓' : results[i]===false ? '~' : i+1}
      </div>))}
      </div>
      <div style={S.qBox('rgba(96,165,250,0.12)','rgba(96,165,250,0.4)')}>{q.q}</div>
      {/* Scale selector */}
      <div style={{display:'flex',gap:6,alignItems:'center',flexWrap:'wrap',justifyContent:'center'}}>
        <span style={{fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.88rem',color:'rgba(255,255,255,0.7)'}}>Scale:</span>
        {SCALE_OPTIONS.map((s,i)=>(
          <button key={s} onClick={()=>setScaleIdx(i)} style={{
            background:scaleIdx===i?'linear-gradient(135deg,#F5A623,#FFC94A)':'rgba(255,255,255,0.09)',
            border:`2px solid ${scaleIdx===i?'#F5A623':'rgba(255,255,255,0.15)'}`,
            borderRadius:10,padding:'5px 14px',fontFamily:'"Baloo 2"',fontWeight:900,
            color:scaleIdx===i?'#1a1030':'white',cursor:'pointer',fontSize:'0.95rem',
          }}>{s}</button>
        ))}
      </div>
      {/* Bar graph */}
      <div style={{background:'rgba(0,0,0,0.3)',borderRadius:14,padding:'8px 12px',display:'inline-block'}}>
        <MiniBarGraph data={data} orientation='vertical' />
      </div>
      <div style={{fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.85rem',color:'#FFC94A',
        background:'rgba(245,166,35,0.1)',border:'1px solid rgba(245,166,35,0.25)',
        borderRadius:10,padding:'5px 16px',textAlign:'center'}}>
        Scale = <strong style={{fontSize:'1.05rem'}}>{scale}</strong> — each gridline = <strong>{scale}</strong> unit{scale>1?'s':''}
      </div>
      {/* Explanation banner for wrong answer */}
      {showExp && (
        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} style={{
          background:'linear-gradient(135deg,rgba(232,93,140,0.18),rgba(190,24,93,0.12))',
          border:'2px solid rgba(232,93,140,0.5)',borderRadius:14,
          padding:'10px 16px',fontFamily:'"Baloo 2"',fontWeight:800,
          fontSize:'0.92rem',color:'white',textAlign:'center',lineHeight:1.5,width:'100%'}}>
          💡 {q.exp}
          <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.5)',marginTop:4,fontWeight:600}}>Moving to next question…</div>
        </motion.div>
      )}
      {!showExp && results[qIdx] === null && (
        <div style={{display:'flex',gap:8,width:'100%',maxWidth:320}}>
          <input value={inp} onChange={e=>setInp(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleCheck()}
            placeholder='Type your answer…' style={S.input}/>
          <button onClick={handleCheck} style={S.checkBtn}>Check ✓</button>
        </div>
      )}
      {allAttempted && (
        <div style={{fontFamily:'"Baloo 2"',fontWeight:900,color:'#4ADE80',fontSize:'1.05rem',textAlign:'center'}}>
          {allCorrect ? '🎉 Scale Slider mastered!' : '✅ Station B complete! Moving on…'}
        </div>
      )}
    </div>
  )
}

/* ─── Station C — Orientation Flip ───────────────────────────────────────── */
const ORIENT_Qs = [
  { q:'🔄 Q1: Flip to HORIZONTAL view. Which animal now has the LONGEST bar? Type its name.',
    ans:'dogs', hint:'Dogs = 9 — the longest bar in any orientation!',
    exp:'The answer is Dogs. Dogs has the value 9, the highest number, so its bar is the longest in both vertical and horizontal views!',
    dsIdx:0 },
  { q:'🔄 Q2: Switch to VERTICAL view. Which colour bar is the SHORTEST?',
    ans:'yellow', hint:'Yellow = 3 — the lowest bar in the graph.',
    exp:'The answer is Yellow. Yellow has the value 3, the smallest number, so it has the shortest bar in the graph!',
    dsIdx:1 },
  { q:'🔄 Q3: Flip between vertical and horizontal. Does the DATA (the numbers) change? Type Yes or No.',
    ans:'no', hint:'Orientation only changes the look — never the data!',
    exp:'The answer is No. Flipping the orientation never changes the data. The numbers stay exactly the same — only the direction of the bars changes!',
    dsIdx:2 },
]

function StationC({ onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [orient, setOrient] = useState('vertical')
  const [inp, setInp] = useState('')
  const [results, setResults] = useState([null,null,null])
  const [showExp, setShowExp] = useState(false)
  const { speak } = useAudio()
  const allAttempted = results.every(r => r !== null)
  const allCorrect = results.every(r => r === true)
  const q = ORIENT_Qs[qIdx]
  const data = DS[q.dsIdx]

  React.useEffect(() => {
    if (allAttempted) onComplete()
  }, [allAttempted])

  const advance = (updatedResults) => {
    setShowExp(false)
    const nextIdx = qIdx + 1
    if (nextIdx < ORIENT_Qs.length) {
      setQIdx(nextIdx); setInp(''); setOrient('vertical')
    }
  }

  const handleCheck = () => {
    if (results[qIdx] !== null || showExp) return
    const ok = inp.trim().toLowerCase() === q.ans.toLowerCase()
    const nr = [...results]; nr[qIdx] = ok; setResults(nr)
    if (ok) {
      setTimeout(() => advance(nr), 900)
    } else {
      setShowExp(true)
      speak([`/assets/audio/sim_exp_orient_q${qIdx + 1}.mp3`])
      setTimeout(() => advance(nr), 2500)
    }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8,width:'100%',alignItems:'center'}}>
      <div style={{display:'flex',gap:7,justifyContent:'center'}}>
        {ORIENT_Qs.map((_,i)=>(<div key={i} style={S.badge(results[i]!==null, i===qIdx)}>
        {results[i]===true ? '✓' : results[i]===false ? '~' : i+1}
      </div>))}
      </div>
      <div style={S.qBox('rgba(168,85,247,0.12)','rgba(168,85,247,0.4)')}>{q.q}</div>
      {/* Toggle */}
      <div style={{display:'flex',alignItems:'center',gap:10,background:'rgba(255,255,255,0.07)',
        borderRadius:50,padding:'7px 14px',border:'1px solid rgba(255,255,255,0.12)'}}>
        <span style={{fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.88rem',
          color:orient==='vertical'?'#F5A623':'rgba(255,255,255,0.4)'}}>📊 Vertical</span>
        <button onClick={()=>setOrient(o=>o==='vertical'?'horizontal':'vertical')} style={{
          width:50,height:27,borderRadius:50,cursor:'pointer',border:'none',position:'relative',
          background:orient==='horizontal'?'linear-gradient(135deg,#F5A623,#FFC94A)':'rgba(255,255,255,0.18)',
          transition:'all 0.3s'}}>
          <motion.div animate={{x:orient==='horizontal'?23:2}}
            style={{width:21,height:21,borderRadius:'50%',background:'white',position:'absolute',top:3,
            boxShadow:'0 2px 6px rgba(0,0,0,0.3)'}}/>
        </button>
        <span style={{fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.88rem',
          color:orient==='horizontal'?'#F5A623':'rgba(255,255,255,0.4)'}}>📊 Horizontal</span>
      </div>
      <div style={{background:'rgba(0,0,0,0.3)',borderRadius:14,padding:'8px 12px',display:'inline-block'}}>
        <MiniBarGraph data={data} orientation={orient} />
      </div>
      {/* Explanation banner */}
      {showExp && (
        <motion.div initial={{opacity:0,y:4}} animate={{opacity:1,y:0}} style={{
          background:'linear-gradient(135deg,rgba(232,93,140,0.18),rgba(190,24,93,0.12))',
          border:'2px solid rgba(232,93,140,0.5)',borderRadius:14,
          padding:'10px 16px',fontFamily:'"Baloo 2"',fontWeight:800,
          fontSize:'0.92rem',color:'white',textAlign:'center',lineHeight:1.5,width:'100%'}}>
          💡 {q.exp}
          <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.5)',marginTop:4,fontWeight:600}}>Moving to next question…</div>
        </motion.div>
      )}
      {!showExp && results[qIdx] === null && (
        <div style={{display:'flex',gap:8,width:'100%',maxWidth:320}}>
          <input value={inp} onChange={e=>setInp(e.target.value)}
            onKeyDown={e=>e.key==='Enter'&&handleCheck()}
            placeholder='Type your answer…' style={S.input}/>
          <button onClick={handleCheck} style={S.checkBtn}>Check ✓</button>
        </div>
      )}
      {allAttempted && (
        <div style={{fontFamily:'"Baloo 2"',fontWeight:900,color:'#4ADE80',fontSize:'1.05rem',textAlign:'center'}}>
          {allCorrect ? '🎉 Orientation Flip mastered!' : '✅ Station C complete! Moving on…'}
        </div>
      )}
    </div>
  )
}

/* ─── Station D — Spot the Error ─────────────────────────────────────────── */
const ERR = [
  { title:'Pet Shop', correct:[{l:'Cats',v:6,c:'#FF6B6B'},{l:'Dogs',v:9,c:'#FFD93D'},{l:'Birds',v:4,c:'#6BCB77'}],
    bad:[{l:'Cats',v:3,c:'#FF6B6B'},{l:'Dogs',v:9,c:'#FFD93D'},{l:'Birds',v:4,c:'#6BCB77'}], ei:0,
    q:'🔎 Error 1 — Pet Shop: Cats were sold 6 times but the graph shows the wrong amount. Tap the wrong bar!',
    exp:'The Cats bar shows 3, but 6 cats were sold. The bar should be twice as tall!' },
  { title:'Colour Votes', correct:[{l:'Red',v:8,c:'#FF6B6B'},{l:'Blue',v:5,c:'#4D96FF'},{l:'Green',v:10,c:'#6BCB77'}],
    bad:[{l:'Red',v:8,c:'#FF6B6B'},{l:'Blue',v:5,c:'#4D96FF'},{l:'Green',v:5,c:'#6BCB77'}], ei:2,
    q:'🔎 Error 2 — Colour Votes: Green got 10 votes but the graph is wrong. Find and tap the incorrect bar!',
    exp:'Green should show 10, not 5. The bar was drawn only half as tall as it should be!' },
  { title:'Sunny Days', correct:[{l:'Mon',v:7,c:'#C77DFF'},{l:'Tue',v:4,c:'#FF9F43'},{l:'Wed',v:9,c:'#00D2FF'}],
    bad:[{l:'Mon',v:7,c:'#C77DFF'},{l:'Tue',v:9,c:'#FF9F43'},{l:'Wed',v:9,c:'#00D2FF'}], ei:1,
    q:'🔎 Error 3 — Sunny Days: Tuesday had 4 sunny hours but the bar shows more. Which bar is wrong? Tap it!',
    exp:'Tuesday shows 9 hours, but it should show only 4. Someone drew the bar too tall!' },
]

function StationD({ onComplete }) {
  const [qIdx, setQIdx] = useState(0)
  const [sel, setSel] = useState(null)
  const [rev, setRev] = useState(false)
  const [wrongTaps, setWrongTaps] = useState(0)
  const [done, setDone] = useState([false,false,false])
  // Station D completes when all scenarios have been revealed (right or revealed via wrong taps)
  const allDone = done.every(Boolean)
  const sc = ERR[qIdx]
  const cats = sc.bad
  const maxV = Math.max(...cats.map(c=>c.v),...sc.correct.map(c=>c.v))+2
  const BH = 100

  React.useEffect(()=>{ if(allDone) onComplete() },[allDone])

  const advanceD = () => {
    const nd=[...done]; nd[qIdx]=true
    setDone(nd)
    setTimeout(()=>{
      if(qIdx<ERR.length-1){
        setQIdx(qIdx+1); setSel(null); setRev(false); setWrongTaps(0)
      }
      // allDone fires via useEffect
    },1800)
  }

  const handleClick = (idx) => {
    if (rev) return
    setSel(idx)
    if (idx===sc.ei) {
      setRev(true)
      advanceD()
    } else {
      const newWrong = wrongTaps + 1
      setWrongTaps(newWrong)
      // After 3 wrong taps, reveal the answer and advance anyway
      if (newWrong >= 3) {
        setRev(true)
        advanceD()
      }
    }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',gap:8,width:'100%',alignItems:'center'}}>
      <div style={{display:'flex',gap:7,justifyContent:'center'}}>
        {ERR.map((_,i)=>(<div key={i} style={S.badge(done[i],i===qIdx)}>{done[i]?'✓':i+1}</div>))}
      </div>
      <div style={S.qBox('rgba(232,93,140,0.1)','rgba(232,93,140,0.35)')}>{sc.q}</div>
      {/* Clickable bar chart */}
      <div style={{background:'rgba(0,0,0,0.35)',borderRadius:14,padding:'12px 20px',
        display:'flex',gap:18,alignItems:'flex-end'}}>
        {cats.map((cat,i)=>{
          const bh = Math.max(4,(cat.v/maxV)*BH)
          const isWrong = i===sc.ei
          const isSel = sel===i
          const col = rev&&isWrong ? '#E85D8C' : cat.c
          return (
            <div key={cat.l} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:4}}>
              <span style={{fontFamily:'"Baloo 2"',fontWeight:900,fontSize:'0.88rem',color:'white'}}>{cat.v}</span>
              <button onClick={()=>handleClick(i)} style={{
                width:46,height:bh,background:`linear-gradient(to top,${col}cc,${col})`,
                border:rev&&isWrong?'2px solid #E85D8C':isSel&&!rev?'2px solid white':'2px solid transparent',
                borderRadius:'4px 4px 0 0',cursor:rev?'default':'pointer',
                transition:'all 0.3s',boxShadow:rev&&isWrong?`0 0 16px ${col}`:'none',
              }}/>
              <span style={{fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.8rem',color:'rgba(255,255,255,0.8)'}}>{cat.l}</span>
              {rev&&isWrong&&<motion.span initial={{scale:0}} animate={{scale:1}} style={{fontSize:'1rem'}}>❌</motion.span>}
            </div>
          )
        })}
      </div>
      {sel!==null && !rev && (
        <div style={{fontFamily:'"Baloo 2"',fontWeight:700,fontSize:'0.88rem',
          color:'rgba(255,255,255,0.6)',textAlign:'center'}}>
          That bar looks okay — keep looking! 🔍
          {wrongTaps >= 2 && (
            <span style={{display:'block',fontSize:'0.78rem',color:'#FFC94A',marginTop:3}}>
              💡 Hint: look for the bar that doesn't match the correct value!
            </span>
          )}
        </div>
      )}
      {rev && (
        <motion.div initial={{opacity:0,y:6}} animate={{opacity:1,y:0}} style={{
          background:'rgba(74,222,128,0.12)',border:'2px solid rgba(74,222,128,0.45)',
          borderRadius:14,padding:'10px 16px',fontFamily:'"Baloo 2"',fontWeight:800,
          fontSize:'0.92rem',color:'white',textAlign:'center',lineHeight:1.45}}>
          ✅ Found it! {sc.exp}
        </motion.div>
      )}
      {allDone && <div style={{fontFamily:'"Baloo 2"',fontWeight:900,color:'#4ADE80',fontSize:'1.05rem',textAlign:'center'}}>🎉 All errors spotted! You can now Play! 🎮</div>}
    </div>
  )
}

/* ─── Main Simulate Page ──────────────────────────────────────────────────── */
const TABS = [
  { id:'builder',     icon:'🧱', label:'A — Bar Builder',      color:'#F5A623' },
  { id:'scale',       icon:'📏', label:'B — Scale Slider',     color:'#60A5FA' },
  { id:'orientation', icon:'🔄', label:'C — Orientation Flip', color:'#A78BFA' },
  { id:'error',       icon:'🔎', label:'D — Spot the Error',   color:'#E85D8C' },
]
const NARR = {
  builder: ['sim_barbuilder'],
  scale: ['sim_scale'],
  orientation: ['sim_orient'],
  error: ['sim_error'],
}

export default function Simulate() {
  const navigate = useNavigate()
  const { speak, stopAll } = useAudio()
  const { dispatch } = useProgress()
  const [activeTab, setActiveTab] = useState('builder')
  const [done, setDone] = useState({ builder:false, scale:false, orientation:false, error:false })
  const allDone = Object.values(done).every(Boolean)

  // Station locking: can only access a tab if all previous tabs are done
  const tabOrder = ['builder','scale','orientation','error']
  const isUnlocked = (id) => {
    const idx = tabOrder.indexOf(id)
    if (idx===0) return true
    return done[tabOrder[idx-1]]
  }

  React.useEffect(()=>{
    speak(['/assets/audio/sim_welcome.mp3'])
    return ()=>stopAll()
  },[])

  const handleTabClick = (id) => {
    if (!isUnlocked(id)) return
    stopAll()
    setActiveTab(id)
    const key = NARR[id]?.[0]
    if (key) speak([`/assets/audio/${key}.mp3`])
  }

  const markDone = (id) => {
    setDone(prev=>({...prev,[id]:true}))
    // auto-advance to next tab
    const idx = tabOrder.indexOf(id)
    if (idx < tabOrder.length-1) {
      setTimeout(()=>{
        const next = tabOrder[idx+1]
        stopAll()
        setActiveTab(next)
        const key = NARR[next]?.[0]
        if (key) speak([`/assets/audio/${key}.mp3`])
      }, 1200)
    }
  }

  const handlePlay = () => {
    stopAll()
    dispatch({ type:'COMPLETE_PHASE', phase:'simulate' })
    navigate('/play')
  }

  const owlHints = {
    builder:'Use + and − to match the target bar heights! 🧱',
    scale:'Change the scale and watch the graph reshape! 📏',
    orientation:'Toggle to see the same data vertically and horizontally! 🔄',
    error:'Find the bar that does NOT match the correct value! 🔎',
  }

  return (
    <div className="page-frame">
      <PhaseStepper active="simulate" />
      <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden',
        padding:'8px 14px 6px',gap:6,alignItems:'center'}}>

        {/* ── Header ── */}
        <div style={{display:'flex',alignItems:'flex-start',justifyContent:'space-between',
          width:'100%',maxWidth:640,flexShrink:0,gap:8}}>
          <div>
            <div style={{fontFamily:'"Baloo 2"',fontWeight:900,
              fontSize:'clamp(1.05rem,2.5vw,1.3rem)',color:'white',lineHeight:1.2}}>
              ✏️ Simulate — Explore &amp; Discover!
            </div>
            <div style={{fontFamily:'"Baloo 2"',fontWeight:700,
              fontSize:'clamp(0.75rem,1.6vw,0.88rem)',color:'rgba(255,255,255,0.5)',marginTop:2}}>
              Complete all 4 stations in order to unlock Play 🎮
            </div>
          </div>
          {/* Owl */}
          <div style={{display:'flex',alignItems:'center',gap:6,flexShrink:0,
            background:'rgba(255,255,255,0.07)',border:'1px solid rgba(255,255,255,0.13)',
            borderRadius:14,borderBottomRightRadius:4,padding:'6px 11px',maxWidth:200}}>
            <span style={{fontSize:'1.3rem',flexShrink:0}}>🦉</span>
            <span style={{fontFamily:'"Baloo 2"',fontWeight:700,
              fontSize:'0.7rem',color:'#FFC94A',lineHeight:1.35}}>{owlHints[activeTab]}</span>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div style={{display:'flex',gap:5,flexShrink:0,width:'100%',maxWidth:640}}>
          {TABS.map((tab,i)=>{
            const unlocked = isUnlocked(tab.id)
            const isDone = done[tab.id]
            const isActive = activeTab===tab.id
            return (
              <button key={tab.id}
                onClick={()=>handleTabClick(tab.id)}
                disabled={!unlocked}
                title={!unlocked?`Complete station ${String.fromCharCode(64+i)} first`:undefined}
                style={{
                  flex:1,display:'flex',alignItems:'center',justifyContent:'center',gap:4,
                  padding:'7px 6px',borderRadius:11,border:'none',
                  cursor:unlocked?'pointer':'not-allowed',
                  fontFamily:'"Baloo 2"',fontWeight:800,fontSize:'0.7rem',
                  whiteSpace:'nowrap',transition:'all 0.2s',position:'relative',
                  background: isActive
                    ? `linear-gradient(135deg,${tab.color},${tab.color}cc)`
                    : isDone ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.06)',
                  color: isActive ? '#1a1030' : isDone ? '#4ADE80' : unlocked ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.25)',
                  opacity: !unlocked ? 0.45 : 1,
                  boxShadow: isActive ? `0 2px 12px ${tab.color}66` : 'none',
                }}>
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
                {isDone && <span style={{fontSize:'0.6rem',marginLeft:2}}>{isActive?'':'✓'}</span>}
                {!unlocked && <span style={{fontSize:'0.7rem',position:'absolute',top:2,right:4}}>🔒</span>}
              </button>
            )
          })}
        </div>

        {/* ── Content area ── */}
        <div style={{
          flex:1,width:'100%',maxWidth:640,
          background:'rgba(255,255,255,0.04)',
          border:'1px solid rgba(255,255,255,0.09)',
          borderRadius:18,padding:'12px 14px',
          overflow:'auto',display:'flex',
          flexDirection:'column',alignItems:'center',
        }} className="no-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
              exit={{opacity:0,y:-10}} transition={{duration:0.2}}
              style={{width:'100%',display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
              {activeTab==='builder'     && <StationA onComplete={()=>markDone('builder')} />}
              {activeTab==='scale'       && <StationB onComplete={()=>markDone('scale')} />}
              {activeTab==='orientation' && <StationC onComplete={()=>markDone('orientation')} />}
              {activeTab==='error'       && <StationD onComplete={()=>markDone('error')} />}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Footer nav ── */}
        <div style={{display:'flex',gap:8,flexShrink:0,alignItems:'center',justifyContent:'center'}}>
          {allDone && (
            <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.97}} onClick={handlePlay}
              style={{background:'linear-gradient(135deg,#F5A623,#FFC94A)',border:'none',
                borderRadius:50,padding:'11px 30px',fontFamily:'"Baloo 2"',fontWeight:900,
                fontSize:'clamp(0.95rem,2vw,1.1rem)',color:'#1a1030',cursor:'pointer',
                boxShadow:'0 4px 20px rgba(245,166,35,0.55)'}}>
              🎮 Let's Play! →
            </motion.button>
          )}
          {!allDone && (
            <div style={{fontFamily:'"Baloo 2"',fontWeight:700,
              fontSize:'0.82rem',color:'rgba(255,255,255,0.38)',textAlign:'center'}}>
              🔒 Complete all 4 stations to unlock Play
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
