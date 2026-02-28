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

// Game State
let isPlaying = false;
let score1 = 0;
let score2 = 0;
let timer = 0;
let animationId;
let startTime;

// Physics Entities
const PITCH_RADIUS = 280; // Sahanın yarıçapı
const CENTER_X = canvas.width / 2;
const CENTER_Y = canvas.height / 2;

// Kale (Goal Arc)
const GOAL_WIDTH_RAD = Math.PI / 4; // 45 derecelik yay kaleyi temsil edecek
let goalAngle = 0; // Kalenin şu anki rotasyonu (radyan)
const GOAL_SPEED = 0.02; // Kalenin çember etrafında dönme hızı

// Logolar
let logo1Img = new Image();
let logo2Img = new Image();

// Logo Nesneleri
const logos = [
    { img: null, x: CENTER_X - 50, y: CENTER_Y, vx: -5, vy: -3, radius: 25, team: 1 },
    { img: null, x: CENTER_X + 50, y: CENTER_Y, vx: 4, vy: 5, radius: 25, team: 2 }
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
        document.getElementById('sim-winner-overlay').classList.add('hidden');
        startGame();
    });

    // Modal Kapat Butonu
    const btnCloseWinner = document.getElementById('btn-close-winner');
    if (btnCloseWinner) {
        btnCloseWinner.addEventListener('click', () => {
            document.getElementById('sim-winner-overlay').classList.add('hidden');
        });
    }

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
        const response = await fetch('./data/database.sqlite');
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
    if (url.startsWith('/data') || url.startsWith('./data')) return url.replace(/^\.?\/data/, './data');
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
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
            if (!isPlaying) drawScene(); // Seçim yapıldığında sahneyi güncelle
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
            if (!isPlaying) drawScene(); // Seçim yapıldığında sahneyi güncelle
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

// ----- GAMELOOP & PHYSICS -----

