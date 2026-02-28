import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { getClubSquad } from '../server/scraper.js';
import https from 'https';
import { fileURLToPath } from 'url';
import sqlite3pkg from 'sqlite3';

const sqlite3 = sqlite3pkg.verbose();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const SQLITE_DB_PATH = path.join(DATA_DIR, 'database.sqlite');
const IMG_CLUBS_DIR = path.join(DATA_DIR, 'img', 'clubs');
const IMG_PLAYERS_DIR = path.join(DATA_DIR, 'img', 'players');
const IMG_FLAGS_DIR = path.join(DATA_DIR, 'img', 'flags');

[DATA_DIR, IMG_CLUBS_DIR, IMG_PLAYERS_DIR, IMG_FLAGS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

async function downloadImage(url, dest) {
    if (!url) return null;
    if (fs.existsSync(dest)) return true; // Zaten indirilmişse pass geç
    try {
        const safeUrl = url.startsWith('//') ? `https:${url}` : url;
        const res = await fetch(safeUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Referer': 'https://www.transfermarkt.com/'
            }
        });
        if (!res.ok) return null;
        const arrayBuffer = await res.arrayBuffer();
        fs.writeFileSync(dest, Buffer.from(arrayBuffer));
        return true;
    } catch (e) {
        return null;
    }
}

async function getClubsFromCompetition(compId, slug) {
    const url = `https://www.transfermarkt.com/${slug}/startseite/wettbewerb/${compId}`;
    console.log(`Fetching clubs from ${url}`);

    const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
    });
    const html = await res.text();
    const $ = cheerio.load(html);

    const clubs = [];
    $('table.items tbody tr.odd, table.items tbody tr.even').each((i, el) => {
        const nameLink = $(el).find('td.hauptlink.no-border-links a');
        if (!nameLink.length) return;
        const href = nameLink.attr('href');
        const name = nameLink.text().trim();

        // Örn: /galatasaray-istanbul/startseite/verein/141/saison_id/2023 -> id = 141
        const idMatch = href.match(/verein\/(\d+)/);
        if (!idMatch) return;
        const id = idMatch[1];

        let img = $(el).find('td.zentriert img').attr('src');
        if (img) {
            img = img.replace('tiny', 'head').replace('small', 'head').replace('normal', 'head');
            if (img.includes('default.png')) img = null; // Default lara gerek yok
        }

        // Çifte eklemeleri engelle
        if (!clubs.find(c => c.id === id)) {
            clubs.push({ id, name, href, image: img });
        }
    });
    return clubs;
}

