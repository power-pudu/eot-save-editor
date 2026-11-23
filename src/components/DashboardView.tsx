import { useState } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Accordion from '@mui/material/Accordion'
import AccordionSummary from '@mui/material/AccordionSummary'
import AccordionDetails from '@mui/material/AccordionDetails'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import LinearProgress from '@mui/material/LinearProgress'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded'
import FitnessCenterRoundedIcon from '@mui/icons-material/FitnessCenterRounded'
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded'
import AttractionsRoundedIcon from '@mui/icons-material/AttractionsRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import SaveRoundedIcon from '@mui/icons-material/SaveRounded'
import { CharacterPortrait } from './CharacterPortrait'
import type { SlotData } from '@/lib/save'
import { CHARACTER_LABELS } from '@/lib/save'
import { useI18n } from '@/lib/i18n'

interface DashboardViewProps {
  slot: SlotData
  onPatchSlot: (patch: Partial<SlotData>) => void
  onNavigateTab: (tab: 'characters' | 'inventory' | 'misc') => void
}

const ELEMENT_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  Crono: { bg: '#FEF08A', text: '#854D0E', label: 'Lightning' },
  Marle: { bg: '#BAE6FD', text: '#0369A1', label: 'Ice' },
  Lucca: { bg: '#FED7AA', text: '#C2410C', label: 'Fire' },
  Robo: { bg: '#E9D5FF', text: '#7E22CE', label: 'Shadow' },
  Frog: { bg: '#BBF7D0', text: '#15803D', label: 'Water' },
  Ayla: { bg: '#FBCFE8', text: '#BE185D', label: 'Physical' },
  Magus: { bg: '#C7D2FE', text: '#4338CA', label: 'Shadow' },
}

