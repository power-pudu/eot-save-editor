import { useState, useRef, useEffect } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import LinearProgress from '@mui/material/LinearProgress'
import Popper from '@mui/material/Popper'
import Fade from '@mui/material/Fade'
import Paper from '@mui/material/Paper'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import HealingRoundedIcon from '@mui/icons-material/HealingRounded'
import StarRoundedIcon from '@mui/icons-material/StarRounded'
import GroupRoundedIcon from '@mui/icons-material/GroupRounded'
import SyncRoundedIcon from '@mui/icons-material/SyncRounded'
import { CharacterPortrait } from './CharacterPortrait'
import type { SlotData, CharacterStats } from '@/lib/save'
import {
  CHARACTER_LABELS,
  getExpToNext,
  getExpTotal,
  isExpInLevelRange,
  getLevelForExp,
  calculateNextExp,
} from '@/lib/save'
import { useI18n } from '@/lib/i18n'

interface CharactersViewProps {
  slot: SlotData
  onPatchSlot: (patch: Partial<SlotData>) => void
}

const HERO_META: Record<
  string,
  { element: string; weapon: string; color: string; bg: string; text: string }
> = {
  Crono: { element: 'Lightning', weapon: 'Katana', color: '#EAB308', bg: '#FEF08A', text: '#854D0E' },
  Marle: { element: 'Water / Ice', weapon: 'Bow', color: '#0EA5E9', bg: '#BAE6FD', text: '#0369A1' },
  Lucca: { element: 'Fire', weapon: 'Gun', color: '#F97316', bg: '#FED7AA', text: '#C2410C' },
  Robo: { element: 'Shadow / Laser', weapon: 'Arm', color: '#A855F7', bg: '#E9D5FF', text: '#7E22CE' },
  Frog: { element: 'Water', weapon: 'Broadsword', color: '#22C55E', bg: '#BBF7D0', text: '#15803D' },
  Ayla: { element: 'Physical', weapon: 'Fists', color: '#EC4899', bg: '#FBCFE8', text: '#BE185D' },
  Magus: { element: 'Shadow', weapon: 'Scythe', color: '#6366F1', bg: '#C7D2FE', text: '#4338CA' },
}

interface StatTextFieldProps {
  label: string
  value: number
  min: number
  max: number
  helperText?: string
  onCommit: (val: number) => void
}

function StatTextField({ label, value, min, max, helperText, onCommit }: StatTextFieldProps) {
  const [localVal, setLocalVal] = useState<string>(String(value))
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (!isFocused) {
      setLocalVal(String(value))
    }
  }, [value, isFocused])

  return (
    <TextField
      label={label}
      type="number"
      size="small"
      fullWidth
      value={isFocused ? localVal : value}
      onFocus={() => {
        setIsFocused(true)
        setLocalVal(String(value))
      }}
      onChange={(e) => setLocalVal(e.target.value)}
      onBlur={() => {
        setIsFocused(false)
        const parsed = parseInt(localVal, 10)
        const finalVal = isNaN(parsed) ? value : Math.max(min, Math.min(max, parsed))
        setLocalVal(String(finalVal))
        if (finalVal !== value) {
          onCommit(finalVal)
        }
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          ;(e.target as HTMLElement).blur()
        }
      }}
      helperText={helperText}
    />
  )
}

