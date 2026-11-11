/* Project page kit v2: nav, scroll reveal, count-up stats, tabs, chart views of tables, sortable and heat tables,
   segmented switches, lightbox, BibTeX copy. Every number shown comes from the page's own HTML. */
(function () {
  'use strict';
  document.documentElement.classList.add('js');
  function $(id) { return document.getElementById(id); }
  function all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top < 130) current = i; });
    anchors.forEach(function (a, i) { a.classList.toggle('active', i === current); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- chart views generated from tables: <table data-chart="col" data-chart-title="..."> ---- */
  all('table[data-chart]').forEach(function (table, n) {
    var col = parseInt(table.getAttribute('data-chart'), 10);
    var unit = table.getAttribute('data-chart-unit') || '';
    var rows = Array.prototype.slice.call(table.tBodies[0].rows).filter(function (r) {
      return !r.classList.contains('grp-row') && r.cells[col] && !isNaN(parseFloat(r.cells[col].textContent));
    }).map(function (r) {
      return { label: r.cells[0].textContent.trim(), value: parseFloat(r.cells[col].textContent),
               text: r.cells[col].textContent.trim(), ours: r.classList.contains('ours'), muted: r.classList.contains('muted') };
    });
    if (!rows.length) return;
    rows.sort(function (a, b) { return b.value - a.value; });
    var max = parseFloat(table.getAttribute('data-chart-max')) || Math.max.apply(null, rows.map(function (r) { return r.value; })) || 1;
    var wrap = table.closest('.table-wrap');
    var chart = document.createElement('div');
    chart.className = 'chartview';
    chart.innerHTML = '<div class="ctitle"></div>' + rows.map(function (r) {
      return '<div class="hrow' + (r.ours ? ' ours' : '') + '"' + (r.muted ? ' style="opacity:.6"' : '') + '>' +
        '<span class="hl"></span><span class="ht"><span class="hb" data-w="' + (r.value / max * 100).toFixed(2) + '"></span></span>' +
        '<span class="hv">' + r.text + unit + '</span></div>';
    }).join('');
    chart.querySelector('.ctitle').textContent = table.getAttribute('data-chart-title') || '';
    all('.hl', chart).forEach(function (el, i) { el.textContent = rows[i].label; el.title = rows[i].label; });
    var bar = document.createElement('div');
    bar.className = 'viewbar';
    bar.innerHTML = '<div class="segctl" role="tablist"><button type="button" class="on" data-v="chart">Chart</button>' +
                    '<button type="button" data-v="table">Table</button></div>';
    wrap.parentNode.insertBefore(bar, wrap);
    wrap.parentNode.insertBefore(chart, wrap);
    wrap.style.display = 'none';
    function grow() { all('.hb', chart).forEach(function (b) { b.style.width = b.getAttribute('data-w') + '%'; }); }
    all('button', bar).forEach(function (b) {
      b.addEventListener('click', function () {
        var v = b.getAttribute('data-v');
        all('button', bar).forEach(function (x) { x.classList.toggle('on', x === b); });
        chart.style.display = v === 'chart' ? '' : 'none';
        wrap.style.display = v === 'table' ? '' : 'none';
        if (v === 'chart') grow();
      });
    });
    chart._grow = grow;
  });

  /* ---- tabs: <div class="tabset"><div class="segctl" data-tabs> buttons[data-tab] ... .tabpanel[data-panel] ---- */
  all('.tabset').forEach(function (set) {
    var buttons = all('[data-tabs] button', set);
    var panels = all('.tabpanel', set);
    function show(key) {
      buttons.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-tab') === key); });
      panels.forEach(function (p) { p.classList.toggle('on', p.getAttribute('data-panel') === key); });
      all('.chartview', set).forEach(function (c) { if (c._grow) c._grow(); });
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-tab')); }); });
    show((buttons.filter(function (b) { return b.classList.contains('on'); })[0] || buttons[0]).getAttribute('data-tab'));
  });

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
          if (h >= 0.72) td.classList.add('light-text');
        }
        if (group && i % group === group - 1) td.classList.add('gsep');
      });
    });
    if (group && table.tHead.rows.length > 1) {
      Array.prototype.forEach.call(table.tHead.rows[1].cells, function (th, i) { if (i % group === group - 1) th.classList.add('gsep'); });
    }
  });

  /* ---- segmented switches: <div class="segctl" data-src="json-id" data-out="panel-id"> ---- */
  all('.segctl[data-src]').forEach(function (seg) {
    var data = JSON.parse($(seg.getAttribute('data-src')).textContent);
    var out = $(seg.getAttribute('data-out'));
    var buttons = all('button', seg);
    function show(key) {
      var d = data[key];
      buttons.forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-key') === key); });
      all('[data-field]', out).forEach(function (el) { var v = d[el.getAttribute('data-field')]; el.textContent = v === undefined ? '' : v; });
      all('[data-bar]', out).forEach(function (el) {
        var v = parseFloat(d[el.getAttribute('data-bar')]);
        var scale = parseFloat(el.getAttribute('data-scale') || '100');
        el.style.width = (isNaN(v) ? 0 : Math.min(100, v / scale * 100)) + '%';
      });
    }
    buttons.forEach(function (b) { b.addEventListener('click', function () { show(b.getAttribute('data-key')); }); });
    show((buttons.filter(function (b) { return b.classList.contains('on'); })[0] || buttons[0]).getAttribute('data-key'));
  });

  /* ---- count-up stats: animates a single leading number, keeps its decimals and suffix ---- */
  function countUp(el) {
    var raw = el.textContent;
    var m = raw.match(/^(\d+(?:\.\d+)?)([^\d]*)$/);
    if (!m || reduce) return;
    var target = parseFloat(m[1]), dec = (m[1].split('.')[1] || '').length, suffix = m[2], t0 = null;
    function step(t) {
      if (!t0) t0 = t;
      var k = Math.min(1, (t - t0) / 1100), e = 1 - Math.pow(1 - k, 3);
      el.textContent = (target * e).toFixed(dec) + suffix;
      if (k < 1) requestAnimationFrame(step); else el.textContent = raw;
    }
    requestAnimationFrame(step);
  }

  /* ---- scroll reveal: sections fade up once; charts grow and stats count when they appear ---- */
  var targets = all('.band .wrap > *, .hero .stats, .hero .fig, .hero .video-card').filter(function (el) { return el.offsetParent !== null; });
  function enter(el) {
    el.classList.add('in');
    var cs = all('.chartview', el); if (el.classList.contains('chartview')) cs.push(el);
    cs.forEach(function (c) { if (c._grow && c.offsetParent !== null) c._grow(); });
    if (el.classList.contains('stats')) all('.stat b', el).forEach(countUp);
  }
  if ('IntersectionObserver' in window && !reduce) {
    targets.forEach(function (el) { el.classList.add('reveal'); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { enter(en.target); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    targets.forEach(function (el) { io.observe(el); });
  } else {
    targets.forEach(enter);
  }

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
