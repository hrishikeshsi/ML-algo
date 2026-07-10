import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { RobotIcon, ShieldIcon, CodeIcon, BoltIcon, ChevronIcon } from './Icons'
import ripple from './useRipple'

export const AGENTS = [
  { id: 'software', name: 'Software Compliance agent', Icon: CodeIcon },
  { id: 'cyber', name: 'Cybersecurity Compliance agent', Icon: ShieldIcon },
  { id: 'single', name: 'Software Single Question Compliance agent', Icon: BoltIcon },
]

function Toggle({ on }) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-300 ${
        on ? 'bg-pine-600 shadow-[0_0_10px_rgba(35,129,111,0.45)]' : 'bg-ink-400/30'
      }`}
    >
      <motion.span
        layout
        transition={{ type: 'spring', stiffness: 500, damping: 32 }}
        className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow ${on ? 'left-[18px]' : 'left-[3px]'}`}
      />
    </span>
  )
}

export default function AgentMenu({ selected, onSelect }) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const active = AGENTS.find((a) => a.id === selected)

  useEffect(() => {
    const close = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', close)
    return () => document.removeEventListener('pointerdown', close)
  }, [])

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        title="Select agent"
        onPointerDown={ripple}
        onClick={() => setOpen((o) => !o)}
        className={`ripple-host flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium transition-[background-color,color,box-shadow] duration-150 ${
          active
            ? 'bg-pine-100 text-pine-700 shadow-glow'
            : 'text-ink-600 hover:bg-white/80 hover:text-ink-900 hover:shadow-soft'
        }`}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <RobotIcon className="h-4.5 w-4.5" />
        <span className="hidden max-w-36 truncate sm:block">
          {active ? active.name.replace(' Compliance agent', '') : 'Agents'}
        </span>
        <ChevronIcon
          className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            className="absolute bottom-12 left-0 z-30 w-80 max-w-[calc(100vw-7rem)] origin-bottom-left rounded-2xl border border-white/80 bg-white/90 p-2 shadow-lift backdrop-blur-xl"
          >
            <p className="px-3 pt-2 pb-1.5 text-[10.5px] font-semibold tracking-[0.14em] text-ink-400 uppercase">
              Specialist agents
            </p>
            {AGENTS.map(({ id, name, Icon }) => {
              const on = selected === id
              return (
                <button
                  key={id}
                  type="button"
                  role="menuitemradio"
                  aria-checked={on}
                  onPointerDown={ripple}
                  onClick={() => onSelect(on ? null : id)}
                  className={`ripple-host flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-[background-color,box-shadow] duration-150 ${
                    on ? 'bg-pine-100/80 shadow-glow' : 'hover:bg-white/80'
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg transition-colors duration-150 ${
                      on ? 'bg-pine-600 text-ivory-50' : 'bg-ink-400/12 text-ink-600'
                    }`}
                  >
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <span
                    className={`min-w-0 flex-1 text-[13px] leading-tight font-semibold ${on ? 'text-pine-700' : 'text-ink-900'}`}
                  >
                    {name}
                  </span>
                  <Toggle on={on} />
                </button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
