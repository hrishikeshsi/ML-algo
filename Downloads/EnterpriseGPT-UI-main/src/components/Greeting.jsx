import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

const PHRASES = [
  'Welcome to EnterpriseGPT',
  'Greetings, how was your day?',
  'Ready to assist your compliance needs',
  'Audits, frameworks, controls — ask away',
  'Your intelligent compliance companion',
]

const TYPE_MS = 42
const ERASE_MS = 45
const HOLD_MS = 2000

function useTypewriter(phrases) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [erasing, setErasing] = useState(false)

  useEffect(() => {
    const current = phrases[index]
    let timer
    if (!erasing && text.length < current.length) {
      timer = setTimeout(() => setText(current.slice(0, text.length + 1)), TYPE_MS)
    } else if (!erasing && text.length === current.length) {
      timer = setTimeout(() => setErasing(true), HOLD_MS)
    } else if (erasing && text.length > 0) {
      timer = setTimeout(() => setText(current.slice(0, text.length - 1)), ERASE_MS)
    } else if (erasing) {
      setErasing(false)
      setIndex((i) => (i + 1) % phrases.length)
    }
    return () => clearTimeout(timer)
  }, [text, erasing, index, phrases])

  return text
}

export default function Greeting() {
  const text = useTypewriter(PHRASES)

  return (
    <motion.div
      key="greeting"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24, transition: { duration: 0.35 } }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className="flex flex-1 flex-col items-center justify-center px-8 text-center"
    >
      <h1 className="font-display min-h-[2.4em] max-w-3xl text-[clamp(2rem,4.2vw,3.4rem)] font-500 leading-[1.15] tracking-tight text-ink-900 sm:min-h-[1.2em]">
        <span className="bg-gradient-to-r from-ink-900 via-pine-700 to-bronze-500 bg-clip-text text-transparent">
          {text}
        </span>
        <span className="caret" />
      </h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className="mt-5 max-w-xl text-[15px] leading-relaxed text-ink-600"
      >
        Ask about frameworks, audits, controls or policies — attach evidence, pick a
        specialist agent, and let EnterpriseGPT handle the rest.
      </motion.p>
    </motion.div>
  )
}
