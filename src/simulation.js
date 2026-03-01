// === simulation.js ===
// Core Physics and Recording Engine for the Fun Simulation

// ==========================================
// i18n Translations for Simulation Page
// ==========================================
const simTranslations = {
    en: {
        backToBuilder: "Back to Builder",
        simMatchSettings: "Match Settings",
        simTeam1Label: "1. Team (Home)",
        simTeam2Label: "2. Team (Away)",
        simSearchTeam1: "Search home team...",
        simSearchTeam2: "Search away team...",
        simPitchColor: "Pitch Color",
        simGoalColor: "Goal Color",
        simTeam1Color: "Team 1 Color",
        simTeam2Color: "Team 2 Color",
        simMatchDuration: "Match Duration",
        simDuration15: "15 Seconds",
        simDuration30: "30 Seconds",
        simDuration60: "60 Seconds",
        simStartMatch: "START MATCH",
        simMatchOver: "Match Over!",
        simDownloadVideo: "Download Video",
        simShareX: "Share on \ud835\udd4f",
        simPlayAgain: "Play Again",
        simWon: "Won!",
        simDraw: "Draw!",
        simTeamWon: "%team% Won!",
        navBuilder: "Formation Builder",
        funSimulation: "Fun Simulation"
    },
    tr: {
        backToBuilder: "Kadro Olu\u015fturucuya D\u00f6n",
        simMatchSettings: "Ma\u00e7 Ayarlar\u0131",
        simTeam1Label: "1. Tak\u0131m (Ev Sahibi)",
        simTeam2Label: "2. Tak\u0131m (Deplasman)",
        simSearchTeam1: "Ev sahibi tak\u0131m ara...",
        simSearchTeam2: "Rakip tak\u0131m ara...",
        simPitchColor: "Saha Rengi",
        simGoalColor: "Kale Rengi",
        simTeam1Color: "1. Tak\u0131m Rengi",
        simTeam2Color: "2. Tak\u0131m Rengi",
        simMatchDuration: "Ma\u00e7 S\u00fcresi",
        simDuration15: "15 Saniye",
        simDuration30: "30 Saniye",
        simDuration60: "60 Saniye",
        simStartMatch: "MA\u00c7A BA\u015eLA",
        simMatchOver: "Ma\u00e7 Bitti!",
        simDownloadVideo: "Videoyu \u0130ndir",
        simShareX: "\ud835\udd4f'te Payla\u015f",
        simPlayAgain: "Tekrar Oyna",
        simWon: "Kazand\u0131!",
        simDraw: "Berabere!",
        simTeamWon: "%team% Kazand\u0131!",
        navBuilder: "Kadro Yap\u0131c\u0131",
        funSimulation: "E\u011flenceli Sim\u00fclasyon"
    }
};

let currentLang = 'tr';

function setSimLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('openlineup-lang', lang);
    const t = simTranslations[lang];
    if (!t) return;

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.textContent = t[key];
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        if (t[key]) el.setAttribute('placeholder', t[key]);
    });

    // Update active state on language buttons
    document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`lang-${lang}`);
    if (activeBtn) activeBtn.classList.add('active');
}

// Language Button Listeners
document.getElementById('lang-tr')?.addEventListener('click', () => setSimLanguage('tr'));
document.getElementById('lang-en')?.addEventListener('click', () => setSimLanguage('en'));

let staticDB = null;
let team1 = null;
let team2 = null;
let simDuration = 30; // seconds

// Canvas & Context
const canvas = document.getElementById('sim-canvas');
const ctx = canvas.getContext('2d');

// Audio / Video Recording State
let mediaRecorder;
let recordedChunks = [];
let recordingUrl = null;
let silentAudioCtx = null;

// Game State
let isPlaying = false;
let score1 = 0;
let score2 = 0;
let timer = 0;
let animationId;
let startTime;

// Physics Entities
const PITCH_RADIUS = Math.floor(canvas.width * 0.467); // Sahanın yarıçapı (orantılı)
const CENTER_X = canvas.width / 2;
const CENTER_Y = canvas.height / 2;

// Kale (Goal Arc)
const GOAL_WIDTH_RAD = Math.PI / 4; // 45 derecelik yay kaleyi temsil edecek
let goalAngle = 0; // Kalenin şu anki rotasyonu (radyan)
const GOAL_SPEED = 0.02; // Kalenin çember etrafında dönme hızı

// Logolar
let logo1Img = new Image();
let logo2Img = new Image();

const LOGO_RADIUS = Math.floor(canvas.width * 0.042); // 25 @ 600 → 45 @ 1080

// Logo Nesneleri
const logos = [
    { img: null, x: CENTER_X - 90, y: CENTER_Y, vx: -5, vy: -3, radius: LOGO_RADIUS, team: 1 },
    { img: null, x: CENTER_X + 90, y: CENTER_Y, vx: 4, vy: 5, radius: LOGO_RADIUS, team: 2 }
];

// DOM Elements
const btnStart = document.getElementById('btn-start-match');

// Team 1 DOM
const t1Search = document.getElementById('team1-search');
const t1Results = document.getElementById('team1-results');
const t1Card = document.getElementById('team1-card');
const clearT1Btn = document.getElementById('clear-team1-btn');

// Team 2 DOM
const t2Search = document.getElementById('team2-search');
const t2Results = document.getElementById('team2-results');
const t2Card = document.getElementById('team2-card');
const clearT2Btn = document.getElementById('clear-team2-btn');

