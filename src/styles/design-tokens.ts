/**
 * SHAHEEQ Athletic Brand Design System Tokens
 * Unified Changa Typography · 4px/8px Spacing Grid · 1200px Container · Golden Ratio (1.618)
 */

export const DESIGN_TOKENS = {
  colors: {
    brand: {
      primary: '#070707',
      accent: '#CEF90B',
      referenceLime: '#DDFE01',
    },
    canvas: {
      deepTealBlack: '#01181E',
      elevatedDark: '#03232B',
      elevatedCard: '#042832',
      selectedBundleLight: '#F8F8F8',
      galleryCardCream: '#F4F7EE',
      reviewCardWhite: '#FFFFFF',
      faqContactCard: '#06232C',
    },
    text: {
      primaryLight: '#F4F3EF',
      mutedLight: '#C2CFD4', // WCAG AA >= 7.2:1 on #01181E
      darkOnLime: '#01181E', // WCAG AAA >= 14.5:1 on #DDFE01
      darkOnWhite: '#121212',
      strikePriceRed: '#C84B31',
    },
    border: {
      subtleLight: 'rgba(244, 243, 239, 0.14)',
      bundleInactive: 'rgba(244, 243, 239, 0.28)',
      limeActive: '#CEF90B',
      tableDivider: 'rgba(244, 243, 239, 0.10)',
    },
    status: {
      successBg: 'rgba(206, 249, 11, 0.14)',
      successText: '#CEF90B',
      neutralBg: 'rgba(244, 243, 239, 0.10)',
      neutralText: '#B8C5CA',
      errorBg: 'rgba(239, 68, 68, 0.15)',
      errorText: '#F87171',
    },
  },

  typography: {
    fontFamily: {
      brand: "'Changa', system-ui, -apple-system, sans-serif",
      arabic: "'Changa', system-ui, -apple-system, sans-serif",
      latin: "'Changa', system-ui, -apple-system, sans-serif",
      mono: "'Changa', monospace",
    },
    weights: {
      regular: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
    scale: {
      display: {
        fontSize: 'clamp(2rem, 1.55rem + 2.2vw, 3.125rem)',
        lineHeightAr: '1.22',
        lineHeightEn: '1.15',
        fontWeight: '800',
      },
      h1: {
        fontSize: 'clamp(1.625rem, 1.3rem + 1.6vw, 2.375rem)',
        lineHeightAr: '1.25',
        lineHeightEn: '1.18',
        fontWeight: '800',
      },
      h2: {
        fontSize: 'clamp(1.5rem, 1.2rem + 1.35vw, 2.125rem)',
        lineHeightAr: '1.25',
        lineHeightEn: '1.2',
        fontWeight: '800',
      },
      h3: {
        fontSize: 'clamp(1.125rem, 1.02rem + 0.5vw, 1.375rem)',
        lineHeightAr: '1.35',
        lineHeightEn: '1.3',
        fontWeight: '700',
      },
      bodyLarge: {
        fontSize: 'clamp(1.0625rem, 1rem + 0.3vw, 1.1875rem)',
        lineHeightAr: '1.7',
        lineHeightEn: '1.6',
        fontWeight: '500',
      },
      body: {
        fontSize: 'clamp(1rem, 0.96rem + 0.25vw, 1.125rem)',
        lineHeightAr: '1.7',
        lineHeightEn: '1.6',
        fontWeight: '400',
      },
      button: {
        fontSize: 'clamp(0.9375rem, 0.9rem + 0.2vw, 1.0625rem)',
        lineHeight: '1.2',
        fontWeight: '800',
      },
      small: {
        fontSize: 'clamp(0.875rem, 0.84rem + 0.15vw, 0.9375rem)',
        lineHeight: '1.5',
        fontWeight: '500',
      },
      caption: {
        fontSize: 'clamp(0.75rem, 0.72rem + 0.12vw, 0.8125rem)',
        lineHeight: '1.4',
        fontWeight: '600',
      },
    },
  },

  spacing: {
    px4: '4px',
    px8: '8px',
    px12: '12px',
    px16: '16px',
    px20: '20px',
    px24: '24px',
    px32: '32px',
    px40: '40px',
    px48: '48px',
    px64: '64px',
    px80: '80px',
  },

  layout: {
    maxWidth: '1200px',
    containerPadding: {
      mobile: '16px',
      tablet: '24px',
      desktop: '32px',
    },
    goldenRatio: 1.618,
    goldenSplit: {
      major: '61.8%',
      minor: '38.2%',
    },
    touchTargetMin: '44px',
    announcementBarHeight: '44px',
    headerHeightMobile: '64px',
    headerHeightDesktop: '80px',
  },

  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    pill: '9999px',
  },

  motion: {
    'motion-fast': '150ms',
    'motion-standard': '220ms',
    'motion-emphasis': '320ms',
    'motion-easing': 'cubic-bezier(0.16, 1, 0.3, 1)',
    'motion-reduced': '0ms',
  },
} as const;
