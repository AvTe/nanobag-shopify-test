/*
  Overlay header state
  --------------------
  Keeps the overlay header transparent for exactly as long as the section it
  overlays is still behind it, and solid once it is not.

  Dawn's own sticky classes cannot answer that question. sticky_header_type
  "on-scroll-up" adds shopify-section-header-sticky the moment the visitor
  scrolls up anywhere on the page, including while still over the hero, so
  keying the solid state off it turned the header white mid-hero and never
  cleared once set.

  An observer on the overlaid section is the only thing that actually knows
  whether there is still artwork behind the header. rootMargin pulls the root's
  top edge down by the header's own height, so the flip happens exactly when
  the hero's bottom passes beneath the header rather than when it leaves the
  viewport.

  Degrades to a permanently transparent header if IntersectionObserver is
  missing, which is the same result as not loading this file at all.
*/
(() => {
  const wrapper = document.querySelector('.header-wrapper--transparent');
  if (!wrapper || !('IntersectionObserver' in window)) return;

  const overlaid = document.querySelector(wrapper.dataset.overlayTarget || '.hero-video');
  if (!overlaid) return;

  let observer;

  const watch = () => {
    observer?.disconnect();
    const offset = Math.round(wrapper.getBoundingClientRect().height);
    observer = new IntersectionObserver(
      ([entry]) => wrapper.classList.toggle('header-wrapper--solid', !entry.isIntersecting),
      { rootMargin: `-${offset}px 0px 0px 0px`, threshold: 0 }
    );
    observer.observe(overlaid);
  };

  watch();

  // The header changes height between breakpoints, so the margin is remeasured
  // rather than captured once.
  let pending;
  addEventListener('resize', () => {
    clearTimeout(pending);
    pending = setTimeout(watch, 150);
  });
})();
