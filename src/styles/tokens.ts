// Design tokens for a Linear/Notion-inspired UI
// Minimal palette to start the migration; extend as design system evolves.
export const theme = {
  colors: {
    primary: '#4F46E5',        // violet-600
    primaryDark: '#7C3AED',    // violet-600 (darker variant to emphasize actions)
    background: '#F9FAFB',     // light background
    surface: 'rgba(255,255,255,0.72)', // glassy surface
    text: '#0F172A',            // slate-900
    textMuted: '#64748B',       // slate-500
    border: '#E5E7EB',           // gray-200
    success: '#10B981',          // emerald-500
    danger: '#EF4444',           // red-500
  },
  radii: {
    card: 16,
    modal: 24,
    button: 12,
  },
  shadows: {
    soft: '0 6px 20px rgba(2,6,23,0.08)',
    focus: '0 0 0 3px rgba(79,70,229,0.25)'
  }
};

export type Theme = typeof theme;
