# ALEX TURNER — 3D Designer Portfolio · Clone Spec

Source: screen recording of a Wix Studio portfolio template ("Portfolio Website in Wix Studio",
@designgemstudio). Every value below was read off the video frames. Build a faithful static clone.

**Do not invent new sections, copy, or branding.** Reproduce what is listed here.

---

## 0. Global

- Page background: `#000000`.
- Light panels (`Services`, `Contact`) are off-white `#E9ECEA`, full-bleed, with **large rounded
  top corners** (`border-radius: 48px 48px 0 0`) sitting on the black page.
- The Footer is black and also has **rounded top corners** over the light Contact panel.
- Content max width `1240px`, side padding `clamp(20px, 5vw, 64px)`.
- Scroll behaviour: smooth. Nav links jump to `#about`, `#customers`, `#projects`, `#contact`.
- The video's top "Built on WIX STUDIO" strip is Wix platform chrome, **not** part of the design —
  omit it.

### Type stack

| Role | Font | Notes |
|---|---|---|
| Display (huge headings) | `Archivo Black` | `HI, I'M ALEX`, `ABOUT ME`, `SERVICES`, `PROJECTS`, `LET'S GET IN TOUCH`, `ALEX TURNER`, section numbers `01–05` |
| Body / mid headings | `Poppins` | About paragraph, `What Clients Are Saying`, testimonial copy, service descriptions |
| Labels / nav / tagline | `Archivo` | ALL CAPS, `letter-spacing: .08em`, squarish grotesque feel |

Load from Google Fonts. Everything uppercase where the video shows uppercase.

### Colour tokens

```
--black:        #000000
--panel:        #E9ECEA   /* light section background */
--ink:          #0A0A0A   /* text on light */
--ink-muted:    #7C8583   /* service descriptions, form placeholders */
--white:        #FFFFFF
--white-muted:  #B4B4B4
--hairline:     rgba(255,255,255,.22)   /* card borders on dark */
--hairline-ink: rgba(10,10,10,.25)      /* form underlines on light */
--send-blue:    #3B3BE8   /* SEND button label on light panel */
```

### The gradient pill button (`CONTACT ME`)

Appears in the Hero (top right) and the About section (centred).

- Pill, `border-radius: 999px`, height ~52px, padding `0 34px`.
- Background: `linear-gradient(90deg, #5B21F0 0%, #B026D9 38%, #FF2FA0 62%, #FF9F5A 100%)`.
- Label: white, `Archivo`, uppercase, `letter-spacing:.1em`, ~13px.
- 1px lighter inner ring + soft outer glow (`box-shadow: 0 0 28px rgba(180,40,220,.45)`).
- Hover: glow intensifies slightly, button lifts 2px.

### Chrome / metallic text (`HI, I'M ALEX`)

Silver gradient clipped to text:
`linear-gradient(175deg,#ffffff 0%,#d8d8d8 18%,#8f8f8f 38%,#ffffff 55%,#bdbdbd 72%,#6f6f6f 88%,#e8e8e8 100%)`
with `background-clip:text; color:transparent;` plus a soft dark drop-shadow underneath.

### Outline → fill scroll reveal

`ABOUT ME` and `SERVICES` first render as **outline only** (transparent fill,
`-webkit-text-stroke: 1.5px currentColor`) and animate to solid fill when scrolled into view.
Use an IntersectionObserver that adds `.is-filled`. Honour `prefers-reduced-motion` by
starting filled.

---

## 1. Hero (black)

- **Nav row** across the very top, 4 items spread evenly across the full content width:
  `ABOUT` · `CUSTOMERS` · `PROJECTS` · `CONTACT`. Uppercase, ~13px, letterspaced, white.
- **H1** `HI, I'M ALEX` — chrome text, one line, enormous (`clamp(56px, 11.5vw, 168px)`),
  tight tracking, spans essentially the full content width.
