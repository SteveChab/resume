/* ====================================================================
   Jump links
   ====================================================================
   A link to an id scrolls the page but leaves the keyboard where it
   was, so the next Tab starts over from the top of the document.

   This moves the focus to match the scroll. Every jump target carries
   tabindex="-1" in the markup; the guard below adds it anyway, so a
   link added later still lands.
   ==================================================================== */

(function () {
  function land(id) {
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
    target.focus();
  }

  function hashId() {
    try {
      return decodeURIComponent(location.hash.slice(1));
    } catch (e) {
      return location.hash.slice(1);
    }
  }

  // The browser does the scrolling; this follows on the next frame, so
  // the scroll is settled before the focus lands.
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    if (!id) return;
    requestAnimationFrame(function () { land(id); });
  });

  // A deep link from another page arrives as a hash on load.
  window.addEventListener('hashchange', function () { land(hashId()); });
  if (location.hash) land(hashId());

  // ── The reel index ─────────────────────────────────────────────────
  // Marks which slide is showing, so a screen reader hears "current"
  // on it. Nothing depends on this: with JavaScript off the index
  // still scrolls the scrollport.
  //
  // The mark follows the slide, not the press, because the scroller
  // also answers a swipe and an arrow key. Reading the scrollport is
  // the only version that stays true.

  function watchIndex(index) {
    var reel = index.closest ? index.closest('.reel') : null;
    var scroller = reel ? reel.querySelector('.reel__scroller') : null;
    if (!scroller || !window.IntersectionObserver) return;

    var links = {};
    var slides = [];

    Array.prototype.forEach.call(index.querySelectorAll('a[href^="#"]'), function (a) {
      var slide = document.getElementById(a.getAttribute('href').slice(1));
      if (!slide) return;
      links[slide.id] = a;
      slides.push(slide);
    });

    if (!slides.length) return;

    var watcher = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = links[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
    }, { root: scroller, threshold: 0.6 });

    slides.forEach(function (slide) { watcher.observe(slide); });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.reel__index'), watchIndex);
}());
