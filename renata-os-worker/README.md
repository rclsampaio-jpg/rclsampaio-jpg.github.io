# Renata OS Worker

Backend for the Renata OS chat assistant inside RenaSer. This is a small
Cloudflare Worker that holds your Gemini API key as a secret and proxies chat
requests to it — the RenaSer frontend (static site on GitHub Pages) never
sees the key.

## One-time setup

1. **Get a Gemini API key** (if you don't have one yet):
   https://aistudio.google.com/apikey — sign in, click "Create API Key".

2. **Install dependencies** (from this folder):
   ```
   cd renata-os-worker
   npm install
   ```

3. **Log in to Cloudflare** (free account is enough):
   ```
   npx wrangler login
   ```
   This opens a browser window to authenticate — it's interactive, so run it
   yourself in your own terminal.

4. **Set the Gemini key as a secret** (never commit it anywhere):
   ```
   npx wrangler secret put GEMINI_API_KEY
   ```
   Paste the key when prompted. It's stored encrypted by Cloudflare, not in
   any file in this repo.

5. **Deploy**:
   ```
   npm run deploy
   ```
   Wrangler will print a URL like `https://renata-os-worker.<your-subdomain>.workers.dev`.

6. **Connect the frontend**: open `src/config.ts` in the main RenaSer project
   and set:
   ```ts
   export const RENATA_OS_ENDPOINT = 'https://renata-os-worker.<your-subdomain>.workers.dev';
   ```
   Rebuild/redeploy the site and Renata OS will start responding for real.

## Updating the allowed origin

`wrangler.toml` restricts which site can call this Worker via
`ALLOWED_ORIGIN`. It's already set to `https://rclsampaio-jpg.github.io`.
Change it there if the site ever moves to a different domain.

## Costs

Cloudflare Workers' free tier (100,000 requests/day) comfortably covers a
single-user app like this. Gemini API usage is billed by Google separately —
check https://ai.google.dev/pricing for current rates. The free tier there is
generous for personal use, but keep an eye on it if usage grows.
