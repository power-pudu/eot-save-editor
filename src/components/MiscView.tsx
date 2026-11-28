import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import AttractionsRoundedIcon from '@mui/icons-material/AttractionsRounded'
import PetsRoundedIcon from '@mui/icons-material/PetsRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import type { SlotData } from '@/lib/save'
import { useI18n } from '@/lib/i18n'

interface MiscViewProps {
  slot: SlotData
  onPatchSlot: (patch: Partial<SlotData>) => void
}

export function MiscView({ slot, onPatchSlot }: MiscViewProps) {
  const { t } = useI18n()

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Mini-Games & Millennial Fair */}
      <Card sx={{ p: 3.5, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'rgba(168, 85, 247, 0.12)',
                color: '#A855F7',
              }}
            >
              <AttractionsRoundedIcon sx={{ fontSize: 24 }} />
            </Box>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                {t.misc.fairTitle}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {t.misc.fairSubtitle}
              </Typography>
            </Box>
          </Box>

          <Button
            size="small"
            variant="outlined"
            startIcon={<BoltRoundedIcon sx={{ color: '#A855F7' }} />}
            onClick={() => onPatchSlot({ silverPoints: 255, catFood: 255 })}
            sx={{ borderRadius: 2.5 }}
          >
            {t.misc.maxFairAndFood}
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {/* Silver Points */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AttractionsRoundedIcon sx={{ color: '#A855F7', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {t.misc.silverPointsTitle}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.82rem' }}>
                {t.misc.silverPointsDesc}
              </Typography>
              <TextField
                label={t.misc.silverPointsLabel}
                type="number"
                size="small"
                fullWidth
                value={slot.silverPoints}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(255, parseInt(e.target.value) || 0))
                  onPatchSlot({ silverPoints: val })
                }}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">Pts</InputAdornment>,
                    sx: { fontWeight: 700 },
                  },
                }}
              />
            </Card>
          </Grid>

          {/* Cat Food */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <PetsRoundedIcon sx={{ color: '#EC4899', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  {t.misc.catFoodTitle}
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.82rem' }}>
                {t.misc.catFoodDesc}
              </Typography>
              <TextField
                label={t.misc.catFoodLabel}
                type="number"
                size="small"
                fullWidth
                value={slot.catFood}
                onChange={(e) => {
                  const val = Math.max(0, Math.min(255, parseInt(e.target.value) || 0))
                  onPatchSlot({ catFood: val })
                }}
                slotProps={{
                  input: {
                    endAdornment: <InputAdornment position="end">lbs</InputAdornment>,
                    sx: { fontWeight: 700 },
                  },
                }}
              />
            </Card>
          </Grid>
        </Grid>
      </Card>
    </Box>
  )
}
