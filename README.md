# Free SVG Viewer

A small, browser-based SVG viewer and converter. Open an SVG, inspect its markup, pan and zoom the preview, or export it as PNG or ICO.

## Privacy

SVG files are read and processed in the browser. The app does not upload selected files or keep a conversion history. It uses browser storage only for the optional install prompt and offline app cache. See [the full privacy policy](./PRIVACY.md) for details.

## Features

- Open SVG files by choosing or dragging them into the app
- Preview with pan, zoom, fit, and reset controls
- Inspect and copy SVG source
- Export SVG, PNG at 1x/2x/4x, or a multi-size ICO favicon
- Install as a Progressive Web App and use it offline after the app shell is cached

## Safety limits

The app accepts SVG files up to 5 MB. PNG export is capped at 8,192 pixels on either side and 40 million total pixels to avoid exhausting browser memory.

## Development

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Checks

```bash
npm run lint
npm test
npm run build
```

The test suite covers SVG validation, dimension parsing, and export-size safeguards.

## Deployment

Set `NEXT_PUBLIC_SITE_URL` to the public site origin before deployment so generated metadata, robots.txt, and sitemap URLs use the correct domain. The default is `https://freesvgviewer.com`.

## License

MIT. See [LICENSE](./LICENSE).
