import Box from '@mui/material/Box'
import Drawer from '@mui/material/Drawer'
import Typography from '@mui/material/Typography'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Chip from '@mui/material/Chip'
import DashboardRoundedIcon from '@mui/icons-material/DashboardRounded'
import GroupRoundedIcon from '@mui/icons-material/GroupRounded'
import Inventory2RoundedIcon from '@mui/icons-material/Inventory2Rounded'
import AttractionsRoundedIcon from '@mui/icons-material/AttractionsRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'

export type NavTab = 'dashboard' | 'characters' | 'inventory' | 'misc'

interface SidebarProps {
	activeTab: NavTab
	onSelectTab: (tab: NavTab) => void
	isMobileOpen: boolean
	onCloseMobile: () => void
	mode: 'light' | 'dark'
	onToggleMode: () => void
}

const NAV_ITEMS: Array<{
	id: NavTab
	label: string
	sublabel: string
	icon: React.ReactNode
}> = [
		{
			id: 'dashboard',
			label: 'Dashboard & Boosts',
			sublabel: 'Overview & Cheats',
			icon: <DashboardRoundedIcon sx={{ fontSize: 22 }} />,
		},
		{
			id: 'characters',
			label: 'Party & Characters',
			sublabel: 'Stats, Names, Team',
			icon: <GroupRoundedIcon sx={{ fontSize: 22 }} />,
		},
		{
			id: 'inventory',
			label: 'Inventory & Items',
			sublabel: '347 Items & Equipment',
			icon: <Inventory2RoundedIcon sx={{ fontSize: 22 }} />,
		},
		{
			id: 'misc',
			label: 'Mini-Games & Epoch',
			sublabel: 'Fair, Food, Airship',
			icon: <AttractionsRoundedIcon sx={{ fontSize: 22 }} />,
		},
	]

export const DRAWER_WIDTH = 270

export function Sidebar({
	activeTab,
	onSelectTab,
	isMobileOpen,
	onCloseMobile,
	mode,
	onToggleMode,
}: SidebarProps) {
	const content = (
		<Box
			sx={{
				display: 'flex',
				flexDirection: 'column',
				height: '100%',
				bgcolor: (theme) => (theme.palette.mode === 'light' ? '#FFFFFF' : '#111827'),
				borderRight: '1px solid',
				borderColor: 'divider',
			}}
		>
			{/* Brand Header */}
			<Box sx={{ p: 3, pb: 2.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
				<Box
					component="img"
					src="/assets/eot-logo.png"
					alt="Egg of Time"
					sx={{
						width: 44,
						height: 52,
						objectFit: 'contain',
						filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.15))',
					}}
				/>
				<Box>
					<Typography
						variant="subtitle1"
						sx={{
							fontWeight: 800,
							fontSize: '1.05rem',
							lineHeight: 1.15,
							letterSpacing: '-0.02em',
						}}
					>
						Egg of Time
					</Typography>
					<Typography
						variant="caption"
						sx={{
							fontWeight: 600,
							color: 'primary.main',
							letterSpacing: 0.5,
							textTransform: 'uppercase',
							fontSize: '0.68rem',
						}}
					>
						Save Editor
					</Typography>
				</Box>
			</Box>

			{/* Navigation List */}
			<Box sx={{ px: 2, py: 1.5, flex: 1 }}>
				<Typography
					variant="caption"
					sx={{
						px: 1.5,
						fontWeight: 700,
						textTransform: 'uppercase',
						letterSpacing: 0.8,
						color: 'text.secondary',
						fontSize: '0.68rem',
						display: 'block',
						mb: 1,
					}}
				>
					Navigation
				</Typography>
				<List disablePadding sx={{ display: 'flex', flexDirection: 'column', gap: 0.8 }}>
					{NAV_ITEMS.map((item) => {
						const isSelected = activeTab === item.id
						return (
							<ListItem key={item.id} disablePadding>
								<ListItemButton
									onClick={() => {
										onSelectTab(item.id)
										onCloseMobile()
									}}
									sx={{
										borderRadius: 3,
										py: 1.2,
										px: 1.6,
										bgcolor: isSelected
											? (theme) =>
												theme.palette.mode === 'light' ? 'rgba(79, 70, 229, 0.08)' : 'rgba(99, 102, 241, 0.16)'
											: 'transparent',
										color: isSelected ? 'primary.main' : 'text.primary',
										'&:hover': {
											bgcolor: (theme) =>
												theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
										},
									}}
								>
									<ListItemIcon
										sx={{
											minWidth: 36,
											color: isSelected ? 'primary.main' : 'text.secondary',
										}}
									>
										{item.icon}
									</ListItemIcon>
									<ListItemText
										primary={item.label}
										secondary={item.sublabel}
										slotProps={{
											primary: {
												sx: { fontWeight: isSelected ? 700 : 600, fontSize: '0.88rem' },
											},
											secondary: {
												sx: { fontSize: '0.72rem' },
											},
										}}
									/>
								</ListItemButton>
							</ListItem>
						)
					})}
				</List>
			</Box>

			{/* Brand Footer: Power Pudu */}
			<Box
				sx={{
					p: 2,
					m: 2,
					borderRadius: 1.5,
					bgcolor: (theme) =>
						theme.palette.mode === 'light' ? '#F8FAFC' : 'rgba(255, 255, 255, 0.03)',
					border: '1px solid',
					borderColor: 'divider',
					display: 'flex',
					flexDirection: 'column',
					gap: 1.5,
				}}
			>
				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
					<Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
						<Box
							component="img"
							src="/assets/power-pudu-logo.jpg"
							alt="Power Pudu"
							sx={{
								width: 34,
								height: 34,
								borderRadius: 2,
								objectFit: 'cover',
								border: '1px solid rgba(0,0,0,0.1)',
							}}
						/>
						<Box>
							<Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
								Another project from
							</Typography>
							<Typography variant="body2" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
								Power Pudu
							</Typography>
						</Box>
					</Box>

					<Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
						<IconButton
							size="small"
							onClick={onToggleMode}
							sx={{
								bgcolor: (theme) =>
									theme.palette.mode === 'light' ? '#FFFFFF' : 'rgba(255,255,255,0.08)',
								border: '1px solid',
								borderColor: 'divider',
							}}
						>
							{mode === 'light' ? (
								<DarkModeRoundedIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
							) : (
								<LightModeRoundedIcon sx={{ fontSize: 18, color: '#FBBF24' }} />
							)}
						</IconButton>
					</Tooltip>
				</Box>

				<Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pt: 0.5 }}>
					<Chip label="v0.3" size="small" sx={{ height: 20, fontSize: '0.68rem', fontWeight: 700 }} />
				</Box>
			</Box>
		</Box>
	)

	return (
		<>
			{/* Desktop Persistent Drawer */}
			<Drawer
				variant="permanent"
				sx={{
					display: { xs: 'none', md: 'block' },
					width: DRAWER_WIDTH,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: DRAWER_WIDTH,
						boxSizing: 'border-box',
						border: 'none',
					},
				}}
			>
				{content}
			</Drawer>

			{/* Mobile Temporary Drawer */}
			<Drawer
				variant="temporary"
				open={isMobileOpen}
				onClose={onCloseMobile}
				ModalProps={{ keepMounted: true }}
				sx={{
					display: { xs: 'block', md: 'none' },
					'& .MuiDrawer-paper': {
						width: DRAWER_WIDTH,
						boxSizing: 'border-box',
					},
				}}
			>
				{content}
			</Drawer>
		</>
	)
}
