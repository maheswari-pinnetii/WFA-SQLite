const FONT_STACK = '"Inter", "Segoe UI", Roboto, Helvetica, Arial, sans-serif';

export const muiTypography = {
  fontFamily: FONT_STACK,
  h1: {
    fontFamily: FONT_STACK,
    fontSize: '28px',
    fontWeight: 650,
    lineHeight: '36px',
  },
  h2: {
    fontFamily: FONT_STACK,
    fontSize: '20px',
    fontWeight: 650,
    lineHeight: '28px',
  },
  h3: {
    fontFamily: FONT_STACK,
    fontSize: '17px',
    fontWeight: 600,
    lineHeight: '24px',
  },
  h4: {
    fontFamily: FONT_STACK,
    fontSize: '15px',
    fontWeight: 600,
    lineHeight: '22px',
  },
  h5: {
    fontFamily: FONT_STACK,
    fontSize: '14px',
    fontWeight: 600,
    lineHeight: '20px',
  },
  h6: {
    fontFamily: FONT_STACK,
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: '18px',
  },
  body1: {
    fontFamily: FONT_STACK,
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '21px',
  },
  body2: {
    fontFamily: FONT_STACK,
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: '19px',
  },
  button: {
    fontFamily: FONT_STACK,
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: '18px',
    textTransform: 'none' as const,
  },
  caption: {
    fontFamily: FONT_STACK,
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: '18px',
  },
};

export const typography = {
  fontFamily: FONT_STACK,
  fontSize: {
    xs: '12px',
    sm: '13px',
    base: '14px',
    lg: '17px',
    xl: '20px',
    '2xl': '28px',
    '3xl': '32px'
  },
  fontWeight: {
    normal: '400',
    medium: '500',
    semibold: '600',
    emphasis: '650'
  },
  mui: muiTypography
};


