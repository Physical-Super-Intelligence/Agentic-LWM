/* ==========================================================================
   Agentic-LWM Interactive Scripts
   Vanilla JS, Zero External Dependencies
   ========================================================================== */

document.addEventListener('DOMContentLoaded', function () {
  setupNav();
  setupCounters();
  setupBibtexCopy();
  setupImageZoom();
});

/* Sticky Navigation & Scroll Spy */
function setupNav() {
  const nav = document.getElementById('alwm-nav');
  const progress = document.getElementById('alwm-progress');
  const toggle = document.getElementById('alwm-nav-toggle');
  const links = document.getElementById('alwm-nav-links');
  if (!nav) return;

  if (toggle && links) {
    toggle.addEventListener('click', function () {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('is-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  const anchorLinks = links ? Array.from(links.querySelectorAll('a')) : [];
  const sections = anchorLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  function onScroll() {
    if (progress) {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = scrollHeight > 0 ? `${(window.pageYOffset / scrollHeight) * 100}%` : '0%';
    }

    const scrollPos = window.pageYOffset + nav.offsetHeight + 50;
    let currentIdx = -1;
    sections.forEach((sec, idx) => {
      if (sec.offsetTop <= scrollPos) {
        currentIdx = idx;
      }
    });

    anchorLinks.forEach((a, idx) => {
      a.classList.toggle('is-active', idx === currentIdx);
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* Stat Counter Animation */
function setupCounters() {
  const counters = document.querySelectorAll('[data-count-to]');
  if (!counters.length) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function render(el, val) {
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    el.textContent = prefix + val.toFixed(dec) + suffix;
  }

  function animate(el) {
    const target = parseFloat(el.dataset.countTo);
    if (reduceMotion) {
      render(el, target);
      return;
    }

    const duration = 1200;
    let start = null;

    function step(ts) {
      if (!start) start = ts;
      const prog = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - prog, 3);
      render(el, target * eased);
      if (prog < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }

  if (!('IntersectionObserver' in window)) {
    counters.forEach(c => render(c, parseFloat(c.dataset.countTo)));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  counters.forEach(c => observer.observe(c));
}

/* One-Click BibTeX Copy */
function setupBibtexCopy() {
  const btn = document.querySelector('.copy-bibtex-btn');
  const code = document.getElementById('bibtex-code');
  if (!btn || !code) return;

  btn.addEventListener('click', function () {
    const text = code.innerText || code.textContent;
    function markDone() {
      btn.classList.add('copied');
      btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
      }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(markDone).catch(() => fallbackCopy(text, markDone));
    } else {
      fallbackCopy(text, markDone);
    }
  });

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      cb();
    } catch (e) {
      /* ignore */
    }
    document.body.removeChild(ta);
  }
}

/* Lightbox Image Zoom */
function setupImageZoom() {
  const images = document.querySelectorAll('.teaser-figure img');
  images.forEach(img => {
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function () {
      const modal = document.createElement('div');
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100vw';
      modal.style.height = '100vh';
      modal.style.backgroundColor = 'rgba(15, 23, 42, 0.9)';
      modal.style.display = 'flex';
      modal.style.alignItems = 'center';
      modal.style.justifyContent = 'center';
      modal.style.zIndex = '10000';
      modal.style.cursor = 'zoom-out';
      modal.style.padding = '2rem';

      const fullImg = document.createElement('img');
      fullImg.src = img.src;
      fullImg.style.maxWidth = '95vw';
      fullImg.style.maxHeight = '90vh';
      fullImg.style.objectFit = 'contain';
      fullImg.style.borderRadius = '8px';
      fullImg.style.boxShadow = '0 25px 50px -12px rgba(0, 0, 0, 0.5)';

      modal.appendChild(fullImg);
      modal.addEventListener('click', () => document.body.removeChild(modal));
      document.body.appendChild(modal);
    });
  });
}
