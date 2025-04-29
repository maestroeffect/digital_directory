const typography = fontFamily => ({
  fontFamily:
    typeof fontFamily === 'undefined' || fontFamily === ''
      ? [
          'Cormorant Garamond',
          'Inter',
          'serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
          '"Apple Color Emoji"',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"'
        ].join(',')
      : fontFamily,
  fontSize: 20, // Increased from 13.125
  h1: {
    fontSize: '20rem', // was 2.875rem
    fontWeight: 500,
    lineHeight: 1.45
  },
  h2: {
    fontSize: '2.75rem', // was 2.375rem
    fontWeight: 500,
    lineHeight: 1.45
  },
  h3: {
    fontSize: '2rem', // was 1.75rem
    fontWeight: 500,
    lineHeight: 1.5
  },
  h4: {
    fontSize: '1.75rem', // was 1.5rem
    fontWeight: 500,
    lineHeight: 1.55
  },
  h5: {
    fontSize: '1.375rem', // was 1.125rem
    fontWeight: 500,
    lineHeight: 1.5
  },
  h6: {
    fontSize: '1.125rem', // was 0.9375rem
    fontWeight: 500,
    lineHeight: 1.5
  },
  subtitle1: {
    fontSize: '1.125rem', // was 0.9375rem
    lineHeight: 1.5
  },
  subtitle2: {
    fontSize: '1rem', // was 0.8125rem
    fontWeight: 400,
    lineHeight: 1.55
  },
  body1: {
    fontSize: '1.0625rem', // was 0.9375rem
    lineHeight: 1.5
  },
  body2: {
    fontSize: '0.9375rem', // was 0.8125rem
    lineHeight: 1.55
  },
  button: {
    fontSize: '1rem', // was 0.9375rem
    lineHeight: 1.5,
    textTransform: 'none'
  },
  caption: {
    fontSize: '0.875rem', // was 0.8125rem
    lineHeight: 1.4,
    letterSpacing: '0.4px'
  },
  overline: {
    fontSize: '0.8125rem', // was 0.75rem
    lineHeight: 1.2,
    letterSpacing: '0.8px'
  }
})

export default typography
