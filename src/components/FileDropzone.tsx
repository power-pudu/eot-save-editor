import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CloudUploadRoundedIcon from '@mui/icons-material/CloudUploadRounded'
import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded'

interface FileDropzoneProps {
  onFile: (file: File) => void
  onDemo: () => void
}

export function FileDropzone({ onFile, onDemo }: FileDropzoneProps) {
  const [dragging, setDragging] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Card
      onDragEnter={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        setDragging(false)
      }}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        const file = e.dataTransfer.files[0]
        if (file) onFile(file)
      }}
      onClick={(e) => {
        if ((e.target as HTMLElement).tagName !== 'BUTTON') {
          inputRef.current?.click()
        }
      }}
      sx={{
        p: { xs: 4, sm: 7 },
        borderRadius: 4.5,
        border: '2px dashed',
        borderColor: dragging ? 'primary.main' : 'divider',
        bgcolor: (theme) =>
          dragging
            ? theme.palette.mode === 'light'
              ? 'rgba(79, 70, 229, 0.05)'
              : 'rgba(99, 102, 241, 0.12)'
            : theme.palette.mode === 'light'
              ? '#FFFFFF'
              : '#111827',
        cursor: 'pointer',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: (theme) =>
          theme.palette.mode === 'light'
            ? '0 10px 30px -10px rgba(0, 0, 0, 0.06)'
            : '0 10px 30px -10px rgba(0, 0, 0, 0.5)',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        '&:hover': {
          borderColor: 'primary.main'
        },
      }}
    >
      {/* Egg of Time App Icon */}
      <Box
        component="img"
        src="/assets/eot-logo.png"
        alt="Egg of Time"
        sx={{
          width: 72,
          height: 86,
          objectFit: 'contain',
          filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15))',
          mb: 2.5,
        }}
      />

      {/* Title */}
      <Typography variant="h5" sx={{ fontWeight: 800, mb: 1, letterSpacing: '-0.02em' }}>
        Drop your Chrono Trigger save file here
      </Typography>

      <Typography
        variant="body2"
        sx={{
          color: 'text.secondary',
          maxWidth: 500,
          mb: 3,
          lineHeight: 1.6,
        }}
      >
        Compatible with Nintendo DS battery saves (<Box component="code" sx={{ fontWeight: 700 }}>.sav</Box>), emulator saves (<Box component="code" sx={{ fontWeight: 700 }}>.dsv</Box>), and Action Replay DS saves (<Box component="code" sx={{ fontWeight: 700 }}>.dst</Box>, <Box component="code" sx={{ fontWeight: 700 }}>.duc</Box>).
		<br/>Nothing is uploaded anywhere, so be sure to download your modifications.
      </Typography>

      {/* Backup Caution */}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.8,
          px: 2,
          py: 0.6,
          mb: 3,
          borderRadius: 2,
          bgcolor: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.3)',
          color: (theme) => (theme.palette.mode === 'light' ? '#B45309' : '#FBBF24'),
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
          ⚠️ <strong>Always</strong> backup your original save before editing. I'm is not responsible for corrupted files.
        </Typography>
      </Box>

      {/* Action Buttons */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="contained"
          size="large"
          startIcon={<CloudUploadRoundedIcon />}
          onClick={(e) => {
            e.stopPropagation()
            inputRef.current?.click()
          }}
          sx={{ px: 3.5, py: 1.2, borderRadius: 3 }}
        >
          Choose Save File
        </Button>

        <Button
          variant="outlined"
          size="large"
          startIcon={<AutoAwesomeRoundedIcon sx={{ color: 'primary.main' }} />}
          onClick={(e) => {
            e.stopPropagation()
            onDemo()
          }}
          sx={{ px: 3, py: 1.2, borderRadius: 3 }}
        >
          Try Demo Save
        </Button>
      </Box>

      <input
        ref={inputRef}
        type="file"
        accept=".sav,.dsv,.dst,.duc"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onFile(file)
        }}
      />
    </Card>
  )
}