document.addEventListener('DOMContentLoaded', async () => {
    // 1. Load DB
    await initDB();

    // 2. Setup Search Inputs
    setupSearch(t1Search, t1Results, 1);
    setupSearch(t2Search, t2Results, 2);

    // 3. Try loading team1 from localStorage
    const stored = localStorage.getItem('openlineup_simulation_data');
    if (stored) {
        const data = JSON.parse(stored);
        if (data && data.team1) {
            selectTeam(data.team1, 1);
        }
    }

    // 4. Listeners
    btnStart.addEventListener('click', startGame);
    clearT1Btn.addEventListener('click', () => clearTeam(1));
    clearT2Btn.addEventListener('click', () => clearTeam(2));

    document.getElementById('sim-duration').addEventListener('change', (e) => {
        simDuration = parseInt(e.target.value);
    });

    // Modal Actions
    document.getElementById('btn-download-video').addEventListener('click', downloadVideo);
    document.getElementById('btn-share-x').addEventListener('click', shareToX);
    document.getElementById('btn-restart').addEventListener('click', () => {
        document.getElementById('sim-winner-panel').style.display = 'none';
        toggleSettings(true); // ayarları tekrar aç
    });

    // Renk Değişimi Dinle
    const colorPickers = ['sim-pitch-color', 'sim-goal-color', 'sim-team1-color', 'sim-team2-color'];
    colorPickers.forEach(id => {
        const picker = document.getElementById(id);
        if (picker) {
            picker.addEventListener('input', () => {
                if (!isPlaying) drawScene();
            });
        }
    });

    // İlk açılışta siyah ekran yerine boş sahayı göster
    drawScene();
});

