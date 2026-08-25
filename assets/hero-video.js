/**
 * <responsive-video>
 *
 * Clones the <template> matching the current viewport, so only one video is
 * ever fetched. Template content is inert: the browser does not request it
 * until it is cloned into the document, which is what makes this genuinely
 * free rather than just visually deferred.
 *
 * A <video> cannot art-direct declaratively. The `media` attribute on <source>
 * is only honoured inside <picture>, so this has to be resolved in script.
 *
 * Expected markup:
 *   <responsive-video data-breakpoint="750">
 *     <template data-viewport="mobile">...</template>
 *     <template data-viewport="desktop">...</template>
 *   </responsive-video>
 *
 * Either template may be absent; the other is used as a fallback.
 */

(function () {
  // Guard against double registration. The script tag lives inside the
  // section, so a page with two hero sections executes this twice, and a
  // second define() call would throw and take both videos down with it.
  if (window.customElements && customElements.get('responsive-video')) return;

  class ResponsiveVideo extends HTMLElement {
    connectedCallback() {
      if (this.initialised) return;
      this.initialised = true;

      // Reduced motion: never fetch the video at all. The poster is already
      // in the DOM and carries the visual.
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

      const breakpoint = parseInt(this.dataset.breakpoint, 10) || 750;
      this.query = window.matchMedia('(min-width: ' + breakpoint + 'px)');

      this.handleChange = this.render.bind(this);
      this.query.addEventListener('change', this.handleChange);

      this.render();
    }

    disconnectedCallback() {
      if (this.query && this.handleChange) {
        this.query.removeEventListener('change', this.handleChange);
      }
      this.teardown();
      this.initialised = false;
    }

    /** Stop and release the current video so a swap never leaves two loading. */
    teardown() {
      const current = this.querySelector('video');
      if (!current) return;

      current.pause();
      current.removeAttribute('src');
      Array.prototype.forEach.call(current.querySelectorAll('source'), function (source) {
        source.removeAttribute('src');
      });
      // Forces the network request to be abandoned rather than left in flight.
      current.load();
      current.remove();

      this.removeAttribute('data-ready');
    }

    render() {
      const wanted = this.query.matches ? 'desktop' : 'mobile';
      if (this.current === wanted) return;

      const template =
        this.querySelector('template[data-viewport="' + wanted + '"]') ||
        this.querySelector('template');

      if (!template) return;

      this.teardown();
      this.current = wanted;

      this.appendChild(template.content.cloneNode(true));

      const video = this.querySelector('video');
      if (!video) return;

      const markReady = function () {
        this.setAttribute('data-ready', 'true');
      }.bind(this);

      if (video.readyState >= 2) {
        markReady();
      } else {
        video.addEventListener('loadeddata', markReady, { once: true });
      }

      const started = video.play();
      if (started && typeof started.catch === 'function') {
        // Autoplay is refusable: low power mode, data saver, OS policy.
        // The poster stays visible, so there is nothing to recover from.
        started.catch(function () {});
      }
    }
  }

  customElements.define('responsive-video', ResponsiveVideo);
})();