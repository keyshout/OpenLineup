import * as domtoimage_module from 'dom-to-image-more';
const domtoimage = domtoimage_module.default || domtoimage_module;

// State
let appState = {
  language: 'tr', // default language
  activeClub: null,
  squad: [],
  formation: '4-3-3',
  lineup: {}, // slotIndex -> player object
  activeSlotIndex: null, // The slot currently being populated
  activeTool: 'settings', // default tool
  showClubBadge: false,
  showCenterBadge: true,
  showNationBadge: true,
  viewMode: 'jerseys', // 'faces', 'jerseys', 'basic'
  captainId: null, // ID of the player currently selected as captain
  jerseyColors: {
    primary: '#ffd700', // Yellow
    secondary: '#ffffff',
    tertiary: '#ffffff',
    gkPrimary: '#5effae', // Matches the Save button color
    gkTertiary: '#ffffff',
    basicCardColor: '#ffd700' // Yellow
  },
  fantasia: {
    playerCount: 11,
    cardMode: 'jerseys',
    is3d: true,
    squadTitle: '',
    captainId: null,
    jerseyStyle: 'solid',
    colors: {
      primary: '#ff0055',
      secondary: '#ffffff',
      tertiary: '#ffffff',
      gkPrimary: '#ffffff',
      gkTertiary: '#000000',
      basicCardColor: '#ffffff'
    }
  }
};

// ==========================================
// Translations (i18n)
// ==========================================
const translations = {
  en: {
    modeFaces: "Player Faces",
    modeJerseys: "Jerseys",
    modeBasic: "Basic Cards",
    clubBadgeLabel: "Club Badge",
    searchPlaceholder: "Search team...",
    formationLabel: "Formation",
    squadTitleLabel: "Squad Title",
    squadTitlePlaceholder: "Enter title...",
    subtitleLabel: "Subtitle",
    subtitlePlaceholder: "Enter subtitle...",
    toggle3dPitch: "3D Pitch Design",
    toggleClubBadge: "Display club badge",
    toggleCenterBadge: "Display center club badge",
    toggleNationBadge: "Display nationality badge",
    saveShareBtn: "Save & Share",
    saveLocalBtn: "Save (Download)",
    shareXBtn: "Share to X",
    captainLabel: "Captain",
    noCaptain: "None",
    jerseySettingsTitle: "Jersey Settings",
    primaryColor: "Primary Color",
    secondaryColor: "Secondary Color",
    tertiaryColor: "Collar Color",
    gkJerseyStyle: "GK Style",
    gkPrimaryColor: "GK Primary Color",
    gkTertiaryColor: "GK Collar Color",
    basicCardColor: "Basic Card Color",
    basicCardSettingsTitle: "Basic Card Settings",
    selectClubFirst: "Please search and select a club first!",
    jerseyStyle: "Style",
    styleSolid: "Solid",
    styleStriped: "Striped",
    styleHooped: "Hooped",
    styleHalved: "Halved",
    selectPlayerTitle: "Select Player",
    filterSquadPlaceholder: "Filter squad...",
    loadingSquad: "Loading squad...",
    enterPlayerNameTitle: "Enter Player Name",
    playerNamePlaceholder: "Player Name (e.g. Ronaldinho)",
    kitNumberPlaceholder: "Kit Number (e.g. 10)",
    clearSlotBtn: "Clear Slot",
    saveBtn: "Save",
    toolGeneralSettings: "General Settings",
    toolJerseySettings: "Jersey Settings",
    toolMove: "Move",
    failedToLoadSquad: "Failed to load squad",
    noClubsFound: "No clubs found",
    imageCopied: "Lineup image copied to clipboard! Just paste (Ctrl+V or Cmd+V) it into your Tweet.",
    copyBlocked: "Could not copy image automatically. Your browser might block this feature. Try right-clicking the generated image.",
    captureError: "Could not create image, but you can still share the text.",
    // Fantasia
    modeFantasia: "Fantasia",
    toolFantasiaSettings: "Fantasia Settings",
    playerCountLabel: "Player Count",
    cardModeLabel: "Card Mode"
  },
  tr: {
    modeFaces: "Oyuncu Resimleri",
    modeJerseys: "Formalar",
    modeBasic: "Basit Kartlar",
    clubBadgeLabel: "Kulüp Logosu",
    searchPlaceholder: "Takım ara...",
    formationLabel: "Diziliş",
    squadTitleLabel: "Kadro Başlığı",
    squadTitlePlaceholder: "Başlık girin...",
    subtitleLabel: "Alt Başlık",
    subtitlePlaceholder: "Alt başlık girin...",
    toggle3dPitch: "3D Saha Tasarımı",
    toggleClubBadge: "Kulüp logosunu göster",
    toggleCenterBadge: "Saha ortası logoyu göster",
    toggleNationBadge: "Ülke bayrağını göster",
    saveShareBtn: "Kaydet & Paylaş",
    saveLocalBtn: "Kaydet (İndir)",
    shareXBtn: "𝕏 Paylaş",
    captainLabel: "Kaptan",
    noCaptain: "Yok",
    jerseySettingsTitle: "Forma Ayarları",
    primaryColor: "Ana Renk",
    secondaryColor: "İkinci Renk",
    tertiaryColor: "Yaka Rengi",
    gkJerseyStyle: "GK Tarzı",
    gkPrimaryColor: "GK Ana Renk",
    gkTertiaryColor: "GK Yaka Rengi",
    basicCardColor: "Basit Kart Rengi",
    basicCardSettingsTitle: "Basit Kart Ayarları",
    selectClubFirst: "Lütfen önce bir kulüp arayıp seçin!",
    jerseyStyle: "Forma Tarzı",
    styleSolid: "Düz",
    styleStriped: "Çizgili",
    styleHooped: "Enine Çizgili",
    styleHalved: "Parçalı",
    selectPlayerTitle: "Oyuncu Seç",
    filterSquadPlaceholder: "Kadroda ara...",
    loadingSquad: "Kadro yükleniyor...",
    enterPlayerNameTitle: "Oyuncu Adı Girin",
    playerNamePlaceholder: "Oyuncu Adı (örn. Hagi)",
    kitNumberPlaceholder: "Forma Nu (örn. 10)",
    clearSlotBtn: "Temizle",
    saveBtn: "Kaydet",
    toolGeneralSettings: "Genel Ayarlar",
    toolJerseySettings: "Forma Ayarları",
    toolMove: "Taşı",
    failedToLoadSquad: "Kadro yüklenemedi",
    noClubsFound: "Kulüp bulunamadı",
    imageCopied: "Kadro görseli kopyalandı! Panoya yapıştırarak (Ctrl+V) paylaşabilirsiniz.",
    copyBlocked: "Görsel otomatik kopyalanamadı. Tarayıcı izin vermiyor olabilir, görsele sağ tıklayıp manuel kopyalamayı deneyin.",
    captureError: "Görsel oluşturulamadı, ancak metni paylaşabilirsiniz.",
    // Fantasia
    modeFantasia: "Fantasia",
    toolFantasiaSettings: "Fantasia Ayarları",
    playerCountLabel: "Oyuncu Sayısı",
    cardModeLabel: "Kart Türü"
  }
};

function setLanguage(lang) {
  appState.language = lang;
  const t = translations[lang];
  if (!t) return;

  // Update text content
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (t[key]) {
      el.textContent = t[key];
    }
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (t[key]) {
      el.setAttribute('placeholder', t[key]);
    }
  });

  // Update titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    if (t[key]) {
      el.setAttribute('title', t[key]);
    }
  });

  // Update active state on language buttons
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  document.getElementById(`lang-${lang}`).classList.add('active');
}

// Language Button Listeners
document.getElementById('lang-tr')?.addEventListener('click', () => setLanguage('tr'));
document.getElementById('lang-en')?.addEventListener('click', () => setLanguage('en'));


