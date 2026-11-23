import { useState, useMemo, memo } from 'react'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import IconButton from '@mui/material/IconButton'
import Pagination from '@mui/material/Pagination'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import ClearRoundedIcon from '@mui/icons-material/ClearRounded'
import AddRoundedIcon from '@mui/icons-material/AddRounded'
import RemoveRoundedIcon from '@mui/icons-material/RemoveRounded'
import BoltRoundedIcon from '@mui/icons-material/BoltRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import LocalPharmacyRoundedIcon from '@mui/icons-material/LocalPharmacyRounded'
import SportsMartialArtsRoundedIcon from '@mui/icons-material/SportsMartialArtsRounded'
import ShieldRoundedIcon from '@mui/icons-material/ShieldRounded'
import SmartToyRoundedIcon from '@mui/icons-material/SmartToyRounded'
import DiamondRoundedIcon from '@mui/icons-material/DiamondRounded'
import KeyRoundedIcon from '@mui/icons-material/KeyRounded'
import type { SlotData, InventoryItem } from '@/lib/save'
import { ITEM_CATEGORIES, ITEM_NAMES, type ItemCategory, type ItemCategoryId } from '@/lib/save'

interface InventoryViewProps {
  slot: SlotData
  onPatchSlot: (patch: Partial<SlotData>) => void
}

const CATEGORY_ICONS: Record<ItemCategoryId, React.ReactElement> = {
  consumable: <LocalPharmacyRoundedIcon sx={{ fontSize: 18 }} />,
  weapon: <SportsMartialArtsRoundedIcon sx={{ fontSize: 18 }} />,
  armor: <ShieldRoundedIcon sx={{ fontSize: 18 }} />,
  helmet: <SmartToyRoundedIcon sx={{ fontSize: 18 }} />,
  accessory: <DiamondRoundedIcon sx={{ fontSize: 18 }} />,
  important: <KeyRoundedIcon sx={{ fontSize: 18 }} />,
}

function getItemDisplayName(cat: ItemCategory, item: InventoryItem): string {
  let subId = item.slotIndex
  if (item.itemId !== 0) {
    const rawSubId = (item.itemId & 0xff) - 1
    if (rawSubId >= 0 && rawSubId < cat.slotCount) {
      subId = rawSubId
    }
  }
  const nameIdx = cat.nameOffset + subId
  const found = ITEM_NAMES[nameIdx]
  return found && found.trim() ? found.trim() : `${cat.label} #${subId + 1}`
}

const PAGE_SIZE = 36

interface ItemCardProps {
  category: ItemCategory
  item: InventoryItem
  name: string
  onUpdateQuantity: (catId: ItemCategoryId, slotIndex: number, qty: number) => void
}

