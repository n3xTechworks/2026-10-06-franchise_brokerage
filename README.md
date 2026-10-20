# Franchise Consulting & Business Brokerage — front-end

Static website (HTML + CSS + vanilla JS). No backend, database, login or dashboard.

## Pages
| File | Page |
|---|---|
| `index.html` | Home 1 – featured business listings |
| `home-2.html` | Home 2 – franchise consulting services |
| `about.html` | About |
| `buy-a-business.html` | Buy a Business (searchable/filterable listings + buyer enquiry form) |
| `sell-your-business.html` | Sell Your Business (valuation + seller form) |
| `blog.html`, `blog-details.html` | Blog + article |
| `contact.html` | Contact (enquiry form, embedded map, FAQ) |

Open any `.html` directly in a browser, or run `npm run serve` (→ http://localhost:8080).

## Structure
- `assets/css/style.css` – the only stylesheet (design tokens, light/dark theme, RTL-safe logical properties, one font: Plus Jakarta Sans, self-hosted).
- `assets/js/main.js` – theme + RTL toggles (saved in localStorage), nav/dropdown, scroll-reveal, form validation, listing filter.
- `assets/js/validators.js` – pure validation rules (shared by the browser and the unit tests).
- `assets/img/` – optimised JPEGs per page (no photo is used on more than one page), logo, favicon set. Photo credits: `assets/img/CREDITS.txt` (Pexels / Unsplash, free licence).
- Root `*.html` – the finished pages; edit them directly (the shared header/footer/icon sprite are repeated in each page, so change them in every file).

## Form validation (front-end only)
Name: min 2 letters, no numbers · Email: needs `@`, domain and TLD · Phone: digits only (letters are stripped as you type, 7–15 digits) · plus required/select/message/amount rules. Valid forms show a confirmation message (nothing is sent anywhere).

## Tests
```
npm install        # only needed once (jsdom)
npm test           # 96 unit/static/DOM tests (validators, links, images, forms, nav, filter, toggles)
```
Optional browser checks (need `npm i -D playwright && npx playwright install chromium`, and `npm run serve` running):
`node tests/e2e/layout-contrast.mjs` (360/768/1024/1280 × light/dark: overflow, contrast, header control sizes, logo size) and `node tests/e2e/images-load.mjs`.

## Placeholders to replace
Phone `+1 (312) 555-0148`, email `info@fcbbrokerage.com`, address and map location (the header/footer of every page and the map `src` in `contact.html`), social links (footer), listing data and testimonials (sample content).
