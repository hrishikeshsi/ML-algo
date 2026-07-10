import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { PanelIcon } from './components/Icons'
import ripple from './components/useRipple'
import Sidebar from './components/Sidebar'
import Greeting from './components/Greeting'
import Composer from './components/Composer'
import ChatThread from './components/ChatThread'
import ParticleField from './components/ParticleField'
import { AGENTS } from './components/AgentMenu'

export default function App() {
  const [messages, setMessages] = useState([])
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [thinking, setThinking] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const idRef = useRef(0)

  const handleSend = ({ text, files, webSearch }) => {
    const userMsg = {
      id: ++idRef.current,
      role: 'user',
      text: text || '(attached files)',
      files,
      webSearch,
    }
    setMessages((prev) => [...prev, userMsg])
    setThinking(true)

    // Frontend-only demo reply — swap for a real API call.
    const agent = AGENTS.find((a) => a.id === selectedAgent)
    setTimeout(() => {
      setThinking(false)
      setMessages((prev) => [
        ...prev,
        {
          id: ++idRef.current,
          role: 'assistant',
          agent: selectedAgent,
          text: `${agent ? `As your ${agent.name}, I` : 'I'}'ve received your question${
            files.length ? ` along with ${files.length} attachment${files.length > 1 ? 's' : ''}` : ''
          }${webSearch ? ' and will consult live web sources' : ''}. This is a frontend preview — connect the compliance engine to get real answers here.`,
        },
      ])
    }, 1600)
  }

  return (
    <div className="relative flex h-full overflow-clip bg-ivory-50">
      {/* ambient background */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="aurora left-[-10%] top-[-15%] h-[55vh] w-[45vw] bg-pine-100" />
        <div
          className="aurora right-[-8%] top-[20%] h-[50vh] w-[40vw] bg-bronze-100"
          style={{ animationDelay: '-9s' }}
        />
        <div
          className="aurora bottom-[-20%] left-[25%] h-[50vh] w-[45vw] bg-ivory-200"
          style={{ animationDelay: '-17s' }}
        />
      </div>
      <ParticleField />

      <AnimatePresence>
        {sidebarOpen && <Sidebar onClose={() => setSidebarOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {!sidebarOpen && (
          <motion.button
            type="button"
            title="Open sidebar"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.3 }}
            onPointerDown={ripple}
            onClick={() => setSidebarOpen(true)}
            className="ripple-host glass-strong absolute top-5 left-4 z-20 grid h-10 w-10 place-items-center rounded-xl text-ink-600 shadow-soft transition-[color,box-shadow] duration-150 hover:text-ink-900 hover:shadow-lift"
          >
            <PanelIcon className="h-5 w-5" />
          </motion.button>
        )}
      </AnimatePresence>

      <main className="relative z-10 flex min-w-0 flex-1 flex-col">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <Greeting />
          ) : (
            <ChatThread messages={messages} thinking={thinking} />
          )}
        </AnimatePresence>

        <Composer
          onSend={handleSend}
          selectedAgent={selectedAgent}
          onSelectAgent={setSelectedAgent}
        />
      </main>
    </div>
  )
}