// Memoized item card to prevent re-rendering all items when one is modified
const InventoryItemCard = memo(function InventoryItemCard({
  category,
  item,
  name,
  onUpdateQuantity,
}: ItemCardProps) {
  const hasQuantity = item.quantity > 0

  return (
    <Card
      variant="outlined"
      sx={{
        p: 1.8,
        borderRadius: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        bgcolor: (theme) =>
          hasQuantity
            ? theme.palette.mode === 'light'
              ? '#FFFFFF'
              : 'rgba(255, 255, 255, 0.04)'
            : theme.palette.mode === 'light'
              ? '#FAFAFA'
              : 'rgba(0, 0, 0, 0.2)',
        borderColor: hasQuantity ? 'primary.main' : 'divider',
        opacity: hasQuantity ? 1 : 0.85,
        transition: 'border-color 0.15s ease',
      }}
    >
      {/* Left: Item Info */}
      <Box sx={{ minWidth: 0, pr: 1.5, flex: 1 }}>
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            color: hasQuantity ? 'text.primary' : 'text.secondary',
            fontSize: '0.86rem',
          }}
          title={name}
        >
          {name}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mt: 0.3 }}>
          <Chip
            label={category.label}
            size="small"
            sx={{
              height: 18,
              fontSize: '0.65rem',
              fontWeight: 600,
              bgcolor: (theme) =>
                theme.palette.mode === 'light' ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.08)',
            }}
          />
        </Box>
      </Box>

      {/* Right: Fast Quantity Controls (Lightweight DOM input) */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <IconButton
          size="small"
          title="Decrease by 1"
          disabled={item.quantity <= 0}
          onClick={() => onUpdateQuantity(category.id, item.slotIndex, item.quantity - 1)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <RemoveRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>

        <Box
          component="input"
          type="number"
          min={0}
          max={99}
          value={item.quantity}
          onChange={(e) => onUpdateQuantity(category.id, item.slotIndex, parseInt(e.target.value) || 0)}
          sx={{
            width: 38,
            height: 28,
            textAlign: 'center',
            fontWeight: 700,
            fontFamily: 'monospace',
            fontSize: '0.85rem',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            color: 'text.primary',
            outline: 'none',
            '&:focus': {
              borderColor: 'primary.main',
            },
          }}
        />

        <IconButton
          size="small"
          title="Increase by 1"
          disabled={item.quantity >= 99}
          onClick={() => onUpdateQuantity(category.id, item.slotIndex, item.quantity + 1)}
          sx={{
            width: 28,
            height: 28,
            borderRadius: 1.5,
            border: '1px solid',
            borderColor: 'divider',
          }}
        >
          <AddRoundedIcon sx={{ fontSize: 16 }} />
        </IconButton>

        <IconButton
          size="small"
          title="Set to 99"
          onClick={() => onUpdateQuantity(category.id, item.slotIndex, 99)}
          sx={{
            width: 28,
            height: 28,
            fontSize: '0.7rem',
            fontWeight: 700,
            borderRadius: 1.5,
            bgcolor: (theme) =>
              theme.palette.mode === 'light' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.15)',
            color: 'primary.main',
          }}
        >
          99
        </IconButton>
      </Box>
    </Card>
  )
})