const formations = {
  '4-3-3': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 65, label: 'LB' },
      { id: 2, x: 38, y: 65, label: 'CB' },
      { id: 3, x: 62, y: 65, label: 'CB' },
      { id: 4, x: 84, y: 65, label: 'RB' },
      { id: 5, x: 50, y: 45, label: 'CDM' },
      { id: 6, x: 25, y: 45, label: 'CM' },
      { id: 7, x: 75, y: 45, label: 'CM' },
      { id: 8, x: 16, y: 20, label: 'LW' },
      { id: 9, x: 50, y: 20, label: 'ST' },
      { id: 10, x: 84, y: 20, label: 'RW' },
    ]
  },
  '4-4-2': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 65, label: 'LB' },
      { id: 2, x: 38, y: 65, label: 'CB' },
      { id: 3, x: 62, y: 65, label: 'CB' },
      { id: 4, x: 84, y: 65, label: 'RB' },
      { id: 5, x: 16, y: 40, label: 'LM' },
      { id: 6, x: 38, y: 40, label: 'CM' },
      { id: 7, x: 62, y: 40, label: 'CM' },
      { id: 8, x: 84, y: 40, label: 'RM' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },
  '3-5-2': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 20, y: 65, label: 'CB' },
      { id: 2, x: 50, y: 65, label: 'CB' },
      { id: 3, x: 80, y: 65, label: 'CB' },
      { id: 4, x: 16, y: 40, label: 'LWB' },
      { id: 5, x: 30, y: 45, label: 'CM' },
      { id: 6, x: 50, y: 35, label: 'CAM' },
      { id: 7, x: 70, y: 45, label: 'CM' },
      { id: 8, x: 84, y: 40, label: 'RWB' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },
  '4-2-3-1': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 72, label: 'CB' },
      { id: 3, x: 62, y: 72, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 38, y: 52, label: 'CDM' },
      { id: 6, x: 62, y: 52, label: 'CDM' },
      { id: 7, x: 16, y: 32, label: 'LAM' },
      { id: 8, x: 50, y: 35, label: 'CAM' },
      { id: 9, x: 84, y: 32, label: 'RAM' },
      { id: 10, x: 50, y: 20, label: 'ST' },
    ]
  },
  '3-4-3': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 20, y: 65, label: 'CB' },
      { id: 2, x: 50, y: 65, label: 'CB' },
      { id: 3, x: 80, y: 65, label: 'CB' },
      { id: 4, x: 16, y: 45, label: 'LM' },
      { id: 5, x: 38, y: 45, label: 'CM' },
      { id: 6, x: 62, y: 45, label: 'CM' },
      { id: 7, x: 84, y: 45, label: 'RM' },
      { id: 8, x: 20, y: 20, label: 'LW' },
      { id: 9, x: 50, y: 20, label: 'ST' },
      { id: 10, x: 80, y: 20, label: 'RW' },
    ]
  },
  '4-1-4-1': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 70, label: 'CB' },
      { id: 3, x: 62, y: 70, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 50, y: 55, label: 'CDM' },
      { id: 6, x: 16, y: 40, label: 'LM' },
      { id: 7, x: 38, y: 40, label: 'CM' },
      { id: 8, x: 62, y: 40, label: 'CM' },
      { id: 9, x: 84, y: 40, label: 'RM' },
      { id: 10, x: 50, y: 20, label: 'ST' },
    ]
  },
  '4-3-2-1': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 72, label: 'CB' },
      { id: 3, x: 62, y: 72, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 22, y: 50, label: 'CM' },
      { id: 6, x: 50, y: 52, label: 'CM' },
      { id: 7, x: 78, y: 50, label: 'CM' },
      { id: 8, x: 30, y: 30, label: 'AM' },
      { id: 9, x: 70, y: 30, label: 'AM' },
      { id: 10, x: 50, y: 20, label: 'ST' },
    ]
  },
  '5-3-2': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 65, label: 'LWB' },
      { id: 2, x: 30, y: 70, label: 'CB' },
      { id: 3, x: 50, y: 70, label: 'CB' },
      { id: 4, x: 70, y: 70, label: 'CB' },
      { id: 5, x: 84, y: 65, label: 'RWB' },
      { id: 6, x: 25, y: 45, label: 'CM' },
      { id: 7, x: 50, y: 45, label: 'CM' },
      { id: 8, x: 75, y: 45, label: 'CM' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },
  '4-4-2-diamond': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 70, label: 'CB' },
      { id: 3, x: 62, y: 70, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 50, y: 55, label: 'CDM' },
      { id: 6, x: 20, y: 40, label: 'LM' },
      { id: 7, x: 80, y: 40, label: 'RM' },
      { id: 8, x: 50, y: 30, label: 'CAM' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },
  '4-1-2-1-2': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 70, label: 'CB' },
      { id: 3, x: 62, y: 70, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 50, y: 55, label: 'CDM' },
      { id: 6, x: 25, y: 42, label: 'CM' },
      { id: 7, x: 75, y: 42, label: 'CM' },
      { id: 8, x: 50, y: 30, label: 'CAM' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },
  '3-4-2-1': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 20, y: 65, label: 'CB' },
      { id: 2, x: 50, y: 65, label: 'CB' },
      { id: 3, x: 80, y: 65, label: 'CB' },
      { id: 4, x: 16, y: 45, label: 'LM' },
      { id: 5, x: 38, y: 45, label: 'CM' },
      { id: 6, x: 62, y: 45, label: 'CM' },
      { id: 7, x: 84, y: 45, label: 'RM' },
      { id: 8, x: 30, y: 25, label: 'AM' },
      { id: 9, x: 70, y: 25, label: 'AM' },
      { id: 10, x: 50, y: 20, label: 'ST' },
    ]
  },
  '5-4-1': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 65, label: 'LWB' },
      { id: 2, x: 30, y: 70, label: 'CB' },
      { id: 3, x: 50, y: 70, label: 'CB' },
      { id: 4, x: 70, y: 70, label: 'CB' },
      { id: 5, x: 84, y: 65, label: 'RWB' },
      { id: 6, x: 16, y: 40, label: 'LM' },
      { id: 7, x: 38, y: 40, label: 'CM' },
      { id: 8, x: 62, y: 40, label: 'CM' },
      { id: 9, x: 84, y: 40, label: 'RM' },
      { id: 10, x: 50, y: 20, label: 'ST' },
    ]
  },
  '4-2-4': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 70, label: 'CB' },
      { id: 3, x: 62, y: 70, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 38, y: 45, label: 'CM' },
      { id: 6, x: 62, y: 45, label: 'CM' },
      { id: 7, x: 16, y: 20, label: 'LW' },
      { id: 8, x: 84, y: 20, label: 'RW' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },
  '4-2-2-2': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 70, label: 'CB' },
      { id: 3, x: 62, y: 70, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 38, y: 50, label: 'CDM' },
      { id: 6, x: 62, y: 50, label: 'CDM' },
      { id: 7, x: 20, y: 30, label: 'LAM' },
      { id: 8, x: 80, y: 30, label: 'RAM' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },

  '4-5-1': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 70, label: 'CB' },
      { id: 3, x: 62, y: 70, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 16, y: 45, label: 'LM' },
      { id: 6, x: 38, y: 45, label: 'CM' },
      { id: 7, x: 50, y: 45, label: 'CM' },
      { id: 8, x: 62, y: 45, label: 'CM' },
      { id: 9, x: 84, y: 45, label: 'RM' },
      { id: 10, x: 50, y: 20, label: 'ST' },
    ]
  },
  '4-4-1-1': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 70, label: 'CB' },
      { id: 3, x: 62, y: 70, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 16, y: 48, label: 'LM' },
      { id: 6, x: 38, y: 48, label: 'CM' },
      { id: 7, x: 62, y: 48, label: 'CM' },
      { id: 8, x: 84, y: 48, label: 'RM' },
      { id: 9, x: 50, y: 32, label: 'CF' },
      { id: 10, x: 50, y: 20, label: 'ST' },
    ]
  },
  '4-3-1-2': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 70, label: 'CB' },
      { id: 3, x: 62, y: 70, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 25, y: 48, label: 'CM' },
      { id: 6, x: 50, y: 48, label: 'CM' },
      { id: 7, x: 75, y: 48, label: 'CM' },
      { id: 8, x: 50, y: 32, label: 'CAM' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },
  '4-1-3-2': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 70, label: 'LB' },
      { id: 2, x: 38, y: 70, label: 'CB' },
      { id: 3, x: 62, y: 70, label: 'CB' },
      { id: 4, x: 84, y: 70, label: 'RB' },
      { id: 5, x: 50, y: 56, label: 'CDM' },
      { id: 6, x: 20, y: 42, label: 'LM' },
      { id: 7, x: 50, y: 42, label: 'CM' },
      { id: 8, x: 80, y: 42, label: 'RM' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },
  '3-4-1-2': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 20, y: 65, label: 'CB' },
      { id: 2, x: 50, y: 65, label: 'CB' },
      { id: 3, x: 80, y: 65, label: 'CB' },
      { id: 4, x: 16, y: 45, label: 'LM' },
      { id: 5, x: 38, y: 45, label: 'CM' },
      { id: 6, x: 62, y: 45, label: 'CM' },
      { id: 7, x: 84, y: 45, label: 'RM' },
      { id: 8, x: 50, y: 30, label: 'CAM' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },
  '3-1-4-2': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 20, y: 65, label: 'CB' },
      { id: 2, x: 50, y: 65, label: 'CB' },
      { id: 3, x: 80, y: 65, label: 'CB' },
      { id: 4, x: 50, y: 52, label: 'CDM' },
      { id: 5, x: 16, y: 38, label: 'LM' },
      { id: 6, x: 38, y: 38, label: 'CM' },
      { id: 7, x: 62, y: 38, label: 'CM' },
      { id: 8, x: 84, y: 38, label: 'RM' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  },
  '5-2-3': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 65, label: 'LWB' },
      { id: 2, x: 30, y: 70, label: 'CB' },
      { id: 3, x: 50, y: 70, label: 'CB' },
      { id: 4, x: 70, y: 70, label: 'CB' },
      { id: 5, x: 84, y: 65, label: 'RWB' },
      { id: 6, x: 38, y: 45, label: 'CM' },
      { id: 7, x: 62, y: 45, label: 'CM' },
      { id: 8, x: 20, y: 20, label: 'LW' },
      { id: 9, x: 50, y: 20, label: 'ST' },
      { id: 10, x: 80, y: 20, label: 'RW' },
    ]
  },
  '5-2-1-2': {
    nodes: [
      { id: 0, x: 50, y: 84, label: 'GK' },
      { id: 1, x: 16, y: 65, label: 'LWB' },
      { id: 2, x: 30, y: 70, label: 'CB' },
      { id: 3, x: 50, y: 70, label: 'CB' },
      { id: 4, x: 70, y: 70, label: 'CB' },
      { id: 5, x: 84, y: 65, label: 'RWB' },
      { id: 6, x: 38, y: 48, label: 'CM' },
      { id: 7, x: 62, y: 48, label: 'CM' },
      { id: 8, x: 50, y: 32, label: 'CAM' },
      { id: 9, x: 38, y: 20, label: 'ST' },
      { id: 10, x: 62, y: 20, label: 'ST' },
    ]
  }
};

