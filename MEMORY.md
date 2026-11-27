# MEMORY.md — Egg of Time (Save Editor)

> **CRITICAL FOR ALL AGENTS**: Read this file completely before inspecting code or proposing changes. This document retains context across chat sessions, user constraints, architecture rules, and verified reverse-engineered memory offsets for Chrono Trigger DS.

---

## 1. Project Overview & Identity

- **Project Name:** Egg of Time - Save Editor
- **Studio / Creator Brand:** Power Pudu
- **Target Game:** Chrono Trigger (Nintendo DS release)
- **Supported Formats:** 64 KB raw battery saves (`.sav`), emulator battery saves (`.dsv`) with optional DeSmuME footers, and Action Replay DS / Datel saves (`.dst`, `.duc`) with 500-byte ARDS container headers and trailing padding.
- **Execution Model:** 100% client-side in the browser. Zero server uploads, zero remote data transmission.
- **License:** GNU General Public License v3.0 (`LICENSE.md`).

### Brand Assets & Paths
- **Brand Logo (Power Pudu):** `public/assets/power-pudu-logo.jpg` (pixel deer illustration).
- **App Logo (Egg of Time):** `public/assets/eot-logo.png` (Chrono Trigger Time Egg).
- **Character Portraits:** `public/assets/portraits/{characterName}{variant}.png`
  - Canonical names: `Crono`, `Marle`, `Lucca`, `Robo`, `Frog`, `Ayla`, `Magus`
  - Variants: `B` for Big (hero detail & party showcase), `S` for Small (slot selector cards & tabs).
  - Pre-staged: `CronoB.png`, `CronoS.png`, `FrogB.png`, `FrogS.png`.
  - Missing portraits fall back gracefully to letter initials + elemental colors via `<CharacterPortrait />`.

---

## 2. Non-Negotiable User Constraints & Rules

1. **Light Mode First:** Default theme is Light Mode. Dark Mode toggle must always be available.
2. **Never Hand-Craft or Improvise Icons in Code:**
   - Do NOT create custom SVG vector paths in React components.
   - Use standard icons from `@mui/icons-material`. If an icon cannot be found in `@mui/icons-material`, **ask the user first**.
3. **Save Slot Selector First:**
   - When a save file is loaded (or demo save clicked), the app must present the dedicated **Slot Selection Modal (`SlotSelectDialog`) first**.
   - The active slot switcher remains prominently in the top header afterwards.
4. **Quick Boosts as an Accordion:**
   - The Quick Boosts & Cheats section in `DashboardView` must be a slim, collapsed-by-default accordion to preserve screen space and avoid stealing focus from core stats.
5. **No Emojis in Formal Documentation:** Keep files like `README.md` professional and free of emojis.
6. **Save Safety & Legal Disclaimers:**
   - Always display the backup warning: *"Always backup your original save before editing. I'm not responsible for corrupted files."*
   - Always retain the trademark disclaimer regarding Square Enix Co., Ltd.
7. **Performance in Inventory:**
   - With 347 items across 6 categories, never render all items with heavy MUI wrappers simultaneously. Use pagination (36 items/page), `React.memo` on item cards, and lightweight styled HTML inputs.
8. **Text Input Editing & Name Restoration:**
   - When editing character names (in `CharactersView`) or vessel/identity names (in `MiscView`), clearing the input field while typing must keep the field empty (`""`) so the user can freely backspace and type a new name without the default snapping back on keystroke.
   - Restoration of default names (`Crono`, `Marle`, `Epoch`, etc.) only occurs when the text input loses focus (`onBlur`) if the field was left completely blank or whitespace-only. `serializeSave` additionally guarantees fallback to canonical labels.
9. **Consult Egg of Time Agent for Game Logic:**
   - Whenever you have a question about the game's logic, internal structures, formulas, or save requirements, **ask the user first** so they can forward the inquiry to the agent working directly on the *Egg of Time* Chrono Trigger DS static recompilation project. Do not guess or improvise undocumented game logic.
10. **Numeric Stat Inputs & Reciprocal Level/EXP Commits:**
   - All character numeric stat inputs (Level, EXP, HP, MP, and battle attributes) must only commit their values to save state after the input loses focus (`onBlur` or `Enter`). Users can freely backspace, clear, and type multi-digit numbers without intermediate state snapping or debounced jumping mid-keystroke.
   - When Level or Experience is committed on blur and updates the matching counterpart, the notification popup adheres strictly to modern SaaS component styling: clean `background.paper` surface (white in Light Mode, deep slate in Dark Mode), subtle indigo-tinted border (`#E0E7FF` / `rgba(99, 102, 241, 0.25)`), soft elevation shadow, 12px border radius, a compact soft indigo icon badge, and an 8px offset anchored to `top-start` to avoid overlapping the input's floating label.
