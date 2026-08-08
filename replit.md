# The Mirror

The Mirror is a local-first reflection app built with React, TypeScript, and
Vite. It stores reflections and preferences in the browser and presents
state-specific Mirror cards, work summaries, and history.

## Development

- Start the app: `npm run dev`
- Production build: `npm run build`
- Tests: `npm test`

## User preferences

- Preserve the existing glassmorphism, backgrounds, spacing, typography,
  animations, and interaction model when adding features.
- Prefer additive, focused changes over redesigns.
- Keep reflection data and analytics behavior backward compatible.
- Keep personal reflection data on-device unless the user explicitly requests
  another storage model.