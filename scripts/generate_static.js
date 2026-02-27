import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { getClubSquad } from '../server/scraper.js';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
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
        { id: 'TR1', slug: 'super-lig' },
        { id: 'ES1', slug: 'laliga' }
    ];

    const allClubs = []; // Bu array tüm DB'yi oluşturacak

    for (const comp of competitions) {
        const clubs = await getClubsFromCompetition(comp.id, comp.slug);
        console.log(`Found ${clubs.length} clubs in ${comp.id}`);

        for (const club of clubs) {
            console.log(`Processing club: ${club.name} (${club.id})`);

            // 1. Kulüp Logosunu İndir
            let clubLocalImg = null;
            if (club.image) {
                const ext = club.image.split('?')[0].split('.').pop() || 'png';
                const dest = path.join(IMG_CLUBS_DIR, `${club.id}.${ext}`);
                await downloadImage(club.image, dest);
                clubLocalImg = `/data/img/clubs/${club.id}.${ext}`;
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
                    pImgLocal = `/data/img/players/${p.id}.jpg`;
                }

                let flagLocal = null;
                if (p.natImage && p.natName) {
                    const cleanNat = p.natName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase() || 'unknown';
                    const dest = path.join(IMG_FLAGS_DIR, `${cleanNat}.png`);
                    await downloadImage(p.natImage, dest);
                    flagLocal = `/data/img/flags/${cleanNat}.png`;
                }

                localSquad.push({
                    id: p.id,
                    name: p.name,
                    number: p.number,
                    position: p.position,
                    originalImage: p.image, // Saklıyoruz fallback için
                    originalNatImage: p.natImage,
                    image: pImgLocal, // Local path /data/img/players/123.jpg
                    natImage: flagLocal,
                    natName: p.natName
                });

                // Rate Limit koruması: Her oyuncu için 100ms
                await new Promise(r => setTimeout(r, 100));
            }

            allClubs.push({
                id: club.id,
                name: club.name,
                image: clubLocalImg,
                originalImage: club.image,
                players: localSquad,
                competition: comp.id
            });

            console.log(`--> Saved ${localSquad.length} players for ${club.name}`);

            // Rate Limit koruması: Dizi arası 1 saniye
            await new Promise(r => setTimeout(r, 1000));
        }
    }

    // 4. db.json Çıktısı
    const dbPath = path.join(DATA_DIR, 'db.json');
    fs.writeFileSync(dbPath, JSON.stringify(allClubs, null, 2));

    console.log(`\n🎉 Static generation complete!`);
    console.log(`💾 Database saved to ${dbPath}`);
    console.log(`Total Clubs: ${allClubs.length}`);
}

run().catch(console.error);