- **Left column** under the H1, the tagline in 3 lines, uppercase, ~15px, white,
  `line-height: 2`:
  `A 3D DESIGNER PASSIONATE` / `ABOUT CRAFTING BOLD AND` / `MEMORABLE PROJECTS 🥹`
  (the trailing glyph is a 3D-style emoji).
- **Right side**, vertically aligned with the tagline: the `CONTACT ME` gradient pill.
- **Centre**: the large 3D character head (`assets/character.svg`) — a stylised young man with
  swept dark-brown hair, heavy brows, large eyes, hoop earrings in both ears, neutral/glum mouth.
  It sits **in front of** the H1 (higher z-index), centred, roughly 42% of viewport width,
  and hangs below into the marquee band.
- Section is ~100vh tall.

## 2. Client logo marquee (black)

Infinite horizontal marquee, all logos rendered white/monochrome, ~34px tall, gap ~90px,
continuous leftward scroll (~28s loop), duplicated track for seamlessness.

Logos, in order:
1. `ProtoSphere` / small caps sub-label `CONNECTION` — molecule-like icon (3 spheres + links) above.
2. `Thelma Watson` / `Artist & Illustrator` — wavy "M"/double-wave mark above.
3. `Impact Creative` — hatched square mark to the left of two stacked words.
4. `SCA LER` (two lines) / `Graphic Design Tool` — square with a diagonal arrow, mark on the left.
5. `PIXEL FORGE` — tall concentric-arc / anvil mark above.
6. `VIOLETA K` / `DESIGN` — angular pointed mark above.

## 3. Gallery marquee (black)

Two rows of rounded image tiles showing colourful abstract 3D renders (glossy blobs, bubbles,
organic shapes — saturated yellows, oranges, blues, greens, pinks).

- Tile: `280 × 190`, `border-radius: 18px`, `object-fit: cover`, gap `14px`.
- Row 1 scrolls **left**, Row 2 scrolls **right**. ~40s loops. Rows offset so they interlock.
- 8 distinct tiles per row, track duplicated.

## 4. About (black) — `#about`

Centred column, generous vertical padding (~160px).

- `ABOUT ME` — display, huge (`clamp(48px,9vw,132px)`), white, outline→fill reveal.
- Paragraph, `Poppins`, ~17px, white, `line-height: 2`, centred, hard line breaks as shown:
  ```
  With over five years of experience in design,
  I specialize in branding, web design, and user experience.
  I love collaborating with businesses that want to stand out
  and showcase their best side.
  Let's create something amazing together!
  ```
- `CONTACT ME` gradient pill, centred below.
- **Floating 3D decorations** absolutely positioned around the block, gently bobbing
  (`translateY` ±10px, 6–9s, staggered delays):
  - chrome/silver asterisk-flower — upper left
  - glossy blue rounded cube — upper right
  - red puffy heart — mid left
  - purple 5-petal flower with yellow centre — mid right
  - small purple blob — lower right

## 5. Services (light panel) — rounded top corners

- `SERVICES` — display, `#0A0A0A`, huge (`clamp(52px,10vw,150px)`), centred,
  slight 3D extrude shadow (`text-shadow: 3px 4px 0 rgba(0,0,0,.18)`), outline→fill reveal.
- Five rows. Each row: big number on the left (display, ~62px, `#0A0A0A`), then title +
  description in a column. A `1px` hairline divider under every row.
  Number column ~150px wide; text column starts at ~200px.
- Title: `Archivo`, uppercase, bold, ~15px, `#0A0A0A`, letterspaced.
- Description: `Poppins`, ~14.5px, `--ink-muted`, `line-height:1.7`, max-width ~640px.

| # | Title | Description |
|---|---|---|
| 01 | 3D MODELING | Creation of detailed objects, characters, or environments tailored to specific client needs, ideal for games, products, and visualizations. |
| 02 | 3D RENDERING | High-quality, photorealistic renders that showcase designs with realistic lighting, textures, and shadows. |
| 03 | 3D ANIMATION | Dynamic animations to bring characters, products, or environments to life for marketing, gaming, or storytelling. |
| 04 | PRODUCT DESIGN | Precise 3D modeling and rendering for showcasing or prototyping consumer products. |
| 05 | 3D PRINTING MODELS | Custom 3D designs prepared and optimized for 3D printing technology. |

