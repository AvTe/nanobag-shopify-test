/*
  responsive-video
  ----------------
  Renders one of two videos depending on viewport width.

  Both sources sit in <template> elements, which the browser does not fetch.
  Only the matching one is ever cloned into the DOM, so a phone never downloads
  the desktop file and a desktop never downloads the mobile one. That matters
  here: the two source videos differ by roughly 20MB.

  The alternative, rendering both <video> elements and hiding one with CSS,
  would duplicate the markup and still cost a metadata request for the hidden
  file. The alternative of a `media` attribute on <source> is not honoured by
  browsers inside <video>, only inside <picture>.

  Nothing is loaded when the visitor prefers reduced motion. The poster image
  underneath is already painted, so the hero is complete without this running
  at all, and the element degrades to the poster if JavaScript fails.
*/
class ResponsiveVideo extends HTMLElement {
  connectedCallback() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.query = window.matchMedia(`(min-width: ${Number(this.dataset.breakpoint) || 750}px)`);
    this.update();
    this.query.addEventListener('change', () => this.update());
  }

  update() {
    const wanted = this.query.matches ? 'desktop' : 'mobile';
    if (this.dataset.active === wanted) return;

    const template =
      this.querySelector(`template[data-viewport="${wanted}"]`) || this.querySelector('template');
    if (!template) return;

    this.querySelector('video')?.remove();
    this.appendChild(template.content.cloneNode(true));
    this.dataset.active = wanted;

    // Safari does not always honour the autoplay attribute on an injected node.
    const video = this.querySelector('video');
    if (video?.hasAttribute('autoplay')) video.play().catch(() => {});
  }
}

customElements.define('responsive-video', ResponsiveVideo);
