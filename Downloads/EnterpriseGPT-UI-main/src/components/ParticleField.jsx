import { useEffect, useRef } from 'react'

// Crisp, scattered dot particles (reference-style) in the app's own palette.
// Mostly warm grays with occasional pine/bronze accents; slow, soothing drift.
const TONES = [
  { rgb: [120, 115, 104], weight: 0.62 }, // warm gray
  { rgb: [26, 107, 94], weight: 0.2 }, // pine
  { rgb: [185, 128, 62], weight: 0.12 }, // bronze
  { rgb: [122, 139, 111], weight: 0.06 }, // sage
]

function pickTone() {
  let r = Math.random()
  for (const t of TONES) {
    if ((r -= t.weight) <= 0) return t.rgb
  }
  return TONES[0].rgb
}

export default function ParticleField() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    let particles = []

    const spawn = (w, h) => {
      const count = Math.min(170, Math.floor((w * h) / 7200))
      particles = Array.from({ length: count }, () => {
        // mostly tiny dots, a few larger standouts
        const big = Math.random() < 0.12
        return {
          x: Math.random() * w,
          y: Math.random() * h,
          r: big ? 2.6 + Math.random() * 2.4 : 0.8 + Math.random() * 1.6,
          vx: (Math.random() - 0.5) * 0.1,
          vy: (Math.random() - 0.5) * 0.08 - 0.03,
          tone: pickTone(),
          alpha: 0.22 + Math.random() * 0.38,
          soft: Math.random() < 0.25, // some dots slightly blurred for depth
          phase: Math.random() * Math.PI * 2,
          pulse: 0.3 + Math.random() * 0.6,
        }
      })
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      spawn(canvas.offsetWidth, canvas.offsetHeight)
    }

    const tick = (t) => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)
      for (const p of particles) {
        p.x += p.vx + Math.sin(t / 5000 + p.phase) * 0.05
        p.y += p.vy
        if (p.y < -8) p.y = h + 8
        if (p.y > h + 8) p.y = -8
        if (p.x < -8) p.x = w + 8
        if (p.x > w + 8) p.x = -8

        const breathe = p.alpha * (0.8 + 0.2 * Math.sin(t / 2200 + p.phase * p.pulse))
        const [r, g, b] = p.tone
        ctx.save()
        if (p.soft) {
          ctx.filter = 'blur(1.5px)'
        }
        ctx.fillStyle = `rgba(${r},${g},${b},${breathe})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
      }
      raf = requestAnimationFrame(tick)
    }

    resize()
    window.addEventListener('resize', resize)
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    />
  )
}