function startGame() {
    // EĞER HALA OYNANAN BİR MAÇ VARSA ONU BİTİR / SIFIRLA
    if (isPlaying) {
        isPlaying = false;
        cancelAnimationFrame(animationId);
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }
    }

    // Reset states
    score1 = 0;
    score2 = 0;
    document.getElementById('score1').textContent = 0;
    document.getElementById('score2').textContent = 0;

    const durSelect = document.getElementById('sim-duration');
    simDuration = parseInt(durSelect.value, 10);

    logos[0].x = CENTER_X - 50; logos[0].y = CENTER_Y;
    logos[1].x = CENTER_X + 50; logos[1].y = CENTER_Y;

    // Give random initial velocities
    logos.forEach(l => {
        l.vx = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 3);
        l.vy = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 3);
    });

    goalAngle = 0; // Reset goal angle
    isPlaying = true;
    startTime = Date.now();

    // Start MediaRecorder
    recordedChunks = [];
    const stream = canvas.captureStream(30); // 30 FPS

    let opts = { mimeType: 'video/webm' }; // Default to webm
    if (MediaRecorder.isTypeSupported('video/webm;codecs=h264')) {
        opts = { mimeType: 'video/webm;codecs=h264' };
    } else if (MediaRecorder.isTypeSupported('video/mp4')) { // Check for mp4 support
        opts = { mimeType: 'video/mp4' };
    } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
        opts = { mimeType: 'video/webm;codecs=vp9' };
    }

    try {
        mediaRecorder = new MediaRecorder(stream, opts);
    } catch (e) {
        console.warn("MediaRecorder with specified codecs not supported, falling back to default webm:", e);
        mediaRecorder = new MediaRecorder(stream, { mimeType: 'video/webm' }); // Fallback
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
    goalAngle += GOAL_SPEED;
    if (goalAngle > Math.PI * 2) goalAngle -= Math.PI * 2;

    const goalStart = goalAngle;
    const goalEnd = goalAngle + GOAL_WIDTH_RAD;

    // Move Logos
    logos.forEach(logo => {
        logo.x += logo.vx;
        logo.y += logo.vy;

        const dx = logo.x - CENTER_X;
        const dy = logo.y - CENTER_Y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Çember Sınırına (Sahaya) çarptı mı?
        if (dist + logo.radius >= PITCH_RADIUS) {

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
            } else {
                const nx = dx / dist;
                const ny = dy / dist;

                const dot = logo.vx * nx + logo.vy * ny;

                logo.vx = logo.vx - 2 * dot * nx;
                logo.vy = logo.vy - 2 * dot * ny;

                const overlap = dist + logo.radius - PITCH_RADIUS;
                logo.x -= nx * overlap;
                logo.y -= ny * overlap;

                logo.vx += (Math.random() - 0.5) * 0.5;
                logo.vy += (Math.random() - 0.5) * 0.5;
            }
        }
    });

    // 2. Logolar Birbirine Çarptı Mı? (Circle-Circle Collision)
    const l1 = logos[0];
    const l2 = logos[1];

    // Yalnızca ikisi de sahadaysa ve resimleri yüklendiyse çarpışsınlar
    if (l1.img && l2.img) {
        const dxLogos = l2.x - l1.x;
        const dyLogos = l2.y - l1.y;
        const distLogos = Math.sqrt(dxLogos * dxLogos + dyLogos * dyLogos);
        const minDist = l1.radius + l2.radius;

        if (distLogos < minDist && distLogos > 0) {
            // Çarpışma var. Normalizasyon ve overlap çözümü
            const nxL = dxLogos / distLogos;
            const nyL = dyLogos / distLogos;

            const overlapL = minDist - distLogos;
            // Eşit kütle varsayımıyla her birini overlap'in yarısı kadar geri it
            l1.x -= nxL * (overlapL / 2);
            l1.y -= nyL * (overlapL / 2);
            l2.x += nxL * (overlapL / 2);
            l2.y += nyL * (overlapL / 2);

            // 1D Elastik Çarpışma Matematiği
            // L1 hız bileşenleri
            const dot1 = l1.vx * nxL + l1.vy * nyL;
            // L2 hız bileşenleri
            const dot2 = l2.vx * nxL + l2.vy * nyL;

            // Kütle eşit sayıldığı için vx1' = vx2, yani momentum değiş tokuşu
            // Hız vektörlerinin çarpışma düzlemine dik olan bileşenlerini koru, 
            // paralel olanları (nxL, nyL) değiştir
            const diffDot = dot1 - dot2;

            l1.vx -= diffDot * nxL;
            l1.vy -= diffDot * nyL;
            l2.vx += diffDot * nxL;
            l2.vy += diffDot * nyL;

            // Biraz kaotik sekmeler için hızlarına minik randomlar ekle
            l1.vx += (Math.random() - 0.5) * 1.5;
            l1.vy += (Math.random() - 0.5) * 1.5;
            l2.vx += (Math.random() - 0.5) * 1.5;
            l2.vy += (Math.random() - 0.5) * 1.5;
        }
    }
}

function handleGoal(scoringTeam) {
    if (scoringTeam === 1) {
        score1++;
        document.getElementById('score1').textContent = score1;
    } else {
        score2++;
        document.getElementById('score2').textContent = score2;
    }

    logos[0].x = CENTER_X - 50; logos[0].y = CENTER_Y;
    logos[1].x = CENTER_X + 50; logos[1].y = CENTER_Y;

    logos.forEach(l => {
        l.vx = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 3);
        l.vy = (Math.random() > 0.5 ? 1 : -1) * (4 + Math.random() * 3);
    });
}

