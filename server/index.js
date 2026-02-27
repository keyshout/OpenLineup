import express from 'express';
import cors from 'cors';
import { searchClub, getClubSquad } from './scraper.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Root Endpoint
app.get('/', (req, res) => {
    res.send('LineupPro Backend API Server is running. Please access the application from the Vite frontend URL (e.g. http://localhost:5173 or http://localhost:5174).');
});

// Search Club Endpoint
app.get('/api/search', async (req, res) => {
    const { q } = req.query;
    if (!q) {
        return res.status(400).json({ error: 'Query parameter "q" is required' });
    }

    console.log(`[API] Searching for club: ${q}`);
    const results = await searchClub(q);
    res.json(results);
});

// Get Squad Endpoint
app.get('/api/squad/:id', async (req, res) => {
    const { id } = req.params;
    const { slug } = req.query; // optional slug

    console.log(`[API] Getting squad for club id: ${id}`);
    const squad = await getClubSquad(id, slug);
    res.json(squad);
});

// Image Proxy Endpoint (to bypass html2canvas CORS issues)
app.get('/api/image-proxy', async (req, res) => {
    try {
        const imageUrl = req.query.url;
        if (!imageUrl || imageUrl === 'undefined' || imageUrl === 'null') {
            return res.status(400).send('URL required or invalid');
        }

        // Ensure image url has protocol
        const safeUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;

        const response = await fetch(safeUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
                'Accept-Language': 'en-US,en;q=0.9',
                'Referer': 'https://www.transfermarkt.com/'
            }
        });

        if (!response.ok) {
            console.error(`Fetch failed for ${safeUrl} with status ${response.status}`);
            return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
        }

        const buffer = await response.arrayBuffer();
        res.set('Content-Type', response.headers.get('content-type') || 'image/jpeg');
        res.set('Cache-Control', 'public, max-age=31536000');
        res.set('Access-Control-Allow-Origin', '*');
        res.send(Buffer.from(buffer));
    } catch (error) {
        console.error('Image proxy error:', error);
        res.status(500).send('Error proxying image');
    }
});

app.listen(PORT, () => {
    console.log(`Backend API Server running at http://localhost:${PORT}`);
});