async function run() {
    const competitions = [
        // EUROPE — First Tier (all pages)
        { id: 'GB1', slug: 'premier-league' },
        { id: 'ES1', slug: 'laliga' },
        { id: 'IT1', slug: 'serie-a' },
        { id: 'L1', slug: 'bundesliga' },
        { id: 'FR1', slug: 'ligue-1' },
        { id: 'PO1', slug: 'liga-portugal' },
        { id: 'TR1', slug: 'super-lig' },
        { id: 'NL1', slug: 'eredivisie' },
        { id: 'RU1', slug: 'premier-liga' },
        { id: 'BE1', slug: 'jupiler-pro-league' },
        { id: 'GR1', slug: 'super-league-1' },
        { id: 'TS1', slug: 'chance-liga' },
        { id: 'UKR1', slug: 'premier-liga' },
        { id: 'DK1', slug: 'superliga' },
        { id: 'C1', slug: 'super-league' },
        { id: 'PL1', slug: 'pko-bp-ekstraklasa' },
        { id: 'SC1', slug: 'scottish-premiership' },
        { id: 'A1', slug: 'bundesliga' },
        { id: 'NO1', slug: 'eliteserien' },
        { id: 'SER1', slug: 'super-liga-srbije' },
        { id: 'SE1', slug: 'allsvenskan' },
        { id: 'RO1', slug: 'superliga' },
        { id: 'KR1', slug: 'supersport-hnl' },
        { id: 'BU1', slug: 'efbet-liga' },
        { id: 'ISR1', slug: 'ligat-haal' },

        { id: 'UNG1', slug: 'nemzeti-bajnoksag' },
        { id: 'ZYP1', slug: 'cyprus-league' },
        { id: 'AZ1', slug: 'premyer-liqa' },
        { id: 'SLO1', slug: 'nike-liga' },
        { id: 'KAS1', slug: 'premier-liga' },
        { id: 'SL1', slug: 'prva-liga' },
        { id: 'BOS1', slug: 'premijer-liga-bosne-i-hercegovine' },
        { id: 'WER1', slug: 'vysheyshaya-liga' },
        { id: 'ARM1', slug: 'premier-league' },
        { id: 'ALB1', slug: 'kategoria-superiore' },
        { id: 'KO1', slug: 'superliga-e-kosoves' },
        { id: 'MT1N', slug: 'premier-league-opening-round' },
        { id: 'MT1P', slug: 'premier-league-closing-round' },
        { id: 'LET1', slug: 'virsliga' },
        { id: 'LI1', slug: 'a-lyga' },
        { id: 'MAZ1', slug: 'prva-makedonska-fudbalska-liga' },
        { id: 'FI1', slug: 'veikkausliiga' },
        { id: 'IR1', slug: 'league-of-ireland-premier-division' },
        { id: 'MNE1', slug: 'meridianbet-1-cfl' },
        { id: 'NIR1', slug: 'premiership' },
        { id: 'IS1', slug: 'besta-deild' },
        { id: 'LUX1', slug: 'bgl-ligue' },
        { id: 'MO1N', slug: 'super-liga' },
        { id: 'GE1N', slug: 'erovnuli-liga' },
        { id: 'AND1', slug: 'primera-divisio' },

        { id: 'WAL1', slug: 'cymru-premier' },
        { id: 'FARO', slug: 'betri-deildin' },
        { id: 'SMR1', slug: 'campionato-sammarinese' },
        { id: 'GI1', slug: 'gibraltar-football-league' },
        { id: 'GZO1', slug: 'gozo-football-league-first-division' },


        { id: 'TR1', slug: 'super-lig' },
        { id: 'ES1', slug: 'laliga' },
        { id: 'GB1', slug: 'premier-league' },
        { id: 'IT1', slug: 'serie-a' },
        { id: 'L1', slug: 'bundesliga' },
        { id: 'FR1', slug: 'ligue-1' },
        { id: 'NL1', slug: 'eredivisie' },
        { id: 'PO1', slug: 'liga-portugal-bwin' },
        { id: 'BE1', slug: 'jupiler-pro-league' },
        { id: 'SA1', slug: 'saudi-pro-league' },
        // ASIA / OCEANIA — First Tier (page 1)
        { id: 'SA1', slug: 'saudi-pro-league' },
        { id: 'QSL', slug: 'qatar-stars-league' },
        { id: 'UAE1', slug: 'uae-pro-league' },
        { id: 'JAP1', slug: 'j1-league' },
        { id: 'CSL', slug: 'chinese-super-league' },
        { id: 'IRN1', slug: 'persian-gulf-pro-league' },
        { id: 'RSK1', slug: 'k-league-1' },
        { id: 'AUS1', slug: 'a-league-men' },
        { id: 'IRQ1', slug: 'iraq-stars-league' },
        { id: 'UZ1', slug: 'ozbekiston-superligasi' },
        { id: 'IN1L', slug: 'super-league' },
        { id: 'THA1', slug: 'thai-league' },
        { id: 'MYS1', slug: 'malaysia-super-league' },
        { id: 'VIE1', slug: 'v-league-1' },
        { id: 'OM1L', slug: 'oman-jindal-league' },
        { id: 'IND1', slug: 'indian-super-league' },
        { id: 'LIB1', slug: 'lebanese-premier-league' },
        { id: 'JO1L', slug: 'jordanian-pro-league' },
        { id: 'KG1L', slug: 'jogorku-liga' },
        { id: 'HGKG', slug: 'hong-kong-premier-league' },
        { id: 'SIN1', slug: 'singapore-premier-league' },
        { id: 'TAD1', slug: 'vysshaya-liga' },
        { id: 'KHM1', slug: 'cambodian-premier-league' },
        { id: 'MYA1', slug: 'myanmar-national-league' },
        { id: 'BGD1', slug: 'bangladesh-football-league' },

        // AFRICA — First Tier (page 1)
        { id: 'EGY1', slug: 'egyptian-premier-league' },
        { id: 'SFA1', slug: 'betway-premiership' },
        { id: 'MAR1', slug: 'botola-pro-inwi' },
        { id: 'ALG1', slug: 'ligue-1' },
        { id: 'TUN1', slug: 'ligue-1' },
        { id: 'LPL', slug: 'libyan-premier-league' },
        { id: 'UGL1', slug: 'uganda-premier-league' },
        { id: 'ETP1', slug: 'ethiopian-premier-league' },
        { id: 'GHPL', slug: 'ghana-premier-league' },
        { id: 'NPFL', slug: 'nigeria-professional-football-league' },
        { id: 'BFL1', slug: 'ligue-1' },
        { id: 'SEN1', slug: 'ligue-1' },
        { id: 'COM1', slug: 'championnat-des-comores-de-d1' },

        // AMERICA — First Tier (page 1)
        { id: 'BRA1', slug: 'campeonato-brasileiro-serie-a' },
        { id: 'MLS1', slug: 'major-league-soccer' },
        { id: 'ARG1', slug: 'torneo-apertura' },
        { id: 'MEX1', slug: 'liga-mx-clausura' },
        { id: 'MEXA', slug: 'liga-mx-apertura' },
        { id: 'POMX', slug: 'liguilla-apertura' },
        { id: 'COLP', slug: 'liga-dimayor-apertura' },
        { id: 'URU1', slug: 'liga-auf-apertura' },
        { id: 'CLPD', slug: 'liga-de-primera' },
        { id: 'EC1N', slug: 'ligapro-serie-a' },
        { id: 'TDeA', slug: 'liga-1-apertura' },
        { id: 'PR1A', slug: 'primera-division-apertura' },
        { id: 'BO1A', slug: 'division-profesional' },
        { id: 'VZ1A', slug: 'liga-futve-apertura' },
        { id: 'CRPD', slug: 'primera-division-apertura' },
        { id: 'PDV1', slug: 'primera-division-clausura' },
        { id: 'GU1A', slug: 'liga-guate-apertura' },
        { id: 'GU1C', slug: 'liga-nacional-clausura' },
        { id: 'SL1A', slug: 'primera-division-apertura' },
        { id: 'SL1C', slug: 'primera-division-clausura' },
        { id: 'PN1C', slug: 'liga-panamena-de-futbol-clausura' },
        { id: 'HO1A', slug: 'liga-nacional-apertura' },
        { id: 'HOC1', slug: 'liga-nacional-clausura' },
        { id: 'CRPV', slug: 'primera-division-apertura-play-off' },
        { id: 'CDN1', slug: 'canadian-premier-league' },
    ];

    // Load existing DB to skip already fetched clubs (SQLite version)
    const db = new sqlite3.Database(SQLITE_DB_PATH, (err) => {
        if (err) {
            console.error('Veritabanı bağlantı hatası:', err.message);
            process.exit(1);
        }
    });

    // Ensure tables exist
    db.serialize(() => {
        db.run(`CREATE TABLE IF NOT EXISTS clubs (
            id INTEGER PRIMARY KEY,
            name TEXT,
            image TEXT,
            originalImage TEXT,
            competition TEXT
        )`);

        db.run(`CREATE TABLE IF NOT EXISTS players (
            id INTEGER,
            club_id INTEGER,
            name TEXT,
            number TEXT,
            position TEXT,
            originalImage TEXT,
            originalNatImage TEXT,
            image TEXT,
            natImage TEXT,
            natName TEXT
        )`);
    });

    // Fetch existing club IDs
    let existingClubIds = new Set();
    try {
        const rows = await new Promise((resolve, reject) => {
            db.all("SELECT id FROM clubs", [], (err, rows) => {
                if (err) reject(err);
                else resolve(rows);
            });
        });
        rows.forEach(r => existingClubIds.add(String(r.id)));
        console.log(`Loaded existing SQLite DB with ${existingClubIds.size} clubs. Existing ones will be skipped.`);
    } catch (err) {
        console.error("Could not read clubs from SQLite:", err);
    }

    for (const comp of competitions) {
        const clubs = await getClubsFromCompetition(comp.id, comp.slug);
        console.log(`Found ${clubs.length} clubs in ${comp.id}`);

        for (const club of clubs) {
            // Skip if already in our DB
            if (existingClubIds.has(String(club.id))) {
                console.log(`Skipping existing club: ${club.name} (${club.id})`);
                continue;
            }

            console.log(`Processing club: ${club.name} (${club.id})`);

            // 1. Kulüp Logosunu İndir
            let clubLocalImg = null;
            if (club.image) {
                const ext = club.image.split('?')[0].split('.').pop() || 'png';
                const dest = path.join(IMG_CLUBS_DIR, `${club.id}.${ext}`);
                await downloadImage(club.image, dest);
                clubLocalImg = `./data/img/clubs/${club.id}.${ext}`;
            }

            // 2. Takım Kadrosunu Çek (scraper.js üzerinden)
            const squad = await getClubSquad(club.id);
            if (!squad || squad.error || !Array.isArray(squad)) {
                console.log(`--> Failed to fetch squad for ${club.name}`);
                continue;
            }

            const localSquad = [];
            // 3. Oyuncuları Döngüye Al ve Fotoğraflarını İndir
            for (const p of squad) {
                let pImgLocal = null;
                if (p.image && !p.image.includes('default.jpg') && !p.image.includes('default.png')) {
                    const dest = path.join(IMG_PLAYERS_DIR, `${p.id}.jpg`);
                    await downloadImage(p.image, dest);
                    pImgLocal = `./data/img/players/${p.id}.jpg`;
                }

                let flagLocal = null;
                if (p.natImage && p.natName) {
                    const cleanNat = p.natName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'unknown';
                    const dest = path.join(IMG_FLAGS_DIR, `${cleanNat}.png`);
                    await downloadImage(p.natImage, dest);
                    flagLocal = `./data/img/flags/${cleanNat}.png`;
                }

                // Rate Limit koruması: Her oyuncu için 100ms (İsteğe bağlı kapatıldı)
                // await new Promise(r => setTimeout(r, 100));
            } // END for loop over localSquad

            // Insert new club into DB
            db.serialize(() => {
                db.run("BEGIN TRANSACTION");

                const insertClub = db.prepare(`INSERT INTO clubs (id, name, image, originalImage, competition) VALUES (?, ?, ?, ?, ?)`);
                insertClub.run(club.id, club.name, clubLocalImg, club.image, comp.id);
                insertClub.finalize();

                const insertPlayer = db.prepare(`INSERT INTO players (id, club_id, name, number, position, originalImage, originalNatImage, image, natImage, natName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);
                for (const p of localSquad) {
                    insertPlayer.run(p.id, p.club_id, p.name, p.number, p.position, p.originalImage, p.originalNatImage, p.image, p.natImage, p.natName);
                }
                insertPlayer.finalize();

                db.run("COMMIT", (err) => {
                    if (err) console.error(`Error saving ${club.name} to DB:`, err);
                    else {
                        existingClubIds.add(String(club.id));
                        console.log(`--> Saved ${localSquad.length} players for ${club.name} to SQLite`);
                    }
                });
            });

            // Rate Limit koruması: Dizi arası 1 saniye (İsteğe bağlı kapatıldı)
            // await new Promise(r => setTimeout(r, 1000));
        }
    }

    // Close the database connection when all done
    db.close((err) => {
        if (err) console.error(err.message);
        console.log(`\n🎉 Web Scraping sequence complete! Data saved to memory.`);
        console.log(`💾 Connected SQLite Database: ${SQLITE_DB_PATH}`);
    });
}

run().catch(console.error);
