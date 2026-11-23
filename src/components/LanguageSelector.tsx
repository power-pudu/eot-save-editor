import { useState } from 'react'
import IconButton from '@mui/material/IconButton'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import Typography from '@mui/material/Typography'
import Tooltip from '@mui/material/Tooltip'
import ListItemText from '@mui/material/ListItemText'
import ListItemIcon from '@mui/material/ListItemIcon'
import CheckRoundedIcon from '@mui/icons-material/CheckRounded'
import LanguageRoundedIcon from '@mui/icons-material/LanguageRounded'
import { useI18n, type Locale } from '@/lib/i18n'

interface LanguageSelectorProps {
  compact?: boolean
  size?: 'small' | 'medium'
}

export function LanguageSelector({ compact = false, size = 'small' }: LanguageSelectorProps) {
  const { locale, setLocale, supportedLocales, t } = useI18n()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }

  const handleClose = () => {
    setAnchorEl(null)
  }

  const handleSelect = (code: Locale) => {
    setLocale(code)
    handleClose()
  }

  const currentMeta = supportedLocales.find((l) => l.code === locale) || supportedLocales[0]

  return (
    <>
      <Tooltip title={t.topBar.language}>
        <IconButton
          size={size}
          onClick={handleClick}
          aria-label={t.topBar.language}
          aria-controls={open ? 'language-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          sx={{
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 2,
            gap: compact ? 0 : 0.6,
            px: compact ? 1 : 1.2,
          }}
        >
          <LanguageRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
          {!compact && (
            <Typography
              variant="caption"
              sx={{
                fontWeight: 700,
                fontSize: '0.72rem',
                color: 'text.primary',
                textTransform: 'uppercase',
                fontFamily: 'monospace',
              }}
            >
              {currentMeta.code}
            </Typography>
          )}
        </IconButton>
      </Tooltip>

      <Menu
        id="language-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        slotProps={{
          paper: {
            sx: {
              mt: 1,
              minWidth: 180,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              boxShadow: (theme) =>
                theme.palette.mode === 'light'
                  ? '0 10px 25px -4px rgba(79, 70, 229, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)'
                  : '0 12px 28px -4px rgba(0, 0, 0, 0.55)',
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {supportedLocales.map((item) => {
          const isSelected = item.code === locale
          return (
            <MenuItem
              key={item.code}
              onClick={() => handleSelect(item.code)}
              selected={isSelected}
              sx={{
                py: 1,
                px: 2,
                borderRadius: 1.5,
                mx: 0.8,
                my: 0.2,
              }}
            >
              <ListItemIcon sx={{ minWidth: 28 }}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    fontWeight: 800,
                    fontSize: '0.75rem',
                    color: isSelected ? 'primary.main' : 'text.secondary',
                  }}
                >
                  {item.code.toUpperCase()}
                </Typography>
              </ListItemIcon>
              <ListItemText
                primary={item.nativeName}
                secondary={item.label !== item.nativeName ? item.label : undefined}
                slotProps={{
                  primary: {
                    variant: 'body2',
                    sx: {
                      fontWeight: isSelected ? 700 : 500,
                      color: isSelected ? 'primary.main' : 'text.primary',
                    },
                  },
                  secondary: {
                    variant: 'caption',
                    sx: {
                      fontSize: '0.7rem',
                    },
                  },
                }}
              />
              {isSelected && (
                <CheckRoundedIcon sx={{ fontSize: 16, color: 'primary.main', ml: 1 }} />
              )}
            </MenuItem>
          )
        })}
      </Menu>
    </>
  )
}
