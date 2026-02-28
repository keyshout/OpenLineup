import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sqlite3pkg from 'sqlite3';

const sqlite3 = sqlite3pkg.verbose();

// ES Module ortamında __dirname tanımlı değildir, kendimiz oluşturuyoruz
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, '../public/data');
const JSON_DB_PATH = path.join(DATA_DIR, 'db.json');
const SQLITE_DB_PATH = path.join(DATA_DIR, 'database.sqlite');

console.log("🔄 Başlatılıyor: JSON Veritabanı SQLite'a Çevriliyor...");

// 1. Eğer halihazırda varsa eski veritabanını sil (sıfırdan yaratmak için)
if (fs.existsSync(SQLITE_DB_PATH)) {
    console.log('🗑️ Eski database.sqlite dosyası siliniyor...');
    fs.unlinkSync(SQLITE_DB_PATH);
}

// 2. Yeni SQLite Bağlantısı Oluştur
const db = new sqlite3.Database(SQLITE_DB_PATH, (err) => {
    if (err) {
        console.error('❌ Veritabanı oluşturulurken hata oluştu:', err.message);
        process.exit(1);
    }
    console.log('✅ Yeni database.sqlite dosyası oluşturuldu ve bağlandı.');
});

// 3. Mevcut JSON verisini belleğe al
if (!fs.existsSync(JSON_DB_PATH)) {
    console.error(`❌ db.json dosyası bulunamadı: ${JSON_DB_PATH}`);
    process.exit(1);
}

console.log('⏳ db.json belleğe yükleniyor...');
const dbJsonRaw = fs.readFileSync(JSON_DB_PATH, 'utf-8');
const allClubs = JSON.parse(dbJsonRaw);
console.log(`📦 Toplam ${allClubs.length} adet kulüp bulundu.`);

db.serialize(() => {
    // 4. Tabloları Oluştur (Clubs ve Players)
    console.log('🛠️ Tablolar oluşturuluyor (clubs & players)...');

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
        natName TEXT,
        FOREIGN KEY (club_id) REFERENCES clubs (id)
    )`);

    // 5. Verileri Ekleme İşlemi (Transaction içinde daha hızlı çalışır)
    console.log('🚀 Veriler tabloya aktarılıyor, bu işlem birkaç saniye sürebilir...');
    db.run("BEGIN TRANSACTION");

    const insertClub = db.prepare(`INSERT INTO clubs (id, name, image, originalImage, competition) VALUES (?, ?, ?, ?, ?)`);
    const insertPlayer = db.prepare(`INSERT INTO players (id, club_id, name, number, position, originalImage, originalNatImage, image, natImage, natName) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

    let totalPlayers = 0;

    for (const club of allClubs) {
        // Kulübü Ekle
        insertClub.run(club.id, club.name, club.image, club.originalImage, club.competition);

        // Kulübün Oyuncularını Ekle
        for (const p of club.players) {
            insertPlayer.run(
                p.id,
                club.id,
                p.name,
                p.number,
                p.position,
                p.originalImage,
                p.originalNatImage,
                p.image,
                p.natImage,
                p.natName
            );
            totalPlayers++;
        }
    }

    insertClub.finalize();
    insertPlayer.finalize();

    db.run("COMMIT", (err) => {
        if (err) {
            console.error('❌ İşlem Commit edilirken hata oluştu:', err.message);
        } else {
            console.log(`🎉 Muazzam! Migration başarıyla tamamlandı.`);
            console.log(`📊 Sonuç:`);
            console.log(`  - ⚽ Kulüp Sayısı: ${allClubs.length}`);
            console.log(`  - 🏃‍♂️ Futbolcu Sayısı: ${totalPlayers}`);
            console.log(`💾 Veritabanı Yolu: ${SQLITE_DB_PATH}`);
        }

        // Bağlantıyı kapat
        db.close();
    });
});