// ==========================================
// Static Fallback Helpers (For GitHub Pages Deployment)
// ==========================================
let staticDB = null; // Will now hold the SQL.Database instance

async function getStaticDB() {
  if (staticDB) return staticDB;
  try {
    // Fetch the SQLite file as an ArrayBuffer
    const response = await fetch('./data/database.sqlite');
    if (!response.ok) throw new Error("SQLite DB Download Failed");
    const buffer = await response.arrayBuffer();

    // Initialize sql.js - Fetch wasm from CDN to avoid MIME type or Vite bundling issues
    const SQL = await window.initSqlJs({
      locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
    });

    // Create database instance from the buffer
    staticDB = new SQL.Database(new Uint8Array(buffer));
    console.log("✅ SQLite Database loaded successfully into memory.");

  } catch (err) {
    console.warn("Could not load SQLite fallback database", err);
  }
  return staticDB;
}

function getSafeImageUrl(url) {
  if (!url) return '';
  // If the URL is already a local static path, don't pass it to the proxy
  // Check both absolute '/data' and relative './data' from db.json
  if (url.startsWith('/data')) return '.' + url;
  if (url.startsWith('./data')) return url;

  // Otherwise, use the Node.js backend proxy to bypass CORS
  return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

// DOM Elements
const searchInput = document.getElementById('club-search');
const searchResults = document.getElementById('search-results');
const activeClubCard = document.getElementById('active-club-card');
const formationControls = document.getElementById('formation-controls');
const formationSelect = document.getElementById('formation-select');
const formationNodesContainer = document.getElementById('formation-nodes');
const playerModal = document.getElementById('player-modal');
const closeModalBtn = document.getElementById('close-modal');
const squadList = document.getElementById('squad-list');
const playerSearchFilter = document.getElementById('player-search-filter');
const shareXBtn = document.getElementById('share-x-btn');
const saveLocalBtn = document.getElementById('save-local-btn');
const toggleClubBadge = document.getElementById('toggle-club-badge');
const toggleNationBadge = document.getElementById('toggle-nation-badge');

// Manual Player Modal Elements
const manualPlayerModal = document.getElementById('manual-player-modal');
const closeManualModalBtn = document.getElementById('close-manual-modal');
const manualPlayerNameInput = document.getElementById('manual-player-name');
const manualPlayerNumberInput = document.getElementById('manual-player-number');
const clearManualPlayerBtn = document.getElementById('clear-manual-player');
const saveManualPlayerBtn = document.getElementById('save-manual-player');

const clearClubBtn = document.getElementById('clear-club-btn');

const squadTitleInput = document.getElementById('squad-title-input');
const squadSubtitleInput = document.getElementById('squad-subtitle-input');
const displaySquadTitle = document.getElementById('display-squad-title');
const displaySquadSubtitle = document.getElementById('display-squad-subtitle');
const fanDisplaySquadTitle = document.getElementById('fan-display-squad-title');
const normalTitleDeco = document.getElementById('normal-title-deco');
const captainSelect = document.getElementById('captain-select');
const fanCaptainSelect = document.getElementById('fan-captain-select');

// Initialization
document.addEventListener('DOMContentLoaded', () => {
  setLanguage(appState.language); // Initialize translations
  setupSearch();
  setupFormation();
  setupModal();
  setupSharing();
  setupDragAndDrop();
  setupPitchStyleToggle();
  setupFantasiaSettings();
  setupToolbar();
  setupSquadTextInputs();
  setupViewModeToggle();
  renderPitch();

  // Set initial formation
  document.getElementById('display-formation').textContent = appState.formation;
});

function setupViewModeToggle() {
  const modeBtns = document.querySelectorAll('.mode-toggle .mode-btn');
  modeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      modeBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      btn.classList.add('active');
      // Update state
      if (btn.dataset.view) {
        appState.viewMode = btn.dataset.view;
        renderPitch();

        // Sync with toolbar if fantasia is selected
        if (appState.viewMode === 'fantasia') {
          const fanBtn = document.querySelector('.tool-btn[data-tool="fantasia-settings"]');
          if (fanBtn) fanBtn.click();
        } else {
          // If we leave fantasia mode from top menu but toolbar is on fantasia, switch tool to move/settings
          if (appState.activeTool === 'fantasia-settings') {
            const defBtn = document.querySelector('.tool-btn[data-tool="settings"]');
            if (defBtn) defBtn.click();
          }
        }
      }
    });
  });
}

function setupSquadTextInputs() {
  if (squadTitleInput && displaySquadTitle) {
    squadTitleInput.addEventListener('input', (e) => {
      displaySquadTitle.textContent = e.target.value;
    });
  }
  if (squadSubtitleInput && displaySquadSubtitle) {
    squadSubtitleInput.addEventListener('input', (e) => {
      displaySquadSubtitle.textContent = e.target.value;
    });
  }
}

// Setup Toolbar
function setupToolbar() {
  const toolBtns = document.querySelectorAll('.tool-btn');
  const mainControlsPanel = document.querySelector('.controls-panel:not(#jersey-settings-panel):not(#fantasia-settings-panel)');
  const jerseySettingsPanel = document.getElementById('jersey-settings-panel');
  const fantasiaSettingsPanel = document.getElementById('fantasia-settings-panel');

  toolBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active from all
      toolBtns.forEach(b => b.classList.remove('active'));
      // Add active to clicked
      btn.classList.add('active');

      // Update state
      if (btn.dataset.tool) {
        appState.activeTool = btn.dataset.tool;

        // If clicking another tool while in fantasia mode, sync out of fantasia view
        if (appState.activeTool !== 'fantasia-settings' && appState.viewMode === 'fantasia') {
          const defaultModeBtn = document.querySelector('.mode-btn[data-view="jerseys"]');
          if (defaultModeBtn) defaultModeBtn.click();
        }

        // Toggle UI Panels
        if (appState.activeTool === 'jersey-settings') {
          mainControlsPanel.classList.add('hidden');
          if (fantasiaSettingsPanel) fantasiaSettingsPanel.classList.add('hidden');
          jerseySettingsPanel.classList.remove('hidden');
        } else if (appState.activeTool === 'fantasia-settings') {
          mainControlsPanel.classList.add('hidden');
          jerseySettingsPanel.classList.add('hidden');
          if (fantasiaSettingsPanel) fantasiaSettingsPanel.classList.remove('hidden');

          // Sync with top mode toggle if not already
          if (appState.viewMode !== 'fantasia') {
            const fanModeBtn = document.querySelector('.mode-btn[data-view="fantasia"]');
            if (fanModeBtn) fanModeBtn.click();
          }
        } else if (appState.activeTool === 'settings') {
          jerseySettingsPanel.classList.add('hidden');
          if (fantasiaSettingsPanel) fantasiaSettingsPanel.classList.add('hidden');
          mainControlsPanel.classList.remove('hidden');
        } else {
          // Keep showing main settings for Move/Player tool unless specified otherwise
          jerseySettingsPanel.classList.add('hidden');
          if (fantasiaSettingsPanel) fantasiaSettingsPanel.classList.add('hidden');
          mainControlsPanel.classList.remove('hidden');
        }
      }
    });
  });

  // Setup color input listeners
  const styleInput = document.getElementById('jersey-style-input');
  const pColorInput = document.getElementById('primary-color-input');
  const sColorInput = document.getElementById('secondary-color-input');
  const tColorInput = document.getElementById('tertiary-color-input');
  const basicCardColorInput = document.getElementById('basic-card-color-input');
  const gkPColorInput = document.getElementById('gk-primary-color-input');
  const gkTColorInput = document.getElementById('gk-tertiary-color-input');

  // Initialize values
  if (styleInput) styleInput.value = appState.jerseyStyle || 'solid';
  if (pColorInput) pColorInput.value = appState.jerseyColors.primary;
  if (sColorInput) sColorInput.value = appState.jerseyColors.secondary;
  if (tColorInput) tColorInput.value = appState.jerseyColors.tertiary || '#ffffff';
  if (basicCardColorInput) basicCardColorInput.value = appState.jerseyColors.basicCardColor || '#ffffff';
  if (gkPColorInput) gkPColorInput.value = appState.jerseyColors.gkPrimary;
  if (gkTColorInput) gkTColorInput.value = appState.jerseyColors.gkTertiary || '#ffffff';

  // Add event listeners
  if (styleInput) {
    styleInput.addEventListener('change', (e) => {
      appState.jerseyStyle = e.target.value;
      renderPitch();
    });
  }
  if (pColorInput) {
    pColorInput.addEventListener('input', (e) => {
      appState.jerseyColors.primary = e.target.value;
      renderPitch();
    });
  }
  if (sColorInput) {
    sColorInput.addEventListener('input', (e) => {
      appState.jerseyColors.secondary = e.target.value;
      renderPitch();
    });
  }
  if (tColorInput) {
    tColorInput.addEventListener('input', (e) => {
      appState.jerseyColors.tertiary = e.target.value;
      renderPitch();
    });
  }
  if (basicCardColorInput) {
    basicCardColorInput.addEventListener('input', (e) => {
      appState.jerseyColors.basicCardColor = e.target.value;
      renderPitch();
    });
  }
  if (gkPColorInput) {
    gkPColorInput.addEventListener('input', (e) => {
      appState.jerseyColors.gkPrimary = e.target.value;
      renderPitch();
    });
  }
  if (gkTColorInput) {
    gkTColorInput.addEventListener('input', (e) => {
      appState.jerseyColors.gkTertiary = e.target.value;
      renderPitch();
    });
  }
}

