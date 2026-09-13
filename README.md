# The Backlog

A bookshelf for your video game backlog. Every game is a book on the shelf; hover one and it slides
out and turns to show its cover. Built with Vite + React.

- Search a game by name and click it to add it. The cover, Metacritic score, screenshots,
  genres, platforms and description are fetched automatically from [RAWG](https://rawg.io).
- Statuses: **Playing**, **Paused**, **Not Started**, **Finished**. Each status gets its own shelf.
- Click a book to open it: change its status, view screenshots full-screen, refresh its info, or remove it.
- Your library is saved in the browser (localStorage). Settings → Export/Import JSON to back it up.

## Setup

1. Get a free API key at <https://rawg.io/apidocs>.
2. Install and run:

   ```bash
   npm install
   npm run dev
   ```

3. Open the app, click the ⚙ button, and paste your key. Or put it in `.env.local` (see `.env.example`):

   ```
   VITE_RAWG_API_KEY=your_key_here
   ```

Note: the key is used from the browser, so it's visible to anyone who uses your deployed site. That's
fine for a personal site; don't use a key you care about on a public one.

## Build

```bash
npm run build     # outputs to dist/
npm run preview
```
