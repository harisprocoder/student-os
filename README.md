# DAE Student OS

An offline-first student workspace for managing assignments, notes, timetable, attendance, exams, study plans, goals, and academic progress. Everything stays on your device.

## Tech Stack

- **React 19** — Frontend framework
- **TypeScript** — Type-safe code
- **Vite** — Build tool and dev server
- **Tailwind CSS v4** — Styling
- **shadcn/ui** — UI component library
- **Lucide Icons** — Icon library
- **Framer Motion** — Animations
- **Dexie.js** — IndexedDB wrapper for offline data storage
- **Zustand** — State management
- **Recharts** — Charts and data visualization
- **React Router v7** — Client-side routing (imports from `react-router`)
- **vite-plugin-pwa** — Progressive Web App support

All relevant files live in the `src` directory.

Use `bun` for the package manager.

## Architecture

This is a **frontend-only, offline-first** application. There is:

- **No backend server** — all data is stored locally in IndexedDB via Dexie.js
- **No authentication service** — no sign-in required
- **No cloud database** — no external API dependencies
- **No external CDN dependencies** — all assets are bundled locally
- **No analytics or tracking**

The app works completely offline after the first load and can be installed as a PWA.

## Project Structure

```
src/
├── components/       # Reusable UI components
│   ├── layout/       # App layout, sidebar, page transitions
│   └── ui/           # shadcn/ui components
├── constants/        # Animation constants, motion tokens
├── db/               # Dexie database setup and seed data
├── hooks/            # Custom React hooks for data access
├── lib/              # Utilities, animation variants
├── pages/            # Route-level page components
├── stores/           # Zustand stores (UI state, settings)
├── types/            # TypeScript type definitions
├── App.tsx           # Root app with routing
└── main.tsx          # Entry point
```

## Setup

This project is set up and running in a cloud development environment.

## Development

```bash
bun install
bun run dev
```

## Build

```bash
bun run build
```

## Features

- **Dashboard** — Overview of academic progress and upcoming items
- **Subjects** — Manage courses with color coding and icons
- **Notes** — Rich text notes with markdown support
- **Assignments** — Track homework with due dates and status
- **Timetable** — Weekly class schedule
- **Attendance** — Track attendance per subject with percentage calculations
- **Exams** — Exam planner with countdown timers
- **Marks & GPA** — Grade tracking and GPA calculator
- **Study Planner** — Weekly study schedule
- **Pomodoro Timer** — Focus timer with session tracking
- **Goals** — Goal tracking with subtasks and progress
- **Settings** — Theme, data backup/restore
- **PWA** — Installable as a Progressive Web App
- **Offline** — Full functionality without internet

## Styling

Colors are defined in `src/index.css` using the oklch color format for Tailwind v4.

All UI components support both light and dark mode. Set the theme using `dark` or `light` classes on the parent element.

## Accessibility

The app follows WCAG guidelines:
- Semantic HTML throughout
- Keyboard navigable
- Focus-visible states on all interactive elements
- Proper heading hierarchy
- ARIA labels where needed
- Respects `prefers-reduced-motion`
