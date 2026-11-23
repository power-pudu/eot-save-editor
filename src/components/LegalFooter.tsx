import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import GavelRoundedIcon from '@mui/icons-material/GavelRounded'
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined'
import { useI18n } from '@/lib/i18n'

export function LegalFooter() {
  const { t } = useI18n()
  const [openModal, setOpenModal] = useState(false)

  return (
    <Box
      component="footer"
      sx={{
        mt: 'auto',
        pt: 4,
        pb: 3,
        borderTop: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 1.5,
        textAlign: 'center',
      }}
    >
      {/* Backup Warning Callout */}
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 1,
          px: 2,
          py: 0.8,
          borderRadius: 2.5,
          bgcolor: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'light' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.3)',
          color: (theme) =>
            theme.palette.mode === 'light' ? '#B45309' : '#FBBF24',
          maxWidth: '100%',
        }}
      >
        <WarningAmberRoundedIcon sx={{ fontSize: 18, flexShrink: 0 }} />
        <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem' }}>
          {t.footer.backupWarning}
        </Typography>
      </Box>

      {/* Legal & Trademark Text */}
      <Box sx={{ maxWidth: 760, px: 2 }}>
        <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.73rem', lineHeight: 1.5, display: 'block' }}>
          {t.footer.trademark}
        </Typography>
      </Box>

      {/* View Full Legal Notice Link */}
      <Button
        size="small"
        variant="text"
        color="inherit"
        onClick={() => setOpenModal(true)}
        startIcon={<GavelRoundedIcon sx={{ fontSize: 15 }} />}
        sx={{
          fontSize: '0.72rem',
          color: 'text.secondary',
          textTransform: 'none',
          py: 0.2,
          '&:hover': { color: 'text.primary' },
        }}
      >
        {t.footer.legalModalTitle}
      </Button>

      {/* Full Legal Policy Dialog */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          backdrop: {
            sx: { backdropFilter: 'blur(4px)', bgcolor: 'rgba(15, 23, 42, 0.6)' },
          },
        }}
      >
        <DialogTitle sx={{ pt: 3, pb: 1, px: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ShieldOutlinedIcon sx={{ color: 'primary.main', fontSize: 24 }} />
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            {t.footer.legalModalTitle}
          </Typography>
        </DialogTitle>

        <DialogContent sx={{ px: 3, py: 2, display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Backup Notice */}
          <Box
            sx={{
              p: 3,
              borderRadius: 3,
              bgcolor: (theme) =>
                theme.palette.mode === 'light' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.15)',
              border: '1px solid',
              borderColor: 'rgba(245, 158, 11, 0.3)',
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#D97706', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <WarningAmberRoundedIcon sx={{ fontSize: 18 }} />
              Save File Safety & Disclaimer of Liability
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.82rem', lineHeight: 1.6 }}>
              Users are strongly advised to keep an untouched backup copy of their original save file (<code>.sav</code> or <code>.dsv</code>) before applying any edits. While this software performs 32-bit checksum recalculations and nondestructive file formatting, <strong>Power Pudu and the developer(s) assume no responsibility or liability for corrupted saves, lost gameplay progress, or unexpected emulator behavior</strong>. Use this tool entirely at your own discretion.
            </Typography>
          </Box>

          {/* Trademark & Copyright */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              Intellectual Property Notice
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.6 }}>
              <strong>Chrono Trigger</strong>, characters, music, and associated intellectual property are trademarks or registered trademarks of <strong>Square Enix Co., Ltd.</strong> (formerly Square Co., Ltd.). This web utility is an independent fan-made tool created purely for educational, personal archival, and research purposes. It is in no way affiliated with, authorized, maintained, sponsored, or endorsed by Square Enix.
            </Typography>
          </Box>

          {/* No Game Data Distribution */}
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
              No Copyrighted Data or ROM Distribution
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.82rem', lineHeight: 1.6 }}>
              This web application does not host, store, or distribute any game ROMs, proprietary game code, or commercial software files. All file operations, parsing, and exports are executed 100% locally in your web browser. No save files or user data are uploaded to any server.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2.5, pt: 0 }}>
          <Button
            variant="contained"
            onClick={() => setOpenModal(false)}
            sx={{ borderRadius: 2.5, px: 3 }}
          >
            {t.footer.close}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
