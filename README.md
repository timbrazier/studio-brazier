# Studio Brazier

The Studio Brazier website — a static, dependency-free site built from the Figma
designs. Two pages: a homepage with a masonry grid of projects, and an about page.

```
index.html            Homepage — intro, project grid, contact
about.html            About me
404.html              Not-found page (GitHub Pages serves this automatically)
assets/
  css/styles.css      All styling
  js/main.js          Tap-to-reveal on the project tiles + copyright year
  fonts/              Figtree, self-hosted (SIL Open Font License)
  img/projects/       Project artwork — placeholders, see below
  img/portrait.svg    About-page portrait — placeholder, see below
.github/workflows/    GitHub Pages deployment
```

There is no build step and no framework. Open `index.html` in a browser, or run a
local server so relative paths behave exactly as they will in production:

```sh
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Things to swap in

The build is complete, but a few assets and details are stand-ins because they
weren't available. Each one is a straight file or text replacement.

**Project artwork.** Nothing — the real exports are in
`assets/img/projects/`. Each one is a finished tile with its background baked
in, so it fills its card edge to edge; there is no separate background colour to
keep in sync. See "Project tiles" below if you ever need to replace one.

**Portrait.** Nothing — `assets/img/tim-brazier.png` is the real photo, with a
WebP alongside it that modern browsers take instead.

**Project descriptions.** Nothing — all thirteen are your copy. To edit one, the
title, description and category on a hover panel are the `.tile__title`,
`.tile__desc` and `.tile__tag` inside that tile's `<article>` in `index.html`.
See "Hover panels" below before writing anything much longer.

**Company number.** `00000000` in the footer of all three pages.

**Typeface.** Nothing — the fonts are the real ones. See "Typography" below.

## Hosting on GitHub Pages

Everything needed is already in the repository. Once this branch is merged to
`main`:

1. Go to the repository's **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**.

That's it. Every push to `main` runs `.github/workflows/deploy.yml`, which
publishes the repository root. The first deploy takes a couple of minutes; after
that the site is live at `https://<username>.github.io/<repository>/`.

GitHub Pages is free for public repositories, including HTTPS.

### Using studiobrazier.co instead

1. Create a file called `CNAME` in the repository root containing one line — your
   domain, with no protocol and no trailing slash:

   ```
   studiobrazier.co
   ```

2. At your DNS provider, for an apex domain like `studiobrazier.co`, add four
   `A` records pointing at GitHub's Pages servers:

   ```
   185.199.108.153
   185.199.109.153
   185.199.110.153
   185.199.111.153
   ```

   (And optionally a `CNAME` record for `www` pointing at
   `<username>.github.io`.)

3. In **Settings → Pages**, enter the domain under **Custom domain**, then tick
   **Enforce HTTPS** once the certificate has been issued — that can take up to
   an hour.

GitHub's own guide has the current values if they ever change:
<https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site>

## Notes on how it's built

- **The grid** is CSS multi-column. On wide screens, `data-col-start` on two tiles
  forces the column breaks so the three stacks match the design exactly. Below
  1060px that's released and the browser balances two columns; below 640px it
  becomes a single column. Tile heights come from `aspect-ratio` values taken
  from the design, so the rhythm holds at every width.
- **The hover panel** is CSS-driven (`:hover` and `:focus-within`), so it works
  without JavaScript and for keyboard users. On touch devices, where there is no
  hover, `main.js` makes a tap open the panel and a tap elsewhere close it.
- **Accessibility**: each tile carries a visually hidden button with
  `aria-expanded`, the panel text is always in the DOM for screen readers, there's
  a skip link, and `prefers-reduced-motion` is respected.
- **No third-party requests.** The fonts are self-hosted, so nothing loads from
  another domain.

## Hover panels

The panel sizes its own type against the card it sits in, using container
queries in `assets/css/styles.css`. There are four steps, and a card picks one
by its height — and, at the tightest step, its width too, because a narrow card
needs more lines for the same words. The narrowest cards on the site are not the
phone ones; they're the two-column layout between 640px and 1060px.

This exists because the cards range from 134px to 488px tall while the copy does
not shrink to match. Without it, the shortest cards overflowed — Make it Click
by 71px, Good Things Foundation by 34px.

**If you lengthen a description, check the short cards still fit.** The tightest
are Make it Click, Good Things Foundation, MindWell and Comoodle. Open the page,
hover each one, and look for clipped text; the two-column range around 700px
wide is where it will show first. Current copy is verified clear at every width
from 320px to 1920px.

There is a floor to this: type can only shrink so far before it stops being
readable, and Make it Click is already at it. If that one needs longer copy,
give the card more height rather than smaller type — its `aspect-ratio` in the
tile-heights block, which the design put at 360/134.

## Project tiles

Each export in `assets/img/projects/` is a complete tile — logo *and* background
— so the image fills its card with `object-fit: cover` and there is no CSS
padding or logo sizing to maintain.

The card heights come from the design and don't always match the exports' own
proportions, so `cover` trims the overflow. That's safe here because every logo
sits centred on a flat field, and each card also carries a `background` colour
sampled from its own image's edge, so nothing flashes white while loading and no
seam shows at the rounded corners. If you swap an image for one with a
noticeably different shape, check it still reads — and update that sampled
colour in `assets/css/styles.css` to match.

Filenames are lowercase and hyphenated, and the `<img>` tags carry each file's
real pixel dimensions. If you replace a file with one of a different size,
update `width` and `height` in `index.html` too — they reserve the right space
while the page loads.

Images were re-encoded on the way in: the flat vector exports are 256-colour
palette PNGs (visually identical, ~85% smaller) and the portrait keeps full
colour with a WebP companion. All thirteen tiles together come to about 128KB.

## Typography

Two families, both self-hosted in `assets/fonts/` and both SIL Open Font
Licensed (licence text sits alongside them):

| | Family | Files | Weights |
|---|---|---|---|
| `--font-display` | [Lilita One](https://fonts.google.com/specimen/Lilita+One) | `lilita-one-*.woff2` | 400 only |
| `--font-body` | [Plus Jakarta Sans](https://fonts.google.com/specimen/Plus+Jakarta+Sans) | `plus-jakarta-sans-*.woff2` | variable 200–800 |

Two things to know before editing type:

**Lilita One has exactly one weight.** Every rule that uses `--font-display`
sets `font-weight: 400`. Asking for a bolder weight makes the browser
synthesise a fake one, which thickens the strokes unevenly — `font-synthesis:
none` on `body` prevents that happening silently, so a wrong weight will simply
look untouched rather than subtly wrong.

**Display type set inside body copy is sized up.** Lilita One's cap height is
704/1000 em against Plus Jakarta Sans's 745/1000, so at matching pixel sizes it
looks smaller. The three inline runs — `.intro .name`, `.about__body .lede` and
`.email-link` — are set to `1.35em` to match the design, with `line-height: 1`
so the taller inline box can't stretch the line it sits on.

Each family is split into `latin` and `latin-ext` files with `unicode-range`, so
a visitor only downloads the extended set if the page actually uses those
characters. Total for a normal English page: about 38KB.