11. **GitHub Account & Git Operations:**
   - Always use the `power-pudu` GitHub account for this repository (`gh auth switch --user power-pudu`, `git config user.name "power-pudu"`). Never commit or push under the alternate machine account.
12. **Modern SaaS UI Visual Consistency & Design Guidelines:**
   - Visual consistency with the clean SaaS dashboard design system is mandatory across all views, popups, and components.
   - **Palette & Contrast:**
     - Primary: Indigo (`#4F46E5` light, `#818CF8` dark, with `#EEF2FF` light tint).
     - Secondary: Emerald (`#10B981` / `#34D399`).
     - Backgrounds: `theme.palette.background.default` (`#F8FAFC` light, `#0B0F19` dark), `background.paper` (`#FFFFFF` light, `#111827` or `#1E293B` dark).
     - Text: Slate hierarchy (`#0F172A` primary / `#64748B` secondary in light; `#F8FAFC` primary / `#94A3B8` secondary in dark).
     - Borders: Subtle `1px solid` with `#E2E8F0` (light) or `rgba(255, 255, 255, 0.08)` (dark). Never use heavy, un-themed, or high-contrast saturated borders.
   - **Shape & Radii:**
     - Outer cards and dashboard containers: `16px` (`borderRadius: 4`).
     - Dialogs & modals: `20px` (`borderRadius: 5`).
     - Text inputs, buttons, and popups/poppers: `12px` (`borderRadius: 3` / `2.5`).
     - Chips & small badges: `8px` (`borderRadius: 2`).
   - **Elevations & Shadows:**
     - Light mode: Soft, multi-stop SaaS shadows (e.g. `0 10px 25px -4px rgba(79, 70, 229, 0.12), 0 4px 6px -2px rgba(0, 0, 0, 0.04)` for floating elements; `0 1px 3px 0 rgba(0, 0, 0, 0.04)` for static cards).
     - Dark mode: Deep, subtle dark shadows (e.g. `0 12px 28px -4px rgba(0, 0, 0, 0.55)`).
   - **Floating Badges, Tooltips & Popups:**
     - Must use `background.paper` matching the current theme mode. Never render pitch-black pills, dark navy blobs, or neon outlines in Light Mode.
     - Must include an icon badge (28×28px rounded container with subtle primary tint) and crisp two-tier typography (primary bold label + secondary description).
     - Must maintain spatial offset (e.g. `8px` to `10px`) so they never intersect, overlap, or clip adjacent input labels or borders.

---

## 3. Nintendo DS Save File Architecture

### File Layout
- **Total Save Size:** Exactly 65,536 bytes (64 KB).
- **Global Header Magic:** `0xFEDCBA98` (32-bit LE) at file offset `0x0000`.
- **Global Header Text:** 32-byte Shift-JIS string at `0x0004` (typically `フォーマット済みファイルデータ`).
- **Slot Table Start:** Offset `0x0028`.
- **Slot Count:** 3 slots (`Slot 1`, `Slot 2`, `Slot 3`).
- **Slot Stride / Size:** `0x2800` bytes (10,240 bytes) each.
  - Slot 0: `0x0028`
  - Slot 1: `0x2828`
  - Slot 2: `0x5028`

### Container Formats (.dsv, .dst, .duc)
- **DeSmuME (`.dsv`):** 64 KB raw save followed by ASCII footer marker `|<--Snip above here`. Reattached on export.
- **Action Replay DS / Datel (`.dst`, `.duc`):**
  - Offset `0x000` to `0x1F3` (500 bytes): ARDS header beginning with ASCII `ARDS000000000001` magic.
  - Offset `0x1F4` (500 decimal): Exactly where the 64 KB save begins (`0xFEDCBA98` magic).
  - Offset `0x1F4 + 65536` (`0x101F4`) to EOF: Trailing padding (often 0xFF up to 256 KB or 512 KB).
  - Both header and footer padding are preserved byte-for-byte on download.

### Checksum Algorithm
- Each slot begins with a 32-bit unsigned additive sum stored at `slot + 0x0000`.
- The sum is computed over bytes `slot + 0x0004` through `slot + 0x27FF` (10,236 bytes):
  ```ts
  let sum = 0
  for (let i = 4; i < 0x2800; i++) {
    sum = (sum + slotBytes[i]) >>> 0
  }
  ```
- Any modification to a slot requires updating this 32-bit integer at `slot + 0x0000`.

