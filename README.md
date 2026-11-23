# Egg of Time — Save Editor

[![Support me on Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/powerpudu)

**A modern, client-side save editor for *Chrono Trigger* on Nintendo DS**, running natively in your web browser.

Egg of Time Save Editor allows you to inspect, modify, and enhance your cartridge and emulator save files with multi-slot support, automated 32-bit checksum calculations, full inventory control across all 347 items, character attribute tweaking, and one-click quick boosts.

> [!IMPORTANT]
> **Always back up your saves.** Keep an untouched copy of your original `.sav`, `.dsv`, `.dst`, or `.duc` file before applying edits. While this tool recalculates authentic 32-bit checksums to protect against corruption, I assume no responsibility for lost progress or damaged files.

## Disclaimers

- This is an unofficial fan project created by Power Pudu, not affiliated with, endorsed by, or sponsored by Square Enix or Nintendo. *Chrono Trigger* is a registered trademark of Square Enix Co., Ltd.
- **No copyrighted game data is distributed.** This application contains no ROM dumps, no proprietary game binaries, and no copyrighted assets. All file reading, decoding, and writing occurs strictly client-side on your own machine.
- **AI-Assisted Project:** This project was developed with the assistance of artificial intelligence tools for code generation, architecture planning, reverse-engineering analysis, and documentation. All reverse-engineered game structures and save offsets are tested and verified.

## Supported Save Formats

Egg of Time Save Editor works directly with saves from real hardware, Action Replay devices, and all major DS emulators:

| Format | Source | Description |
|---|---|---|
| `.sav` | Flashcarts & Hardware | Standard 64 KB raw battery save dump |
| `.dsv` | DeSmuME | 64 KB save with trailing DeSmuME metadata footer (preserved on export) |
| `.sav` | melonDS / NO$GBA | Direct battery saves |
| `.dst` / `.duc` | Action Replay DS / Datel | Container format with 500-byte ARDS header and trailing padding (preserved on export) |

The editor automatically identifies the file format, preserves container headers and emulator footers byte-for-byte, and recalculates the slot's native 32-bit additive checksum on download so your game boots with zero corruption.

## Features

### 3 Slots Support
Chrono Trigger DS stores up to three independent adventures within a single 64 KB cartridge file. When loading a file, Egg of Time Save Editor presents a dedicated slot selection screen first, displaying:
- Party leader portrait and name
- Adventure playtime (hours and minutes)
- Recorded gold counter
- Active battle party formation

Switch between Slot 1, Slot 2, and Slot 3 at any time using the header switcher.

### Quick Boosts & Cheats
- **Max Gold**: Instantly sets your pouch to 9,999,999 G.
- **Max Items x99**: Sets all consumable items (Potions, Ethers, Elixirs, Megalixirs, Shelters, Lapis, and Stat Tabs) to x99.
- **Max 7 Heroes**: Boosts all seven playable characters to Level 99 with 999 HP, 99 MP, and 99 in all stats (Speed capped safely at 16, the engine maximum).
- **Max Fair & Food**: Sets Norstein Bekkler's tent Silver Points to 255 and domestic Cat Food to 255 lbs.
- **Unlock Gear**: Grants one of every Weapon, Armor, Helmet, and Accessory in the game.

### Party & Character Management
- **Full Roster**: Manage Crono, Marle, Lucca, Robo, Frog, Ayla, and Magus.
- **Zenkaku Name Encoding**: Edit character names up to 5 characters with automatic conversion to native full-width Shift-JIS text, preventing text clipping in-game.
- **Vitals & Stats**: Adjust Level (1–99), EXP, current/max HP (1–999), current/max MP (1–99), and core battle parameters: Power, Stamina, Speed (1–16), Magic, Hit, Evade, and Magic Defense.
- **Formation Selector**: Reorder your three active party members and designate the team leader.

### Complete Inventory (347 Items)
Every item from the Nintendo DS release is cataloged and editable:
- **Categories**: Weapons (111), Armor (50), Helmets (39), Accessories (59), Items / Consumables (43), and Key Items (45).
- **Live Search & Filters**: Filter by item name or category, or toggle "Show Owned Only".
- **Fine Quantity Adjustments**: Quick -1/+1 steppers, direct numeric input, or quick "Set to 99" buttons.

### Mini-Games & Story Entities
- **Millennial Fair**: Adjust Silver Points for Norstein Bekkler's tent mini-games.
- **Cat Breeding**: Modify Crono's house Cat Food supply.
- **Story Entity Names**: Rename the Epoch time machine (*Wings of Time*) and Princess Nadia (*Marle's royal title*).
- **Playtime & Save Counters**: Customize recorded elapsed adventure time and total save counts.

## Development & Building

The application is built with React 18, TypeScript, and Material UI (MUI v9), bundled using Vite.

### Prerequisites
- Node.js 18 or newer
- npm or pnpm

### Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/power-pudu/egg-of-time-save-editor.git
   cd egg-of-time-save-editor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development server:
   ```bash
   npm run dev
   ```

4. Run unit test suite:
   ```bash
   npm test
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## License

Egg of Time Save Editor is free software licensed under the **GNU General Public License v3.0**. See [LICENSE.md](LICENSE.md) for details.

## Credits & Thanks

- Built with [React](https://react.dev), [Vite](https://vitejs.dev), and [Material UI](https://mui.com)
- UI layout and theme inspired by [SaaSable UI](https://github.com/phoenixcoded/saasable-ui) by Phoenixcoded
- Reverse-engineered memory layouts and offsets documented in [MEMORY.md](MEMORY.md)
