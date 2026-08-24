# Nanobag — Shopify Developer Test

Figma implementation, CRO audit and SEO audit for the Nanobag developer
assessment.

**Base theme:** Dawn 16.0.0 (unmodified baseline is the first commit, so every
change in this repo is visible as a diff against stock Dawn).

**Dev store:** `nanobags.myshopify.com` — theme left unpublished, shared via
preview link.

## Deliverables

| Deliverable | Location |
| --- | --- |
| Figma implementation | `sections/`, `snippets/`, `assets/` (see below) |
| CRO recommendations | [`docs/CRO.md`](docs/CRO.md) |
| SEO recommendations | [`docs/SEO.md`](docs/SEO.md) |
| Technical decisions note | [`docs/TECHNICAL-DECISIONS.md`](docs/TECHNICAL-DECISIONS.md) |

## Sections built

| Section | File | JS |
| --- | --- | --- |
| Hero video | `sections/hero-video.liquid` | none |
| Logo bar | `sections/logo-bar.liquid` | none |
| Feature trio | `sections/feature-trio.liquid` | none |
| Video gallery | `sections/video-gallery.liquid` | `assets/video-gallery.js` |
| Transparent header | modification to `sections/header.liquid` | none |

Section CSS is loaded per section from `assets/section-*.css` rather than
appended to `base.css`, so each file stays independently cacheable and a page
that does not use a section never downloads its styles. Shopify deduplicates
repeated `stylesheet_tag` output automatically.

## Approach in one paragraph

One markup tree per section, sized with `clamp()` and intrinsic grid, rather
than duplicated desktop and mobile markup toggled by media queries. Breakpoints
appear only where the layout genuinely reflows. All copy, links, media and the
hero overlay opacity are Theme Editor settings. No apps, no external libraries,
no frameworks — Dawn ships everything required.

## Local development

```bash
# preview against the dev store with hot reload
shopify theme dev --store nanobags.myshopify.com

# lint before every commit
shopify theme check
```

CI runs `shopify theme check --fail-level error` on every push.

## Repo conventions

- BEM class names, section-prefixed (`.hero-video__heading`)
- Whitespace control on all Liquid logic tags
- No `!important`, no inline `<style>` blocks except schema-driven custom
  properties
- Conventional Commits
