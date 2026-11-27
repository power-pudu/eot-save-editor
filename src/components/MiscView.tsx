import { useMemo } from 'react'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
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
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded'
import {
  SAVE_LOCATIONS,
  type LocalizedName,
  type SaveLocation,
  type SlotData,
} from '@/lib/save'
import { useI18n, type Locale } from '@/lib/i18n'

interface MiscViewProps {
  slot: SlotData
  onPatchSlot: (patch: Partial<SlotData>) => void
}

function getGameName(name: LocalizedName, locale: Locale): string {
  if (locale === 'fr') return name.fr
  if (locale === 'ja') return name.ja
  return name.en
}

export function MiscView({ slot, onPatchSlot }: MiscViewProps) {
  const { t, locale } = useI18n()
  const hours = Math.floor(slot.playtimeSeconds / 3600)
  const minutes = Math.floor((slot.playtimeSeconds % 3600) / 60)

  const currentLocationEntry = useMemo(
    () =>
      SAVE_LOCATIONS.find(
        (entry) =>
          entry.location === slot.location &&
          entry.x === slot.locationX &&
          entry.y === slot.locationY,
      ) ?? null,
    [slot.location, slot.locationX, slot.locationY],
  )

  const filterLocationOptions = useMemo(
    () =>
      createFilterOptions<SaveLocation>({
        stringify: (option) => {
          const era = getGameName(option.era, locale) || t.misc.locationNoEra
          const area = getGameName(option.area, locale)
          return `${era} ${option.era.en} ${area} ${option.area.en} ${option.room}`
        },
      }),
    [locale, t.misc.locationNoEra],
  )

  const handleTimeChange = (newHours: number, newMinutes: number) => {
    const totalSecs = Math.max(0, newHours * 3600 + newMinutes * 60)
    onPatchSlot({ playtimeSeconds: totalSecs })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Save Location Picker */}
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
              bgcolor: 'rgba(79, 70, 229, 0.12)',
              color: 'primary.main',
            }}
          >
            <PlaceRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {t.misc.locationTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t.misc.locationSubtitle}
            </Typography>
          </Box>
        </Box>

        {/* Current Location Summary */}
        <Card variant="outlined" sx={{ px: 4, py: 1, borderRadius: 3, mb: 2.5 }}>
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', fontWeight: 600, display: 'block', mb: 0.75 }}
          >
            {t.misc.locationCurrentLabel}
          </Typography>

          {currentLocationEntry ? (
            <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Chip
                label={getGameName(currentLocationEntry.era, locale) || t.misc.locationNoEra}
                size="small"
                color="primary"
                variant="outlined"
                sx={{ fontWeight: 700, borderRadius: 2 }}
              />
              <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                {getGameName(currentLocationEntry.area, locale)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                — {currentLocationEntry.room}
              </Typography>
            </Box>
          ) : (
            <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
              {t.misc.locationOther}
            </Typography>
          )}
        </Card>

        {/* Searchable Save Point Picker */}
        <Autocomplete
          options={SAVE_LOCATIONS}
          value={currentLocationEntry}
          onChange={(_, newValue) => {
            if (!newValue) return
            onPatchSlot({
              location: newValue.location,
              locationX: newValue.x,
              locationY: newValue.y,
            })
          }}
          groupBy={(option) => getGameName(option.era, locale) || t.misc.locationNoEra}
          getOptionLabel={(option) =>
            `${getGameName(option.area, locale)} — ${option.room}`
          }
          isOptionEqualToValue={(option, value) =>
            option.location === value.location && option.x === value.x && option.y === value.y
          }
          filterOptions={filterLocationOptions}
          renderOption={(props, option) => {
            const { key: _key, ...optionProps } = props
            return (
              <Box
                component="li"
                key={`${option.location}-${option.x}-${option.y}`}
                {...optionProps}
                sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start !important', py: 1 }}
              >
                <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3 }}>
                  {getGameName(option.area, locale)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', lineHeight: 1.3 }}>
                  {option.room}
                </Typography>
              </Box>
            )
          }}
          renderInput={(params) => (
            <TextField
              {...params}
              size="small"
              label={t.misc.locationPickerLabel}
              placeholder={t.misc.locationPickerPlaceholder}
              helperText={t.misc.locationHelpText}
            />
          )}
        />

        {/* Softlock Warning */}
        <Box
          sx={{
            mt: 2,
            px: 2,
            py: 1.25,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.12)',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'light' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(245, 158, 11, 0.3)',
            color: (theme) => (theme.palette.mode === 'light' ? '#B45309' : '#FBBF24'),
          }}
        >
          <WarningAmberRoundedIcon sx={{ fontSize: 18, mt: 0.15, flexShrink: 0 }} />
          <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.78rem', lineHeight: 1.45 }}>
            {t.misc.locationSoftlockWarning}
          </Typography>
        </Box>
      </Card>

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
            <Card variant="outlined" sx={{ p: 3,  borderRadius: 3 }}>
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
              {t.misc.storyEntitiesTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t.misc.storyEntitiesSubtitle}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          {/* Epoch Airship Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t.misc.epochLabel}
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
              helperText={t.misc.epochDesc}
              slotProps={{ htmlInput: { maxLength: 5 } }}
            />
          </Grid>

          {/* Princess Nadia Name */}
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label={t.misc.nadiaLabel}
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
              helperText={t.misc.nadiaDesc}
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
              {t.misc.timeAndSaveTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t.misc.timeAndSaveSubtitle}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2.5}>
          {/* Hours */}
          <Grid size={{ xs: 6, sm: 4 }}>
            <TextField
              label={t.misc.playtimeHours}
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
              label={t.misc.playtimeMinutes}
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
              label={t.misc.saveCountLabel}
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
