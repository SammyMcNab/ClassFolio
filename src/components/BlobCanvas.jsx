import { useEffect, useRef } from 'react'

export default function BlobCanvas() {
  const svgRef = useRef(null)

  useEffect(() => {
    const svg = svgRef.current
    if (!svg) return

    // Clear any previously appended blobs (React StrictMode double-invoke)
    while (svg.firstChild) svg.removeChild(svg.firstChild)

    const COLOR = '#94a3b8' // silver — original was '#b8fd4b'
    const COUNT = 22

    function rng(seed, n) {
      return Math.abs(Math.sin(seed * 127.1 + n * 311.7))
    }

    function blobPath(size, seed) {
      const pts = 6 + Math.floor(rng(seed, 0) * 3)
      const step = (Math.PI * 2) / pts
      const coords = []
      for (let i = 0; i < pts; i++) {
        const angle = i * step - Math.PI / 2
        const r = size * (0.55 + rng(seed, i + 1) * 0.45)
        coords.push([r * Math.cos(angle), r * Math.sin(angle)])
      }
      const t = 0.35
      let d = `M ${coords[0][0].toFixed(1)} ${coords[0][1].toFixed(1)}`
      for (let i = 0; i < pts; i++) {
        const cur = coords[i]
        const nxt = coords[(i + 1) % pts]
        const prv = coords[(i - 1 + pts) % pts]
        const nnx = coords[(i + 2) % pts]
        const cp1x = cur[0] + (nxt[0] - prv[0]) * t
        const cp1y = cur[1] + (nxt[1] - prv[1]) * t
        const cp2x = nxt[0] - (nnx[0] - cur[0]) * t
        const cp2y = nxt[1] - (nnx[1] - cur[1]) * t
        d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${nxt[0].toFixed(1)} ${nxt[1].toFixed(1)}`
      }
      return d + ' Z'
    }

    const H = window.innerHeight
    const W = window.innerWidth
    const ns = 'http://www.w3.org/2000/svg'

    for (let i = 0; i < COUNT; i++) {
      const size = 18 + rng(i, 1) * 44
      const x = rng(i, 2) * W
      const dur = 9 + rng(i, 3) * 12
      const delay = -(rng(i, 4) * dur * 2)
      const opacity = 0.18 + rng(i, 5) * 0.55
      const rot0 = rng(i, 6) * 360
      const rotDelta = (rng(i, 7) - 0.5) * 70

      const g = document.createElementNS(ns, 'g')
      const path = document.createElementNS(ns, 'path')
      path.setAttribute('d', blobPath(size, i))
      path.setAttribute('fill', COLOR)
      path.setAttribute('opacity', opacity.toFixed(2))

      const animY = document.createElementNS(ns, 'animateTransform')
      animY.setAttribute('attributeName', 'transform')
      animY.setAttribute('type', 'translate')
      animY.setAttribute('values', `${x.toFixed(1)} ${-size * 2}; ${x.toFixed(1)} ${H + size * 2}`)
      animY.setAttribute('dur', `${dur.toFixed(1)}s`)
      animY.setAttribute('begin', `${delay.toFixed(1)}s`)
      animY.setAttribute('repeatCount', 'indefinite')
      animY.setAttribute('calcMode', 'linear')

      const animR = document.createElementNS(ns, 'animateTransform')
      animR.setAttribute('attributeName', 'transform')
      animR.setAttribute('type', 'rotate')
      animR.setAttribute('values', `${rot0.toFixed(1)} 0 0; ${(rot0 + rotDelta).toFixed(1)} 0 0`)
      animR.setAttribute('dur', `${dur.toFixed(1)}s`)
      animR.setAttribute('begin', `${delay.toFixed(1)}s`)
      animR.setAttribute('repeatCount', 'indefinite')
      animR.setAttribute('calcMode', 'linear')
      animR.setAttribute('additive', 'sum')

      g.appendChild(path)
      g.appendChild(animY)
      g.appendChild(animR)
      svg.appendChild(g)
    }
  }, [])

  return (
    <div className="blob-canvas" aria-hidden="true">
      <svg ref={svgRef} className="blob-svg" xmlns="http://www.w3.org/2000/svg" />
      <div className="blob-overlay" />
    </div>
  )
}