// Setup Pitch Style Toggle
function setupPitchStyleToggle() {
  const toggle3D = document.getElementById('toggle-3d-style');
  const pitchBoard = document.getElementById('pitch-board');

  if (toggle3D && pitchBoard) {
    // Check initial state
    if (toggle3D.checked) {
      pitchBoard.classList.add('style-3d');
    } else {
      pitchBoard.classList.remove('style-3d');
    }

    toggle3D.addEventListener('change', (e) => {
      if (appState.viewMode !== 'fantasia') {
        if (e.target.checked) pitchBoard.classList.add('style-3d');
        else pitchBoard.classList.remove('style-3d');
      }
    });
  }
}

// Setup Fantasia Settings
function setupFantasiaSettings() {
  const fanTitle = document.getElementById('fan-squad-title-input');
  const fanCaptain = document.getElementById('fan-captain-select');
  const fan3dToggle = document.getElementById('fan-toggle-3d-style');
  const fanPlayerCount = document.getElementById('fan-player-count');
  const fanCardMode = document.getElementById('fan-card-mode');

  const fanBasicSettings = document.getElementById('fan-basic-settings');
  const fanJerseySettings = document.getElementById('fan-jersey-settings');

  const fanBasicColor = document.getElementById('fan-basic-color-input');
  const fanJerseyStyle = document.getElementById('fan-jersey-style-input');
  const fanPrimaryColor = document.getElementById('fan-primary-color');
  const fanSecondaryColor = document.getElementById('fan-secondary-color');
  const fanTertiaryColor = document.getElementById('fan-tertiary-color');
  const fanGkPrimary = document.getElementById('fan-gk-primary');
  const fanGkTertiary = document.getElementById('fan-gk-tertiary');

  // Set Initials
  if (fanTitle) fanTitle.value = appState.fantasia.squadTitle;
  if (fan3dToggle) fan3dToggle.checked = appState.fantasia.is3d;
  if (fanPlayerCount) fanPlayerCount.value = appState.fantasia.playerCount;
  if (fanCardMode) fanCardMode.value = appState.fantasia.cardMode;

  if (fanBasicColor) fanBasicColor.value = appState.fantasia.colors.basicCardColor;
  if (fanJerseyStyle) fanJerseyStyle.value = appState.fantasia.jerseyStyle;
  if (fanPrimaryColor) fanPrimaryColor.value = appState.fantasia.colors.primary;
  if (fanSecondaryColor) fanSecondaryColor.value = appState.fantasia.colors.secondary;
  if (fanTertiaryColor) fanTertiaryColor.value = appState.fantasia.colors.tertiary;
  if (fanGkPrimary) fanGkPrimary.value = appState.fantasia.colors.gkPrimary;
  if (fanGkTertiary) fanGkTertiary.value = appState.fantasia.colors.gkTertiary;

  // Mode Toggle Logic
  if (fanCardMode) {
    fanCardMode.addEventListener('change', (e) => {
      appState.fantasia.cardMode = e.target.value;
      if (appState.fantasia.cardMode === 'jerseys') {
        if (fanJerseySettings) fanJerseySettings.classList.remove('hidden');
        if (fanBasicSettings) fanBasicSettings.classList.add('hidden');
      } else {
        if (fanJerseySettings) fanJerseySettings.classList.add('hidden');
        if (fanBasicSettings) fanBasicSettings.classList.remove('hidden');
      }
      if (appState.viewMode === 'fantasia') renderPitch();
    });
  }

  // General Listeners
  if (fanTitle) {
    fanTitle.addEventListener('input', (e) => {
      appState.fantasia.squadTitle = e.target.value;
      if (appState.viewMode === 'fantasia') renderPitch();
    });
  }
  if (fanCaptain) fanCaptain.addEventListener('change', (e) => { appState.fantasia.captainId = e.target.value; if (appState.viewMode === 'fantasia') renderPitch(); });

  if (fan3dToggle) fan3dToggle.addEventListener('change', (e) => {
    appState.fantasia.is3d = e.target.checked;
    const pitchBoard = document.getElementById('pitch-board');
    if (appState.viewMode === 'fantasia' && pitchBoard) {
      if (e.target.checked) pitchBoard.classList.add('style-3d');
      else pitchBoard.classList.remove('style-3d');
    }
  });

  if (fanPlayerCount) fanPlayerCount.addEventListener('change', (e) => {
    appState.fantasia.playerCount = parseInt(e.target.value);
    if (appState.viewMode === 'fantasia') renderPitch();
  });

  // Color & Style Event Listeners
  if (fanBasicColor) fanBasicColor.addEventListener('input', (e) => { appState.fantasia.colors.basicCardColor = e.target.value; if (appState.viewMode === 'fantasia') renderPitch(); });
  if (fanJerseyStyle) fanJerseyStyle.addEventListener('change', (e) => { appState.fantasia.jerseyStyle = e.target.value; if (appState.viewMode === 'fantasia') renderPitch(); });
  if (fanPrimaryColor) fanPrimaryColor.addEventListener('input', (e) => { appState.fantasia.colors.primary = e.target.value; if (appState.viewMode === 'fantasia') renderPitch(); });
  if (fanSecondaryColor) fanSecondaryColor.addEventListener('input', (e) => { appState.fantasia.colors.secondary = e.target.value; if (appState.viewMode === 'fantasia') renderPitch(); });
  if (fanTertiaryColor) fanTertiaryColor.addEventListener('input', (e) => { appState.fantasia.colors.tertiary = e.target.value; if (appState.viewMode === 'fantasia') renderPitch(); });
  if (fanGkPrimary) fanGkPrimary.addEventListener('input', (e) => { appState.fantasia.colors.gkPrimary = e.target.value; if (appState.viewMode === 'fantasia') renderPitch(); });
  if (fanGkTertiary) fanGkTertiary.addEventListener('input', (e) => { appState.fantasia.colors.gkTertiary = e.target.value; if (appState.viewMode === 'fantasia') renderPitch(); });

}

// Drag State
let draggedNode = null;
let dragOffsetX = 0;
let dragOffsetY = 0;
let isDragging = false;
let startDragX = 0;
let startDragY = 0;

function setupDragAndDrop() {
  document.addEventListener('mousemove', onDragMove, { passive: false });
  document.addEventListener('touchmove', onDragMove, { passive: false });
  document.addEventListener('mouseup', onDragEnd);
  document.addEventListener('touchend', onDragEnd);
}

function onDragStart(e, nodeEl) {
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  startDragX = clientX;
  startDragY = clientY;
  isDragging = false;
  draggedNode = nodeEl;

  const rect = nodeEl.getBoundingClientRect();
  dragOffsetX = clientX - rect.left;
  dragOffsetY = clientY - rect.top;

  nodeEl.style.zIndex = 100;
  nodeEl.classList.add('dragging');
}

function onDragMove(e) {
  if (!draggedNode) return;

  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;

  // Threshold to detect actual drag
  if (Math.abs(clientX - startDragX) > 5 || Math.abs(clientY - startDragY) > 5) {
    isDragging = true;
  }

  if (isDragging) {
    e.preventDefault(); // Prevent scrolling on mobile

    // In 3D mode, getBoundingClientRect gives transformed visually distorted coordinates
    // Using a simpler relative movement approach avoids complex 3D CSS Matrix math
    const movementX = clientX - startDragX;
    const movementY = clientY - startDragY;

    // Get current percentages
    const currentLeft = parseFloat(draggedNode.style.left) || 50;
    const currentTop = parseFloat(draggedNode.style.top) || 50;

    const parentRect = formationNodesContainer.getBoundingClientRect();

    // Convert movement to percentages
    // Adjust y-sensitivity subtly if 3D mode is on since perspective squishes the Y axis
    const is3D = document.getElementById('pitch-board').classList.contains('style-3d');
    const yMultiplier = is3D ? 1.2 : 1;

    let newLeft = currentLeft + (movementX / parentRect.width) * 100;
    let newTop = currentTop + ((movementY * yMultiplier) / parentRect.height) * 100;

    // Clamp inside container
    // When 3D mode is active, the pitch visually shrinks due to perspective and padding, so boundaries must be tighter.
    // Limits have been increased to ensure the edges of player nodes (faces, jerseys) do not overlap with the pitch white lines.
    let minX = is3D ? 16 : 12;
    let maxX = is3D ? 84 : 88;
    let minY = is3D ? 20 : 12;
    let maxY = is3D ? 86 : 88;

    newLeft = Math.max(minX, Math.min(maxX, newLeft));
    newTop = Math.max(minY, Math.min(maxY, newTop));

    draggedNode.style.left = `${newLeft}%`;
    draggedNode.style.top = `${newTop}%`;

    // Reset start pos for next move frame
    startDragX = clientX;
    startDragY = clientY;
  }
}

