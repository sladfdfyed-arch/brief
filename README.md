# Brief

A product wheel blog built with Next.js. Browse products in a center-locked wheel, view tweet/video embeds, and manage content via the admin panel.

## Features

- **Wheel UI** – Scroll through products with mouse wheel
- **Tweet & video embeds** – YouTube, Vimeo, Loom, Streamable, Wistia, Dailymotion, Twitch
- **Voiceover captions** – Record and play audio per product
- **Admin** – Add, edit, delete products at `/admin`

## Deploy to Vercel

1. Push this repo to GitHub
2. [Import the project](https://vercel.com/new) in Vercel
3. Link a **Vercel Blob** store (Storage tab) so add/delete works
4. Deploy

## Local development

```bash
npm install
npm run dev
```

Set `BLOB_READ_WRITE_TOKEN` in `.env.local` for Blob storage, or use local file fallback.
