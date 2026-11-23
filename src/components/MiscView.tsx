import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import FlightRoundedIcon from '@mui/icons-material/FlightRounded'
import AttractionsRoundedIcon from '@mui/icons-material/AttractionsRounded'
import PetsRoundedIcon from '@mui/icons-material/PetsRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import AutoStoriesRoundedIcon from '@mui/icons-material/AutoStoriesRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import type { SlotData } from '@/lib/save'

interface MiscViewProps {
  slot: SlotData
  onPatchSlot: (patch: Partial<SlotData>) => void
}

export function MiscView({ slot, onPatchSlot }: MiscViewProps) {
  const hours = Math.floor(slot.playtimeSeconds / 3600)
  const minutes = Math.floor((slot.playtimeSeconds % 3600) / 60)

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const totalSecs = Math.max(0, newHours * 3600 + newMinutes * 60)
    onPatchSlot({ playtimeSeconds: totalSecs })
  }

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
                Millennial Fair & Mini-Games
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Norstein Bekkler's tent tickets, silver points, and cat breeding food
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
            Max Fair & Food (255)
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {/* Silver Points */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <AttractionsRoundedIcon sx={{ color: '#A855F7', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Silver Points (Bekkler's Tent)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.82rem' }}>
                Used to play mini-games at the Millennial Fair and win the Crono Poyozo doll.
              </Typography>
              <TextField
                label="Points (0 - 255)"
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
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <PetsRoundedIcon sx={{ color: '#EC4899', fontSize: 20 }} />
                <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                  Cat Food (Pounds)
                </Typography>
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2, fontSize: '0.82rem' }}>
                Attracts more cats to Crono's house in Truce when food supplies are high.
              </Typography>
              <TextField
                label="Cat Food (0 - 255)"
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

      {/* Epoch & Identity Names */}
      <Card sx={{ p: 3.5, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(59, 130, 246, 0.12)',
              color: '#3B82F6',
            }}
          >
            <FlightRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Epoch & Story Entities
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Names for the Wings of Time time machine and royal identity
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          {/* Epoch Airship Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Time Machine (Epoch) Name"
              size="small"
              fullWidth
              value={slot.airshipName}
              onChange={(e) => onPatchSlot({ airshipName: e.target.value.slice(0, 5) })}
              onBlur={() => {
                const trimmed = slot.airshipName.trim()
                if (!trimmed) {
                  onPatchSlot({ airshipName: 'Epoch' })
                } else if (trimmed !== slot.airshipName) {
                  onPatchSlot({ airshipName: trimmed })
                }
              }}
              helperText="Default: 'Epoch' (Wings of Time). Max 5 characters."
              slotProps={{ htmlInput: { maxLength: 5 } }}
            />
          </Grid>

          {/* Princess Nadia Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Princess Nadia (Marle's Royal Name)"
              size="small"
              fullWidth
              value={slot.nadiaName}
              onChange={(e) => onPatchSlot({ nadiaName: e.target.value.slice(0, 5) })}
              onBlur={() => {
                const trimmed = slot.nadiaName.trim()
                if (!trimmed) {
                  onPatchSlot({ nadiaName: 'Nadia' })
                } else if (trimmed !== slot.nadiaName) {
                  onPatchSlot({ nadiaName: trimmed })
                }
              }}
              helperText="Default: 'Nadia'. Max 5 characters."
              slotProps={{ htmlInput: { maxLength: 5 } }}
            />
          </Grid>
        </Grid>
      </Card>

      {/* Playtime & Save Counter */}
      <Card sx={{ p: 3.5, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
          <Box
            sx={{
              width: 42,
              height: 42,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'rgba(16, 185, 129, 0.12)',
              color: '#10B981',
            }}
          >
            <AccessTimeRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Play Time & Save Counter
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Adjust recorded adventure elapsed time and save frequency
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          {/* Hours */}
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              label="Hours"
              type="number"
              size="small"
              fullWidth
              value={hours}
              onChange={(e) => handleTimeChange(parseInt(e.target.value) || 0, minutes)}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">hrs</InputAdornment> } }}
            />
          </Grid>

          {/* Minutes */}
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              label="Minutes"
              type="number"
              size="small"
              fullWidth
              value={minutes}
              onChange={(e) => handleTimeChange(hours, Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
              slotProps={{ input: { endAdornment: <InputAdornment position="end">min</InputAdornment> } }}
            />
          </Grid>

          {/* Save Counter */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Save Count"
              type="number"
              size="small"
              fullWidth
              value={slot.saveCount}
              onChange={(e) => onPatchSlot({ saveCount: Math.max(0, parseInt(e.target.value) || 0) })}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <AutoStoriesRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  )
}