async function initDB() {
    try {
        // Fetch the SQLite file as an ArrayBuffer, using relative path to work for GitHub Pages
        const response = await fetch(import.meta.env.BASE_URL + 'data/database.sqlite');
        if (!response.ok) throw new Error("SQLite DB Download Failed");
        const buffer = await response.arrayBuffer();

        // Initialize sql.js
        const SQL = await window.initSqlJs({
            locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.12.0/${file}`
        });

        staticDB = new SQL.Database(new Uint8Array(buffer));
        console.log("Simülasyon DB Yüklendi");
    } catch (e) {
        console.warn("Simülasyon DB yüklenemedi. Yol hatası veya Fetch problemi:", e);
    }
}

function getSafeImageUrl(url) {
    if (!url) return '';
    const base = import.meta.env.BASE_URL;
    if (url.startsWith('/data') || url.startsWith('./data')) return base + url.replace(/^\.?\/data\//, 'data/');
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
}

// Logo'dan dominant renk çıkarma (siyah/beyaz/gri filtrelenir)
function getDominantColor(img) {
    try {
        const size = 40;
        const c = document.createElement('canvas');
        c.width = size; c.height = size;
        const cCtx = c.getContext('2d');
        cCtx.drawImage(img, 0, 0, size, size);
        const data = cCtx.getImageData(0, 0, size, size).data;

        const colorMap = {};
        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2], a = data[i + 3];
            if (a < 128) continue; // saydam pikselleri atla
            // Çok koyu, çok açık ve gri tonlarını filtrele
            const brightness = (r + g + b) / 3;
            if (brightness < 30 || brightness > 225) continue;
            const saturation = Math.max(r, g, b) - Math.min(r, g, b);
            if (saturation < 25) continue; // gri tonlarını atla

            // Renkleri 16'lık gruplara indir (benzer tonları birleştir)
            const qr = (r >> 4) << 4;
            const qg = (g >> 4) << 4;
            const qb = (b >> 4) << 4;
            const key = `${qr},${qg},${qb}`;
            colorMap[key] = (colorMap[key] || 0) + 1;
        }

        let maxCount = 0, dominant = [200, 50, 50];
        for (const [key, count] of Object.entries(colorMap)) {
            if (count > maxCount) {
                maxCount = count;
                dominant = key.split(',').map(Number);
            }
        }

        const hex = '#' + dominant.map(v => Math.min(255, v + 8).toString(16).padStart(2, '0')).join('');
        return hex;
    } catch (e) {
        return null; // CORS veya başka hata
    }
}

// ----- ARAMA MANTIĞI -----
function setupSearch(inputEl, resultsEl, teamNum) {
    let debounceTimeout;

    inputEl.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        const val = e.target.value.trim().toLowerCase();

        if (val.length < 2) {
            resultsEl.classList.add('hidden');
            return;
        }

        debounceTimeout = setTimeout(() => searchClubs(val, resultsEl, teamNum), 300);
    });

    // Hide dropdown on outside click
    document.addEventListener('click', (e) => {
        if (!inputEl.contains(e.target) && !resultsEl.contains(e.target)) {
            resultsEl.classList.add('hidden');
        }
    });

    // Prevent hiding when clicking on results themselves
    resultsEl.addEventListener('click', (e) => {
        e.stopPropagation();
    });
}

function searchClubs(query, resultsEl, teamNum) {
    if (!staticDB) {
        console.warn("Veritabanı hazır değil, aramaya başlanamıyor.");
        return;
    }

    try {
        const q = `SELECT id, name, image FROM clubs WHERE name LIKE ? COLLATE NOCASE LIMIT 15`;
        const stmt = staticDB.prepare(q);
        stmt.bind([`%${query}%`]);

        const results = [];
        while (stmt.step()) {
            const row = stmt.getAsObject();
            results.push({ id: row.id, name: row.name, logoUrl: row.image });
        }
        stmt.free();

        renderSearchResults(results, resultsEl, teamNum);
    } catch (err) {
        console.error("Arama sırasına DB Hatası:", err);
    }
}

function renderSearchResults(results, resultsEl, teamNum) {
    resultsEl.innerHTML = '';
    if (results.length === 0) {
        resultsEl.innerHTML = `<div class="p-2 text-sm" style="color:#666; padding:8px;">Bulunamadı</div>`;
    } else {
        results.forEach(club => {
            const div = document.createElement('div');
            div.className = 'search-result-item'; // CSS sınıfı (hover için)
            div.innerHTML = `
                <img src="${getSafeImageUrl(club.logoUrl)}" alt="logo" style="width:24px; height:24px; object-fit:contain; margin-right:8px;">
                <span>${club.name}</span>
            `;
            // Inline stiller kaldırılarak css class'a bırakıldı (hover vb. daha rahat olsun diye)
            div.style.display = 'flex';
            div.style.alignItems = 'center';
            div.style.padding = '8px';
            div.style.cursor = 'pointer';
            div.style.borderBottom = '1px solid rgba(255,255,255,0.05)';

            // Tıklayınca parent div kapanmasın diyestopPropagation
            div.addEventListener('click', (e) => {
                e.stopPropagation();
                selectTeam(club, teamNum);
                resultsEl.classList.add('hidden');
            });
            resultsEl.appendChild(div);
        });
    }

    // Yüksek z-index ve absolute pozisyonlama
    resultsEl.style.position = 'absolute';
    resultsEl.style.zIndex = '9999';
    resultsEl.style.width = '100%';
    resultsEl.style.maxHeight = '200px';
    resultsEl.style.overflowY = 'auto';
    resultsEl.style.backgroundColor = '#1a1a1a';
    resultsEl.style.border = '1px solid var(--border)';
    resultsEl.style.borderRadius = '0 0 8px 8px';
    resultsEl.classList.remove('hidden');
}

function selectTeam(club, teamNum) {
    const safeImg = getSafeImageUrl(club.logoUrl);

    if (teamNum === 1) {
        team1 = club;
        t1Search.value = '';
        t1Search.parentElement.classList.add('hidden'); // hide search wrapper
        t1Card.parentElement.classList.remove('hidden'); // Make sure parent allows card
        t1Card.classList.remove('hidden');

        document.getElementById('team1-card-name').textContent = club.name;
        document.getElementById('team1-card-logo').src = safeImg;

        // Header info
        document.getElementById('team1-name').textContent = club.name;
        document.getElementById('team1-logo').src = safeImg;
        document.getElementById('team1-logo').style.opacity = '1';

        logo1Img.crossOrigin = "Anonymous";
        logo1Img.src = safeImg;
        logos[0].img = logo1Img;

        logo1Img.onload = () => {
            if (!isPlaying) drawScene();
            // Logo'dan dominant renk çıkar ve renk picker'ı güncelle
            const color = getDominantColor(logo1Img);
            if (color) {
                const picker = document.getElementById('sim-team1-color');
                if (picker) { picker.value = color; }
            }
        };
    } else {
        team2 = club;
        t2Search.value = '';
        t2Search.parentElement.classList.add('hidden');
        t2Card.parentElement.classList.remove('hidden');
        t2Card.classList.remove('hidden');

        document.getElementById('team2-card-name').textContent = club.name;
        document.getElementById('team2-card-logo').src = safeImg;

        // Header info
        document.getElementById('team2-name').textContent = club.name;
        document.getElementById('team2-logo').src = safeImg;
        document.getElementById('team2-logo').style.opacity = '1';

        logo2Img.crossOrigin = "Anonymous";
        logo2Img.src = safeImg;
        logos[1].img = logo2Img;

        logo2Img.onload = () => {
            if (!isPlaying) drawScene();
            const color = getDominantColor(logo2Img);
            if (color) {
                const picker = document.getElementById('sim-team2-color');
                if (picker) { picker.value = color; }
            }
        };
    }

    checkStartReadiness();
}

function clearTeam(teamNum) {
    if (teamNum === 1) {
        team1 = null;
        t1Card.parentElement.classList.add('hidden'); // card hide inside wrapper
        t1Card.classList.add('hidden');
        t1Search.parentElement.classList.remove('hidden'); // wrapper show
        t1Search.value = '';

        document.getElementById('team1-name').textContent = "Ev Sahibi";
        document.getElementById('team1-logo').src = "";
        document.getElementById('team1-logo').style.opacity = '0.2';
        logos[0].img = null;
    } else {
        team2 = null;
        t2Card.parentElement.classList.add('hidden'); // card hide
        t2Card.classList.add('hidden');
        t2Search.parentElement.classList.remove('hidden'); // search wrap show
        t2Search.value = '';

        document.getElementById('team2-name').textContent = "Deplasman";
        document.getElementById('team2-logo').src = "";
        document.getElementById('team2-logo').style.opacity = '0.2';
        logos[1].img = null;
    }
    checkStartReadiness();
}

function checkStartReadiness() {
    if (team1 && team2) {
        btnStart.disabled = false;
        btnStart.style.opacity = '1';
    } else {
        btnStart.disabled = true;
        btnStart.style.opacity = '0.5';
    }
}

// Ayarları aktif/pasif yap (maç sırasında kilitlemek için)
function toggleSettings(enabled) {
    const ids = [
        'team1-search', 'team2-search',
        'sim-pitch-color', 'sim-goal-color', 'sim-team1-color', 'sim-team2-color',
        'sim-duration', 'clear-team1-btn', 'clear-team2-btn'
    ];
    ids.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.style.pointerEvents = enabled ? '' : 'none';
            el.style.opacity = enabled ? '' : '0.4';
        }
    });
}

function startGame() {
    // Winner panelini gizle, ayarları kilitle
    document.getElementById('sim-winner-panel').style.display = 'none';
    toggleSettings(false);

    // EĞER HALA OYNANAN BİR MAÇ VARSA ONU BİTİR / SIFIRLA
    if (isPlaying) {
        isPlaying = false;
        cancelAnimationFrame(animationId);
    }
    // Önceki kaydı temizle
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.onstop = null; // eski callback'i iptal et
        mediaRecorder.stop();
    }
    mediaRecorder = null;
    if (silentAudioCtx) { silentAudioCtx.close(); silentAudioCtx = null; }
    if (recordingUrl) { URL.revokeObjectURL(recordingUrl); recordingUrl = null; }
    recordedChunks = [];

    // Reset states
    score1 = 0;
    score2 = 0;
    document.getElementById('score1').textContent = 0;
    document.getElementById('score2').textContent = 0;

    const durSelect = document.getElementById('sim-duration');
    simDuration = parseInt(durSelect.value, 10);

    const sc = canvas.width / 600;
    logos[0].x = CENTER_X - 90 * sc; logos[0].y = CENTER_Y;
    logos[1].x = CENTER_X + 90 * sc; logos[1].y = CENTER_Y;

    // Give random initial velocities (scaled to canvas size)
    logos.forEach(l => {
        l.vx = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 3) * sc;
        l.vy = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 3) * sc;
    });

    goalAngle = 0; // Reset goal angle
    isPlaying = true;
    startTime = Date.now();

    // Start MediaRecorder
    recordedChunks = [];
    const videoStream = canvas.captureStream(30);

    // Sessiz audio track ekle (Twitter ve sosyal medya gereksinimleri için)
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    silentAudioCtx = audioCtx;
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    gainNode.gain.value = 0; // tamamen sessiz
    oscillator.connect(gainNode);
    const dest = audioCtx.createMediaStreamDestination();
    gainNode.connect(dest);
    oscillator.start();

    // Video + audio track'leri birleştir
    const stream = new MediaStream([
        ...videoStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
    ]);

    const videoBitrate = 5_000_000; // 5 Mbps
    // MP4 öncelikli (Chrome 130+), yoksa WebM VP9
    let opts = null;
    const tryMimes = [
        'video/mp4;codecs=avc1.42E01E,mp4a.40.2', // MP4 H264 + AAC (Twitter uyumlu)
        'video/mp4;codecs=avc1.42E01E',
        'video/mp4',
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm'
    ];
    for (const mime of tryMimes) {
        if (MediaRecorder.isTypeSupported(mime)) {
            opts = { mimeType: mime, videoBitsPerSecond: videoBitrate };
            break;
        }
    }
    if (!opts) opts = { videoBitsPerSecond: videoBitrate };

    try {
        mediaRecorder = new MediaRecorder(stream, opts);
        console.log('📹 MediaRecorder codec:', mediaRecorder.mimeType);
    } catch (e) {
        console.warn('MediaRecorder opts failed, using defaults:', e);
        mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: opts.mimeType });
        recordingUrl = URL.createObjectURL(blob);
    };

    mediaRecorder.start(100); // collect 100ms chunks

    // Start Loop
    gameLoop();
}

function startRecording() {
    // This function is now integrated into startGame, so it can be removed or kept as a placeholder if needed elsewhere.
    // For now, keeping it as is, but its content is effectively moved.
    recordedChunks = [];
    const stream = canvas.captureStream(30); // 30 FPS

    try {
        const options = { mimeType: 'video/webm;codecs=vp9' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options.mimeType = 'video/webm';
        }
        mediaRecorder = new MediaRecorder(stream, options);
    } catch (e) {
        console.warn("VP9 webm not supported, freezing to default", e);
        mediaRecorder = new MediaRecorder(stream);
    }

    mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
            recordedChunks.push(event.data);
        }
    };

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        recordingUrl = URL.createObjectURL(blob);
    };

    mediaRecorder.start(100); // collect 100ms chunks
}

function gameLoop() {
    if (!isPlaying) return;

    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const remaining = simDuration - elapsed;

    updateTimerDisplay(remaining);

    if (remaining <= 0) {
        endGame();
        return;
    }

    updatePhysics();
    drawScene();

    // Next frame
    animationId = requestAnimationFrame(gameLoop);
}

function updateTimerDisplay(sec) {
    const m = Math.floor(sec / 60).toString().padStart(2, '0');
    const s = (sec % 60).toString().padStart(2, '0');
    document.getElementById('sim-timer').textContent = `${m}:${s}`;
}

function updatePhysics() {
    const sc = canvas.width / 600; // scale factor
    const MAX_SPEED = 12 * sc;     // maximum speed cap
    const MIN_SPEED = 3 * sc;      // minimum speed floor (prevents stalling)
    const RESTITUTION = 1.15;      // >1 = super-elastic (gains energy on hit, exciting!)
    const WALL_RESTITUTION = 1.05; // slight speed boost on wall bounce
    const GRAVITY_PULL = 0.02 * sc; // tiny pull toward center (keeps action in the middle)

    // --- Goal rotation ---
    goalAngle += GOAL_SPEED;
    if (goalAngle > Math.PI * 2) goalAngle -= Math.PI * 2;
    const goalStart = goalAngle;
    const goalEnd = goalAngle + GOAL_WIDTH_RAD;

    // --- Move each logo ---
    logos.forEach(logo => {
        // Apply gentle gravity toward center (prevents stuck-in-corners)
        const gx = CENTER_X - logo.x;
        const gy = CENTER_Y - logo.y;
        const gDist = Math.sqrt(gx * gx + gy * gy);
        if (gDist > 1) {
            logo.vx += (gx / gDist) * GRAVITY_PULL;
            logo.vy += (gy / gDist) * GRAVITY_PULL;
        }

        // Integrate position
        logo.x += logo.vx;
        logo.y += logo.vy;

        // --- Boundary collision (circular pitch) ---
        const dx = logo.x - CENTER_X;
        const dy = logo.y - CENTER_Y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist + logo.radius >= PITCH_RADIUS) {
            // Check if it hit the goal arc
            let impactAngle = Math.atan2(dy, dx);
            if (impactAngle < 0) impactAngle += Math.PI * 2;

            let isGoal = false;
            if (goalEnd <= Math.PI * 2) {
                if (impactAngle >= goalStart && impactAngle <= goalEnd) isGoal = true;
            } else {
                const wrappedEnd = goalEnd - Math.PI * 2;
                if (impactAngle >= goalStart || impactAngle <= wrappedEnd) isGoal = true;
            }

            if (isGoal) {
                handleGoal(logo.team);
                return; // skip rest for this logo, positions reset in handleGoal
            }

            // Wall reflection: reflect velocity about the surface normal
            const nx = dx / dist;
            const ny = dy / dist;
            const dot = logo.vx * nx + logo.vy * ny;

            // Only reflect if moving outward (dot > 0)
            if (dot > 0) {
                logo.vx -= 2 * dot * nx;
                logo.vy -= 2 * dot * ny;

                // Apply wall restitution (slight energy gain)
                logo.vx *= WALL_RESTITUTION;
                logo.vy *= WALL_RESTITUTION;
            }

            // Push logo back inside the pitch
            const overlap = dist + logo.radius - PITCH_RADIUS;
            logo.x -= nx * overlap;
            logo.y -= ny * overlap;

            // Tiny random spin for unpredictability
            logo.vx += (Math.random() - 0.5) * 0.8 * sc;
            logo.vy += (Math.random() - 0.5) * 0.8 * sc;
        }
    });

    // --- Logo vs Logo collision (proper 2D elastic) ---
    const l1 = logos[0];
    const l2 = logos[1];

    if (l1.img && l2.img) {
        const dx = l2.x - l1.x;
        const dy = l2.y - l1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const minDist = l1.radius + l2.radius;

        if (dist < minDist && dist > 0.001) {
            // Collision normal
            const nx = dx / dist;
            const ny = dy / dist;

            // Separate overlapping logos (push each half the overlap)
            const overlap = minDist - dist;
            l1.x -= nx * (overlap / 2 + 1);
            l1.y -= ny * (overlap / 2 + 1);
            l2.x += nx * (overlap / 2 + 1);
            l2.y += ny * (overlap / 2 + 1);

            // Relative velocity along collision normal
            const dvx = l1.vx - l2.vx;
            const dvy = l1.vy - l2.vy;
            const relVelNormal = dvx * nx + dvy * ny;

            // Only resolve if objects are approaching (not separating)
            if (relVelNormal > 0) {
                // Impulse (equal mass = 1 for both)
                const impulse = relVelNormal * RESTITUTION;

                l1.vx -= impulse * nx;
                l1.vy -= impulse * ny;
                l2.vx += impulse * nx;
                l2.vy += impulse * ny;
            }

            // Add slight tangential kick for spin-like unpredictability
            const tangentX = -ny;
            const tangentY = nx;
            const kick = (Math.random() - 0.5) * 2 * sc;
            l1.vx += tangentX * kick;
            l1.vy += tangentY * kick;
            l2.vx -= tangentX * kick;
            l2.vy -= tangentY * kick;
        }
    }

    // --- Speed clamping (prevent runaway or stalling) ---
    logos.forEach(logo => {
        const speed = Math.sqrt(logo.vx * logo.vx + logo.vy * logo.vy);

        if (speed > MAX_SPEED) {
            const scale = MAX_SPEED / speed;
            logo.vx *= scale;
            logo.vy *= scale;
        } else if (speed < MIN_SPEED && speed > 0.001) {
            // Give a nudge if too slow
            const scale = MIN_SPEED / speed;
            logo.vx *= scale;
            logo.vy *= scale;
        }
    });
}

function handleGoal(scoringTeam) {
    if (scoringTeam === 1) {
        score1++;
        document.getElementById('score1').textContent = score1;
    } else {
        score2++;
        document.getElementById('score2').textContent = score2;
    }

    const sc = canvas.width / 600;
    // Reset positions to center
    logos[0].x = CENTER_X - 80 * sc; logos[0].y = CENTER_Y;
    logos[1].x = CENTER_X + 80 * sc; logos[1].y = CENTER_Y;

    // Logolar kısa süre duraksasın (gol kutlaması)
    logos.forEach(l => { l.vx = 0; l.vy = 0; });

    setTimeout(() => {
        logos.forEach(l => {
            l.vx = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 4) * sc;
            l.vy = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 4) * sc;
        });
    }, 300); // 0.8 sn bekleme
}



function drawScene(pitchOnly = false) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Renk Ayarlarını Al
    const pitchPicker = document.getElementById('sim-pitch-color');
    const centerColor = pitchPicker ? pitchPicker.value : '#2d8c4e';

    const goalPicker = document.getElementById('sim-goal-color');
    const goalColorStr = goalPicker ? goalPicker.value : '#ffffff';

    const team1Picker = document.getElementById('sim-team1-color');
    const team1ColorStr = team1Picker ? team1Picker.value : '#ffffff';

    const team2Picker = document.getElementById('sim-team2-color');
    const team2ColorStr = team2Picker ? team2Picker.value : '#ffffff';

    const sc = canvas.width / 600; // scale factor for all proportional dimensions

    // ============================
    // PREMIUM SAHA ÇİZİMİ
    // ============================

    // 1. Koyu arka plan (canvas kenarları)
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 2. Yeşil saha gradyanı (canlı, doygun)
    ctx.save();
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, PITCH_RADIUS, 0, Math.PI * 2);
    ctx.clip();

    const bgGradient = ctx.createRadialGradient(CENTER_X, CENTER_Y, 0, CENTER_X, CENTER_Y, PITCH_RADIUS);
    bgGradient.addColorStop(0, centerColor);
    // Kenarları biraz koyulaştır
    const darkerEdge = '#0e3a18';
    bgGradient.addColorStop(1, darkerEdge);
    ctx.fillStyle = bgGradient;
    ctx.fillRect(CENTER_X - PITCH_RADIUS, CENTER_Y - PITCH_RADIUS, PITCH_RADIUS * 2, PITCH_RADIUS * 2);

    // 3. Çim şerit efekti (gerçekçi saha deseni)
    const stripeWidth = 35 * sc;
    ctx.globalAlpha = 0.06;
    for (let x = CENTER_X - PITCH_RADIUS; x < CENTER_X + PITCH_RADIUS; x += stripeWidth * 2) {
        ctx.fillStyle = '#000000';
        ctx.fillRect(x, CENTER_Y - PITCH_RADIUS, stripeWidth, PITCH_RADIUS * 2);
    }
    ctx.globalAlpha = 1.0;

    // 4. İç vignette (derinlik efekti)
    const vignette = ctx.createRadialGradient(CENTER_X, CENTER_Y, PITCH_RADIUS * 0.5, CENTER_X, CENTER_Y, PITCH_RADIUS);
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(0,0,0,0.35)');
    ctx.fillStyle = vignette;
    ctx.fillRect(CENTER_X - PITCH_RADIUS, CENTER_Y - PITCH_RADIUS, PITCH_RADIUS * 2, PITCH_RADIUS * 2);

    ctx.restore(); // clip'i kaldır

    // 5. Saha Çizgileri (parlak beyaz, net)
    const lineColor = 'rgba(255, 255, 255, 0.45)';
    const lineWidth = 2.5 * sc;

    // Orta Çizgi (Yatay)
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    ctx.moveTo(CENTER_X - PITCH_RADIUS, CENTER_Y);
    ctx.lineTo(CENTER_X + PITCH_RADIUS, CENTER_Y);
    ctx.stroke();

    // Orta Yuvarlak
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, 60 * sc, 0, Math.PI * 2);
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();

    // Orta Nokta
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, 4 * sc, 0, Math.PI * 2);
    ctx.fillStyle = lineColor;
    ctx.fill();

    // 6. Dış Saha Kenar Çizgisi (zarif glow)
    // Dış glow halkası
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, PITCH_RADIUS + 2 * sc, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 8 * sc;
    ctx.stroke();

    // Ana kenar çizgisi
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, PITCH_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    ctx.lineWidth = 6.5 * sc;
    ctx.stroke();

    // Kale (Fileli)
    const goalR = PITCH_RADIUS;
    const netDepth = 22 * sc; // file derinliği
    const netLines = 6;       // file çizgi sayısı

    // 1. Kale direkleri (başlangıç ve bitiş noktaları)
    const postAngle1 = goalAngle;
    const postAngle2 = goalAngle + GOAL_WIDTH_RAD;
    const postRadius = 5 * sc;

    ctx.fillStyle = goalColorStr;
    ctx.beginPath();
    ctx.arc(CENTER_X + Math.cos(postAngle1) * goalR, CENTER_Y + Math.sin(postAngle1) * goalR, postRadius, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(CENTER_X + Math.cos(postAngle2) * goalR, CENTER_Y + Math.sin(postAngle2) * goalR, postRadius, 0, Math.PI * 2);
    ctx.fill();

    // 2. Kale çerçevesi (ana yay - kalın)
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, goalR, goalAngle, goalAngle + GOAL_WIDTH_RAD);
    ctx.strokeStyle = goalColorStr;
    ctx.lineWidth = 7 * sc;
    ctx.lineCap = 'round';
    ctx.stroke();

    // 3. File ağı - yatay yaylar (iç tarafa doğru)
    ctx.lineWidth = 1 * sc;
    ctx.strokeStyle = goalColorStr;
    ctx.globalAlpha = 0.4;
    for (let i = 1; i <= netLines; i++) {
        const r = goalR - (netDepth / netLines) * i;
        ctx.beginPath();
        ctx.arc(CENTER_X, CENTER_Y, r, goalAngle, goalAngle + GOAL_WIDTH_RAD);
        ctx.stroke();
    }

    // 4. File ağı - dikey çizgiler (direkler arası)
    const verticalLines = 8;
    for (let i = 0; i <= verticalLines; i++) {
        const angle = goalAngle + (GOAL_WIDTH_RAD / verticalLines) * i;
        ctx.beginPath();
        ctx.moveTo(
            CENTER_X + Math.cos(angle) * goalR,
            CENTER_Y + Math.sin(angle) * goalR
        );
        ctx.lineTo(
            CENTER_X + Math.cos(angle) * (goalR - netDepth),
            CENTER_Y + Math.sin(angle) * (goalR - netDepth)
        );
        ctx.stroke();
    }
    ctx.globalAlpha = 1.0;

    // ---------------------------------
    // CANVAS İÇİ SKORBORD + LOGOLAR (pitchOnly modunda atla)
    // ---------------------------------
    if (!pitchOnly) {

        // CANVAS İÇİ SKORBORD (HEADER)
        ctx.save();
        ctx.globalAlpha = 1.0;
        const sbY = CENTER_Y - 125 * sc;

        // Süre
        const elapsed = isPlaying ? Math.floor((Date.now() - startTime) / 1000) : 0;
        let remaining = simDuration - elapsed;
        if (remaining < 0) remaining = 0;
        const m = Math.floor(remaining / 60).toString().padStart(2, '0');
        const s = (remaining % 60).toString().padStart(2, '0');

        ctx.textBaseline = 'middle';
        ctx.textAlign = 'center';
        ctx.font = `bold ${16 * sc}px "Inter", sans-serif`;
        ctx.fillStyle = '#ccc';
        ctx.fillText(`${m}:${s}`, CENTER_X, sbY + 16 * sc);

        // Skor (Büyük)
        ctx.font = `bold ${36 * sc}px "Inter", sans-serif`;
        ctx.fillStyle = '#fff';
        ctx.fillText(`${score1} - ${score2}`, CENTER_X, sbY + 44 * sc);

        // Ev Sahibi (Sol)
        ctx.textAlign = 'right';
        ctx.font = `${16 * sc}px "Inter", sans-serif`;
        ctx.fillStyle = '#ffffff';
        if (team1) ctx.fillText(team1.name, CENTER_X - 100 * sc, sbY + 44 * sc, 120 * sc);
        if (logos[0].img && logos[0].img.complete) {
            const img0 = logos[0].img;
            const maxSb = 40 * sc;
            const ratio0 = Math.min(maxSb / img0.naturalWidth, maxSb / img0.naturalHeight);
            const w0 = img0.naturalWidth * ratio0;
            const h0 = img0.naturalHeight * ratio0;
            ctx.drawImage(img0, CENTER_X - 90 * sc + (maxSb - w0) / 2, sbY + 24 * sc + (maxSb - h0) / 2, w0, h0);
        }

        // Deplasman (Sağ)
        ctx.textAlign = 'left';
        ctx.font = `${16 * sc}px "Inter", sans-serif`;
        ctx.fillStyle = '#ffffff';
        if (team2) ctx.fillText(team2.name, CENTER_X + 100 * sc, sbY + 44 * sc, 120 * sc);
        if (logos[1].img && logos[1].img.complete) {
            const img1 = logos[1].img;
            const maxSb1 = 40 * sc;
            const ratio1 = Math.min(maxSb1 / img1.naturalWidth, maxSb1 / img1.naturalHeight);
            const w1 = img1.naturalWidth * ratio1;
            const h1 = img1.naturalHeight * ratio1;
            ctx.drawImage(img1, CENTER_X + 50 * sc + (maxSb1 - w1) / 2, sbY + 24 * sc + (maxSb1 - h1) / 2, w1, h1);
        }

        ctx.restore();

        // ---------------------------------
        // LOGOLARI ÇİZ (SKORBORDUN ÜZERİNE ÇİZİLİYOR - Z-INDEX 2)
        // ---------------------------------
        logos.forEach(l => {
            if (l.img && l.img.complete) {
                const currentTeamColor = l.team === 1 ? team1ColorStr : team2ColorStr;

                // Takım renkli arkaplan dairesi
                ctx.beginPath();
                ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
                ctx.fillStyle = currentTeamColor;
                ctx.fill();

                // Logoyu en-boy oranını koruyarak dairenin %80'ine sığdır
                const img = l.img;
                const fitSize = l.radius * 1.6; // dairenin %80'i (çap)
                const ratio = Math.min(fitSize / img.naturalWidth, fitSize / img.naturalHeight);
                const w = img.naturalWidth * ratio;
                const h = img.naturalHeight * ratio;

                ctx.save();
                ctx.beginPath();
                ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
                ctx.clip();
                ctx.drawImage(img, l.x - w / 2, l.y - h / 2, w, h);
                ctx.restore();

                // Düz yuvarlak kenarlık
                ctx.beginPath();
                ctx.arc(l.x, l.y, l.radius, 0, Math.PI * 2);
                ctx.lineWidth = 3;
                ctx.strokeStyle = currentTeamColor;
                ctx.stroke();
            }
        });

    } // end if (!pitchOnly)

}

function endGame() {
    isPlaying = false;
    cancelAnimationFrame(animationId);

    const fadeOutDuration = 1000;  // Faz 1: 1 sn saha kararma
    const winnerDuration = 3000;   // Faz 2: 3 sn winner ekranı
    const startTime2 = Date.now();

    function winnerLoop() {
        const elapsed = Date.now() - startTime2;

        if (elapsed < fadeOutDuration) {
            // === FAZ 1: Saha kararıyor (logosuz) ===
            const fadeProgress = elapsed / fadeOutDuration;
            drawScene(true);
            ctx.fillStyle = `rgba(0, 0, 0, ${fadeProgress * 0.55})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            requestAnimationFrame(winnerLoop);

        } else if (elapsed < fadeOutDuration + winnerDuration) {
            // === FAZ 2: Saha arkada + winner ekranı fade-in ===
            const winnerElapsed = elapsed - fadeOutDuration;
            const winnerAlpha = Math.min(1, winnerElapsed / 500);

            drawScene(true);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            drawWinnerScreen(winnerAlpha);
            requestAnimationFrame(winnerLoop);

        } else {
            // === BİTTİ ===
            drawScene(true);
            ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawWinnerScreen(1);

            if (mediaRecorder && mediaRecorder.state !== 'inactive') {
                mediaRecorder.stop();
            }
            if (silentAudioCtx) { silentAudioCtx.close(); silentAudioCtx = null; }
            showWinnerOverlay();
        }
    }

    winnerLoop();
}

function drawWinnerScreen(alpha = 1) {
    const sc = canvas.width / 600;
    const t = simTranslations[currentLang];

    ctx.save();
    ctx.globalAlpha = alpha;

    // Parlak daire spotlight
    const spotGrad = ctx.createRadialGradient(CENTER_X, CENTER_Y, 0, CENTER_X, CENTER_Y, PITCH_RADIUS * 0.6);
    spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.08)');
    spotGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = spotGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 3. "MAÇ BİTTİ" üst yazı
    ctx.font = `bold ${18 * sc}px "Inter", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fillText('⚽  ' + (currentLang === 'tr' ? 'MAÇ BİTTİ' : 'FULL TIME'), CENTER_X, CENTER_Y - 110 * sc);

    // 4. Takım logoları
    const logoSize = 65 * sc;
    const logoY = CENTER_Y - 30 * sc;

    if (logos[0].img && logos[0].img.complete) {
        const img0 = logos[0].img;
        const r0 = Math.min(logoSize / img0.naturalWidth, logoSize / img0.naturalHeight);
        ctx.drawImage(img0, CENTER_X - 160 * sc - (img0.naturalWidth * r0) / 2, logoY - (img0.naturalHeight * r0) / 2, img0.naturalWidth * r0, img0.naturalHeight * r0);
    }
    if (logos[1].img && logos[1].img.complete) {
        const img1 = logos[1].img;
        const r1 = Math.min(logoSize / img1.naturalWidth, logoSize / img1.naturalHeight);
        ctx.drawImage(img1, CENTER_X + 160 * sc - (img1.naturalWidth * r1) / 2, logoY - (img1.naturalHeight * r1) / 2, img1.naturalWidth * r1, img1.naturalHeight * r1);
    }

    // 5. Büyük skor
    ctx.font = `bold ${72 * sc}px "Inter", sans-serif`;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(`${score1} - ${score2}`, CENTER_X, CENTER_Y - 25 * sc);

    // 6. Takım isimleri
    ctx.font = `${16 * sc}px "Inter", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    if (team1) ctx.fillText(team1.name, CENTER_X - 160 * sc, logoY + 50 * sc);
    if (team2) ctx.fillText(team2.name, CENTER_X + 160 * sc, logoY + 50 * sc);

    // 7. Kazanan yazısı (altın renk)
    let winnerMsg = '';
    if (score1 > score2) {
        winnerMsg = t.simTeamWon.replace('%team%', team1.name);
    } else if (score2 > score1) {
        winnerMsg = t.simTeamWon.replace('%team%', team2.name);
    } else {
        winnerMsg = t.simDraw;
    }

    ctx.font = `bold ${28 * sc}px "Inter", sans-serif`;
    ctx.fillStyle = '#ffd700';
    ctx.fillText(winnerMsg, CENTER_X, CENTER_Y + 70 * sc);

    // 8. Alt logo/branding
    ctx.font = `${12 * sc}px "Inter", sans-serif`;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillText('OpenLineup', CENTER_X, CENTER_Y + 110 * sc);

    ctx.restore();
}

