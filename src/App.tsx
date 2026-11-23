import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import Box from '@mui/material/Box'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Alert from '@mui/material/Alert'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import MenuIcon from '@mui/icons-material/Menu'
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded'
import RestartAltRoundedIcon from '@mui/icons-material/RestartAltRounded'
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import FileUploadRoundedIcon from '@mui/icons-material/FileUploadRounded'
import EditRoundedIcon from '@mui/icons-material/EditRounded'
import CheckCircleOutlineRoundedIcon from '@mui/icons-material/CheckCircleOutlineRounded'
import { createAppTheme } from '@/theme'
import { Sidebar, type NavTab } from '@/components/Sidebar'
import { FileDropzone } from '@/components/FileDropzone'
import { SlotSelectDialog } from '@/components/SlotSelectDialog'
import { DashboardView } from '@/components/DashboardView'
import { LegalFooter } from '@/components/LegalFooter'
import { LanguageSelector } from '@/components/LanguageSelector'
import { useI18n } from '@/lib/i18n'

const CharactersView = lazy(() =>
  import('@/components/CharactersView').then((m) => ({ default: m.CharactersView })),
)
const InventoryView = lazy(() =>
  import('@/components/InventoryView').then((m) => ({ default: m.InventoryView })),
)
const MiscView = lazy(() =>
  import('@/components/MiscView').then((m) => ({ default: m.MiscView })),
)

function ViewLoadingFallback() {
  return (
    <Box
      sx={{
        py: 8,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 2,
      }}
    >
      <CircularProgress size={36} thickness={4} />
      <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
        Loading view...
      </Typography>
    </Box>
  )
}

function startViewTransitionSafe(updateFn: () => void, onFinished?: () => void) {
  if (typeof document !== 'undefined' && 'startViewTransition' in document) {
    const transition = (document as unknown as {
      startViewTransition: (cb: () => void) => { finished: Promise<void> }
    }).startViewTransition(updateFn)
    if (transition?.finished) {
      transition.finished.finally(() => {
        onFinished?.()
      })
    } else {
      onFinished?.()
    }
  } else {
    updateFn()
    onFinished?.()
  }
}
import {
  buildEditedFileName,
  cloneSaveData,
  createDemoSaveBytes,
  createEditedBlob,
  DEFAULT_CHECKSUM_ALGORITHM,
  downloadBlob,
  loadSaveFile,
  serializeSave,
  CHARACTER_LABELS,
} from '@/lib/save'
import type {
  ChecksumAlgorithmId,
  LoadedSaveFile,
  SaveData,
  SaveDocument,
  SlotData,
} from '@/lib/save'

