import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import AgentMenu from './AgentMenu'
import { PaperclipIcon, GlobeIcon, SendIcon, XIcon } from './Icons'
import ripple from './useRipple'

export default function Composer({ onSend, selectedAgent, onSelectAgent }) {
  const [value, setValue] = useState('')
  const [files, setFiles] = useState([])
  const [webSearch, setWebSearch] = useState(false)
  const fileInputRef = useRef(null)
  const canSend = value.trim().length > 0 || files.length > 0

  const submit = () => {
    if (!canSend) return
    onSend({ text: value.trim(), files, webSearch })
    setValue('')
    setFiles([])
  }

  return (
    <motion.div
      initial={{ y: 32, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.65, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
      className="relative z-20 mx-auto w-full max-w-3xl px-4 pb-6"
    >
      <div className="glass-strong glow-ring rounded-[26px] border border-white/80 p-3 shadow-lift">
        {/* attached files */}
        <AnimatePresence>
          {files.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 px-1 pb-2.5">
                {files.map((f, i) => (
                  <motion.span
                    key={`${f.name}-${i}`}
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex items-center gap-1.5 rounded-full bg-bronze-100 px-3 py-1 text-[12px] font-medium text-bronze-500"
                  >
                    <PaperclipIcon className="h-3.5 w-3.5" />
                    <span className="max-w-40 truncate">{f.name}</span>
                    <button
                      type="button"
                      aria-label={`Remove ${f.name}`}
                      onClick={() => setFiles(files.filter((_, j) => j !== i))}
                      className="rounded-full p-0.5 transition-colors hover:bg-bronze-500/15"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <textarea
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit()
            }
          }}
          placeholder="Ask anything about compliance…"
          className="max-h-40 w-full resize-none bg-transparent px-2 pt-1.5 pb-2 text-[15px] leading-relaxed text-ink-900 outline-none placeholder:text-ink-400"
        />

        <div className="flex items-center gap-1.5 pt-1">
          {/* attach */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              setFiles((prev) => [...prev, ...Array.from(e.target.files)])
              e.target.value = ''
            }}
          />
          <button
            type="button"
            title="Attach files"
            onPointerDown={ripple}
            onClick={() => fileInputRef.current?.click()}
            className="ripple-host grid h-9 w-9 place-items-center rounded-full text-ink-600 transition-[background-color,color,box-shadow] duration-150 hover:bg-white/80 hover:text-ink-900 hover:shadow-soft"
          >
            <PaperclipIcon className="h-4.5 w-4.5" />
          </button>

          {/* agents */}
          <AgentMenu selected={selectedAgent} onSelect={onSelectAgent} />

          {/* web search */}
          <button
            type="button"
            title="Toggle web search"
            aria-pressed={webSearch}
            onPointerDown={ripple}
            onClick={() => setWebSearch((w) => !w)}
            className={`ripple-host flex h-9 items-center gap-1.5 rounded-full px-3 text-[12.5px] font-medium transition-[background-color,color,box-shadow] duration-150 ${
              webSearch
                ? 'bg-pine-100 text-pine-700 shadow-glow'
                : 'text-ink-600 hover:bg-white/80 hover:text-ink-900 hover:shadow-soft'
            }`}
          >
            <GlobeIcon className="h-4.5 w-4.5" />
            <span className="hidden sm:block">Web search</span>
          </button>

          {/* send */}
          <motion.button
            type="button"
            title="Send"
            onPointerDown={ripple}
            onClick={submit}
            disabled={!canSend}
            whileHover={canSend ? { scale: 1.06 } : {}}
            whileTap={canSend ? { scale: 0.94 } : {}}
            className={`ripple-host ml-auto grid h-10 w-10 place-items-center rounded-full transition-[background-color,color,box-shadow] duration-200 ${
              canSend
                ? 'bg-gradient-to-br from-pine-600 to-pine-700 text-ivory-50 shadow-[0_4px_16px_rgba(26,107,94,0.4)]'
                : 'cursor-default bg-ink-400/15 text-ink-400'
            }`}
          >
            <SendIcon className="h-4.5 w-4.5" />
          </motion.button>
        </div>
      </div>

      <p className="pt-2.5 text-center text-[11px] text-ink-400">
        EnterpriseGPT can make mistakes — verify critical compliance decisions with your auditor.
      </p>
    </motion.div>
  )
}
