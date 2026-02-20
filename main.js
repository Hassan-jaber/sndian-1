// ─── Helpers ─────────────────────────────────────────────────────────────────
const $ = id => document.getElementById(id);
const raf = fn => requestAnimationFrame(fn);
// ─── End Helpers ─────────────────────────────────────────────────────────────


// ─── Page Navigation ──────────────────────────────────────────────────────────
function goto(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('on'));
  $('page-' + p).classList.add('on');
  document.querySelectorAll('[data-p]').forEach(a => {
    a.classList.toggle('act', a.dataset.p === p);
  });
  window.scrollTo({ top: 0, behavior: 'instant' });
  setTimeout(kickReveal, 60);
  closeMenu();
}
// ─── End Page Navigation ──────────────────────────────────────────────────────


// ─── Mobile Menu ──────────────────────────────────────────────────────────────
let menuOpen = false;

function toggleMenu() {
  menuOpen = !menuOpen;
  $('mobile-menu').classList.toggle('open', menuOpen);
  $('burger').classList.toggle('open', menuOpen);
  $('burger').setAttribute('aria-expanded', String(menuOpen));
  document.body.style.overflow = menuOpen ? 'hidden' : '';
}

function closeMenu() {
  menuOpen = false;
  $('mobile-menu').classList.remove('open');
  $('burger').classList.remove('open');
  $('burger').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

// Close mobile menu on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && menuOpen) closeMenu();
});
// ─── End Mobile Menu ──────────────────────────────────────────────────────────


// ─── Dark Mode ────────────────────────────────────────────────────────────────
const savedTheme = localStorage.getItem('layan-theme') || 'light';
applyTheme(savedTheme);

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('layan-theme', t);
  if (window._bgCtx) updateCanvasTheme(t);
}

function toggleTheme() {
  const curr = document.documentElement.getAttribute('data-theme');
  applyTheme(curr === 'dark' ? 'light' : 'dark');
}
// ─── End Dark Mode ────────────────────────────────────────────────────────────


// ─── Scroll Handlers ──────────────────────────────────────────────────────────
const nav   = $('nav');
const wa    = $('wa');
const pfill = $('prog-fill');

window.addEventListener('scroll', () => {
  const top = window.scrollY;
  const h   = document.documentElement.scrollHeight - window.innerHeight;
  pfill.style.width = (h > 0 ? (top / h) * 100 : 0) + '%';
  nav.classList.toggle('solid', top > 30);
  wa.classList.toggle('show', top > 400);
}, { passive: true });
// ─── End Scroll Handlers ──────────────────────────────────────────────────────


// ─── Reveal Animations ────────────────────────────────────────────────────────
function kickReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('vis');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -24px 0px' });

  document.querySelectorAll('.page.on .rv:not(.vis), .page.on .rv-l:not(.vis), .page.on .rv-r:not(.vis)')
    .forEach(el => obs.observe(el));
}
kickReveal();
// ─── End Reveal Animations ────────────────────────────────────────────────────


// ─── Counter Animation ────────────────────────────────────────────────────────
function animCount(el) {
  if (el._done) return;
  el._done = true;
  const target = +el.dataset.t;
  const suf    = el.dataset.s || '+';
  let start    = null;
  const dur    = 1500;

  raf(function step(ts) {
    if (!start) start = ts;
    const p    = Math.min((ts - start) / dur, 1);
    const ease = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(ease * target) + suf;
    if (p < 1) raf(step);
  });
}

const cObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      animCount(e.target);
      cObs.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });

document.querySelectorAll('[data-t]').forEach(el => cObs.observe(el));
// ─── End Counter Animation ────────────────────────────────────────────────────


// ─── Mobile Testimonials Slider ───────────────────────────────────────────────
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

    // Animate KPI counter in new slide
    const kpi = $('ts-' + cur)?.querySelector('[data-t]');
    if (kpi && !kpi._done) setTimeout(() => animCount(kpi), 350);

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
  track.addEventListener('touchend',   e => {
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

  // Init first slide KPI
  const k0 = $('ts-0')?.querySelector('[data-t]');
  if (k0) setTimeout(() => animCount(k0), 600);

  startTicker();
})();
// ─── End Mobile Slider ────────────────────────────────────────────────────────


// ─── Keyboard Accessibility on Cards ─────────────────────────────────────────
document.querySelectorAll('[tabindex="0"]').forEach(el => {
  el.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      el.click();
    }
  });
});
// ─── End Keyboard Accessibility ───────────────────────────────────────────────


// ─── Animated Background Canvas ───────────────────────────────────────────────
(function () {
  const cv  = $('bg-canvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, nodes = [], frame = 0;
  window._bgCtx = ctx;

  const THEMES = {
    light: { node: 'rgba(28,56,41,',   line: 'rgba(28,56,41,',   bg: 'transparent' },
    dark:  { node: 'rgba(94,203,136,', line: 'rgba(94,203,136,', bg: 'transparent' }
  };
  let tc = THEMES[savedTheme] || THEMES.light;

  function updateCanvasTheme(t) { tc = THEMES[t] || THEMES.light; }
  window.updateCanvasTheme = updateCanvasTheme;

  function rnd(a, b) { return a + Math.random() * (b - a); }

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
    init();
  }

  function init() {
    const count = Math.min(Math.floor(W * H / 26000), 52);
    nodes = Array.from({ length: count }, () => ({
      x:     rnd(0, W),
      y:     rnd(0, H),
      vx:    rnd(-0.22, 0.22),
      vy:    rnd(-0.22, 0.22),
      r:     rnd(1.5, 2.8),
      pulse: rnd(0, Math.PI * 2)
    }));
  }

  function draw() {
    frame++;
    ctx.clearRect(0, 0, W, H);

    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0) n.x = W;
      if (n.x > W) n.x = 0;
      if (n.y < 0) n.y = H;
      if (n.y > H) n.y = 0;
      n.pulse += 0.011;
    });

    if (frame % 2 === 0) {
      const DIST = Math.min(W, H) * 0.18;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const d  = Math.sqrt(dx * dx + dy * dy);
          if (d < DIST) {
            const alpha = (1 - d / DIST) * 0.055;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = tc.line + alpha + ')';
            ctx.lineWidth   = 0.7;
            ctx.stroke();
          }
        }
      }
    }

    nodes.forEach(n => {
      const pulsed = n.r + Math.sin(n.pulse) * 0.45;
      const alpha  = 0.10 + Math.sin(n.pulse) * 0.04;
      ctx.beginPath();
      ctx.arc(n.x, n.y, pulsed, 0, Math.PI * 2);
      ctx.fillStyle = tc.node + alpha + ')';
      ctx.fill();
    });

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    clearTimeout(window._rsz);
    window._rsz = setTimeout(resize, 140);
  });

  resize();
  draw();
})();
// ─── End Animated Canvas ──────────────────────────────────────────────────────


// ─── Contact Form ─────────────────────────────────────────────────────────────
function submitForm(btn) {
  btn.innerHTML = 'تم الإرسال ✓';
  btn.disabled  = true;
  btn.style.background = 'var(--green-2)';
  btn.style.cursor = 'default';
}
// ─── End Contact Form ─────────────────────────────────────────────────────────