export function DashboardView({ slot, onPatchSlot, onNavigateTab }: DashboardViewProps) {
  const { t } = useI18n()
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Boost 1: Max Gold
  const handleMaxGold = () => {
    onPatchSlot({ money: 9_999_999 })
    setToastMessage(t.dashboard.toastMaxGold)
  }

  // Boost 2: Max Consumables x99
  const handleMaxConsumables = () => {
    const consumables = slot.inventory.consumable.map((item, idx) => ({
      slotIndex: idx,
      itemId: item.itemId !== 0 ? item.itemId : 0x0040 + idx + 1,
      quantity: 99,
    }))
    onPatchSlot({
      inventory: {
        ...slot.inventory,
        consumable: consumables,
      },
    })
    setToastMessage(t.dashboard.toastMaxConsumables)
  }

  // Boost 3: Max All 7 Characters
  const handleMaxAllCharacters = () => {
    const upgraded = slot.characters.map((c) => ({
      ...c,
      level: 99,
      curHp: 999,
      maxHp: 999,
      curMp: 99,
      maxMp: 99,
      power: 99,
      stamina: 99,
      speed: 16, // In Chrono Trigger, 16 is maximum speed
      magic: 99,
      hit: 99,
      evade: 99,
      magicDefense: 99,
      exp: 1_743_570, // Chrono Trigger Level 99 canonical EXP
      nextExp: 0, // EXP countdown is 0 at max level
    }))
    onPatchSlot({ characters: upgraded })
    setToastMessage(t.dashboard.toastMaxHeroes)
  }

  // Boost 4: Max Mini-Games (Silver Points & Cat Food)
  const handleMaxMinigames = () => {
    onPatchSlot({
      silverPoints: 255,
      catFood: 255,
    })
    setToastMessage(t.dashboard.toastMaxMiniGames)
  }

  // Boost 5: Unlock 1 of each equipment
  const handleUnlockAllEquipment = () => {
    const newInventory = { ...slot.inventory }
    const equipCats = ['weapon', 'armor', 'helmet', 'accessory'] as const

    for (const cat of equipCats) {
      newInventory[cat] = slot.inventory[cat].map((item, idx) => ({
        slotIndex: idx,
        itemId: item.itemId !== 0 ? item.itemId : idx + 1,
        quantity: item.quantity > 0 ? item.quantity : 1,
      }))
    }
    onPatchSlot({ inventory: newInventory })
    setToastMessage(t.dashboard.toastUnlockGear)
  }

  const hours = Math.floor(slot.playtimeSeconds / 3600)
  const minutes = Math.floor((slot.playtimeSeconds % 3600) / 60)

  // Active party members
  const activePartyChars = slot.party
    .filter((id) => id >= 0 && id < 7)
    .map((id) => slot.characters.find((c) => c.id === id) || slot.characters[id])
    .filter(Boolean)

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Quick Boosts Accordion */}
      <Accordion
        elevation={0}
        disableGutters
        defaultExpanded={false}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: '14px !important',
          bgcolor: 'background.paper',
          overflow: 'hidden',
          '&:before': { display: 'none' },
          boxShadow: (theme) =>
            theme.palette.mode === 'light'
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.04)'
              : 'none',
        }}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreRoundedIcon sx={{ fontSize: 20 }} />}
          sx={{
            minHeight: 46,
            px: 2,
            py: 0.5,
            '& .MuiAccordionSummary-content': {
              my: 0.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1.5,
              mr: 1,
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <BoltRoundedIcon sx={{ fontSize: 18, color: 'primary.main' }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
              {t.dashboard.quickBoostsTitle}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: { xs: 'none', sm: 'inline' } }}>
              · {t.dashboard.quickBoostsSubtitle}
            </Typography>
          </Box>
          <Chip
            label="5 Cheats"
            size="small"
            sx={{
              height: 20,
              fontSize: '0.68rem',
              fontWeight: 700,
              bgcolor: (theme) =>
                theme.palette.mode === 'light' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)',
              color: 'primary.main',
            }}
          />
        </AccordionSummary>

        <AccordionDetails sx={{ px: 2, pb: 2, pt: 0.5 }}>
          <Grid container spacing={1.2}>
            {/* Boost 1: Max Gold */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleMaxGold}
                startIcon={<MonetizationOnRoundedIcon sx={{ color: '#F59E0B', fontSize: 18 }} />}
                sx={{
                  py: 0.8,
                  px: 1.2,
                  borderRadius: 2.5,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                    {t.dashboard.maxGold}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                    {t.dashboard.maxGoldDesc}
                  </Typography>
                </Box>
              </Button>
            </Grid>

            {/* Boost 2: Max Consumables */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleMaxConsumables}
                startIcon={<LocalPharmacyRoundedIcon sx={{ color: '#10B981', fontSize: 18 }} />}
                sx={{
                  py: 0.8,
                  px: 1.2,
                  borderRadius: 2.5,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                    {t.dashboard.maxConsumables}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                    {t.dashboard.maxConsumablesDesc}
                  </Typography>
                </Box>
              </Button>
            </Grid>

            {/* Boost 3: Max All Characters */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleMaxAllCharacters}
                startIcon={<FitnessCenterRoundedIcon sx={{ color: '#EC4899', fontSize: 18 }} />}
                sx={{
                  py: 0.8,
                  px: 1.2,
                  borderRadius: 2.5,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                    {t.dashboard.maxAllHeroes}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                    {t.dashboard.maxAllHeroesDesc}
                  </Typography>
                </Box>
              </Button>
            </Grid>

            {/* Boost 4: Fair & Minigames */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleMaxMinigames}
                startIcon={<AttractionsRoundedIcon sx={{ color: '#8B5CF6', fontSize: 18 }} />}
                sx={{
                  py: 0.8,
                  px: 1.2,
                  borderRadius: 2.5,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                    {t.dashboard.maxMiniGames}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                    {t.dashboard.maxMiniGamesDesc}
                  </Typography>
                </Box>
              </Button>
            </Grid>

            {/* Boost 5: Equipment Unlock */}
            <Grid size={{ xs: 12, sm: 6, md: 2.4 }}>
              <Button
                fullWidth
                size="small"
                variant="outlined"
                onClick={handleUnlockAllEquipment}
                startIcon={<ShieldRoundedIcon sx={{ color: '#0EA5E9', fontSize: 18 }} />}
                sx={{
                  py: 0.8,
                  px: 1.2,
                  borderRadius: 2.5,
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', lineHeight: 1.2 }}>
                    {t.dashboard.unlockAllGear}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.68rem' }}>
                    {t.dashboard.unlockAllGearDesc}
                  </Typography>
                </Box>
              </Button>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Uninitialized Slot Notice */}
      {!slot.isInitialized && (
        <Alert
          severity="info"
          variant="outlined"
          sx={{
            mb: 3,
            borderRadius: 3,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? 'rgba(59, 130, 246, 0.04)' : 'rgba(59, 130, 246, 0.1)',
          }}
        >
          <strong>{t.slotDialog.slot} {slot.index + 1}</strong> {t.dashboard.uninitializedNotice}
        </Alert>
      )}

      {/* Primary Stats Overview */}
      <Grid container spacing={2.5}>
        {/* Gold Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', p: 2.5, display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                {t.dashboard.goldTitle}
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(245, 158, 11, 0.12)',
                  color: '#F59E0B',
                }}
              >
                <MonetizationOnRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Box>
            <TextField
              type="number"
              size="small"
              value={slot.money}
              onChange={(e) => {
                const val = Math.max(0, Math.min(9999999, parseInt(e.target.value) || 0))
                onPatchSlot({ money: val })
              }}
              slotProps={{
                input: {
                  endAdornment: <InputAdornment position="end">G</InputAdornment>,
                  sx: { fontWeight: 700, fontFamily: 'monospace', fontSize: '1.05rem' },
                },
              }}
              fullWidth
            />
          </Card>
        </Grid>

        {/* Playtime Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Play Time
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(59, 130, 246, 0.12)',
                  color: '#3B82F6',
                }}
              >
                <AccessTimeRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {hours}h {minutes}m
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {slot.playtimeSeconds.toLocaleString()} elapsed seconds
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Total Saves Card */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Save Counter
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(16, 185, 129, 0.12)',
                  color: '#10B981',
                }}
              >
                <SaveRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Box>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800 }}>
                {slot.saveCount}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                Times recorded to cartridge
              </Typography>
            </Box>
          </Card>
        </Grid>

        {/* Silver Points & Cat Food */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', p: 2.5, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
              <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Fair Points & Food
              </Typography>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 2.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'rgba(168, 85, 247, 0.12)',
                  color: '#A855F7',
                }}
              >
                <AttractionsRoundedIcon sx={{ fontSize: 20 }} />
              </Box>
            </Box>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Silver Pts
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {slot.silverPoints}
                </Typography>
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  Cat Food
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 800 }}>
                  {slot.catFood}
                </Typography>
              </Box>
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Active Battle Party Showcase */}
      <Card sx={{ p: 3, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Active Battle Party
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              The 3 characters currently selected for combat
            </Typography>
          </Box>
          <Button
            variant="outlined"
            size="small"
            onClick={() => onNavigateTab('characters')}
            sx={{ borderRadius: 2.5 }}
          >
            Manage All Characters
          </Button>
        </Box>

        <Grid container spacing={2.5}>
          {activePartyChars.map((hero, idx) => {
            const rawName = CHARACTER_LABELS[hero.id] || 'Crono'
            const customName = slot.characterNames[hero.id] || rawName
            const elem = ELEMENT_COLORS[rawName] || { bg: '#E2E8F0', text: '#334155', label: 'None' }
            const hpPercent = hero.maxHp > 0 ? (hero.curHp / hero.maxHp) * 100 : 100
            const mpPercent = hero.maxMp > 0 ? (hero.curMp / hero.maxMp) * 100 : 100

            return (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Card
                  variant="outlined"
                  sx={{
                    p: 2.5,
                    borderRadius: 3.5,
                    bgcolor: (theme) =>
                      theme.palette.mode === 'light' ? '#FAFAFA' : 'rgba(255, 255, 255, 0.03)',
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <CharacterPortrait
                        name={rawName}
                        displayName={customName}
                        variant="B"
                        size={46}
                        borderRadius={3}
                        fallbackBg={elem.bg}
                        fallbackColor={elem.text}
                      />
                      <Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
                            {customName}
                          </Typography>
                          {idx === 0 && (
                            <Chip label="Leader" size="small" color="primary" sx={{ height: 20, fontSize: '0.7rem' }} />
                          )}
                        </Box>
                        <Chip
                          label={elem.label}
                          size="small"
                          sx={{
                            height: 18,
                            fontSize: '0.68rem',
                            fontWeight: 700,
                            bgcolor: elem.bg,
                            color: elem.text,
                            mt: 0.3,
                          }}
                        />
                      </Box>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                        Level
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
                        {hero.level}
                      </Typography>
                    </Box>
                  </Box>

                  {/* HP Bar */}
                  <Box sx={{ mb: 1.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#10B981' }}>
                        HP
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {hero.curHp} / {hero.maxHp}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, Math.max(0, hpPercent))}
                      sx={{
                        height: 7,
                        borderRadius: 3,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#10B981',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>

                  {/* MP Bar */}
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#3B82F6' }}>
                        MP
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600 }}>
                        {hero.curMp} / {hero.maxMp}
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={Math.min(100, Math.max(0, mpPercent))}
                      sx={{
                        height: 7,
                        borderRadius: 3,
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)',
                        '& .MuiLinearProgress-bar': {
                          bgcolor: '#3B82F6',
                          borderRadius: 3,
                        },
                      }}
                    />
                  </Box>

                  {/* Mini stats preview */}
                  <Box
                    sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      pt: 1.5,
                      borderTop: '1px solid',
                      borderColor: 'divider',
                    }}
                  >
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        PWR
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {hero.power}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        SPD
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {hero.speed}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        MAG
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {hero.magic}
                      </Typography>
                    </Box>
                    <Box sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                        STA
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {hero.stamina}
                      </Typography>
                    </Box>
                  </Box>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </Card>

      {/* Quick feedback toast */}
      <Snackbar
        open={Boolean(toastMessage)}
        autoHideDuration={3000}
        onClose={() => setToastMessage(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setToastMessage(null)}
          severity="success"
          variant="filled"
          sx={{ borderRadius: 3, fontWeight: 600 }}
        >
          {toastMessage}
        </Alert>
      </Snackbar>
    </Box>
  )
}
