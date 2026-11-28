import { useMemo, useState } from 'react'
import Accordion from '@mui/material/Accordion'
import AccordionDetails from '@mui/material/AccordionDetails'
import AccordionSummary from '@mui/material/AccordionSummary'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Checkbox from '@mui/material/Checkbox'
import Chip from '@mui/material/Chip'
import FormControlLabel from '@mui/material/FormControlLabel'
import IconButton from '@mui/material/IconButton'
import InputAdornment from '@mui/material/InputAdornment'
import Switch from '@mui/material/Switch'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import FlagRoundedIcon from '@mui/icons-material/FlagRounded'
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  getFlag,
  SAVE_FLAGS,
  setFlag,
  type SaveFlag,
  type SlotData,
} from '@/lib/save'
import { useI18n, type Locale } from '@/lib/i18n'

interface StoryFlagsViewProps {
  slot: SlotData
  onPatchSlot: (patch: Partial<SlotData>) => void
}

function getGroupName(group: SaveFlag['group'], locale: Locale): string {
  return locale === 'fr' ? group.fr : group.en
}

function formatHex3(val: number): string {
  return `0x${val.toString(16).toUpperCase().padStart(3, '0')}`
}

function formatHex2(val: number): string {
  return `0x${val.toString(16).toUpperCase().padStart(2, '0')}`
}

export function StoryFlagsView({ slot, onPatchSlot }: StoryFlagsViewProps) {
  const { t, locale } = useI18n()
  const [searchQuery, setSearchQuery] = useState('')
  const [checkedOnly, setCheckedOnly] = useState(true)
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})

  const groupedFlags = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const map = new Map<string, { displayName: string; flags: SaveFlag[] }>()

    for (const flag of SAVE_FLAGS) {
      if (checkedOnly && !flag.verified) continue

      const displayGroup = getGroupName(flag.group, locale)
      if (query) {
        const haystack = `${flag.label} ${flag.group.en} ${displayGroup}`.toLowerCase()
        if (!haystack.includes(query)) continue
      }

      const key = flag.group.en
      let bucket = map.get(key)
      if (!bucket) {
        bucket = { displayName: displayGroup, flags: [] }
        map.set(key, bucket)
      }
      bucket.flags.push(flag)
    }

    return Array.from(map.entries()).map(([key, value]) => ({
      key,
      displayName: value.displayName,
      flags: value.flags,
    }))
  }, [searchQuery, checkedOnly, locale])

  const totalShown = useMemo(
    () => groupedFlags.reduce((acc, g) => acc + g.flags.length, 0),
    [groupedFlags],
  )

  const defaultExpanded = checkedOnly || searchQuery.trim().length > 0

  const isGroupExpanded = (groupKey: string) =>
    expandedGroups[groupKey] ?? defaultExpanded

  const handleToggleGroup = (groupKey: string) => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !(prev[groupKey] ?? defaultExpanded),
    }))
  }

  const handleToggleFlag = (flag: SaveFlag, checked: boolean) => {
    const updated = setFlag(slot, flag, checked)
    onPatchSlot({ flagBank: updated.flagBank })
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Header, Search & Filter Controls */}
      <Card sx={{ p: 3, borderRadius: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2.5 }}>
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
            <FlagRoundedIcon sx={{ fontSize: 24 }} />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              {t.flags.title}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {t.flags.subtitle}
            </Typography>
          </Box>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <TextField
            size="small"
            placeholder={t.flags.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: 260, flex: 1, maxWidth: 460 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchQuery('')}>
                      <ClearRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <FormControlLabel
              control={
                <Switch
                  checked={checkedOnly}
                  onChange={(e) => {
                    setCheckedOnly(e.target.checked)
                    setExpandedGroups({})
                  }}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {t.flags.checkedOnly}
                </Typography>
              }
            />
            <Chip
              label={`${totalShown} ${t.flags.flagsCount}`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>

        {/* Help Text Notice */}
        <Box
          sx={{
            mt: 2.5,
            px: 2,
            py: 1.25,
            borderRadius: 2.5,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 1.25,
            bgcolor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(79, 70, 229, 0.05)'
                : 'rgba(99, 102, 241, 0.12)',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'light'
                ? 'rgba(79, 70, 229, 0.16)'
                : 'rgba(99, 102, 241, 0.25)',
            color: 'text.secondary',
          }}
        >
          <InfoOutlinedIcon sx={{ fontSize: 18, mt: 0.15, color: 'primary.main', flexShrink: 0 }} />
          <Typography variant="caption" sx={{ fontSize: '0.78rem', lineHeight: 1.5, fontWeight: 500 }}>
            {t.flags.helpText}
          </Typography>
        </Box>
      </Card>

      {/* Collapsible Flag Groups */}
      {groupedFlags.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {t.flags.noFlagsFound}
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {groupedFlags.map((group) => {
            const expanded = isGroupExpanded(group.key)
            const activeCount = group.flags.reduce(
              (acc, f) => acc + (getFlag(slot, f) ? 1 : 0),
              0,
            )

            return (
              <Accordion
                key={group.key}
                expanded={expanded}
                onChange={() => handleToggleGroup(group.key)}
                disableGutters
                elevation={0}
                slotProps={{ transition: { unmountOnExit: true } }}
                sx={{
                  borderRadius: '16px !important',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  '&::before': { display: 'none' },
                  overflow: 'hidden',
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreRoundedIcon />}
                  sx={{ px: 2.5, py: 0.75 }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                      {group.displayName}
                    </Typography>
                    <Chip
                      label={`${activeCount} / ${group.flags.length}`}
                      size="small"
                      color={activeCount > 0 ? 'primary' : 'default'}
                      variant={activeCount > 0 ? 'filled' : 'outlined'}
                      sx={{ height: 22, fontSize: '0.72rem', fontWeight: 700 }}
                    />
                  </Box>
                </AccordionSummary>

                <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                    {group.flags.map((flag) => {
                      const isOn = getFlag(slot, flag)
                      const setByText = flag.setBy.map(formatHex3).join(', ')
                      const offsetBitText = `${formatHex3(flag.offset)} · ${formatHex2(flag.bit)}`

                      return (
                        <Box
                          key={`${flag.offset}-${flag.bit}-${flag.label}`}
                          sx={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 1,
                            px: 1.5,
                            py: 1,
                            borderRadius: 2.5,
                            border: '1px solid',
                            borderColor: isOn ? 'primary.main' : 'divider',
                            bgcolor: isOn
                              ? (theme) =>
                                  theme.palette.mode === 'light'
                                    ? 'rgba(79, 70, 229, 0.04)'
                                    : 'rgba(99, 102, 241, 0.12)'
                              : 'transparent',
                            transition: 'border-color 0.15s ease, background-color 0.15s ease',
                          }}
                        >
                          <Checkbox
                            size="small"
                            checked={isOn}
                            onChange={(e) => handleToggleFlag(flag, e.target.checked)}
                            sx={{ p: 0.5, mt: -0.25 }}
                          />
                          <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                              variant="body2"
                              sx={{ fontWeight: 600, lineHeight: 1.35 }}
                            >
                              {flag.label}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{
                                color: 'text.secondary',
                                fontFamily: 'monospace',
                                fontSize: '0.73rem',
                                display: 'block',
                                mt: 0.25,
                              }}
                            >
                              {offsetBitText} — {setByText}
                            </Typography>
                          </Box>
                        </Box>
                      )
                    })}
                  </Box>
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Box>
      )}
    </Box>
  )
}
