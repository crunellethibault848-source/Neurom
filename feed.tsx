@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-display: 'Syne', system-ui, sans-serif;
  --font-body: 'DM Sans', system-ui, sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  background-color: #080A0F;
  color: #E8EDF5;
  font-family: var(--font-body);
  font-size: 15px;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Scrollbar */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: #080A0F;
}
::-webkit-scrollbar-thumb {
  background: #1E2635;
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: #2A3548;
}

/* Sélection */
::selection {
  background: rgba(77, 255, 195, 0.2);
  color: #4DFFC3;
}

/* Focus visible */
:focus-visible {
  outline: 1px solid #4DFFC3;
  outline-offset: 2px;
}

/* Utilitaires */
.font-display {
  font-family: var(--font-display);
}

.bg-grid {
  background-image: linear-gradient(rgba(77, 255, 195, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(77, 255, 195, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

.glow-brand {
  box-shadow: 0 0 30px rgba(77, 255, 195, 0.2);
}

.glow-brand-sm {
  box-shadow: 0 0 12px rgba(77, 255, 195, 0.15);
}

.text-gradient {
  background: linear-gradient(135deg, #4DFFC3 0%, #4D9FFF 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Textarea auto-resize */
textarea {
  resize: none;
}

/* Link no decoration */
a {
  text-decoration: none;
  color: inherit;
}

/* Transition globale */
.transition-all {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Card hover */
.card-hover {
  transition: background-color 0.15s ease, border-color 0.15s ease;
}
.card-hover:hover {
  background-color: #1A2130;
  border-color: #2A3548;
}

/* Skeleton loading */
@keyframes shimmer {
  0% { background-position: -1000px 0; }
  100% { background-position: 1000px 0; }
}

.skeleton {
  background: linear-gradient(90deg, #111620 25%, #1A2130 50%, #111620 75%);
  background-size: 1000px 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

/* Pulse dot */
@keyframes pulseDot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}
.pulse-dot {
  animation: pulseDot 1.5s ease-in-out infinite;
}

/* Fade in animation */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeInUp {
  animation: fadeInUp 0.3s ease-out forwards;
}
