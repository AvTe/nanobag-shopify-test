# CRO recommendations — nanobag.com

Five changes, ordered by expected impact against effort. Every claim below was
verified against the live HTML on the date of writing; the check used is given
so you can re-run it.

Nanobag sells a low-consideration impulse product at $15.95–$20.95. That shapes
the whole list: the job is to shorten the distance between landing and adding to
cart, not to educate.

---

## 1. Put price and review proof above the fold

**Priority: P1 — highest impact, low effort**

**What:** Surface the starting price and the Judge.me rating within the first
screen of the home page, and move the review badge above the buy box on the
product page.

**Evidence:** The home page contains exactly one `$` character in the first 40KB
of body text, and no rating markup at all. Judge.me is installed and loads (211
`jdgm` references) but nothing renders near the top. On the product page,
`jdgm-prev-badge` does not appear anywhere in the first 60KB of the body — the
star badge sits well below the buy box.

**Why it should work:** For an impulse purchase the two questions a visitor
answers first are "how much" and "do people like it". Both currently require a
scroll or a click. Price anchoring this low ($15.95) is an asset, not something
to defer — hiding it removes the single strongest reason to keep reading. Social
proof placed adjacent to the price is the standard pairing because it answers the
risk question at the moment the cost question is raised.

**How to test:** A/B the home page hero with and without a price-plus-rating
line. Primary metric: click-through from hero to product page. Secondary:
product-page add-to-cart rate, to confirm the change qualifies traffic rather
than merely moving clicks. Run to a fixed sample size decided in advance. Given
the traffic implied by "200k+ customers", two weeks should be sufficient for the
hero test; the product-page badge move can be shipped without a test, since
moving existing proof upward carries little downside risk.

---

## 2. Give the announcement bar somewhere to go

**Priority: P1 — lowest effort on the list**

**What:** Link the two promotional messages to the pages that explain them, and
replace "Details below" with the actual offer.

**Evidence:** The bar rotates five messages. Two of them —
`LIMITED SPECIAL - Details below` and `FREE GIFT OFFER - See Below for Details` —
are plain text with no `href`. They instruct the visitor to scroll and give no
destination.

**Why it should work:** A promotional bar is the highest-position element on
every page. Asking a visitor to hunt for the offer converts curiosity into
friction, and "details below" is unusable on a page they have not read yet.
Naming the offer ("Free carabiner with any 2 bags") and linking it turns the
site's most prominent real estate into a working entry point.

**How to test:** This is small enough that a straight before/after on bar
click-through is adequate; there is no meaningful downside case for an unlinked
message. If you want a cleaner read, A/B the specific wording rather than
linked-versus-unlinked.

---

## 3. Show gift-tier progress at the point of decision

**Priority: P2**

**What:** Render a live "you are $X away from a free carabiner" indicator on the
product page and in the cart drawer.

**Evidence:** The tier mechanic exists — the product page carries 41 references
to `carabiner`, 21 to `tier`, and two `data-tier` attributes — but there is no
progress element for it. The only `progress` classes on the page belong to a
third-party popup app (`zpa-crm-popup-progressbar-wrap`), not the gift tier. The
cart drawer states "Add a product to receive a…" without showing distance to the
threshold.

**Why it should work:** The promise is important enough to be the page's `<h1>`
("Buy More and Unlock Free Gifts + Free Shipping"), yet the visitor cannot see
where they stand against it while choosing quantity. A goal with a visible
distance is the mechanic that lifts average order value; a goal stated once in a
heading is not. This is the clearest gap between what the site promises and what
it operationalises.

**How to test:** A/B the product page with and without the indicator. Primary
metric is average order value, not conversion rate — this change is intended to
move units per order and may leave conversion flat. Watch add-to-cart rate as a
guardrail to confirm the extra element is not distracting from the primary
action.

---

## 4. Establish a single primary call to action

**Priority: P2**

**What:** Reduce the home page to one repeated primary CTA with one label, and
demote the rest to secondary styling.

**Evidence:** The home page renders six button-styled links across two different
labels: `Shop Now` four times and `SHOP NANOBAG` twice, plus
`Totes | Slings | Backpacks`. All carry equal visual weight.

**Why it should work:** Two labels for the same destination read as two different
offers and force a decision that does not exist. Equal weighting also removes the
page's ability to signal what it wants next. Consolidating to one label with one
visual treatment is a presentation change with no content cost.

**How to test:** A/B one consistent label against the current mix. Primary
metric: home-page-to-product click-through. This is worth a test rather than a
straight ship, because the current variety may be doing work for visitors
arriving at different scroll depths; the test will show whether it is.

---

## 5. Merchandise the range, not a single product

**Priority: P3 — meaningful but the largest build**

**What:** Surface the product range on the home page rather than routing
everything to one product page.

**Evidence:** All ten product links on the home page point to the same URL,
`/products/reusable-shopping-bags`. Seven collections exist and are linked
(`edc-bags`, `foldable-bags`, `lightweight-travel-bags`, `packable-beach-bags`,
`reusable-bags`, `reusable-grocery-bags`), but the range itself is not shown.

**Why it should work:** A visitor who does not want that specific product has no
visible alternative and must use the navigation to discover that alternatives
exist. Showing three or four distinct products with prices gives self-selection
and lifts the chance that any given visitor finds a fit.

**How to test:** A/B a product grid inserted below the hero against the current
single-product routing. Primary metric: home-page bounce rate and product-page
entries. Watch revenue per session rather than conversion rate alone, since
spreading traffic across products can flatten conversion while raising total
revenue.

---

## Deliberately not on this list

The brief's working notes flagged a **missing sticky add-to-cart on mobile**.
That is not correct on the current site: the product page renders
`product-sticky-form--mobile-primary` inside a `<sticky-element>`, so a sticky
add-to-cart is already present. It is listed here so the omission does not look
like an oversight.
