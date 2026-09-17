const FONT_STACK = '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const muiTypography = {
  fontFamily: FONT_STACK,
  h1: {
    fontFamily: FONT_STACK,
    fontWeight: 600,
  },
  h2: {
    fontFamily: FONT_STACK,
    fontWeight: 600,
  },
  h3: {
    fontFamily: FONT_STACK,
    fontWeight: 600,
  },
  h4: {
    fontFamily: FONT_STACK,
    fontWeight: 600,
  },
  h5: {
    fontFamily: FONT_STACK,
    fontWeight: 600,
  },
  h6: {
    fontFamily: FONT_STACK,
    fontWeight: 600,
  },
  body1: {
    fontFamily: FONT_STACK,
    fontWeight: 400,
  },
  body2: {
    fontFamily: FONT_STACK,
    fontWeight: 400,
  },
  button: {
    fontFamily: FONT_STACK,
    fontWeight: 500,
    textTransform: 'none' as const,
  },
  caption: {
    fontFamily: FONT_STACK,
    fontWeight: 400,
  },
};

export const typography = {
  fontFamily: FONT_STACK,
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem'
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700'
  },
  mui: muiTypography
};

