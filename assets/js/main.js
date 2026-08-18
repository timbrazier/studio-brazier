/* Studio Brazier — small progressive enhancements. The site works without JS:
   the project panels are revealed by CSS :hover and :focus-within, and every
   panel's text is in the markup. This script only adds tap-to-toggle. */
(function () {
  'use strict';

  /* Keep the footer copyright year current. */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  var tiles = Array.prototype.slice.call(document.querySelectorAll('.tile'));
  if (!tiles.length) return;

  var canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  function close(tile) {
    tile.classList.remove('is-open');
    var toggle = tile.querySelector('.tile__toggle');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  }

  function closeAll(except) {
    tiles.forEach(function (tile) {
      if (tile !== except) close(tile);
    });
  }

  tiles.forEach(function (tile) {
    var toggle = tile.querySelector('.tile__toggle');
    if (!toggle) return;

    toggle.addEventListener('click', function () {
      var open = tile.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) closeAll(tile);
    });

    toggle.addEventListener('keydown', function (event) {
      if (event.key === 'Escape') {
        close(tile);
        toggle.blur();
      }
    });

    /* Reset a tap-opened tile once the pointer leaves it. */
    if (canHover) {
      tile.addEventListener('mouseleave', function () { close(tile); });
    }
  });

  /* A tap anywhere else closes whatever is open. */
  document.addEventListener('click', function (event) {
    if (!event.target.closest('.tile')) closeAll(null);
  });
})();
