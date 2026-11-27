import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded'
import MonetizationOnRoundedIcon from '@mui/icons-material/MonetizationOnRounded'
import GroupRoundedIcon from '@mui/icons-material/GroupRounded'
import ArrowForwardRoundedIcon from '@mui/icons-material/ArrowForwardRounded'
import CheckCircleRoundedIcon from '@mui/icons-material/CheckCircleRounded'
import FolderOpenRoundedIcon from '@mui/icons-material/FolderOpenRounded'
import PlaceRoundedIcon from '@mui/icons-material/PlaceRounded'
import { CharacterPortrait } from './CharacterPortrait'
import { CHARACTER_LABELS, SAVE_LOCATIONS, type LocalizedName, type SlotData } from '@/lib/save'
import { useI18n, type Locale } from '@/lib/i18n'

function getGameName(name: LocalizedName, locale: Locale): string {
  if (locale === 'fr') return name.fr
  if (locale === 'ja') return name.ja
  return name.en
}

interface SlotSelectDialogProps {
  open: boolean
  slots: SlotData[]
  activeSlotIndex: number
  onSelectSlot: (index: number) => void
  onClose?: () => void
  canDismiss?: boolean
}

const CHARACTER_COLORS: Record<string, string> = {
  Crono: '#EAB308', // Lightning yellow
  Marle: '#38BDF8', // Ice blue
  Lucca: '#F97316', // Fire orange
  Robo: '#A855F7',  // Shadow purple
  Frog: '#22C55E',  // Water green
  Ayla: '#EC4899',  // Physical pink
  Magus: '#6366F1', // Shadow indigo
}