function drawScene() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Renk Ayarlarını Al
    const pitchPicker = document.getElementById('sim-pitch-color');
    const centerColor = pitchPicker ? pitchPicker.value : '#1a2a3a';

    const goalPicker = document.getElementById('sim-goal-color');
    const goalColorStr = goalPicker ? goalPicker.value : '#ffd700';

    const team1Picker = document.getElementById('sim-team1-color');
    const team1ColorStr = team1Picker ? team1Picker.value : '#ffffff';

    const team2Picker = document.getElementById('sim-team2-color');
    const team2ColorStr = team2Picker ? team2Picker.value : '#ffffff';

    const bgGradient = ctx.createRadialGradient(CENTER_X, CENTER_Y, 10, CENTER_X, CENTER_Y, canvas.width / 1.5);
    bgGradient.addColorStop(0, centerColor);
    bgGradient.addColorStop(1, '#0a0f14');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Saha Çizgileri Stili
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.lineWidth = 4;

    // Orta Çizgi (Yatay)
    ctx.beginPath();
    ctx.moveTo(CENTER_X - PITCH_RADIUS, CENTER_Y);
    ctx.lineTo(CENTER_X + PITCH_RADIUS, CENTER_Y);
    ctx.stroke();

    // Orta Yuvarlak
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, 60, 0, Math.PI * 2);
    ctx.stroke();

    // Dış Saha Çizgisi (Karanlık Glow)
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, PITCH_RADIUS, 0, Math.PI * 2);
    ctx.strokeStyle = '#223344';
    ctx.lineWidth = 10;
    ctx.stroke();

    // Kale 
    ctx.beginPath();
    ctx.arc(CENTER_X, CENTER_Y, PITCH_RADIUS, goalAngle, goalAngle + GOAL_WIDTH_RAD);
    ctx.strokeStyle = goalColorStr;
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.shadowColor = goalColorStr;
    ctx.shadowBlur = 20;
    ctx.stroke();

    ctx.stroke();
    ctx.shadowBlur = 0;

    // ---------------------------------
    // CANVAS İÇİ SKORBORD (HEADER) - LOGOLARIN ALTINDA (Z-INDEX 1)
    // ---------------------------------
    ctx.save();
    ctx.globalAlpha = 0.35; // Tüm skorbordun saydamlığı (daha silik/faded)
    const sbY = CENTER_Y - 40;

    // Süre
    const elapsed = isPlaying ? Math.floor((Date.now() - startTime) / 1000) : 0;
    let remaining = simDuration - elapsed;
    if (remaining < 0) remaining = 0;
    const m = Math.floor(remaining / 60).toString().padStart(2, '0');
    const s = (remaining % 60).toString().padStart(2, '0');

    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    ctx.font = 'bold 16px "Inter", sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.fillText(`${m}:${s}`, CENTER_X, sbY + 16);

    // Skor (Büyük)
    ctx.font = 'bold 36px "Inter", sans-serif';
    ctx.fillStyle = '#fff';
    ctx.fillText(`${score1} - ${score2}`, CENTER_X, sbY + 44);

    // Ev Sahibi (Sol)
    ctx.textAlign = 'right';
    ctx.font = '16px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff'; // Keep white font on scoreboard
    if (team1) ctx.fillText(team1.name, CENTER_X - 100, sbY + 44, 120);
    if (logos[0].img && logos[0].img.complete) {
        const img0 = logos[0].img;
        const maxSb = 40;
        const ratio0 = Math.min(maxSb / img0.naturalWidth, maxSb / img0.naturalHeight);
        const w0 = img0.naturalWidth * ratio0;
        const h0 = img0.naturalHeight * ratio0;
        ctx.drawImage(img0, CENTER_X - 90 + (maxSb - w0) / 2, sbY + 24 + (maxSb - h0) / 2, w0, h0);
    }

    // Deplasman (Sağ)
    ctx.textAlign = 'left';
    ctx.font = '16px "Inter", sans-serif';
    ctx.fillStyle = '#ffffff'; // Keep white font on scoreboard
    if (team2) ctx.fillText(team2.name, CENTER_X + 100, sbY + 44, 120);
    if (logos[1].img && logos[1].img.complete) {
        const img1 = logos[1].img;
        const maxSb1 = 40;
        const ratio1 = Math.min(maxSb1 / img1.naturalWidth, maxSb1 / img1.naturalHeight);
        const w1 = img1.naturalWidth * ratio1;
        const h1 = img1.naturalHeight * ratio1;
        ctx.drawImage(img1, CENTER_X + 50 + (maxSb1 - w1) / 2, sbY + 24 + (maxSb1 - h1) / 2, w1, h1);
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

}

function endGame() {
    isPlaying = false;
    cancelAnimationFrame(animationId);
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
    }

    const modal = document.getElementById('sim-winner-overlay');
    modal.classList.remove('hidden');

    const winnerText = document.getElementById('winner-text');
    const scoreText = document.getElementById('winner-score-text');

    scoreText.textContent = `${score1} - ${score2}`;

    const t = simTranslations[currentLang];
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

    // Uzantı belirle (Mp4 ya da webm destekleniyorsa)
    let ext = "mp4";
    if (mediaRecorder && mediaRecorder.mimeType && mediaRecorder.mimeType.includes("webm") && !mediaRecorder.mimeType.includes("h264")) {
        ext = "webm";
    }

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
