// Same-page links scroll without moving focus. This moves the keyboard
// to the target so the next Tab starts there.

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

  // Wait a frame so the scroll settles before focus lands.
  document.addEventListener('click', function (e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    if (!id) return;
    requestAnimationFrame(function () { land(id); });
  });

  window.addEventListener('hashchange', function () { land(hashId()); });
  if (location.hash) land(hashId());

  // Mark the showing slide's index link as current. Watch the scroller,
  // not clicks: swipes and arrow keys move it too.

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
