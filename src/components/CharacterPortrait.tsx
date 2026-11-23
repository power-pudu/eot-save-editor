import { useState, useEffect } from 'react'
import Box from '@mui/material/Box'

interface CharacterPortraitProps {
  name: string // Canonical character name (Crono, Marle, Lucca, Robo, Frog, Ayla, Magus)
  displayName?: string // Optional custom name for the fallback initial
  variant?: 'S' | 'B' // 'S' for small (save slots/lists), 'B' for big (detail views)
  size?: number
  borderRadius?: number | string
  fallbackBg?: string
  fallbackColor?: string
  borderColor?: string
  shadow?: boolean
}

export function CharacterPortrait({
  name,
  displayName,
  variant = 'B',
  size = 44,
  borderRadius = 3,
  fallbackBg = '#E0E7FF',
  fallbackColor = '#4338CA',
  borderColor,
  shadow = false,
}: CharacterPortraitProps) {
  const [hasError, setHasError] = useState(false)

  // Primary path uses requested variant (e.g., CronoB.png or CronoS.png)
  const imageSrc = `/assets/portraits/${name}${variant}.png`

  // Reset error if character name changes
  useEffect(() => {
    setHasError(false)
  }, [name, variant])

  const initial = (displayName || name).charAt(0).toUpperCase()

  return (
    <Box
      sx={{
        width: size,
        height: size,
        minWidth: size,
        minHeight: size,
        borderRadius,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: fallbackBg,
        color: fallbackColor,
        fontWeight: 800,
        fontSize: `${size * 0.42}px`,
        border: borderColor ? `1.5px solid ${borderColor}` : undefined,
        boxShadow: shadow ? `0 4px 12px ${fallbackBg}` : undefined,
        position: 'relative',
        userSelect: 'none',
      }}
    >
      {!hasError ? (
        <Box
          component="img"
          src={imageSrc}
          alt={displayName || name}
          onError={() => setHasError(true)}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        initial
      )}
    </Box>
  )
}