function onDragEnd() {
  if (draggedNode) {
    draggedNode.style.zIndex = '';
    draggedNode.classList.remove('dragging');
    // Minimal delay to ensure click handler doesn't fire immediately after drag
    setTimeout(() => { draggedNode = null; isDragging = false; }, 50);
  }
}

// Setup Sharing (Local Download & X/Twitter)
function setupSharing() {

  // Shared helper function to capture the pitch
  const capturePitch = async (btnElement) => {
    if (!appState.activeClub && appState.viewMode !== 'fantasia') {
      const msg = appState.language === 'tr' ? "Lütfen önce bir takım arayın veya Fantasia moduna geçin!" : "Please search for a team or switch to Fantasia mode first!";
      showToast(msg, 'error');
      return null;
    }

    btnElement.style.opacity = '0.5';
    btnElement.disabled = true;

    try {
      const pitchEl = document.querySelector('.pitch-card'); // Capture the full card, not just wrapper
      const bgColor = getComputedStyle(pitchEl).getPropertyValue('--pitch-bg-outer').trim() || '#131f24';

      const blob = await domtoimage.toBlob(pitchEl, {
        bgcolor: bgColor, // Use the actual theme color
        style: {
          transform: 'scale(2)',
          transformOrigin: 'top left',
          width: pitchEl.offsetWidth + 'px',
          height: pitchEl.offsetHeight + 'px'
        },
        width: pitchEl.offsetWidth * 2,
        height: pitchEl.offsetHeight * 2,
        cacheBust: true,
        allowTaint: true,
        imagePlaceholder: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
      });

      if (!blob) throw new Error("dom-to-image conversion failed");
      return blob;

    } catch (err) {
      console.error("Capture Error:", err);
      showToast(translations[appState.language].captureError, 'error');
      return null;
    } finally {
      btnElement.style.opacity = '1';
      btnElement.disabled = false;
    }
  };

  // 1. Download Local Button
  if (saveLocalBtn) {
    saveLocalBtn.addEventListener('click', async () => {
      const blob = await capturePitch(saveLocalBtn);
      if (!blob) return;

      try {
        const clubName = appState.activeClub ? appState.activeClub.name : (appState.fantasia.squadTitle || 'Fantasia_Squad');
        const filename = `${clubName.replace(/\s+/g, '_')}_Lineup.png`;

        // Trigger download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        // Use a generic success message or add one to translations later
        showToast("Görsel başarıyla kaydedildi!", 'success');
      } catch (err) {
        console.error("Download Error:", err);
      }
    });
  }

  // 2. Share to X Button
  if (shareXBtn) {
    shareXBtn.addEventListener('click', async () => {
      const blob = await capturePitch(shareXBtn);
      if (!blob) return;

      try {
        const clubName = appState.activeClub ? appState.activeClub.name : (appState.fantasia.squadTitle || 'Fantasia Squad');
        const formation = appState.formation;
        const tweetText = `My ${clubName} Starting XI (${formation}) ⚽️🔥`;
        const fallbackText = `${tweetText}\n\n👉 Paste the copied pitch image below! 👇`;
        const xUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fallbackText)}`;

        let copied = false;

        // Try clipboard copy (Requires HTTPS in production, may fail on local HTTP preview)
        if (navigator.clipboard && navigator.clipboard.write) {
          try {
            const clipboardItem = new ClipboardItem({ 'image/png': blob });
            await navigator.clipboard.write([clipboardItem]);
            copied = true;
          } catch (clipErr) {
            console.warn("Clipboard restricted or failed:", clipErr);
          }
        }

        if (copied) {
          const successMsg = appState.language === 'tr' ? "Görsel kopyalandı! Açılan sayfada tweet'e yapıştırın." : "Image copied! Paste it into your tweet.";
          showToast(successMsg, 'success');
        } else {
          const errorMsg = appState.language === 'tr'
            ? "Görsel otomatik kopyalanamadı. Lütfen önce 'İndir' butonunu kullanıp Twitter'a yükleyin."
            : "Could not copy image. Please download it first, then attach to your tweet.";
          showToast(errorMsg, 'error');
        }

        // Open Twitter Intent regardless of clipboard success
        window.open(xUrl, '_blank', 'width=600,height=400');
      } catch (err) {
        console.error("Share failed:", err);
      }
    });
  }
}


// Setup Search
function setupSearch() {
  let debounceTimeout;

  searchInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    const query = e.target.value.trim();

    if (query.length < 3) {
      searchResults.classList.add('hidden');
      return;
    }

    debounceTimeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (!res.ok) throw new Error("API Fetch Error");
        const data = await res.json();
        renderSearchResults(data);
      } catch (err) {
        console.warn("API Search failed, falling back to static SQLite DB");
        const db = await getStaticDB();

        let results = [];
        if (db) {
          try {
            // Execute a SQL query to search clubs by name (case-insensitive), ordered by ID
            const stmt = db.prepare("SELECT * FROM clubs WHERE name LIKE ? ORDER BY id ASC LIMIT 10");
            stmt.bind([`%${query}%`]);

            while (stmt.step()) {
              const row = stmt.getAsObject();
              results.push({
                id: row.id,
                name: row.name,
                image: row.image || row.originalImage
              });
            }
            stmt.free();
          } catch (sqlErr) {
            console.error("SQLite Query Failed:", sqlErr);
          }
        }

        renderSearchResults(results);
      }
    }, 500);
  });

  // Hide dropdown on click outside
  document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
      searchResults.classList.add('hidden');
    }
  });

  if (clearClubBtn) {
    clearClubBtn.addEventListener('click', () => {
      // Reset Club Select UI
      appState.activeClub = null;
      appState.squad = [];

      activeClubCard.classList.add('hidden');
      searchInput.classList.add('hidden'); // Keep search input hidden after clearing club
      searchInput.value = ''; // Clear search input value

      // Show the search input again
      searchInput.classList.remove('hidden');

      updateCenterBadge();
      renderPitch(); // Clear the pitch characters
    });
  }
}

function renderSearchResults(data) {
  if (data.error || !data.length) {
    searchResults.innerHTML = `<div class="search-result-item">${translations[appState.language].noClubsFound}</div>`;
  } else {
    searchResults.innerHTML = data.map(club => `
      <div class="search-result-item" data-id="${club.id}" data-name="${club.name}" data-img="${club.image || ''}">
        ${club.image ? `<img src="${getSafeImageUrl(club.image)}" crossorigin="anonymous" alt="">` : '<div style="width:24px;height:24px;background:#333;border-radius:50%"></div>'}
        <span>${club.name}</span>
      </div>
    `).join('');

    // Add click listeners
    document.querySelectorAll('.search-result-item').forEach(item => {
      item.addEventListener('click', () => {
        if (item.dataset.id) {
          selectClub(item.dataset);
        }
      });
    });
  }
  searchResults.classList.remove('hidden');
}

async function selectClub(clubData) {
  // Update UI and state
  searchResults.classList.add('hidden');

  appState.activeClub = clubData;

  document.getElementById('active-club-logo').src = clubData.img || 'data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=';
  document.getElementById('active-club-name').textContent = clubData.name;

  // Show the pill, hide the text input
  activeClubCard.classList.remove('hidden');
  searchInput.classList.add('hidden');
  formationControls.classList.remove('hidden');

  updateCenterBadge();
  renderPitch(); // Re-render empty pitch

  // Fetch squad
  try {
    const res = await fetch(`/api/squad/${clubData.id}`);
    if (!res.ok) throw new Error("API Fetch Error");
    const squad = await res.json();
    if (squad && !squad.error) {
      appState.squad = squad.filter(player => player.name); // valid players
    } else {
      showToast(translations[appState.language].failedToLoadSquad, 'error');
    }
  } catch (err) {
    console.warn("API Squad failed, falling back to static SQLite DB");
    const db = await getStaticDB();

    let squadResults = [];
    if (db) {
      try {
        const stmt = db.prepare("SELECT * FROM players WHERE club_id = ? ORDER BY id ASC");
        stmt.bind([Number(clubData.id)]);

        while (stmt.step()) {
          const row = stmt.getAsObject();
          if (row.name) squadResults.push(row);
        }
        stmt.free();
      } catch (err) {
        console.error("SQLite Player Fetch Failed:", err);
      }
    }

    if (squadResults.length > 0) {
      appState.squad = squadResults;
    } else {
      showToast(translations[appState.language].failedToLoadSquad, 'error');
    }
  }
}

// Setup Pitch / Formation
function setupFormation() {
  formationSelect.addEventListener('change', (e) => {
    appState.formation = e.target.value;

    // Update the background formation text if it exists
    const displayFormationEl = document.getElementById('display-formation');
    if (displayFormationEl) {
      // Use clean string, remove ' (Christmas Tree)' etc. for display
      displayFormationEl.textContent = appState.formation.split(' ')[0];
    }

    // Do NOT reset lineup, so players remain on the pitch but move to new node positions
    renderPitch();
  });

  if (toggleClubBadge) {
    toggleClubBadge.checked = appState.showClubBadge;
    toggleClubBadge.addEventListener('change', (e) => {
      appState.showClubBadge = e.target.checked;
      renderPitch();
    });
  }

  if (toggleNationBadge) {
    toggleNationBadge.checked = appState.showNationBadge;
    toggleNationBadge.addEventListener('change', (e) => {
      appState.showNationBadge = e.target.checked;
      renderPitch();
    });
  }

  const toggleCenterBadge = document.getElementById('toggle-center-badge');
  if (toggleCenterBadge) {
    toggleCenterBadge.checked = appState.showCenterBadge;
    toggleCenterBadge.addEventListener('change', (e) => {
      appState.showCenterBadge = e.target.checked;
      updateCenterBadge();
    });
  }

  if (captainSelect) {
    captainSelect.addEventListener('change', (e) => {
      appState.captainId = e.target.value;
      renderPitch();
    });
  }

  if (fanCaptainSelect) {
    fanCaptainSelect.addEventListener('change', (e) => {
      appState.captainId = e.target.value;
      renderPitch();
    });
  }
}

function updateCenterBadge() {
  const centerLogo = document.getElementById('pitch-center-logo');
  if (!centerLogo) return;

  if (appState.showCenterBadge && appState.activeClub && appState.activeClub.img) {
    centerLogo.src = getSafeImageUrl(appState.activeClub.img);
    centerLogo.classList.remove('hidden');
  } else {
    centerLogo.classList.add('hidden');
  }
}

function updateCaptainSelect() {
  const currentVal = appState.captainId; // Try to keep same selection if available

  if (captainSelect) {
    captainSelect.innerHTML = `<option value="">${translations[appState.language].noCaptain}</option>`;
  }
  if (fanCaptainSelect) {
    fanCaptainSelect.innerHTML = `<option value="">${translations[appState.language].noCaptain}</option>`;
  }

  // Collect all players currently down in the pitch
  Object.values(appState.lineup).forEach(player => {
    if (player && player.name) {
      const val = player.id || player.name; // Use ID or Name for manual players
      const text = player.name + (player.number ? ` (#${player.number})` : '');

      if (captainSelect) {
        const opt1 = document.createElement('option');
        opt1.value = val;
        opt1.textContent = text;
        captainSelect.appendChild(opt1);
      }
      if (fanCaptainSelect) {
        const opt2 = document.createElement('option');
        opt2.value = val;
        opt2.textContent = text;
        fanCaptainSelect.appendChild(opt2);
      }
    }
  });

  // Re-apply if still in lineup, else clear it
  const isSelectedStillHere = Object.values(appState.lineup).some(p => (p.id || p.name) === currentVal);
  if (isSelectedStillHere && currentVal) {
    if (captainSelect) captainSelect.value = currentVal;
    if (fanCaptainSelect) fanCaptainSelect.value = currentVal;
    appState.captainId = currentVal;
  } else {
    appState.captainId = null;
  }
}