export default function App() {
  const { t } = useI18n()
  const [themeMode, setThemeMode] = useState<'light' | 'dark'>('light')
  const [loaded, setLoaded] = useState<LoadedSaveFile | null>(null)
  const [data, setData] = useState<SaveData | null>(null)
  const [algorithm] = useState<ChecksumAlgorithmId>(DEFAULT_CHECKSUM_ALGORITHM)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard')
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isSlotDialogOpen, setIsSlotDialogOpen] = useState(false)

  const theme = useMemo(() => createAppTheme(themeMode), [themeMode])

  useEffect(() => {
    document.documentElement.style.colorScheme = themeMode
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeMode === 'light' ? '#FFFFFF' : '#111827')
    }
  }, [themeMode])

  const toggleThemeMode = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  const saveDocument = useMemo<SaveDocument | null>(() => {
    if (!loaded || !data) return null
    return { ...loaded.document, data, checksumAlgorithm: algorithm }
  }, [loaded, data, algorithm])

  const editedBytes = useMemo(
    () => (saveDocument ? serializeSave(saveDocument) : null),
    [saveDocument],
  )

  const handleFile = async (file: File) => {
    setError(null)
    try {
      const result = await loadSaveFile(file)
      setLoaded(result)
      setData(cloneSaveData(result.document.data))
      // Show Slot Selector first as requested!
      setIsSlotDialogOpen(true)
      setActiveTab('dashboard')
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause))
    }
  }

  const handleDemo = () => {
    const demo = createDemoSaveBytes()
    void handleFile(new File([demo], 'CT_demo.sav', { type: 'application/octet-stream' }))
  }

  const handleReset = () => {
    if (!loaded) return
    startViewTransitionSafe(() => {
      setData(cloneSaveData(loaded.document.data))
      setError(null)
    })
  }

  const handleSelectTab = (tab: NavTab) => {
    startViewTransitionSafe(
      () => {
        setActiveTab(tab)
      },
      () => {
        // Accessibility Routing: Route focus to the newly revealed view container
        document.getElementById('main-view-container')?.focus()
      },
    )
  }

  const handleDownload = () => {
    if (!loaded || !editedBytes) return
    const blob = createEditedBlob(loaded, editedBytes)
    downloadBlob(blob, buildEditedFileName(loaded.fileName))
  }

  const patchActiveSlot = (patch: Partial<SlotData>) => {
    if (!data) return
    const activeIdx = data.activeSlotIndex
    const updatedSlots = data.slots.map((slot, idx) =>
      idx === activeIdx ? { ...slot, isInitialized: true, ...patch } : slot,
    )
    setData({ ...data, slots: updatedSlots })
  }

  const activeSlot = data?.slots[data.activeSlotIndex]
  const isSlotEmpty = Boolean(activeSlot && !activeSlot.isInitialized)
  const leaderName = isSlotEmpty
    ? 'Empty'
    : activeSlot && (activeSlot.characterNames[activeSlot.party[0]] || activeSlot.leadName || CHARACTER_LABELS[0])
  const activeHours = activeSlot ? Math.floor(activeSlot.playtimeSeconds / 3600) : 0
  const activeMinutes = activeSlot ? Math.floor((activeSlot.playtimeSeconds % 3600) / 60) : 0

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
        {/* Responsive SaaSable Sidebar */}
        {loaded && data && (
          <Sidebar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
            isMobileOpen={isMobileDrawerOpen}
            onCloseMobile={() => setIsMobileDrawerOpen(false)}
            mode={themeMode}
            onToggleMode={toggleThemeMode}
          />
        )}

        {/* Main Content Layout */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            minWidth: 0,
          }}
        >
          {/* Top SaaSable Navbar */}
          <AppBar
            position="sticky"
            elevation={0}
            sx={{
              bgcolor: (t) =>
                t.palette.mode === 'light' ? 'rgba(255, 255, 255, 0.85)' : 'rgba(17, 24, 39, 0.85)',
              backdropFilter: 'blur(12px)',
              borderBottom: '1px solid',
              borderColor: 'divider',
              color: 'text.primary',
            }}
          >
            <Toolbar sx={{ px: { xs: 2, sm: 3 }, py: 1, display: 'flex', justifyContent: 'space-between', gap: 1.5 }}>
              {/* Left Side: Mobile toggle or Brand on empty */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {loaded && data ? (
                  <IconButton
                    edge="start"
                    onClick={() => setIsMobileDrawerOpen(true)}
                    sx={{ display: { xs: 'flex', md: 'none' } }}
                  >
                    <MenuIcon />
                  </IconButton>
                ) : (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                      component="img"
                      src="/assets/eot-logo.png"
                      alt="Egg of Time"
                      sx={{ width: 34, height: 40, objectFit: 'contain' }}
                    />
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                        Egg of Time
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.72rem' }}>
                        Save Editor · by Power Pudu
                      </Typography>
                    </Box>
                  </Box>
                )}

                {/* Slot Switcher Button in Header (shown when file is loaded) */}
                {loaded && data && (
                  <Button
                    variant="outlined"
                    onClick={() => setIsSlotDialogOpen(true)}
                    endIcon={<KeyboardArrowDownRoundedIcon />}
                    sx={{
                      borderRadius: 2.5,
                      px: 1.8,
                      py: 0.7,
                      textTransform: 'none',
                      bgcolor: (t) => (t.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255, 255, 255, 0.05)'),
                    }}
                  >
                    <Box sx={{ textAlign: 'left' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 800 }}>
                          Slot {data.activeSlotIndex + 1}
                        </Typography>
                        <Chip
                          label={leaderName}
                          size="small"
                          variant={isSlotEmpty ? 'outlined' : 'filled'}
                          color={isSlotEmpty ? 'default' : 'primary'}
                          sx={{ height: 18, fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </Box>
                      {isSlotEmpty ? (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                          Unused Slot
                        </Typography>
                      ) : (
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.7rem' }}>
                          {activeHours}h {activeMinutes}m · {activeSlot?.money.toLocaleString()} G
                        </Typography>
                      )}
                    </Box>
                  </Button>
                )}
              </Box>

              {/* Right Side: Actions, Language & Theme Toggle */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                {loaded && (
                  <>
                    <Chip
                      label={loaded.fileName}
                      size="small"
                      variant="outlined"
                      sx={{
                        display: { xs: 'none', sm: 'flex' },
                        maxWidth: 160,
                        fontWeight: 600,
                      }}
                    />

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<RestartAltRoundedIcon />}
                      onClick={handleReset}
                      sx={{ borderRadius: 2.5 }}
                    >
                      {t.topBar.reset}
                    </Button>

                    <Button
                      size="small"
                      variant="contained"
                      startIcon={<DownloadRoundedIcon />}
                      onClick={handleDownload}
                      disabled={!editedBytes}
                      sx={{ borderRadius: 2.5, px: 2 }}
                    >
                      {t.topBar.downloadSave}
                    </Button>
                  </>
                )}

                {/* Language Selector beside Theme Toggle */}
                <LanguageSelector compact />

                <Tooltip title={themeMode === 'light' ? t.topBar.darkMode : t.topBar.lightMode}>
                  <IconButton
                    size="small"
                    onClick={toggleThemeMode}
                    sx={{ border: '1px solid', borderColor: 'divider' }}
                  >
                    {themeMode === 'light' ? (
                      <DarkModeRoundedIcon sx={{ fontSize: 18 }} />
                    ) : (
                      <LightModeRoundedIcon sx={{ fontSize: 18, color: '#FBBF24' }} />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>
            </Toolbar>
          </AppBar>

          {/* Main Body */}
          <Container maxWidth="xl" sx={{ py: 3.5, px: { xs: 2, sm: 3.5 }, flex: 1, display: 'flex', flexDirection: 'column' }}>
            {error && (
              <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 3, borderRadius: 3 }}>
                {error}
              </Alert>
            )}

            {!loaded || !data ? (
              /* Empty / Welcome Landing View */
              <Box sx={{ my: 'auto', display: 'flex', flexDirection: 'column', gap: 4 }}>
                <FileDropzone onFile={handleFile} onDemo={handleDemo} />

                {/* 3 Step Minimal Feature Cards */}
                <Grid container spacing={2.5}>
                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ p: 3, borderRadius: 3.5 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(79, 70, 229, 0.1)',
                          color: 'primary.main',
                          mb: 2,
                        }}
                      >
                        <FileUploadRoundedIcon />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {t.landing.step1Title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', lineHeight: 1.5 }}>
                        {t.landing.step1Desc}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ p: 3, borderRadius: 3.5 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(16, 185, 129, 0.1)',
                          color: '#10B981',
                          mb: 2,
                        }}
                      >
                        <EditRoundedIcon />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {t.landing.step2Title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', lineHeight: 1.5 }}>
                        {t.landing.step2Desc}
                      </Typography>
                    </Card>
                  </Grid>

                  <Grid size={{ xs: 12, sm: 4 }}>
                    <Card sx={{ p: 3, borderRadius: 3.5 }}>
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'rgba(14, 165, 233, 0.1)',
                          color: '#0EA5E9',
                          mb: 2,
                        }}
                      >
                        <CheckCircleOutlineRoundedIcon />
                      </Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 800, mb: 0.5 }}>
                        {t.landing.step3Title}
                      </Typography>
                      <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.84rem', lineHeight: 1.5 }}>
                        {t.landing.step3Desc}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>
              </Box>
            ) : (
              /* Active Tab View */
              activeSlot && (
                <Box
                  id="main-view-container"
                  tabIndex={-1}
                  sx={{
                    flex: 1,
                    outline: 'none',
                    viewTransitionName: 'main-view',
                  }}
                >
                  <Suspense fallback={<ViewLoadingFallback />}>
                    {activeTab === 'dashboard' && (
                      <DashboardView
                        slot={activeSlot}
                        onPatchSlot={patchActiveSlot}
                        onNavigateTab={handleSelectTab}
                      />
                    )}
                    {activeTab === 'characters' && (
                      <CharactersView slot={activeSlot} onPatchSlot={patchActiveSlot} />
                    )}
                    {activeTab === 'inventory' && (
                      <InventoryView slot={activeSlot} onPatchSlot={patchActiveSlot} />
                    )}
                    {activeTab === 'misc' && (
                      <MiscView slot={activeSlot} onPatchSlot={patchActiveSlot} />
                    )}
                  </Suspense>
                </Box>
              )
            )}

            {/* Legal Disclaimer & Save Safety Notice */}
            <LegalFooter />
          </Container>
        </Box>

        {/* Dedicated Save Slot Selector Dialog */}
        {data && (
          <SlotSelectDialog
            open={isSlotDialogOpen}
            slots={data.slots}
            activeSlotIndex={data.activeSlotIndex}
            onSelectSlot={(slotIdx) => {
              startViewTransitionSafe(
                () => {
                  setData({ ...data, activeSlotIndex: slotIdx })
                  setIsSlotDialogOpen(false)
                },
                () => {
                  document.getElementById('main-view-container')?.focus()
                },
              )
            }}
            onClose={() => setIsSlotDialogOpen(false)}
            canDismiss={Boolean(activeSlot)}
          />
        )}
      </Box>
    </ThemeProvider>
  )
}
