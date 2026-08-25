# SEO recommendations — nanobag.com

Five technical and on-page improvements, ordered by impact. Every claim was
verified against the live HTML on the date of writing.

Worth stating up front, because it changes the priorities: **the fundamentals are
already correct.** The title is well written and keyword-bearing ("Reusable Bags
That Fit in Your Pocket | Nanobag"), the meta description is present and specific,
the canonical is correct, robots.txt is Shopify standard, and the sitemap index is
complete including locale variants. None of that needs work. What follows is about
the document structure sitting inside those good foundations.

---

## 1. An unrendered template literal is a live `<h1>`

**Priority: P1 — this is a bug, not an optimisation**

**What is wrong:** A raw template placeholder, `{!= form_name !}`, renders as an
`<h1>` element. It appears on the home page *and* the product page, so it is
template-level and almost certainly site-wide.

**Why it matters:** Every page is publishing a heading whose content is broken
template syntax. It pollutes the document outline, it is the kind of string that
can surface in a rich result or a site-search snippet, and it signals to a crawler
that the page is malfunctioning. It also inflates the `<h1>` count, compounding
the next item.

**How to fix:** Find the app or section emitting it. The delimiter style is not
Liquid, so this is a third-party template — most likely a form or popup app
rendering client-side syntax into the server response. Fix the placeholder or
remove the block, then confirm zero matches for the literal in the page source.

---

## 2. Fix the heading hierarchy

**Priority: P1**

**What is wrong:** The home page has **four** `<h1>` elements, and the first
heading in the document is an `<h2>`. In DOM order:

| Tag | Text |
| --- | --- |
| H2 | Your cart is currently empty. |
| H2 | **Extreme practicality** — the actual value proposition |
| H2 | Convenience redefined |
| H2 | See It In Action |
| **H1** | Buy More and Unlock Free Gifts + Free Shipping |
| H2 | Unmatched portability, and four more |
| **H1** | As seen on |
| **H1** | Nanobag and our Quest for the Perfect Bag |
| **H1** | the broken template literal from item 1 |

The product page has the same problem in a different form: its `<h1>` is
**"Standard Black"** — a variant name, not the product name.

**Why it matters:** The `<h1>` is the strongest on-page signal of what a document
is about. Here it is a promotional banner targeting no query anyone searches for,
while "Extreme practicality" — the brand's actual positioning — is demoted to an
`<h2>` alongside nine others. On the product page, "Standard Black" describes a
colour, not a reusable bag, so the page's strongest signal says almost nothing
about what is being sold. A cart-empty message opening the outline compounds it.

**How to fix:** One `<h1>` per page, carrying that page's subject. On the home
page that should be the value proposition, worked to include the category term:
"Extreme practicality" reads well but contains no query, whereas "Reusable bags
with extreme practicality" keeps the line and earns the term. On the product page,
use the product title and demote the variant to `<h2>` or plain text. Demote
"As seen on" and the cart message to non-heading elements — neither opens a
content section.

---

## 3. Stop hiding headings behind JavaScript

**Priority: P1**

**What is wrong:** Five headings are wrapped in `<split-words class="js-invisible">`,
including one of the `<h1>` elements. The class name indicates the text is hidden
until JavaScript runs and reveals it.

**Why it matters:** Google renders JavaScript, but rendering is queued separately
and is not guaranteed to be timely or complete. Content that requires JS to become
visible is weaker than content present in the initial HTML, and if the script
fails the headings never appear for anyone. Applying it to an `<h1>` puts the
page's most important signal behind that risk for a decorative letter-animation
effect.

**How to fix:** Invert the pattern. Render the heading visible by default and let
the animation script *add* the starting state on load, so the text is present in
the raw HTML and the effect becomes progressive enhancement. Gate the effect
behind `prefers-reduced-motion` while you are there. Verify by disabling
JavaScript and confirming every heading is still visible.

---

## 4. Add review markup so stars can appear in search results

**Priority: P2**

**What is wrong:** There is no `aggregateRating`, `ratingValue` or `reviewCount`
anywhere on the home page or the product page — all three return zero matches.
Judge.me is installed and rendering review widgets (nine `jdgm-prev-badge`
references on the product page), so the review data exists; it is simply never
expressed as structured data. There is also no `BreadcrumbList`.

**Why it matters:** Product schema is present, but without `aggregateRating`
Google cannot show star ratings in the result. Review stars are among the most
visible SERP enhancements available to an e-commerce listing and lift
click-through at unchanged ranking — free traffic left unclaimed by a site that
already has the reviews. Breadcrumb markup similarly improves URL display.

**How to fix:** Enable Judge.me's rich-snippet output, or emit `aggregateRating`
inside the existing Product JSON-LD from the product metafields. Add a
`BreadcrumbList` to product and collection templates. Validate with Google's Rich
Results Test, and only mark up ratings genuinely visible on the page — markup that
does not match on-page content is a manual-action risk.

---

## 5. Reduce duplicated and unbudgeted media in the DOM

**Priority: P2**

**What is wrong:** Three related measurements on the home page:

- The logo bar renders **18 `<img>` elements for roughly six logos**, because the
  section contains one `logo-bar__desktop` block and three `logo-bar__mobile`
  blocks, toggled with CSS.
- **17 `<video>` elements, all carrying `autoplay`.**
- **32 of 85 images have no `width`/`height`**, and **16 have no `alt` attribute
  at all**.

**Why it matters:** Rendering the same logos three times and hiding two copies
means the markup is downloaded and parsed regardless — it inflates page weight for
no benefit and duplicates the same content signals. Seventeen autoplaying videos in
one document is a substantial Core Web Vitals liability, particularly LCP and INP
on mobile, and page experience is a ranking input. Images without intrinsic
dimensions cause layout shift, measured directly by CLS. Missing `alt` attributes
are both an accessibility failure and a lost relevance signal.

**How to fix:** Render each logo once and let CSS handle the responsive behaviour
rather than duplicating markup per breakpoint. Reduce the number of autoplaying
videos and convert the rest to click-to-play facades — a poster image plus a real
button, with the video markup inside a `<template>` so nothing is fetched until the
visitor asks. Add `width` and `height` to every image, and give meaningful `alt`
text to those that carry meaning. Re-measure with PageSpeed Insights on mobile
before and after.

---

## Checked and deliberately not recommended

Several conventional audit items were checked and found already correct, so they
are absent above: title tag, meta description, canonical URL, robots.txt, XML
sitemap coverage including locale variants, and Organization / WebSite /
VideoObject structured data. Listing them as "improvements" would pad the audit
without helping.