## 6. Projects (black) — `#projects`

- `PROJECTS` — display, white, huge, centred, subtle 3D shadow.
- Three **sticky stacking cards**: each card is `position: sticky; top: 90px;` inside a tall
  wrapper so cards slide up and stack on top of one another as you scroll (the video clearly
  shows card 02 overlapping card 01, then 03 overlapping 02).
- Card: black background, `1px solid var(--hairline)`, `border-radius: 28px`, padding `28px`.
- Card header row: number (display, ~44px, white) · then a stacked label
  `CLIENT` (bold, uppercase, ~13px) over the client name (`Poppins`, ~12px, `--white-muted`) ·
  and on the far right a `LIVE PROJECT` pill (transparent, `1px solid var(--hairline)`,
  `border-radius:999px`, ~12px uppercase white, padding `10px 26px`).
- Card body: a 2-column image grid, left image ~2fr and right ~1fr, `border-radius:18px`,
  height ~330px, `object-fit:cover`.

| # | Client | Imagery |
|---|---|---|
| 01 | Skyline Studios | dense stylised flower/garden renders — oranges, lavender, cream blooms |
| 02 | Pixel Forge | miniature diorama village — cottages, trees, river, warm evening light |
| 03 | DreamLab Creations | vivid abstract/liquid colour renders — blues and hot oranges |

## 7. Testimonials (black) — `#customers`

- Heading, `Poppins` Bold ~`clamp(34px,5vw,64px)`, white, two lines centred:
  `What Clients` / `Are Saying` — with a 😍 (smiling-face-with-hearts) 3D emoji floating to the
  right of the second line.
- Two marquee rows of cards, row 1 scrolling **left**, row 2 scrolling **right**, ~55s loops.
- Card: `width: 430px`, black, `1px solid var(--hairline)`, `border-radius: 22px`,
  padding `26px 28px`, `display:flex; gap:20px; align-items:center`.
  - Circular avatar `84px`, `border-radius:50%`, `object-fit:cover`.
  - Quote: `Poppins`, ~13.5px, `#D8D8D8`, `line-height:1.62`.
  - Attribution below quote: `Archivo`, **bold italic**, uppercase, ~12px, white,
    format `NAME, COMPANY`.

Testimonials (use all seven, split across the two rows):

1. "Alex brought our product concept to life in a way we never thought possible. The 3D model was so detailed and realistic, it helped us secure investors and streamline the manufacturing process. Highly recommend!" — **MICHAEL T., PROTOSPHERE INNOVATIONS**
2. "Alex's 3D character designs exceeded all our expectations. The level of detail, creativity, and responsiveness throughout the project was outstanding. Our game wouldn't be the same without their contributions." — **DAVID R., APEX INTERACTIVE**
3. "Alex created detailed 3D models for our medical training program, and the quality was outstanding. The models were precise, realistic, and incredibly easy to understand. We're thrilled with the outcome." — **SARAH K., MEDTECH VISUALS**
4. "Alex's unique 3D designs made our NFT collection a huge success. The art was breathtaking, and their professionalism made the entire process smooth and enjoyable." — **LENA P., CRYPTOCANVAS**
5. "The 3D assets Alex delivered for our game were outstanding. Every detail, from textures to animations, was crafted with care and creativity. They brought our vision to life in ways we never thought possible!" — **CHRIS B., REALMFORGE STUDIOS**
6. "Alex's work on our VR project was exceptional. They built an immersive environment that met all our technical requirements and provided an unforgettable user experience. Highly recommend!" — **DAVID L., VR INNOVATIONS**
7. "The 3D render Alex produced for our campaign turned heads. It added a dynamic edge that made our brand stand out. Truly impressive!" — **MEGAN B., BOLDEDGE MEDIA**

