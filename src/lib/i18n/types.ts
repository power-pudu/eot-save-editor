export type Locale = 'en' | 'es' | 'pt' | 'fr' | 'ja' | 'zh'

export interface LocaleMeta {
  code: Locale
  label: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LOCALES: LocaleMeta[] = [
  { code: 'en', label: 'English', nativeName: 'English', flag: 'US' },
  { code: 'es', label: 'Spanish', nativeName: 'Español', flag: 'ES' },
  { code: 'pt', label: 'Portuguese', nativeName: 'Português', flag: 'PT' },
  { code: 'fr', label: 'French', nativeName: 'Français', flag: 'FR' },
  { code: 'ja', label: 'Japanese', nativeName: '日本語', flag: 'JA' },
  { code: 'zh', label: 'Simplified Chinese', nativeName: '简体中文', flag: 'ZH' },
]

export interface Translations {
  // Navigation & General
  nav: {
    dashboard: string
    characters: string
    inventory: string
    story: string
    storySubtitle: string
    misc: string
    appTitle: string
    appSubtitle: string
    version: string
    anotherProjectFrom: string
  }
  // Top App Bar
  topBar: {
    selectSlot: string
    editingSlot: string
    slotNum: string
    switchSlot: string
    reset: string
    downloadSave: string
    lightMode: string
    darkMode: string
    language: string
  }
  // Welcome / Landing
  landing: {
    dropzoneTitle: string
    dropzoneSubtitle: string
    supportedFormats: string
    selectFileButton: string
    loadDemoButton: string
    demoNotice: string
    step1Title: string
    step1Desc: string
    step2Title: string
    step2Desc: string
    step3Title: string
    step3Desc: string
  }
  // Slot Select Dialog
  slotDialog: {
    title: string
    subtitle: string
    slot: string
    empty: string
    active: string
    noSaveData: string
    unusedSlot: string
    partyLeader: string
    gold: string
    playtime: string
    location: string
    party: string
    editingSlot: string
    selectSlot: string
  }
  // Dashboard
  dashboard: {
    quickBoostsTitle: string
    quickBoostsSubtitle: string
    maxGold: string
    maxGoldDesc: string
    maxConsumables: string
    maxConsumablesDesc: string
    maxAllHeroes: string
    maxAllHeroesDesc: string
    maxMiniGames: string
    maxMiniGamesDesc: string
    unlockAllGear: string
    unlockAllGearDesc: string
    uninitializedNotice: string
    goldTitle: string
    goldSubtitle: string
    playtimeTitle: string
    playtimeSubtitle: string
    saveCountTitle: string
    saveCountSubtitle: string
    activePartyTitle: string
    activePartySubtitle: string
    editInCharacters: string
    toastMaxGold: string
    toastMaxConsumables: string
    toastMaxHeroes: string
    toastMaxMiniGames: string
    toastUnlockGear: string
  }
  // Characters View
  characters: {
    rosterTitle: string
    partyFormationTitle: string
    slot1Leader: string
    slot2Member: string
    slot3Member: string
    restoreHpMp: string
    maxCharacter: string
    nameLabel: string
    nameHelper: string
    levelLabel: string
    expLabel: string
    maxLevelReached: string
    expUntilNext: string
    autoUpdatedExp: string
    autoUpdatedLevel: string
    expUpdatedMsg: string
    levelUpdatedMsg: string
    hpTitle: string
    mpTitle: string
    currentHp: string
    maxHp: string
    currentMp: string
    maxMp: string
    battleAttributes: string
    power: string
    stamina: string
    speed: string
    magic: string
    hit: string
    evade: string
    magicDef: string
  }
  // Inventory View
  inventory: {
    title: string
    subtitle: string
    searchPlaceholder: string
    showOwnedOnly: string
    itemsOwned: string
    page: string
    prevPage: string
    nextPage: string
    noItemsFound: string
    clearFilters: string
    set99: string
    clear: string
    catAll: string
    catWeapons: string
    catArmor: string
    catHelmets: string
    catAccessories: string
    catConsumables: string
    catKeyItems: string
  }
  // Misc View
  misc: {
    fairTitle: string
    fairSubtitle: string
    maxFairAndFood: string
    silverPointsTitle: string
    silverPointsDesc: string
    silverPointsLabel: string
    catFoodTitle: string
    catFoodDesc: string
    catFoodLabel: string
    storyEntitiesTitle: string
    storyEntitiesSubtitle: string
    epochTitle: string
    epochDesc: string
    epochLabel: string
    nadiaTitle: string
    nadiaDesc: string
    nadiaLabel: string
    timeAndSaveTitle: string
    timeAndSaveSubtitle: string
    playtimeHours: string
    playtimeMinutes: string
    saveCountLabel: string
    locationTitle: string
    locationSubtitle: string
    locationCurrentLabel: string
    locationPickerLabel: string
    locationPickerPlaceholder: string
    locationOther: string
    locationNoEra: string
    locationHelpText: string
    locationSoftlockWarning: string
  }
  // Story Flags View
  flags: {
    title: string
    subtitle: string
    searchPlaceholder: string
    checkedOnly: string
    checkedBadge: string
    helpText: string
    noFlagsFound: string
    flagsCount: string
  }
  // Legal Footer
  footer: {
    backupWarning: string
    trademark: string
    privacyNotice: string
    legalModalTitle: string
    close: string
  }
}
