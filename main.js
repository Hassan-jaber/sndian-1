/* ═══════════════════════════════════════════════════════════════
   LAYAN AL-SALEM — Portfolio JS
   Clean, performant, competition-level
═══════════════════════════════════════════════════════════════ */

// ── Helpers ──────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const raf = fn => requestAnimationFrame(fn);
// ─────────────────────────────────────────────────────────────


// ── Page Navigation ──────────────────────────────────────────
function goto(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('on'));
  const target = $('page-' + p);
  if (!target) return;
  target.classList.add('on');
  document.querySelectorAll('[data-p]').forEach(a => {
    a.classList.toggle('act', a.dataset.p === p);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  setTimeout(kickReveal, 60);
  closeMenu();
}
// ─────────────────────────────────────────────────────────────


// ── Mobile Menu ──────────────────────────────────────────────
let menuOpen = false;

function toggleMenu() {
  menuOpen = !menuOpen;
  $('mobile-menu').classList.toggle('open', menuOpen);
  $('burger').classList.toggle('open', menuOpen);
  $('burger').setAttribute('aria-expanded', String(menuOpen));
  document.body.style.overflow = menuOpen ? 'hidden' : '';
}

function closeMenu() {
  if (!menuOpen) return;
  menuOpen = false;
  $('mobile-menu').classList.remove('open');
  $('burger').classList.remove('open');
  $('burger').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuOpen) closeMenu();
});
// ─────────────────────────────────────────────────────────────


// ── Dark Mode ────────────────────────────────────────────────
// Dark mode is the DEFAULT premium experience on first load.
const savedTheme = localStorage.getItem('layan-theme') || 'dark';
applyTheme(savedTheme);

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('layan-theme', t);
  if (window._updateCanvasTheme) window._updateCanvasTheme(t);
}

function toggleTheme() {
  const curr = document.documentElement.getAttribute('data-theme');
  const next = curr === 'dark' ? 'light' : 'dark';

  // Smooth cross-fade transition
  document.documentElement.classList.add('theme-transitioning');
  applyTheme(next);

  // Create a ripple from the button
  const btn = document.getElementById('theme-btn');
  if (btn) {
    btn.style.setProperty('--ripple', '1');
    setTimeout(() => btn.style.removeProperty('--ripple'), 500);
  }

  setTimeout(() => {
    document.documentElement.classList.remove('theme-transitioning');
  }, 600);
}
// ─────────────────────────────────────────────────────────────


// ── Scroll Handlers ──────────────────────────────────────────
const _nav   = $('nav');
const _wa    = $('wa');
const _pfill = $('prog-fill');

window.addEventListener('scroll', () => {
  const top = window.scrollY;
  const h   = document.documentElement.scrollHeight - window.innerHeight;
  if (_pfill) _pfill.style.width = (h > 0 ? (top / h) * 100 : 0) + '%';
  if (_nav)   _nav.classList.toggle('solid', top > 30);
  if (_wa)    _wa.classList.toggle('show', top > 400);
}, { passive: true });
// ─────────────────────────────────────────────────────────────


// ── Reveal Animations ────────────────────────────────────────
let _revealObs = null;

function kickReveal() {
  // Reuse observer; create once per page switch
  if (_revealObs) _revealObs.disconnect();

  _revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        _revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.page.on .rv:not(.vis)')
    .forEach(el => _revealObs.observe(el));
}

kickReveal();
// ─────────────────────────────────────────────────────────────


// ── Counter Animation ────────────────────────────────────────
function animCount(el) {
  if (el._done) return;
  el._done = true;
  const target = +el.dataset.t;
  const suf    = el.dataset.s !== undefined ? el.dataset.s : '+';
  const dur    = 1500;
  let start    = null;

  raf(function step(ts) {
    if (!start) start = ts;
    const p    = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target) + suf;
    if (p < 1) raf(step);
  });
}

const _cObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animCount(e.target);
      _cObs.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('[data-t]').forEach(el => _cObs.observe(el));
// ─────────────────────────────────────────────────────────────


