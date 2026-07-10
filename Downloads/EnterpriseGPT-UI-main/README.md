# EnterpriseGPT — Compliance Chatbot UI

A frontend-only, light-themed enterprise chatbot interface built with **React + Vite**, **Tailwind CSS v4**, and **Framer Motion**.

## Run

```bash
npm install
npm run dev
```

## Features

- Thin glassmorphic left sidebar: brand, chat history, user card at the bottom
- Rotating typewriter greeting in the main panel
- Composer with file attach, agent picker (robot icon → dropdown with per-agent toggles), web-search toggle, and send
- Three specialist agents: Software Compliance, Cybersecurity Compliance, Software Single Question Compliance
- Ambient aurora wash + canvas-drawn floating bokeh particles
- Fade + slide message transitions, ripple click feedback, soft shadows and glowing focus borders

## Wiring a backend

`handleSend` in [src/App.jsx](src/App.jsx) currently returns a mocked reply after 1.6 s — replace the `setTimeout` block with your API call. The payload already carries `text`, `files`, `webSearch`, and the selected agent id.
