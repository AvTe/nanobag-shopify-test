# Nanobag — Shopify Developer Test

**Submitted by:** Amit
**Store:** `nanobags.myshopify.com`
**Repository:** `AvTe/nanobag-shopify-test`
**Base theme:** Dawn 16.0.0

---

# 1. My approach and development process

## 1.1 Why I set it up this way

I wanted a workflow where the theme lives in Git as the source of truth, renders
locally with hot reload while I work, and reaches the store without me manually
uploading files. That means three things have to be connected: my editor, the
repository, and the store.

I also used **agentic, AI-assisted development** for a large part of the build.
I want to be direct about that because it shaped the process rather than just the
typing speed. It let me move quickly through the mechanical work — schema
scaffolding, responsive maths, repetitive Liquid — and spend my own attention on
the parts that actually decide quality: reading the Figma correctly, deciding the
component structure, and verifying the result in a real browser rather than
trusting that it looked right.

The workflow below is built around that: **every claim gets measured.** Most of
the bugs described later in this document were found by measuring the rendered
page, not by reading the code.

## 1.2 Local setup

I started from a clean Dawn install rather than a marketplace theme, so every
change I made is visible as a diff against stock Dawn.

```bash
# Shopify CLI 3.94.3
git clone --depth 1 https://github.com/Shopify/dawn.git
# committed as: "chore: dawn 16.0.0 baseline"

shopify theme dev --store nanobags.myshopify.com
# -> http://127.0.0.1:9292 with hot reload
```

The very first commit is **untouched Dawn 16.0.0**. That was deliberate: a
reviewer can diff any later commit against it and see exactly what is mine and
what shipped with the theme.

## 1.3 The pipeline

```
   VS Code (local files)
        │
        │  git commit / git push
        ▼
   GitHub — AvTe/nanobag-shopify-test  (main)
        │
        │  Shopify GitHub integration (TWO-WAY)
        ▼
   Shopify store — theme "nanobag-shopify-test/main"
        │
        │  shopify theme dev  (separate dev theme, hot reload)
        ▼
   http://127.0.0.1:9292  ← what I actually develop against
```

**Editor → GitHub.** Ordinary Git. I worked on `main` with small, conventional
commits, because the history is part of what is being reviewed.

**GitHub → Shopify.** Connected through Shopify admin: *Online Store → Themes →
Add theme → Connect from GitHub*, pointed at `main`. Shopify pulls each push
automatically, so deploying is just `git push`.

**Shopify → GitHub.** This is the part worth understanding: the integration is
**two-way**. Anything changed in the Theme Editor is committed back to the
repository by Shopify. That is genuinely useful — it means `templates/index.json`
and `config/settings_data.json` stay in the repo, so a fresh clone renders the
configured page instead of empty sections.

It also has a real failure mode, which I hit and describe in §1.5.

**Local preview.** `shopify theme dev` creates a *separate* development theme and
serves it at `127.0.0.1:9292` with hot reload. It does not touch the
GitHub-connected theme, so I could iterate freely without publishing anything.

## 1.4 How I actually worked

1. **Worked from my own copy of the Figma, not the shared file.** The first thing
   I did was duplicate the supplied file into my own Figma workspace. I never
   edited the original.

   That is partly courtesy — a shared design file is not mine to reorganise — but
   mostly it is practical. In my own copy I could move frames next to each other
   to compare desktop against mobile, zoom into a component without disturbing
   anyone, and select and export any icon, logo or image directly. Working that
   way is how the press logos and the badge came out of the design cleanly rather
   than being approximated from a screenshot.

2. **Read the Figma properly.** I connected the Figma MCP server and pulled the
   real node data rather than working from screenshots. That is where most of the
   accuracy came from — exact values like the 79px desktop headline, the 20%
   overlay, the 191.81 × 287.72 carousel cards, and the 55px announcement bar came
   straight out of the file.

   It also settled questions a screenshot could not. The desktop and mobile frames
   genuinely disagree — different fonts for the headline, an overlay on one and
   not the other, different CTA labels — and only the file could tell me which
   differences were real and which were my eyes.

3. **Build the section**, keeping everything that is content in `{% schema %}`.
4. **Verify in a real browser.** I drove Chrome through DevTools and measured
   computed styles and bounding boxes at 390 / 820 / 1440 / 1920 / 2827px.
5. **`shopify theme check`** before every commit — zero errors is the bar.
6. **Commit small and explain why**, not what.

## 1.5 Two things the pipeline taught me

