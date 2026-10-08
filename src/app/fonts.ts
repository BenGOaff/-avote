import localFont from 'next/font/local'

// Polices auto-hébergées (OFL, licences dans src/fonts). Aucune requête vers un tiers.
export const display = localFont({
  src: '../fonts/archivo-black-latin-400-normal.woff2',
  weight: '400',
  variable: '--ff-display',
  display: 'swap',
  fallback: ['Arial Black', 'Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
})

export const ui = localFont({
  src: [
    { path: '../fonts/public-sans-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/public-sans-latin-600-normal.woff2', weight: '600', style: 'normal' },
    { path: '../fonts/public-sans-latin-700-normal.woff2', weight: '700', style: 'normal' },
  ],
  variable: '--ff-ui',
  display: 'swap',
  fallback: ['Arial', 'sans-serif'],
  adjustFontFallback: 'Arial',
})

export const serif = localFont({
  src: [
    { path: '../fonts/source-serif-4-latin-400-normal.woff2', weight: '400', style: 'normal' },
    { path: '../fonts/source-serif-4-latin-400-italic.woff2', weight: '400', style: 'italic' },
    { path: '../fonts/source-serif-4-latin-600-normal.woff2', weight: '600', style: 'normal' },
  ],
  variable: '--ff-serif',
  display: 'swap',
  preload: false,
  fallback: ['Georgia', 'serif'],
  adjustFontFallback: 'Times New Roman',
})

export const hand = localFont({
  src: '../fonts/caveat-latin-700-normal.woff2',
  weight: '700',
  variable: '--ff-hand',
  display: 'swap',
  preload: false,
  fallback: ['Arial', 'sans-serif'],
})
