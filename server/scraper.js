import * as cheerio from 'cheerio';

export async function searchClub(query) {
    const tmUrl = `https://www.transfermarkt.com/schnellsuche/ergebnis/schnellsuche?query=${encodeURIComponent(query)}`;

    try {
        const res = await fetch(tmUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8'
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch from Transfermarkt: ${res.status}`);
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        const clubs = [];

        // Transfermarkt search page clubs table
        $('table.items tbody tr').each((i, el) => {
            const url = $(el).find('td.hauptlink a').attr('href');
            const name = $(el).find('td.hauptlink a').text().trim();
            let imageUrl = $(el).find('td.suche-vereinswappen img').attr('src') || $(el).find('td.suche-vereinswappen img').attr('data-src');

            // Logoları tiny format yerine normal(wappen) formatta çekelim
            if (imageUrl) {
                imageUrl = imageUrl.replace('tiny', 'head').replace('small', 'head').replace('normal', 'head');
                if (!imageUrl.startsWith('http')) {
                    imageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : `https://www.transfermarkt.com${imageUrl}`;
                }
            }

            if (url && name && url.includes('startseite/verein/') && imageUrl) {
                // Determine ID from URL: e.g. /galatasaray-istanbul/startseite/verein/141 -> 141
                const urlParts = url.split('/');
                const id = urlParts[urlParts.length - 1];

                clubs.push({
                    id,
                    name,
                    url: `https://www.transfermarkt.com${url}`,
                    image: imageUrl
                });
            }
        });

        // Remove duplicates if any
        return Array.from(new Map(clubs.map(item => [item.id, item])).values());

    } catch (error) {
        console.error("Error during searchClub:", error);
        return { error: error.message };
    }
}

export async function getClubSquad(clubId, clubNameSlug) {
    // Determine the squad url based on id and slug (slug isn't strictly necessary for routing, but good practice. tm usually redirects properly if just id is correct)
    const tmUrl = `https://www.transfermarkt.com/${clubNameSlug || 'club'}/kader/verein/${clubId}`;

    try {
        const res = await fetch(tmUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
                'Accept-Language': 'en-US,en;q=0.9,tr;q=0.8'
            }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch squad from Transfermarkt: ${res.status}`);
        }

        const html = await res.text();
        const $ = cheerio.load(html);

        const squad = [];

        // The table containing the players
        $('table.items tbody tr.odd, table.items tbody tr.even').each((i, el) => {
            const row = $(el);

            // Name and ID
            const nameLink = row.find('td.hauptlink a');
            const url = nameLink.attr('href');

            // Extracting just the name text by taking the first child node and trimming it,
            // effectively ignoring span or br values inside the a tag
            let name = "";
            const firstNode = nameLink.contents().first();
            if (firstNode && firstNode.length) {
                name = firstNode.text().trim();
            } else {
                name = nameLink.text().trim().split(/\\s{2,}|€/)[0];
            }


            if (!url || !name) return; // Not a player row

            const urlParts = url.split('/');
            const id = urlParts[urlParts.length - 1];

            // Image
            let imageUrl = row.find('img.bilderrahmen-fixed').attr('data-src') || row.find('img.bilderrahmen-fixed').attr('src');
            // Fix lazyload placeholder issue
            if (imageUrl && imageUrl.includes('default.jpg')) {
                imageUrl = row.find('img.bilderrahmen-fixed').attr('data-src') || imageUrl;
            }
            if (imageUrl && !imageUrl.startsWith('http')) {
                imageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : `https://www.transfermarkt.com${imageUrl}`;
            }

            // Position
            // The position is often the second line in the name cell or the td next to the image
            const position = row.find('table.inline-table tr').eq(1).find('td').text().trim();

            // Number
            const number = row.find('div.rn_nummer').text().trim() || row.find('td.zentriert').first().text().trim();

            // Nationality Flag
            let natImage = row.find('img.flaggenrahmen').first().attr('src') || '';
            const natName = row.find('img.flaggenrahmen').first().attr('title') || '';
            if (natImage) {
                natImage = natImage.replace('verysmall', 'head').replace('tiny', 'head').replace('normal', 'head');
                if (!natImage.startsWith('http')) {
                    natImage = natImage.startsWith('//') ? `https:${natImage}` : `https://www.transfermarkt.com${natImage}`;
                }
            }

            squad.push({
                id,
                name,
                number,
                position,
                image: imageUrl,
                natImage,
                natName
            });
        });

        return squad;
    } catch (error) {
        console.error("Error during getClubSquad:", error);
        return { error: error.message };
    }
}