// ── Mobile Testimonials Slider ────────────────────────────────
(function () {
  const track = $('ttrack');
  if (!track) return;

  let cur = 0;
  const total = 3;
  let tickId;

  function go(n) {
    n   = ((n % total) + total) % total;
    cur = n;

    // RTL: positive translateX moves slides left in RTL — we want to show slide n
    // In RTL, translateX(+100%) moves right, so to reveal slide n we go negative
    track.style.transform = `translateX(${cur * 100}%)`;

    document.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('on', i === cur);
      d.setAttribute('aria-selected', String(i === cur));
    });

    // Animate KPI counter in new slide
    const slide = $('ts-' + cur);
    if (slide) {
      const kpi = slide.querySelector('[data-t]');
      if (kpi && !kpi._done) setTimeout(() => animCount(kpi), 350);
    }

    resetTicker();
    startTicker();
  }

  window.gts = go;

  function resetTicker() {
    clearTimeout(tickId);
    const f = $('ttfill');
    if (!f) return;
    f.style.transition = 'none';
    f.style.width = '0%';
    void f.offsetWidth; // force reflow
  }

  function startTicker() {
    const f = $('ttfill');
    if (!f) return;
    f.style.transition = 'width 5s linear';
    f.style.width = '100%';
    tickId = setTimeout(() => go(cur + 1), 5000);
  }

  const tnext = $('tnext');
  const tprev = $('tprev');
  if (tnext) tnext.addEventListener('click', () => go(cur + 1));
  if (tprev) tprev.addEventListener('click', () => go(cur - 1));

  // Touch swipe — RTL aware
  let tx0 = 0;
  track.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const d = tx0 - e.changedTouches[0].clientX;
    // In RTL layout, swipe left (positive d) → go to previous
    if (Math.abs(d) > 50) go(d > 0 ? cur + 1 : cur - 1);
  }, { passive: true });

  // Pause on hover
  const wrap = track.closest('.testi-outer');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => {
      clearTimeout(tickId);
      const f = $('ttfill');
      if (f) f.style.transition = 'none';
    });
    wrap.addEventListener('mouseleave', () => { resetTicker(); startTicker(); });
  }

  // Init first slide KPI
  const k0 = $('ts-0')?.querySelector('[data-t]');
  if (k0) setTimeout(() => animCount(k0), 600);

  startTicker();
})();
// ─────────────────────────────────────────────────────────────


// ── Keyboard Accessibility on Cards ──────────────────────────
document.querySelectorAll('[tabindex="0"]').forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
});
// ─────────────────────────────────────────────────────────────


// ── Animated Background Canvas ────────────────────────────────
(function () {
  const cv = $('bg-canvas');
  if (!cv) return;

  const ctx = cv.getContext('2d');
  let W, H, nodes = [], frame = 0;

  // Premium palette: light uses warm forest tones, dark uses luminous green
  const PALETTES = {
    light: { node: 'rgba(27,56,40,',   line: 'rgba(27,56,40,' },
    dark:  { node: 'rgba(62,200,120,', line: 'rgba(62,200,120,' }
  };
  let tc = PALETTES[savedTheme] || PALETTES.dark;

  // Expose theme updater
  window._updateCanvasTheme = t => { tc = PALETTES[t] || PALETTES.dark; };

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    initNodes();
  }

  function initNodes() {
    const count = Math.min(Math.floor(W * H / 24000), 55);
    nodes = Array.from({ length: count }, () => ({
      x: rnd(0, W), y: rnd(0, H),
      vx: rnd(-0.18, 0.18), vy: rnd(-0.18, 0.18),
      r: rnd(1.2, 2.8),
      pulse: rnd(0, Math.PI * 2)
    }));
  }

  function draw() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    // Move nodes
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0) n.x = W; else if (n.x > W) n.x = 0;
      if (n.y < 0) n.y = H; else if (n.y > H) n.y = 0;
      n.pulse += 0.008;
    });

    // Draw connections every other frame for performance
    if (frame % 2 === 0) {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const DIST = Math.min(W, H) * (isDark ? 0.19 : 0.17);
      const DIST2 = DIST * DIST;
      const baseAlpha = isDark ? 0.07 : 0.05;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          if (dx * dx + dy * dy < DIST2) {
            const d = Math.sqrt(dx * dx + dy * dy);
            const alpha = (1 - d / DIST) * baseAlpha;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = tc.line + alpha + ')';
            ctx.lineWidth = isDark ? 0.8 : 0.7;
            ctx.stroke();
          }
        }
      }
    }

    // Draw nodes
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    nodes.forEach(n => {
      const r     = n.r + Math.sin(n.pulse) * 0.5;
      const alpha = (isDark ? 0.13 : 0.09) + Math.sin(n.pulse) * 0.04;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = tc.node + alpha + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  let _rsz;
  window.addEventListener('resize', () => {
    clearTimeout(_rsz);
    _rsz = setTimeout(resize, 150);
  });

  resize();
  draw();
})();
// ─────────────────────────────────────────────────────────────


// ── Contact Form ──────────────────────────────────────────────
function submitForm(btn) {
  // Basic validation
  const name  = document.getElementById('cf-name');
  const email = document.getElementById('cf-email');
  if (!name?.value.trim() || !email?.value.trim()) {
    btn.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],
      {duration:300,easing:'ease'});
    return;
  }
  btn.innerHTML   = 'تم الإرسال ✓';
  btn.disabled    = true;
  btn.style.background = 'var(--green2)';
  btn.style.cursor     = 'default';
}
// ─────────────────────────────────────────────────────────────