// Helper to determine text color based on background luminance
function getContrastColor(hexColor) {
  // If it's not a valid hex, return black
  if (!/^#[0-9A-F]{6}$/i.test(hexColor)) return '#000000';

  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);

  // Calculate relative luminance
  // using sRGB formula: L = 0.2126 * R + 0.7152 * G + 0.0722 * B
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b);

  // Return white for dark colors, black for light colors
  return luminance > 128 ? '#000000' : '#ffffff';
}

function formatPlayerName(fullName) {
  if (!fullName) return "";
  const parts = fullName.trim().split(" ");
  if (parts.length === 1) return parts[0];

  // Brezilyalı tek isimler veya özel lakaplar (örn: "Fred", "Ederson") 
  // Zaten 1 kelime ise yukarıda dönüyor.

  // Sadece son kelimeyi (Soyad) alalım. "Kevin De Bruyne" -> "De Bruyne" gibi istisnalar için
  // basit bir mantık: Son 2 kelime ikisi de kısaysa birleştir, değilse sadece sonu al.
  // Ama en temizi genellikle: "Jayden Oosterwolde" -> "Oosterwolde"
  const lastName = parts[parts.length - 1];
  const secondToLast = parts[parts.length - 2];

  // "De", "Van", "Di" gibi ön eklere sahip soyisimler
  const prefixes = ["de", "van", "di", "da", "dos", "el", "al"];
  if (parts.length > 2 && prefixes.includes(secondToLast.toLowerCase())) {
    return `${secondToLast} ${lastName}`;
  }

  // Sadece soyisim dönsün ve çok uzunsa kısalsın (CSS halledecek ama JS ile de kısaltabiliriz)
  return lastName;
}