### Uninitialized / Empty Slots
- In Chrono Trigger DS, unused/unformatted slots contain:
  - `storedChecksum`: `0xFEDCBA98` (`SAVE_MAGIC`) instead of a calculated additive sum.
  - Header text: Japanese Shift-JIS string `フォーマット済みファイルデータ！` ("Formatted file data!").
  - Adventure fields: all bytes set to `0xFF` (e.g. `partyLeader = 0xFF`, `money = 0xFFFFFFFF`, `playtime = 0xFFFFFFFF`).
  - Text decoder ignores leading `0xFF` so names fall back cleanly to character names without `\ufffd` diamond question marks (``).
- The parser flags `isInitialized = false` and sanitizes values (`money = 0`, `playtime = 0`, `party = [0, 255, 255]`).
- Untouched uninitialized slots are preserved byte-for-byte in `serializeSave` so empty slots stay empty on hardware.
- The UI displays uninitialized slots as "No Save Data" / "Empty Slot" with clean placeholders (`—`). Modifying any value marks `isInitialized = true` and enables saving.

### Key Slot Offsets (Relative to `slotBase`)
- `0x0000`: 32-bit Additive Checksum (little-endian).
- `0x027A`: 1-byte Norstein Bekkler's Tent Silver Points (`0 - 255`).
- `0x0287`: 1-byte Millennial Fair Cat Food quantity in pounds (`0 - 255`).
- `0x0428`: 2-byte little-endian save location ID.
- `0x042A`: 1-byte party tile X coordinate.
- `0x042B`: 1-byte party tile Y coordinate.
- `0x042C`: 1-byte party facing direction (left untouched on write).
- `0x0434`: 2-byte little-endian second copy of save location ID (must match `0x0428`).
- `0x045C`: Character battle data (7 characters × `0x60` bytes each, starting with Crono ID 0 at `0x045C`, Frog ID 4 at `0x05DC` / file offset `0x0604`).
- `0x06FC`: Weapons inventory (`111` slots × 4 bytes).
- `0x08B8`: Armor inventory (`50` slots × 4 bytes).
- `0x0980`: Helmets inventory (`39` slots × 4 bytes).
- `0x0A1C`: Accessories inventory (`59` slots × 4 bytes).
- `0x0B08`: Consumables / Items inventory (`43` slots × 4 bytes).
- `0x0BB4`: Key Items inventory (`45` slots × 4 bytes).
- `0x0C98`: Character names (7 characters × 16-byte stride; 10 bytes Shift-JIS + null padding).
- `0x0D08`: Airship (Epoch) name (10 bytes Shift-JIS).
- `0x0D18`: Active leader name summary copy (10 bytes Shift-JIS).
- `0x0D28`: Princess Nadia true name (`82 6D 82 81 82 84 82 89 82 81` = `Ｎａｄｉａ`, 10 bytes Shift-JIS).
- `0x0D38`: Active party character IDs (3 bytes: Leader, Member 2, Member 3; `0x00`=Crono .. `0x06`=Magus, `0xFF`=Empty).
- `0x0D44`: Gold / Money (4-byte LE unsigned integer; max in CT is `9,999,999 G`).
- `0x0D48`: Save counter (4-byte LE integer).
- `0x0D4C`: Adventure playtime in seconds (4-byte LE integer).
- `0x21E8`: Playtime summary copy used on the file load screen (must match `0x0D4C`).

### Character Data Stride (`0x60` bytes per character at `0x045C + id * 0x60`)
- `+0x00`: Character ID (uint32 LE, `0x00`=Crono, `0x01`=Marle, `0x02`=Lucca, `0x03`=Robo, `0x04`=Frog, `0x05`=Ayla, `0x06`=Magus)
- `+0x04`: Status / unknown flags (4 bytes)
- `+0x08`: Current HP (uint16 LE, 1 - 999)
- `+0x0A`: Max HP (uint16 LE, 1 - 999)
- `+0x0C`: Current MP (uint16 LE, 1 - 99)
- `+0x0E`: Max MP (uint16 LE, 1 - 99)
- `+0x10`: Base HP (uint16 LE, 1 - 999)
- `+0x12`: Power (uint8, 1 - 99)
- `+0x13`: Stamina (uint8, 1 - 99)
- `+0x14`: **Speed (uint8, 1 - 16)** — *CRITICAL: 16 is engine max in Chrono Trigger; values > 16 glitch the ATB gauge.*
- `+0x15`: Magic (uint8, 1 - 99)
- `+0x16`: Hit (uint8, 1 - 99)
- `+0x17`: Evade (uint8, 1 - 99)
- `+0x18`: Magic Defense (uint8, 1 - 99)
- `+0x19`: **Level (uint8, 1 - 99)** — *CRITICAL: The game reads level directly from record + 0x19 (e.g. 0x61D for Frog).*
- `+0x1A`: Unused / padding (2 bytes, `00 00`)
- `+0x1C`: Cumulative Experience Points (uint32 LE, capped at 9,999,999; canonical level 99 is 1,743,570)
- `+0x3A`: **EXP to Next Level (uint16 LE)** — *CRITICAL countdown counter. In-game function func_0202bee0 subtracts battle EXP from this value. When it reaches 0 or below, level +0x19 increments and this is refilled with ct_exp_to_next[level] (or 0 at level 99). Must be synchronized whenever level changes.*
- `+0x44 .. +0x4A`: Current / effective stats displayed in in-game equipment menus (Power, Stamina, Speed, Magic, Hit, Evade, Magic Defense)

