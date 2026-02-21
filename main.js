/* ═══════════════════════════════════════════════════════════════
   LAYAN AL-SALEM — Portfolio JS · Award Edition
   ─────────────────────────────────────────────────────────────
   Key upgrades:
   ① Dark mode is DEFAULT — only reads localStorage override
   ② Canvas: brighter particles in dark, refined in light
   ③ Magnetic CTA: subtle cursor-following on primary button
   ④ Stat underline trigger fires on .stat reveal
   ⑤ Smoother scroll restoration
═══════════════════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const raf = fn => requestAnimationFrame(fn);


/* ══════════════════════════════════════
   PAGE NAVIGATION
══════════════════════════════════════ */
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


/* ══════════════════════════════════════
   MOBILE MENU
══════════════════════════════════════ */
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


/* ══════════════════════════════════════
   DARK MODE — Default is DARK
   Logic: check localStorage first.
   If no saved preference → use dark.
══════════════════════════════════════ */
const savedTheme = localStorage.getItem('layan-theme') || 'dark';
applyTheme(savedTheme);

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('layan-theme', t);
  if (window._updateCanvasTheme) window._updateCanvasTheme(t);
}

function toggleTheme() {
  const curr = document.documentElement.getAttribute('data-theme');
  applyTheme(curr === 'dark' ? 'light' : 'dark');
}


/* ══════════════════════════════════════
   SCROLL HANDLERS
══════════════════════════════════════ */
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


/* ══════════════════════════════════════
   REVEAL ANIMATIONS + STAT UNDERLINE
══════════════════════════════════════ */
let _revealObs = null;

function kickReveal() {
  if (_revealObs) _revealObs.disconnect();

  _revealObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        _revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -24px 0px' });

  // Stat blocks get .vis for underline animation
  document.querySelectorAll('.page.on .stat:not(.vis)')
    .forEach(el => _revealObs.observe(el));

  // General reveal
  document.querySelectorAll('.page.on .rv:not(.vis)')
    .forEach(el => _revealObs.observe(el));
}

kickReveal();


/* ══════════════════════════════════════
   ANIMATED COUNTER
══════════════════════════════════════ */
function animCount(el) {
  if (el._done) return;
  el._done = true;
  const target = +el.dataset.t;
  const suf    = el.dataset.s !== undefined ? el.dataset.s : '+';
  const dur    = 1600;
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


/* ══════════════════════════════════════
   MAGNETIC CTA
   Subtle: cursor offset makes button "follow" pointer
   Max displacement: 6px — polished, not gimmicky
══════════════════════════════════════ */
(function initMagneticCTA() {
  const btn = document.querySelector('.cta-primary');
  if (!btn || window.matchMedia('(hover: none)').matches) return;

  let rect, raf_id;

  function onEnter() {
    rect = btn.getBoundingClientRect();
  }

  function onMove(e) {
    if (!rect) return;
    cancelAnimationFrame(raf_id);
    raf_id = raf(() => {
      const cx = rect.left + rect.width  / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width  / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const strength = 6;
      btn.style.transform = `translate(${dx * strength}px, ${dy * strength - 3}px)`;
    });
  }

  function onLeave() {
    cancelAnimationFrame(raf_id);
    btn.style.transform = '';
    rect = null;
  }

  btn.addEventListener('mouseenter', onEnter);
  btn.addEventListener('mousemove',  onMove);
  btn.addEventListener('mouseleave', onLeave);
})();


/* ══════════════════════════════════════
   MOBILE TESTIMONIALS SLIDER
══════════════════════════════════════ */
(function () {
  const track = $('ttrack');
  if (!track) return;

  let cur = 0;
  const total = 3;
  let tickId;

  function go(n) {
    n   = ((n % total) + total) % total;
    cur = n;
    track.style.transform = `translateX(${cur * 100}%)`;

    document.querySelectorAll('.testi-dot').forEach((d, i) => {
      d.classList.toggle('on', i === cur);
      d.setAttribute('aria-selected', String(i === cur));
    });

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
    void f.offsetWidth;
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

  // Touch swipe
  let tx0 = 0;
  track.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend', e => {
    const d = tx0 - e.changedTouches[0].clientX;
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

  const k0 = $('ts-0')?.querySelector('[data-t]');
  if (k0) setTimeout(() => animCount(k0), 600);

  startTicker();
})();


/* ══════════════════════════════════════
   KEYBOARD ACCESSIBILITY
══════════════════════════════════════ */
document.querySelectorAll('[tabindex="0"]').forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
});


/* ══════════════════════════════════════
   CANVAS PARTICLE SYSTEM
   Dark mode: vivid emerald particles, higher opacity
   Light mode: subtle dark-green nodes, low opacity
   Performance: every-other-frame connections
══════════════════════════════════════ */
(function () {
  const cv = $('bg-canvas');
  if (!cv) return;

  const ctx = cv.getContext('2d');
  let W, H, nodes = [], frame = 0;

  // Theme-aware palettes
  const PALETTES = {
    light: {
      node: 'rgba(27,56,40,',
      line: 'rgba(27,56,40,',
      opacity_mult: 1.0,
    },
    dark: {
      node: 'rgba(92,200,138,',
      line: 'rgba(92,200,138,',
      opacity_mult: 1.3,
    },
  };

  let tc = PALETTES[savedTheme] || PALETTES.dark;

  window._updateCanvasTheme = t => {
    tc = PALETTES[t] || PALETTES.dark;
  };

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    initNodes();
  }

  function initNodes() {
    const count = Math.min(Math.floor(W * H / 26000), 52);
    nodes = Array.from({ length: count }, () => ({
      x: rnd(0, W), y: rnd(0, H),
      vx: rnd(-0.22, 0.22),
      vy: rnd(-0.22, 0.22),
      r: rnd(1.3, 2.5),
      pulse: rnd(0, Math.PI * 2),
    }));
  }

  function draw() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0) n.x = W; else if (n.x > W) n.x = 0;
      if (n.y < 0) n.y = H; else if (n.y > H) n.y = 0;
      n.pulse += 0.008;
    });

    // Draw connections — every other frame for performance
    if (frame % 2 === 0) {
      const DIST  = Math.min(W, H) * 0.16;
      const DIST2 = DIST * DIST;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          if (dx * dx + dy * dy < DIST2) {
            const d = Math.sqrt(dx * dx + dy * dy);
            const alpha = (1 - d / DIST) * 0.052 * tc.opacity_mult;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = tc.line + alpha + ')';
            ctx.lineWidth = 0.7;
            ctx.stroke();
          }
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      const r     = n.r + Math.sin(n.pulse) * 0.42;
      const alpha = (0.10 + Math.sin(n.pulse) * 0.038) * tc.opacity_mult;
      ctx.beginPath();
      ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = tc.node + Math.min(alpha, 0.22) + ')';
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


/* ══════════════════════════════════════
   CONTACT FORM
══════════════════════════════════════ */
function submitForm(btn) {
  const name  = document.getElementById('cf-name');
  const email = document.getElementById('cf-email');
  if (!name?.value.trim() || !email?.value.trim()) {
    btn.animate(
      [{ transform:'translateX(0)' }, { transform:'translateX(-6px)' },
       { transform:'translateX(6px)' }, { transform:'translateX(0)' }],
      { duration: 300, easing: 'ease' }
    );
    return;
  }
  btn.innerHTML = 'تم الإرسال ✓';
  btn.disabled  = true;
  btn.style.background = 'var(--green3)';
  btn.style.cursor     = 'default';
}
