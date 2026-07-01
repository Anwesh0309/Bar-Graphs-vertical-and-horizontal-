import React from 'react'
import { motion } from 'framer-motion'

const BAR_COLORS = ['#FF6B6B','#FFD93D','#6BCB77','#4D96FF','#C77DFF','#FF9F43','#00D2FF','#FF6B9D']

export default function BarGraph({
  orientation = 'vertical',
  categories = [],
  scale = 1,
  maxValue,
  title,
  highlightIndex,
  animated = true,
  showValues = true,
  compact = false,
}) {
  const cats = categories.slice(0, 6)
  const dataMax = cats.length ? Math.max(...cats.map(c => c.value)) : 10
  const axisMax = maxValue || Math.ceil((dataMax * 1.2) / scale) * scale || scale * 10

  // Dimensions
  const W = compact ? 260 : 320
  const H = compact ? 200 : 240
  const marginLeft = orientation === 'vertical' ? 38 : 90
  const marginRight = 20
  const marginTop = title ? 28 : 14
  const marginBottom = orientation === 'vertical' ? 44 : 28

  const graphW = W - marginLeft - marginRight
  const graphH = H - marginTop - marginBottom

  const gridCount = Math.ceil(axisMax / scale)
  const gridLines = Array.from({ length: gridCount + 1 }, (_, i) => i * scale)

  const barPad = orientation === 'vertical' ? 0.3 : 0.35
  const barW = orientation === 'vertical'
    ? (graphW / cats.length) * (1 - barPad)
    : graphH / cats.length * (1 - barPad)

  const getColor = (cat, i) => cat.color || BAR_COLORS[i % BAR_COLORS.length]

  return (
    <svg
      width={W}
      height={H}
      role="img"
      aria-label={`${title || 'Bar graph'}: ${cats.map(c=>`${c.label}: ${c.value}`).join(', ')}`}
      style={{ fontFamily: '"Baloo 2", sans-serif', overflow: 'visible', maxWidth: '100%' }}
    >
      {title && (
        <text x={W/2} y={16} textAnchor="middle" fill="#FFC94A" fontWeight="800" fontSize="11">
          {title}
        </text>
      )}

      {/* Grid lines */}
      {orientation === 'vertical' && gridLines.map(val => {
        const y = marginTop + graphH - (val / axisMax) * graphH
        return (
          <g key={val}>
            <line x1={marginLeft} y1={y} x2={marginLeft + graphW} y2={y}
              stroke="rgba(255,255,255,0.12)" strokeWidth={val === 0 ? 1.5 : 0.8} />
            <text x={marginLeft - 5} y={y + 4} textAnchor="end" fill="rgba(255,255,255,0.6)"
              fontSize="9" fontWeight="600">{val}</text>
          </g>
        )
      })}

      {orientation === 'horizontal' && gridLines.map(val => {
        const x = marginLeft + (val / axisMax) * graphW
        return (
          <g key={val}>
            <line x1={x} y1={marginTop} x2={x} y2={marginTop + graphH}
              stroke="rgba(255,255,255,0.12)" strokeWidth={val === 0 ? 1.5 : 0.8} />
            <text x={x} y={marginTop + graphH + 12} textAnchor="middle" fill="rgba(255,255,255,0.6)"
              fontSize="9" fontWeight="600">{val}</text>
          </g>
        )
      })}

      {/* Axes */}
      <line x1={marginLeft} y1={marginTop} x2={marginLeft} y2={marginTop + graphH}
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />
      <line x1={marginLeft} y1={marginTop + graphH} x2={marginLeft + graphW} y2={marginTop + graphH}
        stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

      {/* Bars */}
      {cats.map((cat, i) => {
        const color = getColor(cat, i)
        const isHighlighted = highlightIndex === i
        const ratio = Math.min(cat.value / axisMax, 1)

        if (orientation === 'vertical') {
          const slotW = graphW / cats.length
          const bw = slotW * (1 - barPad)
          const bh = ratio * graphH
          const bx = marginLeft + i * slotW + (slotW - bw) / 2
          const by = marginTop + graphH - bh

          return (
            <g key={cat.label} tabIndex={0}
              aria-label={`${cat.label}: ${cat.value} units`}
              style={{ outline: 'none' }}>
              {animated ? (
                <motion.rect
                  x={bx} y={marginTop + graphH} width={bw} height={0}
                  fill={isHighlighted ? '#E85D8C' : color}
                  rx="3"
                  stroke={isHighlighted ? '#fff' : 'none'}
                  strokeWidth={isHighlighted ? 2 : 0}
                  animate={{ y: by, height: bh }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                  style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
                />
              ) : (
                <rect x={bx} y={by} width={bw} height={bh}
                  fill={isHighlighted ? '#E85D8C' : color}
                  rx="3"
                  stroke={isHighlighted ? '#fff' : 'none'}
                  strokeWidth={isHighlighted ? 2 : 0}
                  style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
                />
              )}
              {showValues && (
                <text x={bx + bw/2} y={by - 4} textAnchor="middle"
                  fill="white" fontSize="9" fontWeight="700">{cat.value}</text>
              )}
              <text x={bx + bw/2} y={marginTop + graphH + 14} textAnchor="middle"
                fill="rgba(255,255,255,0.8)" fontSize="8" fontWeight="600"
                style={{ maxWidth: bw }}>
                {cat.label.length > 7 ? cat.label.slice(0,6)+'…' : cat.label}
              </text>
            </g>
          )
        } else {
          // Horizontal
          const slotH = graphH / cats.length
          const bh = slotH * (1 - barPad)
          const bw = ratio * graphW
          const by = marginTop + i * slotH + (slotH - bh) / 2

          return (
            <g key={cat.label} tabIndex={0}
              aria-label={`${cat.label}: ${cat.value} units`}
              style={{ outline: 'none' }}>
              {animated ? (
                <motion.rect
                  x={marginLeft} y={by} width={0} height={bh}
                  fill={isHighlighted ? '#E85D8C' : color}
                  rx="3"
                  stroke={isHighlighted ? '#fff' : 'none'}
                  strokeWidth={isHighlighted ? 2 : 0}
                  animate={{ width: bw }}
                  transition={{ duration: 0.6, delay: i * 0.1, ease: 'easeOut' }}
                  style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
                />
              ) : (
                <rect x={marginLeft} y={by} width={bw} height={bh}
                  fill={isHighlighted ? '#E85D8C' : color}
                  rx="3"
                  stroke={isHighlighted ? '#fff' : 'none'}
                  strokeWidth={isHighlighted ? 2 : 0}
                  style={{ filter: `drop-shadow(0 0 4px ${color}88)` }}
                />
              )}
              {showValues && (
                <text x={marginLeft + bw + 4} y={by + bh/2 + 4}
                  fill="white" fontSize="9" fontWeight="700">{cat.value}</text>
              )}
              <text x={marginLeft - 5} y={by + bh/2 + 4} textAnchor="end"
                fill="rgba(255,255,255,0.8)" fontSize="8" fontWeight="600">
                {cat.label.length > 9 ? cat.label.slice(0,8)+'…' : cat.label}
              </text>
            </g>
          )
        }
      })}
    </svg>
  )
}
