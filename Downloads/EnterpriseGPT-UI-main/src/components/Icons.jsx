const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.7,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export function LogoMark({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        d="M12 2.5 14.4 9.6 21.5 12 14.4 14.4 12 21.5 9.6 14.4 2.5 12 9.6 9.6Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  )
}

export function RobotIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <rect x="5" y="8" width="14" height="10" rx="3.5" />
      <path d="M12 8V5.2" />
      <circle cx="12" cy="4" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="9.4" cy="12.6" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14.6" cy="12.6" r="1.1" fill="currentColor" stroke="none" />
      <path d="M9.8 15.6h4.4" />
      <path d="M5 12H3.2M20.8 12H19" />
    </svg>
  )
}

export function PaperclipIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M21 12.5 12.7 20.8a5.3 5.3 0 0 1-7.5-7.5l8.5-8.5a3.6 3.6 0 0 1 5 5l-8.5 8.5a1.8 1.8 0 0 1-2.5-2.5L15.5 8" />
    </svg>
  )
}

export function GlobeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.4 2.2 3.6 5.1 3.6 8.5s-1.2 6.3-3.6 8.5c-2.4-2.2-3.6-5.1-3.6-8.5s1.2-6.3 3.6-8.5Z" />
    </svg>
  )
}

export function SendIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M5 12 3.3 4.2c-.2-.8.7-1.5 1.4-1.1l16 8a1 1 0 0 1 0 1.8l-16 8c-.7.4-1.6-.3-1.4-1.1L5 12Zm0 0h7" />
    </svg>
  )
}

export function HistoryIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M4 5.5h16M4 12h16M4 18.5h10" />
    </svg>
  )
}

export function CheckIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

export function XIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  )
}

export function ShieldIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M12 3 5 5.8v5.4c0 4.4 3 8.1 7 9.3 4-1.2 7-4.9 7-9.3V5.8L12 3Z" />
      <path d="m9.2 11.8 2 2 3.6-4" />
    </svg>
  )
}

export function CodeIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="m8.5 8-4 4 4 4M15.5 8l4 4-4 4M13.2 5.5l-2.4 13" />
    </svg>
  )
}

export function BoltIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="M13 2.8 4.8 13.2h5.4L11 21.2l8.2-10.4h-5.4L13 2.8Z" />
    </svg>
  )
}

export function PanelIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <rect x="3" y="4.5" width="18" height="15" rx="3" />
      <path d="M9.5 4.5v15" />
    </svg>
  )
}

export function ChevronIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" className={className} {...base} aria-hidden="true">
      <path d="m7 10 5 5 5-5" />
    </svg>
  )
}
