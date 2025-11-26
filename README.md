# Robo Math

A browser-based math application built with React and Vite.

## Technology Stack

- **React 19.2.0** - UI framework
- **Vite 5.4.11** - Build tool and dev server
- **Bootstrap 5.3.8** - CSS framework
- **JavaScript** - No TypeScript

## Development

Start the development server on port 3333:

```bash
npm run dev
```

The app will be available at `http://localhost:3333`

## Build

Build for production:

```bash
npm run build
```

## Preview

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
robo-math/
├── src/
│   ├── App.jsx          # Main app component
│   ├── App.css          # App styles
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
└── package.json         # Dependencies and scripts
```

## Notes

- This is a standalone browser application (not an Electron app)
- Development server runs on port 3333 by default
- Uses the same build technologies as latex-builder but is completely independent