**The two-way sync can apply half a change.** At one point the published theme
had applied a snippet deletion but *not* the rewrite that made the deletion safe.
Every star in the rating rendered `Liquid error: Could not find asset
snippets/icon-star.liquid` as literal text — ten of those under
`white-space: nowrap` produced a 3140px element and **1780px of horizontal
overflow** on every device. My local dev server rendered it perfectly, because it
serves the repo copy where the snippet is inlined. Only the live store had the
mismatched pair.

The lesson I took: **theme check's "orphaned snippet" warning only sees the
repo.** It cannot know what the published theme is running, so on an externally
synced theme it is not sufficient grounds to delete a file.

**Editor changes can overwrite repo settings.** A setting I had turned off kept
coming back on, because Shopify captured the theme state before my push landed
and wrote the old value back to the repo, which then synced onto the theme again.
The fix is to correct it on the side the sync reads from — the repository — not
on the theme.

## 1.6 Time taken

**Roughly six hours in total**, covering the build, the store SEO setup and both
audits.

That was not six hours in one sitting. I worked in blocks — sometimes thirty
minutes, sometimes closer to two — coming back to it across the day. Some of that
was deliberate: stepping away and returning to the page with fresh eyes is how I
caught several of the visual mismatches, and a couple of the bugs in §1.5 only
became obvious on a re-check rather than in the moment I wrote the code.

---

# 2. What I built

Four new sections plus a modified header, recreating the supplied Figma frames.

| Section | File | Custom JS |
| --- | --- | --- |
| Hero video | `sections/hero-video.liquid` | 47 lines |
| Logo bar | `sections/logo-bar.liquid` | none |
| Feature trio | `sections/feature-trio.liquid` | none |
| Video gallery | `sections/video-gallery.liquid` | **none** |
| Transparent header | modification to `sections/header.liquid` | 50 lines |

The reasoning behind each choice is in
[`docs/TECHNICAL-DECISIONS.md`](docs/TECHNICAL-DECISIONS.md). The short version:

- **One markup tree, not two layouts.** Sizing is `clamp()` interpolated between
  the two Figma frames. Breakpoints appear only where the layout genuinely
  reflows, and even then the hero moves its media and copy into the *same grid
  cell* rather than rendering the block twice.
- **The poster image is the LCP element**, not the video. `video_tag` is called
  without `image_size` so Shopify emits no `poster` attribute; the video paints
  transparent until its first frame and the responsive poster shows through.
- **Desktop and mobile videos are separate settings**, each in an inert
  `<template>`, so a phone never downloads the desktop file — 6.2MB instead of
  27MB with the supplied assets.
- **The video gallery ships no JavaScript.** It reuses Dawn's own
  `<deferred-media>`. The carousel is pure CSS scroll-snap: measured from the
  frame, all four cards are the same size, and the centre only *reads* as
  dominant because it is the only one fully visible.

## 2.1 SEO setup on the test store

The home page is not just built, it is set up. It would have been easy to hand
over a page that looks right and ships a seven-character `<title>` and no meta
description — I did the store-side configuration too, and then verified it on the
live storefront rather than assuming the admin fields had taken effect.

| | Value on the live store |
| --- | --- |
| Home page title | "Reusable Bags That Fit in Your Pocket \| Nanobag" — **57 chars**, within the 70 limit |
| Meta description | **153 chars**, names the product and the use cases |
| Social sharing image | set — `og:image` present |
| Open Graph / Twitter | `og:title`, `og:description`, `og:image`, `twitter:card` all present |
| Canonical | `https://nanobags.myshopify.com/` |
| `<h1>` count | **1** — "Extreme practicality" |
| Structured data | `Organization` + `WebSite` |
| Images | 23 total, **1** without `alt`, **1** without dimensions |
| Horizontal overflow | **none**, 390 → 2827px |
| Liquid errors | **none** |

Two of those are worth calling out because they are the faults I report against
nanobag.com in §4, and it would be poor form to commit them here:

- **One `<h1>`.** Dawn wraps the logo in an `<h1>` on the home page, which
  together with the hero heading meant two. That wrap is now behind a setting,
  defaulted off, so the hero owns the only `<h1>`.
- **No duplicated markup.** Six logo images for six logos, one autoplaying video,
  and every heading present in the initial HTML rather than revealed by script.

The single remaining `img` without `alt` is the poster Shopify generates inside
its own `<video>` output, which the theme does not control. It is decorative and
the heading carries the meaning.

---

# 3. Part 2 — CRO audit of nanobag.com

