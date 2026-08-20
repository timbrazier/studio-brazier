/* Studio Brazier — progressive enhancements.
   The project panels are revealed by CSS :hover and :focus-within and every
   panel's text is in the markup, so hovering/tapping works without this file.
   Two things here do need it: the masonry column layout (.grid is a plain
   single-column list without it — see the comment below) and tap-to-toggle
   on touch devices, where there's no :hover to trigger the CSS panel. */
(function () {
  'use strict';

  /* Keep the footer copyright year current. */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* Masonry layout for the project grid — see the .grid comment in
     styles.css for why this replaced CSS multi-column. Progressive
     enhancement: without this running, .grid is a plain single-column
     block list (the base .grid rule), which is already a complete,
     correctly spaced layout — this only upgrades it to 2 or 3 columns.
     The filter chips above the grid (see below) hide non-matching tiles
     and re-run this against whatever's left. */
  var grid = document.querySelector('.grid');
  if (grid) {
    var gridItems = Array.prototype.slice.call(grid.children);
    var activeFilter = null;

    /* Split children into column-major groups in DOM order, matching how
       CSS multi-column used to fill: column 1 in full, then column 2, etc.
       The split points are the same [data-col-start] markers the design
       was built against, not a computed guess. Only valid for the full,
       unfiltered set — a filtered subset uses balanceColumns instead,
       since the fixed split points would leave whichever column lost the
       most tiles looking sparse or empty. */
    function threeColumnGroups() {
      var groups = [[], [], []];
      var col = 0;
      gridItems.forEach(function (el) {
        if (el.hasAttribute('data-col-start')) col += 1;
        groups[col].push(el);
      });
      return groups;
    }

    /* Bin-pack DOM order across N columns, always adding the next item to
       whichever column is currently shortest — the same result CSS
       multi-column's own balancing gave the unfiltered 2-column view, now
       generalised to any column count so a filtered set (any number of
       columns) balances sensibly too, since it has no fixed split to
       fall back on. */
    function balanceColumns(items, heights, gap, columns) {
      var groups = [];
      var colHeights = [];
      for (var c = 0; c < columns; c++) { groups.push([]); colHeights.push(0); }
      items.forEach(function (el, i) {
        var target = 0;
        for (var c = 1; c < columns; c++) {
          if (colHeights[c] < colHeights[target]) target = c;
        }
        groups[target].push(el);
        colHeights[target] += heights[i] + gap;
      });
      return groups;
    }

    function visibleItems() {
      return gridItems.filter(function (el) {
        return !activeFilter || el.dataset.category === activeFilter;
      });
    }

    function layout() {
      var items = visibleItems();
      gridItems.forEach(function (el) {
        el.classList.toggle('tile--filtered-out', items.indexOf(el) === -1);
      });

      var root = getComputedStyle(document.documentElement);
      var columns = root.getPropertyValue('--breakpoint-1col').trim() ? 1
        : root.getPropertyValue('--breakpoint-2col').trim() ? 2 : 3;

      if (columns === 1) {
        grid.classList.remove('is-masonry');
        grid.style.gridTemplateColumns = '';
        gridItems.forEach(function (el) {
          el.style.gridColumn = '';
          el.style.gridRow = '';
        });
        return;
      }

      grid.classList.add('is-masonry');
      grid.style.gridTemplateColumns = 'repeat(' + columns + ', 1fr)';

      /* Clear any previous explicit placement first so every item
         auto-places at the column width the line above just set — the
         auto-placement position doesn't matter for measuring, only the
         resulting width does, and every column is the same width. */
      items.forEach(function (el) {
        el.style.gridColumn = '';
        el.style.gridRow = '';
      });
      var gap = parseFloat(getComputedStyle(grid).columnGap) || 0;
      var heights = items.map(function (el) {
        return el.getBoundingClientRect().height;
      });

      var groups = (!activeFilter && columns === 3)
        ? threeColumnGroups()
        : balanceColumns(items, heights, gap, columns);

      var indexOf = new Map(items.map(function (el, i) { return [el, i]; }));

      groups.forEach(function (colItems, colIndex) {
        var cursor = 1;
        colItems.forEach(function (el) {
          var h = heights[indexOf.get(el)];
          var span = Math.max(1, Math.round(h));
          el.style.gridColumn = String(colIndex + 1);
          el.style.gridRow = cursor + ' / span ' + span;
          cursor += span + gap;
        });
      });
    }

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(layout, 120);
    });

    layout();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(layout);
    }

    /* Filter chips — tapping one shows only matching tiles; tapping the
       already-active one clears the filter. Single-select: choosing a
       different chip replaces rather than adds to the filter. */
    var chips = Array.prototype.slice.call(document.querySelectorAll('.filter-chip'));
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        var filter = chip.dataset.filter;
        activeFilter = activeFilter === filter ? null : filter;
        chips.forEach(function (c) {
          c.setAttribute('aria-pressed', c.dataset.filter === activeFilter ? 'true' : 'false');
        });
        layout();
      });
    });
  }

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