export function CharactersView({ slot, onPatchSlot }: CharactersViewProps) {
  const { t } = useI18n()
  const [selectedCharId, setSelectedCharId] = useState<number>(0)

  const activeChar = slot.characters[selectedCharId] || slot.characters[0]
  const defaultLabel = CHARACTER_LABELS[selectedCharId] || 'Crono'
  const currentCustomName = slot.characterNames[selectedCharId] ?? defaultLabel
  const meta = HERO_META[defaultLabel] || {
    element: 'None',
    weapon: 'None',
    color: '#4F46E5',
    bg: '#EEF2FF',
    text: '#3730A3',
  }

  // Local input text states for smooth typing
  const [levelInput, setLevelInput] = useState<string>(String(activeChar.level))
  const [expInput, setExpInput] = useState<string>(String(activeChar.exp))
  const [isLevelFocused, setIsLevelFocused] = useState(false)
  const [isExpFocused, setIsExpFocused] = useState(false)

  // Notification popup states anchored to the input fields
  const [levelNotification, setLevelNotification] = useState<string | null>(null)
  const [expNotification, setExpNotification] = useState<string | null>(null)
  const levelInputRef = useRef<HTMLDivElement | null>(null)
  const expInputRef = useRef<HTMLDivElement | null>(null)
  const levelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const expTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Sync inputs with active character state when not focused
  useEffect(() => {
    if (!isLevelFocused) {
      setLevelInput(String(activeChar.level))
    }
  }, [activeChar.level, isLevelFocused, selectedCharId])

  useEffect(() => {
    if (!isExpFocused) {
      setExpInput(String(activeChar.exp))
    }
  }, [activeChar.exp, isExpFocused, selectedCharId])

  // Clear timers and popups on character switch
  useEffect(() => {
    setLevelNotification(null)
    setExpNotification(null)
    if (levelTimerRef.current) clearTimeout(levelTimerRef.current)
    if (expTimerRef.current) clearTimeout(expTimerRef.current)
  }, [selectedCharId])

  // Helper to patch single character stats
  const patchCharacter = (patch: Partial<CharacterStats>) => {
    const updated = slot.characters.map((c) => (c.id === selectedCharId ? { ...c, ...patch } : c))
    onPatchSlot({ characters: updated })
  }

  // Handle name update
  const handleNameChange = (newName: string) => {
    const trimmed = newName.slice(0, 5)
    const newNames = [...slot.characterNames]
    newNames[selectedCharId] = trimmed

    // If active character is party leader, also update leadName
    const isLeader = slot.party[0] === selectedCharId
    onPatchSlot({
      characterNames: newNames,
      ...(isLeader ? { leadName: trimmed } : {}),
    })
  }

  // Restore default name when text input loses focus if empty
  const handleNameBlur = () => {
    const raw = slot.characterNames[selectedCharId] ?? ''
    const trimmed = raw.trim()
    if (!trimmed) {
      handleNameChange(defaultLabel)
    } else if (trimmed !== raw) {
      handleNameChange(trimmed)
    }
  }

  const handleSelectChar = (cId: number) => {
    const raw = slot.characterNames[selectedCharId] ?? ''
    if (!raw.trim()) {
      handleNameChange(defaultLabel)
    }
    setSelectedCharId(cId)
  }

  // Commit Level Change: update experience according to how much experience they should have by that level
  const commitLevelChange = (rawVal: number) => {
    const newLevel = Math.max(1, Math.min(99, rawVal))
    setLevelInput(String(newLevel))
    if (newLevel === activeChar.level) return

    const newExp = getExpTotal(newLevel)
    const nextExp = getExpToNext(newLevel)

    patchCharacter({
      level: newLevel,
      exp: newExp,
      nextExp,
    })
    setExpInput(String(newExp))

    // Show popup on level input informing experience was updated accordingly
    if (levelTimerRef.current) clearTimeout(levelTimerRef.current)
    setLevelNotification(
      t.characters.expUpdatedMsg
        .replace('{exp}', newExp.toLocaleString())
        .replace('{level}', String(newLevel))
    )
    levelTimerRef.current = setTimeout(() => {
      setLevelNotification(null)
    }, 3800)
  }

  // Commit Experience Change: update level ONLY IF new experience value is outside the experience range of that level
  const commitExpChange = (rawVal: number) => {
    const newExp = Math.max(0, Math.min(9_999_999, rawVal))
    setExpInput(String(newExp))
    if (newExp === activeChar.exp) return

    if (!isExpInLevelRange(newExp, activeChar.level)) {
      const newLevel = getLevelForExp(newExp)
      const nextExp = calculateNextExp(newLevel, newExp)

      patchCharacter({
        exp: newExp,
        level: newLevel,
        nextExp,
      })
      setLevelInput(String(newLevel))

      // Show popup on experience input informing level was updated accordingly
      if (expTimerRef.current) clearTimeout(expTimerRef.current)
      setExpNotification(
        t.characters.levelUpdatedMsg
          .replace('{level}', String(newLevel))
          .replace('{exp}', newExp.toLocaleString())
      )
      expTimerRef.current = setTimeout(() => {
        setExpNotification(null)
      }, 3800)
    } else {
      // Experience is within current level range: keep level unchanged, update countdown
      const nextExp = calculateNextExp(activeChar.level, newExp)
      patchCharacter({
        exp: newExp,
        nextExp,
      })
    }
  }

  // Max this character
  const handleMaxThisCharacter = () => {
    patchCharacter({
      level: 99,
      curHp: 999,
      maxHp: 999,
      curMp: 99,
      maxMp: 99,
      power: 99,
      stamina: 99,
      speed: 16,
      magic: 99,
      hit: 99,
      evade: 99,
      magicDefense: 99,
      exp: 1_743_570, // Chrono Trigger Level 99 canonical EXP
      nextExp: 0,
    })
    setLevelInput('99')
    setExpInput('1743570')
    if (levelTimerRef.current) clearTimeout(levelTimerRef.current)
    setLevelNotification(
      t.characters.expUpdatedMsg
        .replace('{exp}', '1,743,570')
        .replace('{level}', '99')
    )
    levelTimerRef.current = setTimeout(() => {
      setLevelNotification(null)
    }, 3800)
  }

  // Full restore HP & MP
  const handleRestoreHpMp = () => {
    patchCharacter({
      curHp: activeChar.maxHp,
      curMp: activeChar.maxMp,
    })
  }

  // Update party slots
  const handlePartySlotChange = (slotIdx: number, newCharId: number) => {
    const newParty = [...slot.party] as [number, number, number]
    newParty[slotIdx] = newCharId

    // If changing leader, update leadName
    const newLeaderName = slot.characterNames[newParty[0]] || CHARACTER_LABELS[newParty[0]]
    onPatchSlot({
      party: newParty,
      leadName: newLeaderName,
    })
  }

  const hpPercent = activeChar.maxHp > 0 ? (activeChar.curHp / activeChar.maxHp) * 100 : 100
  const mpPercent = activeChar.maxMp > 0 ? (activeChar.curMp / activeChar.maxMp) * 100 : 100

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5 }}>
      {/* Active Battle Formation Manager */}
      <Card sx={{ p: 3, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'primary.main',
              color: '#FFFFFF',
            }}
          >
            <GroupRoundedIcon sx={{ fontSize: 22 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {t.characters.partyFormationTitle}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t.dashboard.activePartySubtitle}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          {[0, 1, 2].map((pSlotIdx) => {
            const currentMemberId = slot.party[pSlotIdx]
            const slotLabel =
              pSlotIdx === 0
                ? t.characters.slot1Leader
                : pSlotIdx === 1
                ? t.characters.slot2Member
                : t.characters.slot3Member
            return (
              <Grid size={{ xs: 12, sm: 4 }} key={pSlotIdx}>
                <FormControl fullWidth size="small">
                  <InputLabel id={`party-slot-${pSlotIdx}-label`}>
                    {slotLabel}
                  </InputLabel>
                  <Select
                    labelId={`party-slot-${pSlotIdx}-label`}
                    value={currentMemberId}
                    label={slotLabel}
                    onChange={(e) => handlePartySlotChange(pSlotIdx, Number(e.target.value))}
                    sx={{ borderRadius: 2.5 }}
                  >
                    {CHARACTER_LABELS.map((name, cId) => (
                      <MenuItem key={cId} value={cId}>
                        {slot.characterNames[cId] || name} ({HERO_META[name]?.element || 'Hero'})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
            )
          })}
        </Grid>
      </Card>

      {/* Hero Selection Tabs */}
      <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', pb: 0.5 }}>
        {CHARACTER_LABELS.map((defaultName, cId) => {
          const isSelected = cId === selectedCharId
          const cName = slot.characterNames[cId] || defaultName
          const cMeta = HERO_META[defaultName]
          const isInParty = slot.party.includes(cId)

          return (
            <Card
              key={cId}
              onClick={() => handleSelectChar(cId)}
              sx={{
                p: 1.5,
                px: 2,
                minWidth: 140,
                cursor: 'pointer',
                borderRadius: 3,
                border: '2px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected
                  ? (theme) => (theme.palette.mode === 'light' ? 'rgba(79, 70, 229, 0.05)' : 'rgba(99, 102, 241, 0.15)')
                  : 'background.paper',
                transition: 'all 0.15s ease',
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                '&:hover': {
                  borderColor: 'primary.light'
                },
              }}
            >
              <CharacterPortrait
                name={defaultName}
                displayName={cName}
                variant="S"
                size={36}
                borderRadius={2.5}
                fallbackBg={cMeta.bg}
                fallbackColor={cMeta.text}
              />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
                  {cName}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                    Lv {slot.characters[cId]?.level ?? 1}
                  </Typography>
                  {isInParty && (
                    <Chip
                      label="In Party"
                      size="small"
                      color="primary"
                      sx={{ height: 16, fontSize: '0.62rem', px: 0.5 }}
                    />
                  )}
                </Box>
              </Box>
            </Card>
          )
        })}
      </Box>

      {/* Selected Hero Detailed Card */}
      <Card sx={{ p: 3.5, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CharacterPortrait
              name={defaultLabel}
              displayName={currentCustomName || defaultLabel}
              variant="B"
              size={64}
              borderRadius={3.5}
              fallbackBg={meta.bg}
              fallbackColor={meta.text}
              borderColor={`${meta.color}50`}
            />
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h5" sx={{ fontWeight: 800 }}>
                  {currentCustomName || defaultLabel}
                </Typography>
                <Chip
                  label={meta.element}
                  size="small"
                  sx={{ bgcolor: meta.bg, color: meta.text, fontWeight: 700 }}
                />
                <Chip
                  label={meta.weapon}
                  size="small"
                  variant="outlined"
                  sx={{ fontWeight: 600 }}
                />
              </Box>
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.2 }}>
                Default name: <strong>{defaultLabel}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Quick Actions */}
          <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
            <Button
              variant="outlined"
              size="small"
              startIcon={<HealingRoundedIcon sx={{ color: '#10B981' }} />}
              onClick={handleRestoreHpMp}
              sx={{ borderRadius: 2.5 }}
            >
              {t.characters.restoreHpMp}
            </Button>
            <Button
              variant="contained"
              size="small"
              startIcon={<BoltRoundedIcon />}
              onClick={handleMaxThisCharacter}
              sx={{ borderRadius: 2.5 }}
            >
              {t.characters.maxCharacter}
            </Button>
          </Box>
        </Box>

        {/* Identity & Level Grid */}
        <Grid container spacing={2.5} sx={{ mb: 3 }}>
          {/* Custom Name */}
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label={t.characters.nameLabel}
              size="small"
              fullWidth
              value={currentCustomName}
              onChange={(e) => handleNameChange(e.target.value)}
              onBlur={handleNameBlur}
              helperText={t.characters.nameHelper}
              slotProps={{ htmlInput: { maxLength: 5 } }}
            />
          </Grid>

          {/* Level */}
          <Grid size={{ xs: 6, sm: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                ref={levelInputRef}
                label={t.characters.levelLabel}
                type="number"
                size="small"
                fullWidth
                value={isLevelFocused ? levelInput : activeChar.level}
                onFocus={() => {
                  setIsLevelFocused(true)
                  setLevelInput(String(activeChar.level))
                }}
                onChange={(e) => {
                  setLevelInput(e.target.value)
                }}
                onBlur={() => {
                  setIsLevelFocused(false)
                  const parsed = parseInt(levelInput, 10)
                  commitLevelChange(isNaN(parsed) ? activeChar.level : parsed)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    ;(e.target as HTMLElement).blur()
                  }
                }}
                slotProps={{
                  input: {
                    startAdornment: <StarRoundedIcon sx={{ fontSize: 18, color: '#F59E0B', mr: 0.5 }} />,
                  },
                }}
              />
              <Popper
                open={Boolean(levelNotification)}
                anchorEl={levelInputRef.current}
                placement="top-start"
                modifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 8],
                    },
                  },
                ]}
                transition
                sx={{ zIndex: 1400, pointerEvents: 'none' }}
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={180}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.25,
                        px: 1.75,
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        border: '1px solid',
                        borderColor: (theme) =>
                          theme.palette.mode === 'light' ? '#E0E7FF' : 'rgba(99, 102, 241, 0.25)',
                        boxShadow: (theme) =>
                          theme.palette.mode === 'light'
                            ? '0 10px 25px -4px rgba(79, 70, 229, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)'
                            : '0 12px 28px -4px rgba(0, 0, 0, 0.55)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (theme) =>
                            theme.palette.mode === 'light' ? '#EEF2FF' : 'rgba(99, 102, 241, 0.16)',
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        <SyncRoundedIcon sx={{ fontSize: 16 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            display: 'block',
                            lineHeight: 1.2,
                            fontSize: '0.78rem',
                          }}
                        >
                          {t.characters.autoUpdatedExp}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            fontWeight: 500,
                            display: 'block',
                            lineHeight: 1.3,
                          }}
                        >
                          {levelNotification}
                        </Typography>
                      </Box>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </Box>
          </Grid>

          {/* EXP */}
          <Grid size={{ xs: 6, sm: 4 }}>
            <Box sx={{ position: 'relative' }}>
              <TextField
                ref={expInputRef}
                label={t.characters.expLabel}
                type="number"
                size="small"
                fullWidth
                value={isExpFocused ? expInput : activeChar.exp}
                onFocus={() => {
                  setIsExpFocused(true)
                  setExpInput(String(activeChar.exp))
                }}
                onChange={(e) => {
                  setExpInput(e.target.value)
                }}
                onBlur={() => {
                  setIsExpFocused(false)
                  const parsed = parseInt(expInput, 10)
                  commitExpChange(isNaN(parsed) ? activeChar.exp : parsed)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    ;(e.target as HTMLElement).blur()
                  }
                }}
                helperText={
                  activeChar.level >= 99
                    ? t.characters.maxLevelReached
                    : `${activeChar.nextExp.toLocaleString()} ${t.characters.expUntilNext}`
                }
              />
              <Popper
                open={Boolean(expNotification)}
                anchorEl={expInputRef.current}
                placement="top-start"
                modifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 8],
                    },
                  },
                ]}
                transition
                sx={{ zIndex: 1400, pointerEvents: 'none' }}
              >
                {({ TransitionProps }) => (
                  <Fade {...TransitionProps} timeout={180}>
                    <Paper
                      elevation={0}
                      sx={{
                        p: 1.25,
                        px: 1.75,
                        bgcolor: 'background.paper',
                        color: 'text.primary',
                        borderRadius: 3,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1.5,
                        border: '1px solid',
                        borderColor: (theme) =>
                          theme.palette.mode === 'light' ? '#E0E7FF' : 'rgba(99, 102, 241, 0.25)',
                        boxShadow: (theme) =>
                          theme.palette.mode === 'light'
                            ? '0 10px 25px -4px rgba(79, 70, 229, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)'
                            : '0 12px 28px -4px rgba(0, 0, 0, 0.55)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: (theme) =>
                            theme.palette.mode === 'light' ? '#EEF2FF' : 'rgba(99, 102, 241, 0.16)',
                          color: 'primary.main',
                          flexShrink: 0,
                        }}
                      >
                        <SyncRoundedIcon sx={{ fontSize: 16 }} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            fontWeight: 700,
                            color: 'primary.main',
                            display: 'block',
                            lineHeight: 1.2,
                            fontSize: '0.78rem',
                          }}
                        >
                          {t.characters.autoUpdatedLevel}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            fontSize: '0.75rem',
                            color: 'text.secondary',
                            fontWeight: 500,
                            display: 'block',
                            lineHeight: 1.3,
                          }}
                        >
                          {expNotification}
                        </Typography>
                      </Box>
                    </Paper>
                  </Fade>
                )}
              </Popper>
            </Box>
          </Grid>
        </Grid>

        {/* HP & MP Vitals */}
        <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
          {/* HP Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#10B981' }}>
                  {t.characters.hpTitle}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {activeChar.curHp} / {activeChar.maxHp}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, hpPercent))}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)'),
                  '& .MuiLinearProgress-bar': { bgcolor: '#10B981' },
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <StatTextField
                  label={t.characters.currentHp}
                  value={activeChar.curHp}
                  min={0}
                  max={999}
                  onCommit={(val) => patchCharacter({ curHp: val })}
                />
                <StatTextField
                  label={t.characters.maxHp}
                  value={activeChar.maxHp}
                  min={1}
                  max={999}
                  onCommit={(val) => patchCharacter({ maxHp: val, curHp: Math.min(activeChar.curHp, val) })}
                />
              </Box>
            </Card>
          </Grid>

          {/* MP Section */}
          <Grid size={{ xs: 12, md: 6 }}>
            <Card variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#3B82F6' }}>
                  {t.characters.mpTitle}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 700 }}>
                  {activeChar.curMp} / {activeChar.maxMp}
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={Math.min(100, Math.max(0, mpPercent))}
                sx={{
                  height: 8,
                  borderRadius: 4,
                  mb: 2,
                  bgcolor: (theme) => (theme.palette.mode === 'light' ? '#E2E8F0' : 'rgba(255, 255, 255, 0.1)'),
                  '& .MuiLinearProgress-bar': { bgcolor: '#3B82F6' },
                }}
              />
              <Box sx={{ display: 'flex', gap: 2 }}>
                <StatTextField
                  label={t.characters.currentMp}
                  value={activeChar.curMp}
                  min={0}
                  max={99}
                  onCommit={(val) => patchCharacter({ curMp: val })}
                />
                <StatTextField
                  label={t.characters.maxMp}
                  value={activeChar.maxMp}
                  min={1}
                  max={99}
                  onCommit={(val) => patchCharacter({ maxMp: val, curMp: Math.min(activeChar.curMp, val) })}
                />
              </Box>
            </Card>
          </Grid>
        </Grid>

        {/* Core Attributes */}
        <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 2 }}>
          {t.characters.battleAttributes}
        </Typography>

        <Grid container spacing={2}>
          {/* Power */}
          <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
            <StatTextField
              label={t.characters.power}
              value={activeChar.power}
              min={1}
              max={99}
              helperText="1 - 99"
              onCommit={(val) => patchCharacter({ power: val })}
            />
          </Grid>

          {/* Stamina */}
          <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
            <StatTextField
              label={t.characters.stamina}
              value={activeChar.stamina}
              min={1}
              max={99}
              helperText="1 - 99"
              onCommit={(val) => patchCharacter({ stamina: val })}
            />
          </Grid>

          {/* Speed */}
          <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
            <StatTextField
              label={t.characters.speed}
              value={activeChar.speed}
              min={1}
              max={16}
              helperText="Max 16"
              onCommit={(val) => patchCharacter({ speed: val })}
            />
          </Grid>

          {/* Magic */}
          <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
            <StatTextField
              label={t.characters.magic}
              value={activeChar.magic}
              min={1}
              max={99}
              helperText="1 - 99"
              onCommit={(val) => patchCharacter({ magic: val })}
            />
          </Grid>

          {/* Hit */}
          <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
            <StatTextField
              label={t.characters.hit}
              value={activeChar.hit}
              min={1}
              max={99}
              helperText="1 - 99"
              onCommit={(val) => patchCharacter({ hit: val })}
            />
          </Grid>

          {/* Evade */}
          <Grid size={{ xs: 6, sm: 3, md: 1.71 }}>
            <StatTextField
              label={t.characters.evade}
              value={activeChar.evade}
              min={1}
              max={99}
              helperText="1 - 99"
              onCommit={(val) => patchCharacter({ evade: val })}
            />
          </Grid>

          {/* Magic Defense */}
          <Grid size={{ xs: 6, sm: 3, md: 1.74 }}>
            <StatTextField
              label={t.characters.magicDef}
              value={activeChar.magicDefense}
              min={1}
              max={99}
              helperText="1 - 99"
              onCommit={(val) => patchCharacter({ magicDefense: val })}
            />
          </Grid>
        </Grid>
      </Card>
    </Box>
  )
}
