# US Military Life — Official Intelligence Hub

Live military news, presidential briefings, and AI analyst powered by Claude.

## Deploy to Render

### 1. Push to GitHub
```bash
git init
git add .
git commit -m "Initial deploy"
git remote add origin https://github.com/YOUR_USERNAME/us-military-life.git
git push -u origin main
```

### 2. Create a Web Service on Render
1. Go to [render.com](https://render.com) → **New → Web Service**
2. Connect your GitHub repo
3. Render auto-detects the settings from `render.yaml`, but confirm:
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### 3. Add your API Key (critical)
1. In Render dashboard → your service → **Environment**
2. Add a new environment variable:
   - **Key:** `ANTHROPIC_API_KEY`
   - **Value:** your Anthropic API key (from console.anthropic.com)
3. Click **Save** — Render will redeploy automatically

### 4. Done!
Your site will be live at `https://your-service-name.onrender.com`

## Project Structure
```
us-military-life/
├── server.js          # Express proxy server (keeps API key secret)
├── package.json
├── render.yaml        # Render deploy config
└── public/
    └── index.html     # The full site
```

## How it works
- `server.js` serves `public/index.html` as a static file
- All AI calls go to `/api/claude` on your own server
- The server forwards them to Anthropic with your secret API key
- Your key is never exposed in the browser