Five changes, ordered by impact against effort. **Every claim below was verified
against the live HTML**, and the check is stated so it can be re-run.

Nanobag sells a low-consideration impulse product at $15.95–$20.95. That shapes
the whole list: the job is to shorten the distance between landing and adding to
cart, not to educate.

---

### 1. Put price and review proof above the fold — **P1**

**What I would change.** Surface the starting price and the Judge.me rating within
the first screen of the home page, and move the review badge above the buy box on
the product page.

**Evidence.** The home page contains exactly **one `$` character** in the first
40KB of body text, and **no rating markup at all**. Judge.me is installed and
loading (211 `jdgm` references) but nothing renders near the top. On the product
page, `jdgm-prev-badge` does not appear anywhere in the **first 60KB** of the
body — the star badge sits well below the buy box.

**Why it could improve conversion.** For an impulse purchase the first two
questions are "how much" and "do people like it". Both currently need a scroll or
a click. A $15.95 price point is an asset, not something to defer — hiding it
removes the strongest reason to keep reading. Social proof next to the price is
the standard pairing because it answers the risk question at the moment the cost
question is raised.

**How I would prioritise it.** First. Highest impact, and the product-page half is
a positioning change with no build cost.

**How I would test it.** A/B the hero with and without a price-plus-rating line;
primary metric hero → PDP click-through, secondary PDP add-to-cart rate to confirm
the change qualifies traffic rather than just moving clicks. I would **ship the
badge move without a test** — moving existing proof upward has no realistic
downside.

---

### 2. Give the announcement bar somewhere to go — **P1, lowest effort**

**What I would change.** Link the two promotional messages to the pages that
explain them, and replace "Details below" with the actual offer.

**Evidence.** The bar rotates five messages. Two of them —
`LIMITED SPECIAL - Details below` and `FREE GIFT OFFER - See Below for Details` —
are plain text with **no `href`**. They instruct the visitor to scroll and give no
destination.

**Why it could improve conversion.** The bar is the highest-position element on
every page. Asking someone to hunt for the offer converts curiosity into friction,
and "details below" is unusable on a page they have not read yet. Naming the offer
and linking it turns the most prominent real estate on the site into a working
entry point.

**How I would prioritise it.** Immediately — it is the cheapest change on this
list.

**How I would test it.** Small enough that a before/after on bar click-through is
adequate; there is no sensible downside case for an unlinked message. For a
cleaner read, A/B the wording rather than linked-versus-unlinked.

---

### 3. Show gift-tier progress at the point of decision — **P2**

**What I would change.** Render a live "you are $X away from a free carabiner"
indicator on the product page and in the cart drawer.

**Evidence.** The mechanic exists — the product page carries **41** references to
`carabiner`, **21** to `tier` and two `data-tier` attributes — but there is **no
progress element** for it. The only `progress` classes on the page belong to a
third-party popup app. The cart drawer says "Add a product to receive a…" without
showing distance to the threshold.

**Why it could improve conversion.** The promise is important enough to be the
page's `<h1>` ("Buy More and Unlock Free Gifts + Free Shipping"), yet the visitor
cannot see where they stand against it while choosing quantity. A goal with a
visible distance is what lifts average order value; a goal stated once in a
heading is not.

**How I would prioritise it.** Third. Real build work, but it operationalises a
promise the site already makes loudly.

**How I would test it.** A/B on the product page. Primary metric **average order
value, not conversion rate** — this is meant to move units per order and may leave
CVR flat. Watch add-to-cart rate as a guardrail.

---

### 4. Establish a single primary call to action — **P2**

**What I would change.** Reduce the home page to one repeated primary CTA with one
label, and demote the rest to secondary styling.

**Evidence.** The home page renders **six** button-styled links across **two**
labels: `Shop Now` ×4 and `SHOP NANOBAG` ×2, plus `Totes | Slings | Backpacks`.
All carry equal visual weight.

**Why it could improve conversion.** Two labels for the same destination read as
two different offers and force a decision that does not exist. Equal weighting
also removes the page's ability to signal what it wants next.

**How I would prioritise it.** Fourth. Presentation-only, no content cost.

**How I would test it.** A/B one consistent label against the current mix, metric
home → PDP click-through. Worth testing rather than shipping, because the variety
may be doing work for visitors arriving at different scroll depths.

---

### 5. Merchandise the range, not a single product — **P3**

**What I would change.** Surface the product range on the home page instead of
routing everything to one product page.