export function InventoryView({ slot, onPatchSlot }: InventoryViewProps) {
  // Default to consumable for lightning-fast initial load
  const [activeCatId, setActiveCatId] = useState<string>('consumable')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [ownedOnly, setOwnedOnly] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)

  // Update a single item's quantity
  const handleUpdateQuantity = (catId: ItemCategoryId, slotIndex: number, newQty: number) => {
    const clamped = Math.max(0, Math.min(99, newQty))
    const cat = ITEM_CATEGORIES.find((c) => c.id === catId)
    if (!cat) return

    const categoryItems = [...(slot.inventory[catId] ?? [])]
    const existing = categoryItems[slotIndex]

    if (existing) {
      const itemId =
        existing.itemId !== 0
          ? existing.itemId
          : (cat.prefix << 8) | (slotIndex + 1)

      categoryItems[slotIndex] = {
        ...existing,
        itemId,
        quantity: clamped,
      }

      onPatchSlot({
        inventory: {
          ...slot.inventory,
          [catId]: categoryItems,
        },
      })
    }
  }

  // Bulk actions
  const handleBulkSetCategory = (catId: ItemCategoryId, quantity: number) => {
    const cat = ITEM_CATEGORIES.find((c) => c.id === catId)
    if (!cat) return

    const categoryItems = (slot.inventory[catId] ?? []).map((item, idx) => ({
      slotIndex: idx,
      itemId: item.itemId !== 0 ? item.itemId : (cat.prefix << 8) | (idx + 1),
      quantity,
    }))

    onPatchSlot({
      inventory: {
        ...slot.inventory,
        [catId]: categoryItems,
      },
    })
  }

  // Filter items
  const filteredItems = useMemo(() => {
    const results: Array<{
      category: ItemCategory
      item: InventoryItem
      name: string
    }> = []

    const query = searchQuery.trim().toLowerCase()

    const catsToSearch =
      activeCatId === 'all'
        ? ITEM_CATEGORIES
        : ITEM_CATEGORIES.filter((c) => c.id === activeCatId)

    for (const cat of catsToSearch) {
      const items = slot.inventory[cat.id] ?? []
      for (const item of items) {
        if (ownedOnly && item.quantity <= 0) continue

        const name = getItemDisplayName(cat, item)
        if (query && !name.toLowerCase().includes(query)) continue

        results.push({ category: cat, item, name })
      }
    }

    return results
  }, [slot.inventory, activeCatId, searchQuery, ownedOnly])

  // Paginated items
  const totalPages = Math.ceil(filteredItems.length / PAGE_SIZE) || 1
  const displayedItems = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return filteredItems.slice(start, start + PAGE_SIZE)
  }, [filteredItems, page])

  const handleTabChange = (_: React.SyntheticEvent, val: string) => {
    setActiveCatId(val)
    setPage(1)
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {/* Category Tabs & Header */}
      <Card sx={{ p: 2.5, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Inventory Management
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Search and modify items, equipment, and consumables across all categories
            </Typography>
          </Box>

          {/* Quick Bulk Action for current category */}
          {activeCatId !== 'all' && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<BoltRoundedIcon />}
                onClick={() => handleBulkSetCategory(activeCatId as ItemCategoryId, activeCatId === 'consumable' ? 99 : 1)}
                sx={{ borderRadius: 2.5 }}
              >
                {activeCatId === 'consumable' ? 'Give All x99' : 'Give All x1'}
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="inherit"
                startIcon={<DeleteOutlineRoundedIcon />}
                onClick={() => handleBulkSetCategory(activeCatId as ItemCategoryId, 0)}
                sx={{ borderRadius: 2.5 }}
              >
                Clear Category
              </Button>
            </Box>
          )}
        </Box>

        {/* Categories Bar */}
        <Tabs
          value={activeCatId}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 42,
            borderBottom: '1px solid',
            borderColor: 'divider',
            pb: 1,
            '& .MuiTab-root': {
              minHeight: 38,
              borderRadius: 2.5,
              fontWeight: 600,
              fontSize: '0.84rem',
              mr: 1,
            },
          }}
        >
          {ITEM_CATEGORIES.map((cat) => (
            <Tab
              key={cat.id}
              value={cat.id}
              label={`${cat.label} (${cat.slotCount})`}
              icon={CATEGORY_ICONS[cat.id]}
              iconPosition="start"
            />
          ))}
          <Tab value="all" label="All (347)" />
        </Tabs>

        {/* Search & Filters Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mt: 2.5 }}>
          <TextField
            size="small"
            placeholder="Search items (e.g. Rainbow, Potion, Tab)..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setPage(1)
            }}
            sx={{ minWidth: 280, flex: 1, maxWidth: 450 }}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                  </InputAdornment>
                ),
                endAdornment: searchQuery ? (
                  <InputAdornment position="end">
                    <IconButton
                      size="small"
                      onClick={() => {
                        setSearchQuery('')
                        setPage(1)
                      }}
                    >
                      <ClearRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
          />

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <FormControlLabel
              control={
                <Switch
                  checked={ownedOnly}
                  onChange={(e) => {
                    setOwnedOnly(e.target.checked)
                    setPage(1)
                  }}
                  color="primary"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  Show Owned Only (&gt; 0)
                </Typography>
              }
            />
            <Chip
              label={`${filteredItems.length} items`}
              size="small"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          </Box>
        </Box>
      </Card>

      {/* Items List Grid */}
      {filteredItems.length === 0 ? (
        <Card sx={{ p: 6, textAlign: 'center', borderRadius: 4 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 0.5 }}>
            No items match your filter
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Try clearing your search query or enabling unowned items.
          </Typography>
        </Card>
      ) : (
        <>
          <Grid container spacing={2}>
            {displayedItems.map(({ category, item, name }) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={`${category.id}-${item.slotIndex}`}>
                <InventoryItemCard
                  category={category}
                  item={item}
                  name={name}
                  onUpdateQuantity={handleUpdateQuantity}
                />
              </Grid>
            ))}
          </Grid>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2, pt: 2, pb: 1 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(_, newPage) => setPage(newPage)}
                color="primary"
                shape="rounded"
                size="medium"
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filteredItems.length)} of {filteredItems.length}
              </Typography>
            </Box>
          )}
        </>
      )}
    </Box>
  )
}
