import { createTheme, type Theme } from '@mui/material/styles'

export function createAppTheme(mode: 'light' | 'dark' = 'light'): Theme {
  const isLight = mode === 'light'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isLight ? '#4F46E5' : '#818CF8', // Indigo
        light: isLight ? '#6366F1' : '#A5B4FC',
        dark: isLight ? '#4338CA' : '#4F46E5',
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: '#10B981', // Emerald
        light: '#34D399',
        dark: '#059669',
        contrastText: '#FFFFFF',
      },
      warning: {
        main: '#F59E0B',
        light: '#FBBF24',
        dark: '#D97706',
      },
      background: {
        default: isLight ? '#F8FAFC' : '#0B0F19',
        paper: isLight ? '#FFFFFF' : '#111827',
      },
      text: {
        primary: isLight ? '#0F172A' : '#F8FAFC',
        secondary: isLight ? '#64748B' : '#94A3B8',
      },
      divider: isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.08)',
    },
    shape: {
      borderRadius: 16,
    },
    typography: {
      fontFamily: [
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
      ].join(','),
      h5: {
        fontWeight: 700,
        letterSpacing: '-0.02em',
      },
      h6: {
        fontWeight: 700,
        letterSpacing: '-0.01em',
      },
      subtitle1: {
        fontWeight: 600,
      },
      subtitle2: {
        fontWeight: 600,
      },
      button: {
        textTransform: 'none',
        fontWeight: 600,
        letterSpacing: '0.01em',
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: {
            colorScheme: mode,
            accentColor: isLight ? '#4F46E5' : '#818CF8',
          },
          ':root': {
            colorScheme: mode,
            accentColor: isLight ? '#4F46E5' : '#818CF8',
            scrollbarColor: isLight ? '#64748B #F1F5F9' : '#9CA3AF #1F2937',
          },
          body: {
            backgroundColor: isLight ? '#F8FAFC' : '#0B0F19',
            color: isLight ? '#0F172A' : '#F8FAFC',
            scrollbarColor: isLight ? '#64748B #F1F5F9' : '#9CA3AF #1F2937',
            '& *': {
              scrollbarColor: isLight ? '#64748B #F1F5F9' : '#9CA3AF #1F2937',
            },
          },
          '::selection': {
            backgroundColor: isLight ? 'rgba(79, 70, 229, 0.2)' : 'rgba(129, 140, 248, 0.35)',
            color: isLight ? '#312E81' : '#EEF2FF',
          },
          '@supports not (scrollbar-color: auto)': {
            'body, *': {
              scrollbarWidth: 'auto',
            },
            '&::-webkit-scrollbar, *::-webkit-scrollbar': {
              width: 10,
              height: 10,
            },
            '&::-webkit-scrollbar-track, *::-webkit-scrollbar-track': {
              backgroundColor: isLight ? '#F1F5F9' : '#1F2937',
            },
            '&::-webkit-scrollbar-thumb, *::-webkit-scrollbar-thumb': {
              backgroundColor: isLight ? '#64748B' : '#9CA3AF',
              borderRadius: 5,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: isLight ? '#FFFFFF' : '#111827',
            borderRadius: 16,
            border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: isLight
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.04)'
              : '0 4px 20px -2px rgba(0, 0, 0, 0.35)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '8px 18px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            background: isLight
              ? 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)'
              : 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
            '&:hover': {
              background: isLight
                ? 'linear-gradient(135deg, #4338CA 0%, #3730A3 100%)'
                : 'linear-gradient(135deg, #4F46E5 0%, #4338CA 100%)',
            },
          },
          outlined: {
            borderColor: isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.12)',
            '&:hover': {
              borderColor: isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.25)',
              backgroundColor: isLight ? 'rgba(79, 70, 229, 0.04)' : 'rgba(255, 255, 255, 0.04)',
            },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundColor: isLight ? '#FFFFFF' : 'rgba(0, 0, 0, 0.2)',
            '& fieldset': {
              borderColor: isLight ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)',
            },
            '&:hover fieldset': {
              borderColor: isLight ? '#CBD5E1' : 'rgba(255, 255, 255, 0.22)',
            },
            '&.Mui-focused fieldset': {
              borderColor: `${isLight ? '#4F46E5' : '#818CF8'} !important`,
              borderWidth: '1.5px',
            },
          },
          input: {
            padding: '9px 13px',
            fontSize: '0.875rem',
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 600,
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            borderRadius: 20,
            border: isLight ? '1px solid #E2E8F0' : '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: isLight
              ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
              : '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          },
        },
      },
    },
  })
}

export const theme = createAppTheme('light')
