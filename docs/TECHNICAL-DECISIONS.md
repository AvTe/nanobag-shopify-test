# Technical decisions

A short note on the choices that were not obvious, and why they were made.

Base theme is **Dawn 16.0.0**. The first commit is stock Dawn, so every change
in this repo reads as a diff against it.

---

## Responsiveness: one markup tree, not two layouts

The brief asks for a build that "scales and remains the same on all standard
resolutions", not two fixed layouts. Nanobag's own site renders the logo bar and
the feature row **twice in the DOM** and toggles them with CSS — 18 `<img>`
elements for six logos. That is the thing this build most deliberately avoids.

Sizing is `clamp()` throughout, interpolated between the two Figma frames. The
headline, for example, is measured at 50px on the 390px mobile frame and 79px on
the 1920px desktop frame, so it is written to hit both exactly and scale
smoothly between.

Breakpoints appear only where the layout genuinely reflows:

- **Hero.** On mobile the copy sits in a white card below the media; on desktop
  it is overlaid on the video. That is a real structural change, so it earns one
  media query — but it is done by moving the media and the copy into the *same
  grid cell* at the breakpoint, not by rendering the block twice.
- **Logo bar.** A 60px bordered strip on mobile, a rounded overlapping sheet on
  desktop. Same markup; only the surface changes.

### Hero copy position

The copy inset is proportional (`11.875vw`, capped at 300px) rather than a
centred container. A centred container pushes content inward as the viewport
grows — at 2100px the copy sat 498px from the edge against the frame's 249px.
The frame places it at 228 of 1920, which is 11.875%, so holding that ratio is
what actually matches the design at every width.

---

## Theme Editor over hardcoding

Every string, link, image, video, colour, radius and size in the four sections is
a schema setting. Beyond the brief's list, the settings that earn their place:

| Setting | Why it exists |
| --- | --- |
| Overlay opacity, desktop **and** mobile | The frames differ: 20% on desktop, none on mobile, because the mobile copy is not over the media |
| Copy contrast scrim | The overlay dims evenly, which suits a dark still but not arbitrary video; a bright frame dropped the rating line under 4.5:1 |
| Headline font, desktop **and** mobile | The frames use different faces (below) |
| Section visibility | The desktop frame contains only the hero and logo bar, so feature-trio and video-gallery have no desktop specification |
| Overlay target | Which section the transparent header overlays, rather than a hardcoded selector |

Two fonts, not one, because the frames genuinely differ: **Inter SemiBold 79px**
on desktop, **Fraunces 50px with the second word italicised** on mobile. Both are
in Shopify's font library — verified by loading them — so each is a `font_picker`
served from Shopify's font CDN with **no external request**. Fraunces reports
`unloaded` on desktop, so the mobile-only face costs desktop visitors nothing.

The same `<em>` in the heading serves both: italic Fraunces on mobile, upright
Inter on desktop. The merchant writes the heading once.

---

## JavaScript budget

Two small files, both justified:

**`hero-video.js` (47 lines)** — the brief asks for a replaceable video; the
design needs a different one per device. Both sources sit in inert `<template>`
elements and only the matching one is ever cloned in, so a phone never fetches
the desktop file. With the supplied assets that is **6.2MB instead of 27MB**.
Rendering both and hiding one with CSS would duplicate markup *and* still cost a
metadata request; a `media` attribute on `<source>` is not honoured inside
`<video>`, only inside `<picture>`. Nothing loads at all under
`prefers-reduced-motion`.

**`header-transparent.js` (50 lines)** — keeps the overlay header transparent
while the hero is behind it. Dawn's sticky classes cannot answer that question:
`on-scroll-up` marks the header sticky the moment the visitor scrolls up
*anywhere*, which turned it white mid-hero. An observer on the overlaid section
is the only thing that knows whether artwork is still behind the header.

**The video gallery ships none.** It reuses Dawn's own `<deferred-media>`, which
already does the template facade and pauses other playing media, and lives in
`global.js` that every page loads.

The carousel also needs no JavaScript. Measured from the Figma frame, all four
cards are the same `191.81 × 287.72`; the centre only *reads* as dominant because
it is the only one fully visible. Equal cards plus viewport clipping reproduces
the frame exactly, so it is pure CSS scroll-snap.

---

## Performance

The **poster image is the LCP element**, not the video: eager, `fetchpriority="high"`,
responsive `widths`/`sizes`. `video_tag` is called **without `image_size`** so
Shopify emits no `poster` attribute — the video then paints transparent until its
first frame and the poster shows through underneath. That keeps the `<img>` the
true LCP candidate, avoids downloading a second poster, and needs no JavaScript
cross-fade.

`<picture>` with a media source swaps the poster crop natively. The poster falls
back to the video's own Shopify-generated `preview_image`, so a poster is never
mandatory.

Section CSS is loaded per section from `assets/section-*.css` rather than appended
to `base.css`, so each file stays independently cacheable and a page that does not
use a section never downloads its styles.

Zero dependencies. No Swiper, no GSAP, no Alpine, no jQuery. Dawn ships enough.

---

## Accessibility

- One `<h1>` per page. Dawn wraps the logo in an `<h1>` on the home page, which
  with the hero's heading meant **two** — the exact fault reported against
  nanobag.com in the SEO audit. That wrap is now behind a setting, defaulted off.
- The star rating is a single `role="img"` with one label using Dawn's existing
  `star_reviews_info` translation, so a screen reader announces "4.8 out of 5
  stars" rather than ten decorative shapes. Fractional ratings work by clipping a
  gold layer to a percentage — no half-star icon variants, no JavaScript.
- The 44px tap target survives every value of the size sliders, enforced with
  `max()` rather than by trusting the number.
- Header icons are optically matched, not merely equal in CSS. Dawn's cart glyph
  fills ~43% of its 40×40 viewBox while the hamburger fills ~93% of an 18×16 one,
  so at the same box size they rendered 12px and 26px. The cart box is scaled to
  compensate; the tap target is untouched.
- `prefers-reduced-motion` is honoured for the background video, the logo
  marquee and every transition. Reduced-motion visitors get a manual scroller
  rather than a stopped animation, so content past the edge stays reachable.
- The marquee's duplicate track is `aria-hidden` and out of the tab order, so each
  logo is announced and focusable exactly once.

---

## Things worth knowing if you take this over

**Dawn's root font-size is 10px**, not 16px. Every `rem` here is written against
that. This cost a round of debugging when values landed at 62.5% of intent.

**Specificity against Dawn.** Several Dawn rules are deeper than they look —
`.header:not(.drawer-menu).page-width` is three classes because `:not()` counts,
and `body:has(.section-header .header:not(.drawer-menu)) .utility-bar .page-width`
is (0,5,1). Where escalating would have been an arms race, the markup drops the
`page-width` class instead and the rule is owned outright.

**The GitHub sync is two-way and not always complete.** At one point the theme
held two halves of different versions: it had applied a snippet deletion but not
the rewrite that made the deletion safe, which produced Liquid errors rendered as
literal text and a 1780px horizontal overflow. Theme check's orphan detection
only sees the repo — it cannot know what the published theme is running, so on an
externally synced theme it is not sufficient grounds to delete a file.

**Bundled press logos.** The six logos ship in `assets/` so the section works the
moment it is added, but each block's image picker always wins. Nothing is baked
in.