export function SlotSelectDialog({
  open,
  slots,
  activeSlotIndex,
  onSelectSlot,
  onClose,
  canDismiss = true,
}: SlotSelectDialogProps) {
  const { t, locale } = useI18n()

  return (
    <Dialog
      open={open}
      onClose={canDismiss ? onClose : undefined}
      maxWidth="md"
      fullWidth
      slotProps={{
        backdrop: {
          sx: { backdropFilter: 'blur(6px)', backgroundColor: 'rgba(15, 23, 42, 0.6)' },
        },
      }}
    >
      <DialogTitle sx={{ pt: 3.5, pb: 1, px: 3.5, textAlign: 'center' }}>
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 0.5 }}>
          {t.slotDialog.title}
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {t.slotDialog.subtitle}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 3.5, pt: 2 }}>
        <Grid container spacing={2.5}>
          {slots.map((slot, idx) => {
            const isSelected = idx === activeSlotIndex
            const leaderId = slot.party[0] >= 0 && slot.party[0] < 7 ? slot.party[0] : 0
            const canonicalLeader = CHARACTER_LABELS[leaderId] || 'Crono'
            const leaderName = slot.characterNames[leaderId] || slot.leadName || canonicalLeader
            const hours = Math.floor(slot.playtimeSeconds / 3600)
            const minutes = Math.floor((slot.playtimeSeconds % 3600) / 60)
            const leaderColor = CHARACTER_COLORS[canonicalLeader] || '#4F46E5'

            // Active party member names
            const partyNames = slot.party
              .filter((id) => id >= 0 && id < 7)
              .map((id) => slot.characterNames[id] || CHARACTER_LABELS[id])

            const matchedLocation = slot.isInitialized
              ? SAVE_LOCATIONS.find(
                  (entry) =>
                    entry.location === slot.location &&
                    entry.x === slot.locationX &&
                    entry.y === slot.locationY,
                ) ?? null
              : null
            const matchedEra = matchedLocation ? getGameName(matchedLocation.era, locale) : ''

            return (
              <Grid size={{ xs: 12, md: 4 }} key={idx}>
                <Card
                  onClick={() => onSelectSlot(idx)}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: '2px solid',
                    borderColor: isSelected ? 'primary.main' : 'divider',
                    bgcolor: (theme) =>
                      isSelected
                        ? theme.palette.mode === 'light'
                          ? 'rgba(79, 70, 229, 0.04)'
                          : 'rgba(99, 102, 241, 0.12)'
                        : 'background.paper',
                    '&:hover': {
                      borderColor: 'primary.light',
                      boxShadow: (theme) =>
                        theme.palette.mode === 'light'
                          ? '0 12px 24px -6px rgba(79, 70, 229, 0.15)'
                          : '0 12px 24px -6px rgba(0, 0, 0, 0.5)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Slot Header */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={`${t.slotDialog.slot} ${idx + 1}`}
                          size="small"
                          color={isSelected ? 'primary' : 'default'}
                          variant={isSelected ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 700 }}
                        />
                        {!slot.isInitialized && (
                          <Chip
                            label={t.slotDialog.empty}
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 20,
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              color: 'text.secondary',
                              borderColor: 'divider',
                            }}
                          />
                        )}
                      </Box>
                      {isSelected && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'primary.main' }}>
                          <CheckCircleRoundedIcon sx={{ fontSize: 18 }} />
                          <Typography variant="caption" sx={{ fontWeight: 700 }}>
                            {t.slotDialog.active}
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {/* Leader Highlight or Empty Slot Placeholder */}
                    {slot.isInitialized ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                        <CharacterPortrait
                          name={canonicalLeader}
                          displayName={leaderName}
                          variant="S"
                          size={48}
                          borderRadius={3}
                          fallbackBg={`${leaderColor}20`}
                          fallbackColor={leaderColor}
                          borderColor={`${leaderColor}40`}
                        />
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                            {leaderName}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {t.slotDialog.partyLeader}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
                        <Box
                          sx={{
                            width: 48,
                            height: 48,
                            borderRadius: 3,
                            border: '2px dashed',
                            borderColor: 'divider',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                            bgcolor: (theme) =>
                              theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.03)' : 'rgba(255, 255, 255, 0.03)',
                          }}
                        >
                          <FolderOpenRoundedIcon sx={{ fontSize: 24, opacity: 0.6 }} />
                        </Box>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2, color: 'text.secondary' }}>
                            {t.slotDialog.noSaveData}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', opacity: 0.7 }}>
                            {t.slotDialog.unusedSlot}
                          </Typography>
                        </Box>
                      </Box>
                    )}

                    {/* Stats List */}
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.2, mb: 2.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <MonetizationOnRoundedIcon sx={{ fontSize: 18, color: slot.isInitialized ? '#F59E0B' : 'text.disabled' }} />
                          <Typography variant="body2">{t.slotDialog.gold}</Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: slot.isInitialized ? 700 : 400,
                            fontFamily: 'monospace',
                            color: slot.isInitialized ? 'text.primary' : 'text.secondary',
                          }}
                        >
                          {slot.isInitialized ? `${slot.money.toLocaleString()} G` : '—'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <AccessTimeRoundedIcon sx={{ fontSize: 18, color: slot.isInitialized ? '#3B82F6' : 'text.disabled' }} />
                          <Typography variant="body2">{t.slotDialog.playtime}</Typography>
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: slot.isInitialized ? 600 : 400,
                            color: slot.isInitialized ? 'text.primary' : 'text.secondary',
                          }}
                        >
                          {slot.isInitialized ? `${hours}h ${minutes}m` : '—'}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary', flexShrink: 0 }}>
                          <PlaceRoundedIcon sx={{ fontSize: 18, color: slot.isInitialized ? 'primary.main' : 'text.disabled' }} />
                          <Typography variant="body2">{t.slotDialog.location}</Typography>
                        </Box>
                        {slot.isInitialized ? (
                          <Box sx={{ textAlign: 'right', minWidth: 0 }}>
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: 600,
                                color: 'text.primary',
                                lineHeight: 1.3,
                                wordBreak: 'break-word',
                              }}
                            >
                              {matchedLocation
                                ? getGameName(matchedLocation.area, locale)
                                : t.misc.locationOther}
                            </Typography>
                            {matchedLocation && matchedEra && (
                              <Typography
                                variant="caption"
                                sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}
                              >
                                {matchedEra}
                              </Typography>
                            )}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                            —
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                          <GroupRoundedIcon sx={{ fontSize: 18, color: slot.isInitialized ? '#10B981' : 'text.disabled' }} />
                          <Typography variant="body2">{t.slotDialog.party}</Typography>
                        </Box>
                        {slot.isInitialized ? (
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'flex-end', maxWidth: '65%' }}>
                            {partyNames.map((pName, pIdx) => (
                              <Chip
                                key={pIdx}
                                label={pName}
                                size="small"
                                sx={{
                                  height: 20,
                                  fontSize: '0.72rem',
                                  bgcolor: (theme) =>
                                    theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
                                }}
                              />
                            ))}
                          </Box>
                        ) : (
                          <Typography variant="body2" sx={{ color: 'text.secondary', fontStyle: 'italic', fontSize: '0.85rem' }}>
                            {t.slotDialog.empty}
                          </Typography>
                        )}
                      </Box>
                    </Box>

                    {/* Action Button */}
                    <Box sx={{ mt: 'auto', pt: 1 }}>
                      <Button
                        fullWidth
                        variant={isSelected ? 'contained' : 'outlined'}
                        endIcon={<ArrowForwardRoundedIcon />}
                        onClick={(e) => {
                          e.stopPropagation()
                          onSelectSlot(idx)
                        }}
                        sx={{ borderRadius: 2.5 }}
                      >
                        {isSelected ? t.slotDialog.editingSlot : `${t.slotDialog.selectSlot} ${idx + 1}`}
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      </DialogContent>
    </Dialog>
  )
}
