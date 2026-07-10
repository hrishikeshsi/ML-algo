import { useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogoMark, PaperclipIcon, GlobeIcon } from './Icons'
import { AGENTS } from './AgentMenu'

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-pine-600/70"
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </span>
  )
}

export default function ChatThread({ messages, thinking }) {
  const scrollRef = useRef(null)

  useEffect(() => {
    const el = scrollRef.current
    el?.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
  }, [messages, thinking])

  return (
    <motion.div
      key="thread"
      ref={scrollRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="slim-scroll min-h-0 flex-1 overflow-y-auto px-4 pt-6"
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-5 pb-4">
        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : ''}`}
            >
              {m.role === 'assistant' && (
                <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pine-600 to-pine-700 text-ivory-50 shadow-glow">
                  <LogoMark className="h-3.5 w-3.5" />
                </span>
              )}
              <div
                className={`max-w-[78%] rounded-3xl px-4.5 py-3 text-[14.5px] leading-relaxed shadow-soft ${
                  m.role === 'user'
                    ? 'rounded-br-lg bg-gradient-to-br from-pine-600 to-pine-700 text-ivory-50'
                    : 'glass-strong rounded-bl-lg text-ink-900'
                }`}
              >
                {m.agent && (
                  <p className="pb-1 text-[11px] font-semibold tracking-wide text-pine-600 uppercase">
                    {AGENTS.find((a) => a.id === m.agent)?.name}
                  </p>
                )}
                <p className="whitespace-pre-wrap">{m.text}</p>
                {(m.files?.length > 0 || m.webSearch) && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.files?.map((f, i) => (
                      <span
                        key={i}
                        className="flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-medium"
                      >
                        <PaperclipIcon className="h-3 w-3" />
                        <span className="max-w-36 truncate">{f.name}</span>
                      </span>
                    ))}
                    {m.webSearch && (
                      <span className="flex items-center gap-1 rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-medium">
                        <GlobeIcon className="h-3 w-3" /> Web search
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {thinking && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex gap-3"
          >
            <span className="mt-1 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-pine-600 to-pine-700 text-ivory-50 shadow-glow">
              <LogoMark className="h-3.5 w-3.5" />
            </span>
            <div className="glass-strong rounded-3xl rounded-bl-lg px-4.5 py-3 shadow-soft">
              <TypingDots />
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
