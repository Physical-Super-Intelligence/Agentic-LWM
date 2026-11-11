/* Project page kit: nav, sortable tables, heat tables, segmented controls, lightbox, BibTeX copy. */
(function () {
  'use strict';
  function $(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---- nav: mobile toggle, scroll progress, active section ---- */
  var toggle = $('nav-toggle'), links = $('nav-links'), progress = $('nav-progress');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); }
    });
  }
  var anchors = links ? all('a[href^="#"]', links) : [];
  var sections = anchors.map(function (a) { return document.querySelector(a.getAttribute('href')); });
  function onScroll() {
    var h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (window.pageYOffset / h) * 100 : 0) + '%';
    var current = -1;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < 120) current = i; });
    anchors.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- sortable tables ---- */
  all('table.sortable').forEach(function (table) {
    var tbody = table.tBodies[0];
    var headers = Array.prototype.slice.call(table.tHead.rows[table.tHead.rows.length - 1].cells);
    headers.forEach(function (th, col) {
      var type = th.getAttribute('data-sort');
      if (!type) return;
      th.addEventListener('click', function () {
        var dir = th.classList.contains('desc') ? 'asc' : 'desc';
        headers.forEach(function (h) { h.classList.remove('asc', 'desc'); });
        th.classList.add(dir);
        var rows = Array.prototype.slice.call(tbody.rows);
        rows.sort(function (a, b) {
          var x = a.cells[col].textContent.trim(), y = b.cells[col].textContent.trim();
          var nx = parseFloat(x), ny = parseFloat(y);
          var cmp = type === 'num' ? (isNaN(nx) ? -1e9 : nx) - (isNaN(ny) ? -1e9 : ny) : x.localeCompare(y);
          return dir === 'asc' ? cmp : -cmp;
        });
        rows.forEach(function (r) { tbody.appendChild(r); });
      });
    });
  });

  /* ---- heat tables: <table class="heat" data-max="1" data-group="5"> ---- */
  all('table.heat').forEach(function (table) {
    var max = parseFloat(table.getAttribute('data-max') || '1');
    var group = parseInt(table.getAttribute('data-group') || '0', 10);
    Array.prototype.forEach.call(table.tBodies[0].rows, function (row) {
      all('td:not(.col-avg)', row).forEach(function (td, i) {
        var v = parseFloat(td.textContent);
        if (!isNaN(v)) {
          var h = Math.max(0, Math.min(1, v / max));
          td.style.setProperty('--h', h.toFixed(3));
          if (h >= 0.75) td.classList.add('light-text');
        }
        if (group && i % group === group - 1) td.classList.add('gsep');
      });
    });
  });

  /* ---- segmented controls: <div class="segctl" data-src="json-id" data-out="panel-id"> ---- */
  all('.segctl[data-src]').forEach(function (seg) {
    var data = JSON.parse($(seg.getAttribute('data-src')).textContent);
    var out = $(seg.getAttribute('data-out'));
    var buttons = all('button', seg);
    function show(key) {
      var d = data[key];
      buttons.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-key') === key); });
      all('[data-field]', out).forEach(function (el) {
        var v = d[el.getAttribute('data-field')];
        el.textContent = v === undefined ? '' : v;
      });
      all('[data-bar]', out).forEach(function (el) {
        var v = parseFloat(d[el.getAttribute('data-bar')]);
        var scale = parseFloat(el.getAttribute('data-scale') || '100');
        el.style.width = (isNaN(v) ? 0 : Math.min(100, v / scale * 100)) + '%';
      });
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-key')); }); });
    show((buttons.filter(function (b) { return b.classList.contains('on'); })[0] || buttons[0]).getAttribute('data-key'));
  });

  /* ---- lightbox ---- */
  var lb = $('lightbox'), lbImg = $('lightbox-img');
  function closeLb() { lb.classList.remove('open'); lbImg.src = ''; }
  if (lb) {
    all('img.zoom').forEach(function (img) {
      img.addEventListener('click', function () { lbImg.src = img.src; lbImg.alt = img.alt; lb.classList.add('open'); });
    });
    lb.addEventListener('click', closeLb);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeLb(); });
  }

  /* ---- BibTeX copy ---- */
  var copyBtn = $('copy-bib');
  if (copyBtn) {
    copyBtn.addEventListener('click', function () {
      var done = function () {
        copyBtn.textContent = 'Copied';
        copyBtn.classList.add('done');
        setTimeout(function () { copyBtn.textContent = 'Copy'; copyBtn.classList.remove('done'); }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText($('bib-code').textContent).then(done);
    });
  }
})();