## 8. Contact (light panel) — `#contact`, rounded top corners

Two columns, ~`0.9fr 1.1fr`, vertical padding ~150px.

- **Left**: `LET'S` / `GET IN` / `TOUCH` on three lines, display, `#0A0A0A`,
  `clamp(40px,6.5vw,86px)`, `line-height:1.02`.
  Below it the email as an underlined link: `alex@3dturner.com`, `Poppins`, ~26px, `#0A0A0A`.
- **Right**: underline-style form (no boxes — only a `1px` bottom hairline per field,
  transparent background, placeholder in `--ink-muted`, ~14px, generous `padding: 14px 2px`):
  - Row 1: `Full Name*` (full width)
  - Row 2: `Email*` | `Phone` (two equal columns, `gap: 40px`)
  - Row 3: `Message` (full width, textarea, ~3 rows)
  - `SEND` button: full width of the form column, pill
    (`border:1px solid var(--hairline-ink); border-radius:999px; padding:16px`),
    transparent background, label `SEND` in `--send-blue`, uppercase, letterspaced.
    Submitting shows an inline "Thanks — your message has been sent." confirmation;
    it must not post anywhere.
- **Floating 3D decorations**: a lime-green glossy lightning bolt at the top right,
  and a purple glossy knot/blob at the mid left (partially off the left edge). Both bob gently.

## 9. Footer (black, rounded top corners)

Three columns, top-aligned, padding `90px 0 0`.

- **Left**: `ALEX` / `TURNER` on two lines — display, `clamp(34px,4.5vw,62px)`, **outlined**
  (`color: transparent; -webkit-text-stroke: 1.5px #fff`), `line-height:1.08`.
- **Middle**: `SOCIAL` heading (uppercase, bold, ~12px, letterspaced, white) then links
  `Instagram`, `Facebook`, `Artstation`, `Deviantart` — `Poppins`, ~13px, `--white-muted`,
  hover → white.
- **Right**: `CONTACT` heading, then `alex@3dturner.com`, `+1 (555) 123-4567`,
  `123 Creative Lane, Suite 45`, `Design City, CA 90210` — same styling as the social links.
- **Bottom strip**: a full-bleed row of large flat geometric "Bauhaus" shapes, ~150px tall,
  butted edge to edge with a small gap, scrolling slowly as a marquee. In order:
  1. white quatrefoil / four-lobed X
  2. a 2×2 cluster of four circles — **colour-cycles** between magenta `#FF20C0` and
     lime `#C8FF3D` (the video shows both, ~2s cross-fade)
  3. white "J" hook (circle with a bite taken out + stem)
  4. solid purple circle `#7C3AED`
  5. white double chevron / parallelogram stack
  6. orange `#F5A623` "butterfly" — two semicircles facing each other
  7. white double triangle / upward arrow pair
  8. magenta `#FF20C0` thick ring (donut)

---

## Behaviour summary

- Marquees: CSS `@keyframes` translating a duplicated track by `-50%`; pause on hover for the
  gallery and testimonials.
- Sticky stacking project cards.
- Outline→fill reveal on `ABOUT ME` and `SERVICES`.
- Gentle bobbing on all floating 3D decorations.
- Fade/rise-in on section entry (subtle, 500ms).
- All motion suppressed under `prefers-reduced-motion: reduce`.

## Responsive

- ≥1100px: layout as described.
- 720–1099px: Services number column narrows; Contact and Footer become single column;
  project card body stacks to one column; hero H1 scales down.
- <720px: nav wraps to a centred two-row grid; tagline and pill stack under the H1;
  testimonial cards `320px`; gallery tiles `210×145`; footer shapes `100px`.

## Constraints

- Static site: `index.html`, `css/*.css`, `js/main.js`, `assets/*.svg`. No build step,
  no external requests except Google Fonts.
- All imagery is **procedurally generated SVG** committed into `assets/` — no downloaded files.
