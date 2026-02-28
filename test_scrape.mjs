import * as cheerio from 'cheerio';
import fs from 'fs';

const names = [
    'Roberto Carlos', 'Luis Figo', 'Rivaldo', 'Marco van Basten', 'Ruud Gullit',
    'Frank Rijkaard', 'Lothar Matthäus', 'Gerd Müller', 'Eusebio', 'Bobby Charlton',
    'Alfredo Di Stéfano', 'Ferenc Puskás', 'Michel Platini', 'Hristo Stoichkov',
    'Samuel Eto\'o', 'Didier Drogba', 'Yaya Touré', 'Patrick Vieira', 'Roy Keane',
    'Paul Scholes', 'Ryan Giggs', 'Eric Cantona', 'Dennis Bergkamp', 'Alessandro Del Piero',
    'Gianluigi Buffon', 'Fabio Cannavaro', 'Alessandro Nesta', 'Oliver Kahn', 'Peter Schmeichel',
    'Edwin van der Sar', 'Nemanja Vidic', 'Rio Ferdinand', 'Ashley Cole', 'Xabi Alonso',
    'Michael Ballack', 'Miroslav Klose', 'Fernando Torres', 'David Villa', 'Wesley Sneijder',
    'Arjen Robben', 'Franck Ribéry', 'Sergio Agüero', 'Gareth Bale', 'Zlatan Ibrahimovic',
    'Eden Hazard', 'Mesut Özil', 'Cesc Fàbregas', 'Petr Cech', 'John Terry', 'Vincent Kompany',
    'Carlos Tevez', 'Gonzalo Higuaín', 'Juan Román Riquelme', 'Gabriel Batistuta',
    'Hernán Crespo', 'Diego Forlán', 'Bebeto', 'Dida', 'Dunga', 'Hugo Sánchez',
    'George Weah', 'Abedi Pelé', 'Roger Milla', 'Raúl Gonzalez', 'Guti', 'Fernando Hierro',
    'Pavel Nedved', 'Tomas Rosicky', 'Dimitar Berbatov', 'Andriy Shevchenko',
    'George Best', 'Kenny Dalglish', 'Ian Rush', 'Carlos Valderrama', 'Rene Higuita',
    'Claudio Taffarel', 'Davor Suker', 'Zvonimir Boban', 'Hakan Sükür', 'Bülent Korkmaz',
    'Rüştü Reçber', 'Emre Belözoğlu', 'Arda Turan', 'Nihat Kahveci', 'Tugay Kerimoğlu'
];

async function searchPlayer(name) {
    const tmUrl = `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(name)}`;
    try {
        const res = await fetch(tmUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
        });
        const html = await res.text();
        const $ = cheerio.load(html);

        let found = false;
        $('table.items tbody tr').each((i, el) => {
            if (found) return;
            const url = $(el).find('td.hauptlink a').attr('href');
            if (url && url.includes('/profil/spieler/') && !url.includes('trainer')) {
                const parts = url.split('/');
                const id = parts[parts.length - 1];
                const slug = parts[1];
                const position = $(el).find('td').eq(4).text().trim() || 'Unknown';
                console.log(`{ id: '${id}', name: '${name.replace(/'/g, "\\'")}', slug: '${slug}', position: '${position}' },`);
                found = true;
            }
        });
        if (!found) console.log(`// Not found: ${name}`);
    } catch (e) {
        console.error(`// Error for ${name}: `, e.message);
    }
}

async function run() {
    console.log('const EXTRA_LEGENDS = [');
    for (const n of names) {
        await searchPlayer(n);
        await new Promise(r => setTimeout(r, 600));
    }
    console.log('];');
}
run();