function showWinnerOverlay() {
    // Sol panelde winner panelini göster + ayarları aç
    toggleSettings(true);
    const winnerPanel = document.getElementById('sim-winner-panel');
    winnerPanel.style.display = 'flex';

    document.getElementById('panel-score-text').textContent = `${score1} - ${score2}`;

    const t = simTranslations[currentLang];
    const winnerText = document.getElementById('panel-winner-text');
    if (score1 > score2) {
        winnerText.textContent = t.simTeamWon.replace('%team%', team1.name);
    } else if (score2 > score1) {
        winnerText.textContent = t.simTeamWon.replace('%team%', team2.name);
    } else {
        winnerText.textContent = t.simDraw;
    }
}

// ----- SHARING & DOWNLOAD -----
function downloadVideo() {
    if (!recordingUrl) {
        alert("Video hazırlanıyor, lütfen birkaç saniye daha bekleyin...");
        return;
    }

    // Uzantıyı gerçek mimeType'tan belirle
    const mime = mediaRecorder?.mimeType || '';
    const ext = mime.includes('mp4') ? 'mp4' : 'webm';

    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = recordingUrl;
    a.download = `openlineup_sim_${team1.name.replace(/\s+/g, '_')}_vs_${team2.name.replace(/\s+/g, '_')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
}

function shareToX() {
    const t = simTranslations[currentLang];
    let resultText = t.simTeamWon.replace('%team%', team1.name) + '\n';
    if (score1 < score2) resultText = t.simTeamWon.replace('%team%', team2.name) + '\n';
    if (score1 === score2) resultText = t.simDraw + '\n\n';

    const text = `${resultText} ${team1.name} ${score1} - ${score2} ${team2.name}\n\nhttps://lineup.keyshout.com #Football #OpenLineup`;

    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(twitterUrl, '_blank');
}

// ==========================================
// Gravity Lens Animation (Shared with main page)
// ==========================================
(function initGravityLens() {
    const canvas = document.getElementById('gravity-lens-bg');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gridColor = "94, 255, 174";
    const lensStrength = 35;
    const gridSpacing = 40;
    const lensRadius = 200;

    const pointer = { x: -9999, y: -9999 };

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

        requestAnimationFrame(animate);
    }

    resize();
    animate();
})();

// Initialize language on load (read from localStorage)
setSimLanguage(localStorage.getItem('openlineup-lang') || 'tr');