### Shift-JIS Text & Name Handling
- In Chrono Trigger DS, character names are **up to 5 characters** stored in 10-byte fixed-width fields.
- Names are encoded in **Zenkaku (full-width)** characters (e.g., `Ｃｒｏｎｏ`, `Ｆｒｏｇ`) using Shift-JIS.
- `src/lib/save/encoding.ts` provides `decodeName`, `encodeName`, and `toFullWidth` to convert ASCII cleanly so in-game text rendering does not clip or overflow.

---

## 4. UI Architecture & Components

```
src/
├── App.tsx                     # Main layout, routing, slot dialog state, header
├── theme.ts                    # Light mode default theme (modern SaaS palette)
├── main.tsx                    # Entry point
├── components/
│   ├── CharacterPortrait.tsx   # Silhouette loader with fallback to elemental initial
│   ├── CharactersView.tsx      # Roster management, attributes, party formation
│   ├── DashboardView.tsx       # Core stats, active party cards, Quick Boosts accordion
│   ├── FileDropzone.tsx        # Drag & drop upload area with demo save loader
│   ├── InventoryView.tsx       # Paginated (36/page) search & editor for 347 items
│   ├── LegalFooter.tsx         # Legal disclaimer, trademark notice, and modal
│   ├── MiscView.tsx            # Silver points, Cat food, Epoch name, playtime
│   ├── Sidebar.tsx             # Responsive drawer (width: 270px) with Power Pudu branding
│   └── SlotSelectDialog.tsx    # First-screen modal to choose from Slots 1, 2, or 3
└── lib/save/
    ├── checksum.ts             # 32-bit slot sum implementation
    ├── constants.ts            # Offsets, strides, and memory layouts
    ├── demo.ts                 # Valid 64 KB test save generator
    ├── encoding.ts             # Shift-JIS encoder/decoder with Zenkaku conversion
    ├── fileHandler.ts          # File I/O, blob generation, DeSmuME footer preservation
    ├── itemNames.ts            # All 347 game items across 6 categories
    ├── parser.ts               # Binary parser & serializer with checksum recalculation
    ├── saveLocations.ts        # All 63 in-game save point locations with official EN/FR/JA names
    └── types.ts                # TypeScript interfaces for SaveDocument, SlotData, etc.
```

### Layout Caveat (Drawer Margin)
- MUI's `<Drawer variant="permanent">` in a flex container automatically takes up its width (`270px`).
- **Never** add `marginLeft: 270px` on the main content container sibling, as this doubles the margin and creates a blank void.

### View Transitions & Performance Architecture
- **View Transitions API**: Tab switches (`handleSelectTab`), slot switches (`handleSelectSlot`), and resets wrap state changes in `startViewTransitionSafe`.
- **Accessibility Routing**: Programmatically routes focus to `#main-view-container` (`tabIndex={-1}`) upon transition completion so assistive tech preserves navigation context.
- **Motion Preference**: `index.html` includes `@media (prefers-reduced-motion: reduce)` disabling view transition animations for sensitive users.
- **Code Splitting**: `CharactersView`, `InventoryView`, and `MiscView` are lazy-loaded on demand via `React.lazy` with `<Suspense>`.
- **Bundle Chunking**: `vite.config.ts` splits `@mui/material` (`mui-core`), `@mui/icons-material` (`mui-icons`), and `react-vendor` separately, keeping all bundles under 360 kB.

---

## 5. Development & Verification Commands

```bash
# Run test suite (16 tests verifying parsing, serialization, and round-trips)
npm test

# Build application for production (runs tsc --noEmit && vite build)
npm run build

# Start local dev server
npm run dev
```

*Note: `package.json` must always retain `"type": "module"` to prevent Vite from falling back to deprecated CommonJS Node APIs.*