function renderPitch() {
  let formationData = [];

  const displayFormationEl = document.getElementById('display-formation');
  const pitchCenterLogo = document.getElementById('pitch-center-logo');
  const pitchBoard = document.getElementById('pitch-board');
  const dSquadTitle = document.getElementById('display-squad-title');
  const dSquadSubtitle = document.getElementById('display-squad-subtitle');

  if (appState.viewMode === 'fantasia') {
    // Hide formation text, center badge & normal titles in fantasia
    if (displayFormationEl) displayFormationEl.style.display = 'none';
    if (pitchCenterLogo) pitchCenterLogo.style.display = 'none';
    if (normalTitleDeco) normalTitleDeco.style.display = 'none';

    // Show and update Fantasia specific title
    if (fanDisplaySquadTitle) {
      fanDisplaySquadTitle.style.display = '';
      fanDisplaySquadTitle.textContent = appState.fantasia.squadTitle || '';
    }

    // Sync 3D pitch status with fantasia toggle
    if (pitchBoard) {
      if (appState.fantasia.is3d) pitchBoard.classList.add('style-3d');
      else pitchBoard.classList.remove('style-3d');
    }

    // Generate dynamic nodes based on playerCount
    const count = appState.fantasia.playerCount;

    // Simple grid distribution for fantasia (e.g. 5-a-side)
    // Positions will be pre-defined rough estimates for 1 to 11 players
    const layouts = {
      1: [{ x: 50, y: 50, label: 'P1' }],
      2: [{ x: 50, y: 70, label: 'P1' }, { x: 50, y: 30, label: 'P2' }],
      3: [{ x: 50, y: 75, label: 'P1' }, { x: 30, y: 45, label: 'P2' }, { x: 70, y: 45, label: 'P3' }],
      4: [{ x: 50, y: 84, label: 'P1' }, { x: 30, y: 50, label: 'P2' }, { x: 70, y: 50, label: 'P3' }, { x: 50, y: 25, label: 'P4' }],
      5: [{ x: 50, y: 84, label: 'P1' }, { x: 25, y: 60, label: 'P2' }, { x: 75, y: 60, label: 'P3' }, { x: 35, y: 35, label: 'P4' }, { x: 65, y: 35, label: 'P5' }],
      6: [{ x: 50, y: 84, label: 'P1' }, { x: 25, y: 65, label: 'P2' }, { x: 75, y: 65, label: 'P3' }, { x: 25, y: 40, label: 'P4' }, { x: 75, y: 40, label: 'P5' }, { x: 50, y: 20, label: 'P6' }],
      7: [{ x: 50, y: 84, label: 'P1' }, { x: 25, y: 65, label: 'P2' }, { x: 50, y: 65, label: 'P3' }, { x: 75, y: 65, label: 'P4' }, { x: 30, y: 40, label: 'P5' }, { x: 70, y: 40, label: 'P6' }, { x: 50, y: 20, label: 'P7' }],
      8: [{ x: 50, y: 84, label: 'P1' }, { x: 25, y: 65, label: 'P2' }, { x: 75, y: 65, label: 'P3' }, { x: 25, y: 45, label: 'P4' }, { x: 50, y: 45, label: 'P5' }, { x: 75, y: 45, label: 'P6' }, { x: 35, y: 20, label: 'P7' }, { x: 65, y: 20, label: 'P8' }],
      9: [{ x: 50, y: 84, label: 'P1' }, { x: 25, y: 65, label: 'P2' }, { x: 50, y: 60, label: 'P3' }, { x: 75, y: 65, label: 'P4' }, { x: 25, y: 45, label: 'P5' }, { x: 50, y: 40, label: 'P6' }, { x: 75, y: 45, label: 'P7' }, { x: 35, y: 20, label: 'P8' }, { x: 65, y: 20, label: 'P9' }],
      10: [{ x: 50, y: 84, label: 'P1' }, { x: 20, y: 65, label: 'P2' }, { x: 40, y: 65, label: 'P3' }, { x: 60, y: 65, label: 'P4' }, { x: 80, y: 65, label: 'P5' }, { x: 30, y: 45, label: 'P6' }, { x: 50, y: 45, label: 'P7' }, { x: 70, y: 45, label: 'P8' }, { x: 35, y: 25, label: 'P9' }, { x: 65, y: 25, label: 'P10' }],
      11: [{ x: 50, y: 84, label: 'P1' }, { x: 20, y: 65, label: 'P2' }, { x: 40, y: 65, label: 'P3' }, { x: 60, y: 65, label: 'P4' }, { x: 80, y: 65, label: 'P5' }, { x: 25, y: 45, label: 'P6' }, { x: 75, y: 45, label: 'P7' }, { x: 20, y: 20, label: 'P8' }, { x: 50, y: 37, label: 'P9' }, { x: 80, y: 20, label: 'P10' }, { x: 50, y: 20, label: 'P11' }]
    };

    // Add incremental IDs to the layout
    formationData = (layouts[count] || layouts[11]).map((node, index) => ({
      ...node,
      id: index
    }));

  } else {
    // Restore normal 3D pitch status from main toggle
    const toggle3D = document.getElementById('toggle-3d-style');
    if (pitchBoard && toggle3D) {
      if (toggle3D.checked) pitchBoard.classList.add('style-3d');
      else pitchBoard.classList.remove('style-3d');
    }

    // Hide Fantasia title, Restore Normal Titles & Subtitle
    if (fanDisplaySquadTitle) fanDisplaySquadTitle.style.display = 'none';
    if (normalTitleDeco) normalTitleDeco.style.display = '';

    const normTitle = document.getElementById('squad-title-input');
    const normSub = document.getElementById('squad-subtitle-input');
    if (dSquadTitle) dSquadTitle.textContent = normTitle ? normTitle.value : '';
    if (dSquadSubtitle) dSquadSubtitle.textContent = normSub ? normSub.value : '';

    // Restore formation string
    if (displayFormationEl) displayFormationEl.style.display = '';
    // Display center logo check
    if (pitchCenterLogo && appState.showCenterBadge && appState.activeClub && appState.activeClub.img) {
      pitchCenterLogo.style.display = '';
    } else if (pitchCenterLogo) { // Ensure it's hidden if conditions aren't met
      pitchCenterLogo.style.display = 'none';
    }

    formationData = formations[appState.formation].nodes;
  }

  // Create nodes
  formationNodesContainer.innerHTML = formationData.map(node => {
    const player = appState.lineup[node.id];
    const isFilled = !!player;
    const isManual = isFilled && player.isManual;
    const isCaptain = isFilled && (player.id || player.name) === appState.captainId;

    let badgeImages = [];
    if (isFilled) {
      // Show active club badge if toggled
      if (appState.showClubBadge && appState.activeClub && appState.activeClub.img) badgeImages.push({ url: appState.activeClub.img, type: 'club' });
      // Show nation badge if available (only available for squad players, not manuals)
      if (appState.showNationBadge && player.natImage) badgeImages.push({ url: player.natImage, type: 'nation' });
    }

    const number = isFilled ? (player.number || '') : '';
    // Format the name to mostly just show Last Name
    const displayName = isFilled ? formatPlayerName(player.name).toUpperCase() : node.label;

    let nodeInnerHtml = '';

    // Determine which colors to use (Normal or Fantasia)
    const isFantasia = appState.viewMode === 'fantasia';
    const activeColors = isFantasia ? appState.fantasia.colors : appState.jerseyColors;
    const activeStyle = isFantasia ? appState.fantasia.jerseyStyle : appState.jerseyStyle;
    const activeCardMode = isFantasia ? appState.fantasia.cardMode : appState.viewMode;

    if (activeCardMode === 'jerseys') {
      const isGK = isFantasia && node.id === 0 && appState.fantasia.playerCount > 4;
      const isActuallyGK = node.label === 'GK' || (isFantasia && node.id === 0);
      const style = isActuallyGK ? 'solid' : (activeStyle || 'solid');
      const c1 = isActuallyGK ? activeColors.gkPrimary : activeColors.primary;
      const c2 = isActuallyGK ? activeColors.gkPrimary : activeColors.secondary; // Kalecide her yer ana renk
      const c3 = isActuallyGK ? activeColors.gkTertiary : activeColors.tertiary;

      let defsHtml = '';
      let bodyFill = c1;
      let leftSleeve = c2;
      let rightSleeve = c2;

      if (style === 'striped') {
        defsHtml = `
          <defs>
            <pattern id="striped-pattern-${node.id}" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(0)">
              <rect width="6" height="12" fill="${c1}" />
              <rect x="6" width="6" height="12" fill="${c2}" />
            </pattern>
          </defs>
        `;
        bodyFill = `url(#striped-pattern-${node.id})`;
        leftSleeve = c1;
        rightSleeve = c1;
      } else if (style === 'hooped') {
        defsHtml = `
          <defs>
            <pattern id="hooped-pattern-${node.id}" patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(0)">
              <rect width="12" height="6" fill="${c1}" />
              <rect y="6" width="12" height="6" fill="${c2}" />
            </pattern>
          </defs>
        `;
        bodyFill = `url(#hooped-pattern-${node.id})`;
        leftSleeve = c1;
        rightSleeve = c1;
      } else if (style === 'halved') {
        defsHtml = `
          <defs>
            <linearGradient id="halved-pattern-${node.id}" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="50%" stop-color="${c2}" />
              <stop offset="50%" stop-color="${c1}" />
            </linearGradient>
          </defs>
        `;
        bodyFill = `url(#halved-pattern-${node.id})`;
        leftSleeve = c2;
        rightSleeve = c1;
      }

      nodeInnerHtml = `
        <div class="player-jersey">
           <svg viewBox="0 0 100 100" class="jersey-svg" xmlns="http://www.w3.org/2000/svg">
              ${defsHtml}
              <path d="M 35 10 L 25 20 L 30 40 L 25 85 Q 50 95 75 85 L 70 40 L 75 20 L 65 10 Q 50 25 35 10 Z" fill="rgba(0,0,0,0.15)" transform="translate(0, 4)" />
              <path d="M 25 20 L 5 35 L 15 50 L 30 40 Z" fill="${leftSleeve}" />
              <path d="M 75 20 L 95 35 L 85 50 L 70 40 Z" fill="${rightSleeve}" />
              <path d="M 35 10 L 25 20 L 30 40 L 25 85 Q 50 95 75 85 L 70 40 L 75 20 L 65 10 Q 50 25 35 10 Z" fill="${bodyFill}" />
              <path d="M 35 10 Q 50 25 65 10" fill="none" stroke="${c3}" stroke-width="3" stroke-linecap="round" />
           </svg>
           <div class="jersey-content">
             ${isFilled ? `<span class="jersey-number">${number}</span>` : `<span class="jersey-add">+</span>`}
           </div>
        </div>
      `;
    } else if (activeCardMode === 'basic') {
      nodeInnerHtml = `
        <div class="player-basic" style="background-color: ${activeColors.basicCardColor || '#ffffff'} !important;">
          <div class="basic-content" style="color: ${getContrastColor(activeColors.basicCardColor || '#ffffff')} !important;">
            ${isFilled ? `<span class="basic-number">${number}</span>` : `<span class="basic-add">+</span>`}
          </div>
        </div>
      `;
    } else if (activeCardMode === 'faces') {
      const faceImageUrl = isFilled && player.image ? player.image : '';
      nodeInnerHtml = `
        <div class="player-face-container ${isFilled ? 'filled' : ''}">
          ${faceImageUrl ? `<img src="${getSafeImageUrl(faceImageUrl)}" class="player-face" crossorigin="anonymous" onerror="this.src='/favicon.svg'" />` : `<div class="face-placeholder">+</div>`}
        </div>
      `;
    }

    return `
      <div class="player-node mode-${appState.viewMode} ${isFilled ? 'filled' : ''}" 
           style="left: ${node.x}%; top: ${node.y}%;"
           data-id="${node.id}"
           title="${displayName}">
        
        ${isCaptain ? '<div class="captain-badge-overlay">C</div>' : ''}
        ${nodeInnerHtml}
        
        <div class="player-name-pill ${isFilled ? 'active' : ''}">
          ${badgeImages.map(b => `<img class="pill-badge ${b.type === 'nation' ? 'nation-badge' : ''}" src="${getSafeImageUrl(b.url)}" crossorigin="anonymous" onerror="this.style.display='none'" />`).join('')}
          <span class="pill-name">${displayName}</span>
        </div>
      </div>
     `;
  }).join('');

  updateCaptainSelect();

  // Attach pitch node click and drag listeners
  document.querySelectorAll('.player-node').forEach(nodeEl => {

    nodeEl.addEventListener('mousedown', (e) => onDragStart(e, nodeEl));
    nodeEl.addEventListener('touchstart', (e) => onDragStart(e, nodeEl), { passive: true });

    nodeEl.addEventListener('click', (e) => {
      // Ignore click if it was actually a drag
      if (isDragging) {
        e.preventDefault();
        e.stopPropagation();
        return;
      }

      const nodeId = nodeEl.dataset.id;

      // Handle "Text" tool logic (Manual Entry)
      if (appState.activeTool === 'text') {
        const currentName = appState.lineup[nodeId] ? appState.lineup[nodeId].name : '';
        const currentNumber = appState.lineup[nodeId] ? (appState.lineup[nodeId].number || '') : '';
        appState.activeSlotIndex = parseInt(nodeId);

        manualPlayerNameInput.value = currentName;
        manualPlayerNumberInput.value = currentNumber;
        manualPlayerModal.classList.remove('hidden');
        manualPlayerNameInput.focus();
        return;
      }

      // Default "Player" tool logic
      if (appState.activeTool === 'settings' || appState.activeTool === 'jersey-settings' || appState.activeTool === 'player' || appState.activeTool === 'fantasia-settings') {

        // FANTASIA MODE BYPASS
        if (appState.viewMode === 'fantasia') {
          const currentName = appState.lineup[nodeId] ? appState.lineup[nodeId].name : '';
          const currentNumber = appState.lineup[nodeId] ? (appState.lineup[nodeId].number || '') : '';
          appState.activeSlotIndex = parseInt(nodeId);

          manualPlayerNameInput.value = currentName;
          manualPlayerNumberInput.value = currentNumber;
          manualPlayerModal.classList.remove('hidden');
          manualPlayerNameInput.focus();
          return;
        }

        // Removed strict activeClub dependency to allow global player db searching!
        appState.activeSlotIndex = parseInt(nodeId);
        openPlayerModal();
      }
    });
  });
}

