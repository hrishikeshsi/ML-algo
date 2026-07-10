import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogoMark, HistoryIcon, ChevronIcon, PanelIcon } from './Icons'
import ripple from './useRipple'

const HISTORY = []

export default function Sidebar({ onClose }) {
  const [historyOpen, setHistoryOpen] = useState(true)

  return (
    <motion.aside
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: 240, opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="glass relative z-10 h-full shrink-0 overflow-hidden rounded-r-3xl shadow-soft"
    >
      <div className="flex h-full w-60 flex-col">
      {/* brand */}
      <div className="flex items-center gap-2.5 px-5 pt-6 pb-5">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-pine-600 to-pine-700 text-ivory-50 shadow-glow">
          <LogoMark className="h-4.5 w-4.5" />
        </span>
        <p className="font-display text-[17px] font-semibold tracking-tight text-ink-900">
          EnterpriseGPT
        </p>
        <button
          type="button"
          title="Close sidebar"
          onPointerDown={ripple}
          onClick={onClose}
          className="ripple-host ml-auto grid h-8 w-8 shrink-0 place-items-center rounded-lg text-ink-400 transition-[background-color,color,box-shadow] duration-150 hover:bg-white/70 hover:text-ink-900 hover:shadow-soft"
        >
          <PanelIcon className="h-4.5 w-4.5" />
        </button>
      </div>

      <div className="mx-5 h-px bg-gradient-to-r from-transparent via-ink-400/25 to-transparent" />

      {/* history (collapsible) */}
      <div className="slim-scroll min-h-0 flex-1 overflow-y-auto px-3 pt-4">
        <button
          type="button"
          onPointerDown={ripple}
          onClick={() => setHistoryOpen((o) => !o)}
          aria-expanded={historyOpen}
          className="ripple-host flex w-full items-center gap-1.5 rounded-xl px-2 py-2 text-[11px] font-semibold tracking-[0.12em] text-ink-400 uppercase transition-colors duration-150 hover:bg-white/70 hover:text-ink-600"
        >
          <HistoryIcon className="h-3.5 w-3.5" />
          History
          <ChevronIcon
            className={`ml-auto h-3.5 w-3.5 transition-transform duration-300 ${
              historyOpen ? '' : '-rotate-90'
            }`}
          />
        </button>

        <AnimatePresence initial={false}>
          {historyOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              {HISTORY.length === 0 ? (
                <p className="px-3 py-3 text-[12.5px] leading-relaxed text-ink-400">
                  No conversations yet — your chats will appear here.
                </p>
              ) : (
                <ul className="space-y-0.5 pt-1">
                  {HISTORY.map((item) => (
                    <li key={item}>
                      <button
                        type="button"
                        onPointerDown={ripple}
                        className="ripple-host w-full truncate rounded-xl px-3 py-2 text-left text-[13px] text-ink-600 transition-[background-color,color,box-shadow,transform] duration-150 hover:translate-x-0.5 hover:bg-white/70 hover:text-ink-900 hover:shadow-soft"
                      >
                        {item}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* auth — replace with the real user card once sign-in exists */}
      <div className="p-3">
        <button
          type="button"
          onPointerDown={ripple}
          className="ripple-host w-full rounded-2xl bg-gradient-to-br from-pine-600 to-pine-700 py-2.5 text-[13px] font-semibold text-ivory-50 shadow-glow transition-shadow duration-150 hover:shadow-lift"
        >
          Log in
        </button>
      </div>
      </div>
    </motion.aside>
  )
}