**Evidence.** **All ten** product links on the home page point to the same URL,
`/products/reusable-shopping-bags`. Seven collections exist and are linked, but
the range itself is never shown.

**Why it could improve conversion.** A visitor who does not want that specific
product has no visible alternative and must use the navigation to discover that
alternatives exist. Showing three or four products with prices allows
self-selection.

**How I would prioritise it.** Last of the five — meaningful, but the largest
build.

**How I would test it.** A/B a product grid below the hero. Track **revenue per
session** rather than conversion rate alone, since spreading traffic across
products can flatten CVR while raising total revenue.

---

### Deliberately not recommended

A **missing sticky add-to-cart on mobile** is a common finding and I checked for
it. It is **not** missing: the product page renders
`product-sticky-form--mobile-primary` inside a `<sticky-element>`. Recommending it
would have been wasted work.

---

# 4. Part 3 — SEO audit of nanobag.com

Worth stating first, because it changes the priorities: **the fundamentals are
already correct.** The title is well written and keyword-bearing, the meta
description is present and specific, the canonical is correct, `robots.txt` is
Shopify standard, and the sitemap index is complete including locale variants.
None of that needs work. What follows is about the document structure sitting
inside those good foundations.

---

### 1. An unrendered template literal is a live `<h1>` — **P1, a bug**

**Why it matters.** A raw template placeholder, `{!= form_name !}`, renders as an
`<h1>`. It appears on the **home page and the product page**, so it is
template-level and effectively site-wide. Every page is publishing a heading whose
content is broken template syntax — it pollutes the outline, can surface in a
snippet, and signals a malfunctioning page. It also inflates the `<h1>` count.

**How I would address it.** Find the app emitting it. The delimiter style is not
Liquid, so this is a third-party form or popup template rendering client-side
syntax into the server response. Fix the placeholder or remove the block, then
confirm zero matches in the page source.

---

### 2. Fix the heading hierarchy — **P1**

**Why it matters.** The home page has **four `<h1>` elements** and its first
heading is an `<h2>`:

| Tag | Text |
| --- | --- |
| H2 | Your cart is currently empty. |
| H2 | **Extreme practicality** — the actual value proposition |
| H2 | Convenience redefined |
| H2 | See It In Action |
| **H1** | Buy More and Unlock Free Gifts + Free Shipping |
| **H1** | As seen on |
| **H1** | Nanobag and our Quest for the Perfect Bag |
| **H1** | the broken literal from item 1 |

The product page's `<h1>` is **"Standard Black"** — a variant name, not the
product.

The `<h1>` is the strongest on-page signal of what a document is about. Here it is
a promotional banner targeting no query anyone searches for, while the brand's
actual positioning is demoted to an `<h2>` among nine others. On the product page,
"Standard Black" describes a colour, not a reusable bag.

**How I would address it.** One `<h1>` per page carrying that page's subject. On
the home page, the value proposition worked to include the category term —
"Extreme practicality" reads well but contains no query, whereas "Reusable bags
with extreme practicality" keeps the line and earns the term. On the product page,
use the product title and demote the variant. Demote "As seen on" and the cart
message to non-headings.

---

### 3. Stop hiding headings behind JavaScript — **P1**

**Why it matters.** **Five headings** are wrapped in
`<split-words class="js-invisible">`, including one of the `<h1>` elements — the
text is hidden until JavaScript reveals it. Google renders JavaScript, but
rendering is queued separately and is not guaranteed to be timely or complete.
Content that needs JS to become visible is weaker than content in the initial
HTML, and if the script fails the headings never appear for anyone. Applying it to
an `<h1>` puts the page's most important signal behind that risk for a decorative
letter animation.

**How I would address it.** Invert the pattern: render the heading visible and let
the script *add* the starting state, so the effect becomes progressive
enhancement. Gate it behind `prefers-reduced-motion`. Verify by disabling
JavaScript and confirming every heading is still visible.

---

### 4. Add review markup so stars can appear in search results — **P2**

**Why it matters.** There is **no `aggregateRating`, `ratingValue` or
`reviewCount`** anywhere on the home page or product page. Judge.me is installed
and rendering review widgets, so the data exists — it is simply never expressed as
structured data. Product schema is present, but without `aggregateRating` Google
cannot show star ratings. Review stars are among the most visible SERP
enhancements available to an e-commerce listing and lift click-through at
unchanged ranking. There is also no `BreadcrumbList`.

