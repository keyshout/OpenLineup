<div align="center">
  <h1>🏟️ OpenLineup</h1>
  <p>A modern, interactive, and highly customizable football starting XI lineup builder.</p>
  
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
  [![Vite](https://img.shields.io/badge/Vite-B73BFE?logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)](https://nodejs.org/)

  **[Live Demo (Coming Soon)](#)**
</div>

---

## ✨ Features

- **🔍 Live Player Search**: Direct search integration with Transfermarkt via a custom *Cheerio* based proxy backend. No expensive API keys required!
- **👕 Dynamic Jersey Customization**: Fully customizable SVG jerseys (Striped, Hooped, Halved, Solid) where you can define primary, secondary, and collar colors.
- **🪄 Fantasia Mode**: Build your dream 5-a-side matches with no data limits! Select between 1 to 11 players, place them anywhere, and create custom teams.
- **🏟️ 3D Isometric Pitch**: Stunning 3D layout view that tilts the pitch to a perspective angle while keeping player cards vertically standing.
- **📸 High-Res Export**: Download your created masterpiece as a high-quality picture instantly thanks to `dom-to-image-more`.
- **🌐 Bilingual Support**: Full UI available in both English and Turkish with the built-in i18n system.

## 🛠️ Tech Stack

### Frontend
- **Vanilla JavaScript** (Zero heavy UI frameworks)
- **Vanilla CSS** with modern Grid/Flexbox & Glassmorphism UI
- **Vite** (Next Generation Frontend Tooling)

### Backend (Proxy & Scraper)
- **Node.js & Express** 
- **Cheerio** (Blazing fast HTML parsing for Transfermarkt scraping)

---

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites
Make sure you have Node.js installed (v18+ recommended).
* npm
  ```sh
  npm install npm@latest -g
  ```

### Installation

1. **Clone the repo**
   ```sh
   git clone https://github.com/keyshout/openlineup.git
   ```
2. **Install NPM packages**
   ```sh
   cd openlineup
   npm install
   ```
3. **Run the Application** (Starts both the Node Proxy and Vite Frontend concurrently)
   ```sh
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📦 Deployment Guide

### Deploying to GitHub Pages (Static Frontend Only)
> **⚠️ IMPORTANT:** OpenLineup originally used a Node.js backend to bypass Transfermarkt CORS policies. For static hosts like GitHub Pages, the app now successfully falls back to a massive pre-compiled `database.sqlite` file loaded directly in the browser via WebAssembly (`sql.js`).
> 
> If you deploy strictly to GitHub Pages, the **Fantasia Mode** and **Global Player Search** will still work perfectly thanks to the SQLite fallback! Only real-time scraping features require the active Node.js backend.

**To deploy the Frontend to GitHub Pages:**
1. Update `package.json` with your deploy scripts (e.g. `gh-pages` library).
2. The `vite.config.js` is already configured with `base: './'` for relative path compatibility.
3. Run `npm run build` and push the `dist` folder to your `gh-pages` branch.

### Full-Stack Deployment (Recommended: Render / Heroku / Vercel)
To keep the live search working, you should host the `server/index.js` Express application on a Node.js cloud provider (like Render or Railway) and update the `Vite` proxy target URL to your new cloud API endpoint.

---

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

Please check out our [CONTRIBUTING.md](CONTRIBUTING.md) for more detailed guidelines on how you can participate!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

## 🙏 Acknowledgements

* [Transfermarkt](https://www.transfermarkt.com/) for the comprehensive player database and images.
* [Vite](https://vitejs.dev/) for the incredible build speeds.
* The whole open-source football data community.