// Modal Logic (Standard Player)
function setupModal() {
  closeModalBtn.addEventListener('click', closePlayerModal);
  playerModal.addEventListener('click', (e) => {
    if (e.target === playerModal) closePlayerModal();
  });

  let playerSearchDebounce;
  playerSearchFilter.addEventListener('input', (e) => {
    clearTimeout(playerSearchDebounce);
    playerSearchDebounce = setTimeout(() => {
      renderSquadList(e.target.value);
    }, 400); // 400ms debounce for typing global names
  });

  // Manual Player Modal Events
  closeManualModalBtn.addEventListener('click', closeManualModal);
  manualPlayerModal.addEventListener('click', (e) => {
    if (e.target === manualPlayerModal) closeManualModal();
  });

  saveManualPlayerBtn.addEventListener('click', saveManualPlayer);
  clearManualPlayerBtn.addEventListener('click', clearManualPlayer);

  // Submit on Enter key
  manualPlayerNameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveManualPlayer();
  });
}

function closeManualModal() {
  manualPlayerModal.classList.add('hidden');
}

function saveManualPlayer() {
  const name = manualPlayerNameInput.value.trim();
  const number = manualPlayerNumberInput.value.trim();
  const nodeId = appState.activeSlotIndex;

  if (name === '') {
    clearManualPlayer();
  } else {
    appState.lineup[nodeId] = { name: name, number: number, isManual: true };
    renderPitch();
    closeManualModal();
  }
}

function clearManualPlayer() {
  const nodeId = appState.activeSlotIndex;
  delete appState.lineup[nodeId];
  renderPitch();
  closeManualModal();
}

function openPlayerModal() {
  playerSearchFilter.value = '';
  renderSquadList();
  playerModal.classList.remove('hidden');
}

function closePlayerModal() {
  playerModal.classList.add('hidden');
}

async function renderSquadList(filterString = '') {
  const term = filterString.toLowerCase().trim();
  let results = [];

  // Determine search pool (Global DB vs Active Club Squad)
  if (term.length >= 2) {
    squadList.innerHTML = `<div class="loading-spinner">${translations[appState.language] ? translations[appState.language].searching || 'Oyuncu aranıyor...' : 'Oyuncu aranıyor...'}</div>`;

    try {
      const db = await getStaticDB();
      if (db) {
        // Query players globally matching name, or exact position, ordered by ID
        const stmt = db.prepare("SELECT * FROM players WHERE name LIKE ? OR position = ? ORDER BY id ASC LIMIT 50");
        stmt.bind([`%${term}%`, term]);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
      }
    } catch (err) {
      console.error("SQLite Player Search Failed:", err);
    }
  } else if (!term && appState.activeClub && appState.squad && appState.squad.length > 0) {
    // Fallback to active club squad if search is empty
    results = appState.squad;
  } else if (!term && !appState.activeClub) {
    // Completely empty state, expecting user to search globally
    squadList.innerHTML = `<div class="loading-spinner">${translations[appState.language] ? translations[appState.language].typeToSearch || 'Ekrana oyuncu eklemek için yukarıdan isim arayın...' : 'Ekrana oyuncu eklemek için yukarıdan isim arayın...'}</div>`;
    return;
  } else {
    // User typed 1 char, wait for more
    squadList.innerHTML = `<div class="loading-spinner">${translations[appState.language] ? translations[appState.language].typeMore || 'Arama yapmak için en az 2 karakter girin.' : 'Arama yapmak için en az 2 karakter girin.'}</div>`;
    return;
  }

  // Render Display
  if (results.length === 0) {
    squadList.innerHTML = `<div class="loading-spinner">${translations[appState.language] ? translations[appState.language].noPlayersFound || 'Oyuncu bulunamadı.' : 'Oyuncu bulunamadı.'}</div>`;
    return;
  }

  squadList.innerHTML = results.map(player => {
    // Check if player is already in lineup by comparing IDs as strings
    const isAlreadyInLineup = Object.values(appState.lineup).some(p => String(p.id) === String(player.id));
    const opacity = isAlreadyInLineup ? '0.5' : '1';
    const cursor = isAlreadyInLineup ? 'not-allowed' : 'pointer';

    return `
    <div class="squad-list-item" style="opacity: ${opacity}; cursor: ${cursor}" data-id="${player.id}">
       <img src="${getSafeImageUrl(player.image)}" crossorigin="anonymous" alt="" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='">
       <div class="item-details">
          <div class="item-name">${player.name}</div>
          <div class="item-meta">${player.number ? '#' + player.number + ' • ' : ''} ${player.position || 'Unknown'}</div>
       </div>
       ${isAlreadyInLineup ? `<span style="color:var(--accent);font-size:12px">${appState.language === 'tr' ? 'Kadroda' : 'In Lineup'}</span>` : ''}
    </div>
  `}).join('');

  // Attach localized click listeners
  document.querySelectorAll('.squad-list-item').forEach(item => {
    item.addEventListener('click', () => {
      const playerId = item.dataset.id;
      const playerObj = results.find(p => String(p.id) === String(playerId));
      if (playerObj) {
        // Prevent duplicate insertion
        if (Object.values(appState.lineup).some(p => String(p.id) === String(playerObj.id))) return;

        appState.lineup[appState.activeSlotIndex] = playerObj;
        renderPitch();
        closePlayerModal();
      }
    });
  });
}

// ==========================================
// Gravity Lens Animation
// ==========================================
(function initGravityLens() {
  const canvas = document.getElementById('gravity-lens-bg');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const gridColor = "94, 255, 174"; // Neon green to match accent and dark theme
  const lensStrength = 35;
  const gridSpacing = 40;
  const lensRadius = 200;

  const pointer = { x: -9999, y: -9999 };
  let rafId = null;

  function resize() {
    const parent = document.body;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = parent.clientWidth * dpr;
    canvas.height = parent.clientHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  window.addEventListener('resize', resize);

  window.addEventListener('pointermove', (e) => {
    pointer.x = e.clientX;
    pointer.y = e.clientY;
  });

  window.addEventListener('pointerleave', () => {
    pointer.x = -9999;
    pointer.y = -9999;
  });

  function animate() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    ctx.clearRect(0, 0, w, h);

    // Draw warped grid
    for (let gx = 0; gx < w + gridSpacing; gx += gridSpacing) {
      ctx.beginPath();
      for (let gy = 0; gy <= h; gy += 2) {
        const dx = gx - pointer.x;
        const dy = gy - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let warpedX = gx;
        if (dist < lensRadius && dist > 0) {
          const force = (1 - dist / lensRadius) * lensStrength;
          warpedX += (dx / dist) * force;
        }

        if (gy === 0) ctx.moveTo(warpedX, gy);
        else ctx.lineTo(warpedX, gy);
      }
      ctx.strokeStyle = `rgba(${gridColor}, 0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let gy = 0; gy < h + gridSpacing; gy += gridSpacing) {
      ctx.beginPath();
      for (let gx = 0; gx <= w; gx += 2) {
        const dx = gx - pointer.x;
        const dy = gy - pointer.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let warpedY = gy;
        if (dist < lensRadius && dist > 0) {
          const force = (1 - dist / lensRadius) * lensStrength;
          warpedY += (dy / dist) * force;
        }

        if (gx === 0) ctx.moveTo(gx, warpedY);
        else ctx.lineTo(gx, warpedY);
      }
      ctx.strokeStyle = `rgba(${gridColor}, 0.15)`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    rafId = requestAnimationFrame(animate);
  }

  resize();
  animate();
})();

// ==========================================
// Toast Notifications
// ==========================================
window.showToast = function (message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  // Icon based on type
  let iconSvg = '';
  if (type === 'error') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
  } else if (type === 'success') {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
  } else {
    iconSvg = `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
  }

  toast.innerHTML = `
    <div class="toast-icon">${iconSvg}</div>
    <div class="toast-message">${message}</div>
  `;

  container.appendChild(toast);

  // Trigger reflow to animate in
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove after 3 seconds
  setTimeout(() => {
    toast.classList.remove('show');
    toast.addEventListener('transitionend', () => toast.remove());
  }, 3000);
}