**How I would address it.** Enable Judge.me's rich-snippet output, or emit
`aggregateRating` into the existing Product JSON-LD from the product metafields.
Add `BreadcrumbList` to product and collection templates. Validate with the Rich
Results Test, and only mark up ratings genuinely visible on the page — mismatched
markup is a manual-action risk.

---

### 5. Reduce duplicated and unbudgeted media — **P2**

**Why it matters.** Three related measurements on the home page:

- The logo bar renders **18 `<img>` elements for roughly six logos** — one
  `logo-bar__desktop` block and three `logo-bar__mobile` blocks, toggled with CSS.
- **17 `<video>` elements, all with `autoplay`.**
- **32 of 85 images have no `width`/`height`**, and **16 have no `alt` at all**.

Rendering the same logos three times and hiding two copies means the markup is
downloaded and parsed regardless — page weight for no benefit, and duplicated
content signals. Seventeen autoplaying videos is a substantial Core Web Vitals
liability, particularly LCP and INP on mobile, and page experience is a ranking
input. Images without intrinsic dimensions cause layout shift, measured directly
by CLS. Missing `alt` is both an accessibility failure and a lost relevance
signal.

**How I would address it.** Render each logo once and let CSS handle the
responsive behaviour. Reduce autoplaying videos and convert the rest to
click-to-play facades — a poster plus a real button, with the video markup inside
a `<template>` so nothing is fetched until asked. Add `width`/`height` to every
image and meaningful `alt` where it carries meaning. Re-measure in PageSpeed
Insights on mobile.

**This is the one recommendation I also applied to my own build**, so it is worth
comparing:

| | nanobag.com | This build |
| --- | --- | --- |
| `<h1>` count | 4 | **1** |
| Autoplaying videos | 17 | **1** |
| Images | 85 | **23** |
| Images without dimensions | 32 | **1** |
| Duplicated logo markup | 18 `<img>` for 6 logos | **6 for 6** |
| JS-hidden headings | 5 | **0** |

---

# 5. Deliverables

| Deliverable | Where |
| --- | --- |
| Preview URL | **https://nanobags.myshopify.com/** — publicly reachable, no password needed |
| Code / access | **https://github.com/AvTe/nanobag-shopify-test** |
| CRO recommendations | §3 above, and [`docs/CRO.md`](docs/CRO.md) |
| SEO recommendations | §4 above, and [`docs/SEO.md`](docs/SEO.md) |
| Technical decisions note | §2 above, and [`docs/TECHNICAL-DECISIONS.md`](docs/TECHNICAL-DECISIONS.md) |

## Against the brief's Part 1 requirements

| Requirement | Status |
| --- | --- |
| Match the Figma designs | Values read from the Figma file directly, not estimated |
| Fully responsive, not two fixed layouts | One markup tree, `clamp()` throughout; verified 390 → 2827px with no horizontal overflow |
| Shopify theme best practices | Sections + blocks, presets, per-section CSS, `theme check` clean |
| Content editable, not hardcoded | **118 settings** |
| Video replaceable via Theme Editor | Separate desktop and mobile video settings |
| Headings, supporting text, CTA text and links editable | All present |
| Overlay dimmable 0–100% | `min 0, max 100, step 5, unit %` — plus a separate mobile control, since the frames differ |
| No unnecessary apps or libraries | No `package.json`, no `node_modules`, no external requests from my sections |
| Page speed / avoid heavy JavaScript | **97 lines total**; the gallery ships none |
| Accessibility | One `<h1>`; single `role="img"` rating; 44px tap targets enforced with `max()`; `prefers-reduced-motion` honoured throughout; full keyboard path |

Beyond Part 1, the store's own SEO is configured and verified — title, meta
description, social sharing image, Open Graph and Twitter tags, canonical, single
`<h1>` and image alt text. See §2.1.

**Time taken: roughly six hours in total**, spread across the day in blocks
rather than one continuous sitting. See §1.6.

---

## A note on how this was verified

I did not take the working notes at face value. Re-checking them against the live
site removed two claims that would have been wrong — a "missing" sticky
add-to-cart that already exists, and "weak SEO fundamentals" that are in fact
correct — and surfaced two findings the notes did not have: the broken template
literal is on the **product page too**, and the product `<h1>` is a variant name.

The same habit applied to my own build. The header icons looked mismatched; the
CSS was identical, but Dawn's cart glyph fills ~43% of its viewBox while the
hamburger fills ~93%, so at the same box size they rendered 12px and 26px. That
is only findable by measuring the drawn bounds, not by reading the stylesheet.
