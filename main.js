/* ═══════════════════════════════════════════════════════════════
   AWARD EDITION JS
   Key upgrades vs original:
   ① Dark mode DEFAULT (localStorage || 'dark')
   ② Magnetic CTA on hero primary button
   ③ Improved canvas: vivid in dark, subtle in light
   ④ Reveal observer unified with stat trigger
   ═══════════════════════════════════════════════════════════════ */

const $ = id => document.getElementById(id);
const raf = fn => requestAnimationFrame(fn);

// ─── Navigation ───────────────────────────────────────────────
function goto(p) {
  document.querySelectorAll('.page').forEach(el => el.classList.remove('on'));
  const pg = $('page-' + p);
  if (!pg) return;
  pg.classList.add('on');
  document.querySelectorAll('[data-p]').forEach(a => a.classList.toggle('act', a.dataset.p === p));
  window.scrollTo({ top: 0, behavior: 'instant' });
  setTimeout(kickReveal, 60);
  closeMenu();
}

// ─── Mobile Menu ──────────────────────────────────────────────
let _mOpen = false;
function toggleMenu() {
  _mOpen = !_mOpen;
  $('mobile-menu').classList.toggle('open', _mOpen);
  $('burger').classList.toggle('open', _mOpen);
  $('burger').setAttribute('aria-expanded', String(_mOpen));
  document.body.style.overflow = _mOpen ? 'hidden' : '';
}
function closeMenu() {
  if (!_mOpen) return;
  _mOpen = false;
  $('mobile-menu').classList.remove('open');
  $('burger').classList.remove('open');
  $('burger').setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}
document.addEventListener('keydown', e => { if (e.key === 'Escape' && _mOpen) closeMenu(); });

// ─── Theme — DARK DEFAULT ──────────────────────────────────────
const _saved = localStorage.getItem('layan-theme') || 'dark';
applyTheme(_saved);

function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('layan-theme', t);
  if (window._cvTheme) window._cvTheme(t);
}
function toggleTheme() {
  applyTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark');
}

// ─── Scroll ───────────────────────────────────────────────────
const _nav = $('nav'), _wa = $('wa'), _pf = $('prog-fill');
window.addEventListener('scroll', () => {
  const top = window.scrollY;
  const h   = document.documentElement.scrollHeight - window.innerHeight;
  if (_pf) _pf.style.width = (h > 0 ? (top/h)*100 : 0) + '%';
  _nav?.classList.toggle('solid', top > 30);
  _wa?.classList.toggle('show', top > 400);
}, { passive: true });

// ─── Reveal ───────────────────────────────────────────────────
function kickReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add('vis');
      obs.unobserve(e.target);
    });
  }, { threshold: 0.07, rootMargin: '0px 0px -20px 0px' });
  document.querySelectorAll('.page.on .rv:not(.vis),.page.on .rv-l:not(.vis)')
    .forEach(el => obs.observe(el));
}
kickReveal();

// ─── Counter Animation ────────────────────────────────────────
function animCount(el) {
  if (el._done) return; el._done = true;
  const t = +el.dataset.t, s = el.dataset.s ?? '+';
  const dur = 1600; let st = null;
  raf(function step(ts) {
    if (!st) st = ts;
    const p = Math.min((ts - st) / dur, 1);
    const e = 1 - Math.pow(1 - p, 3);
    el.textContent = Math.round(e * t) + s;
    if (p < 1) raf(step);
  });
}
const _cObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { animCount(e.target); _cObs.unobserve(e.target); } });
}, { threshold: 0.4 });
document.querySelectorAll('[data-t]').forEach(el => _cObs.observe(el));

// ─── Magnetic CTA ─────────────────────────────────────────────
(function () {
  const btn = document.getElementById('cta-main');
  if (!btn || window.matchMedia('(hover: none)').matches) return;
  let rect, rid;
  btn.addEventListener('mouseenter', () => { rect = btn.getBoundingClientRect(); });
  btn.addEventListener('mousemove', e => {
    if (!rect) return;
    cancelAnimationFrame(rid);
    rid = raf(() => {
      const dx = (e.clientX - (rect.left + rect.width/2)) / (rect.width/2);
      const dy = (e.clientY - (rect.top  + rect.height/2)) / (rect.height/2);
      btn.style.transform = `translate(${dx*6}px, ${dy*6 - 3}px)`;
    });
  });
  btn.addEventListener('mouseleave', () => {
    cancelAnimationFrame(rid);
    btn.style.transform = '';
    rect = null;
  });
})();

// ─── Mobile Slider ────────────────────────────────────────────
(function () {
  const track = $('ttrack'); if (!track) return;
  let cur = 0, tid;
  const total = 3;

  function go(n) {
    n = ((n % total) + total) % total; cur = n;
    track.style.transform = `translateX(${n * 100}%)`;
    document.querySelectorAll('.testi-dot').forEach((d,i) => {
      d.classList.toggle('on', i===n);
      d.setAttribute('aria-selected', String(i===n));
    });
    const k = $('ts-'+n)?.querySelector('[data-t]');
    if (k && !k._done) setTimeout(() => animCount(k), 350);
    resetT(); startT();
  }
  window.gts = go;

  function resetT() {
    clearTimeout(tid);
    const f = $('ttfill'); if (!f) return;
    f.style.transition = 'none'; f.style.width = '0%'; void f.offsetWidth;
  }
  function startT() {
    const f = $('ttfill'); if (!f) return;
    f.style.transition = 'width 5s linear'; f.style.width = '100%';
    tid = setTimeout(() => go(cur+1), 5000);
  }

  $('tnext')?.addEventListener('click', () => go(cur+1));
  $('tprev')?.addEventListener('click', () => go(cur-1));

  let tx = 0;
  track.addEventListener('touchstart', e => { tx = e.touches[0].clientX; }, { passive:true });
  track.addEventListener('touchend', e => { const d = tx - e.changedTouches[0].clientX; if (Math.abs(d)>50) go(d>0?cur+1:cur-1); }, { passive:true });

  const wrap = track.closest('.testi-outer');
  if (wrap) {
    wrap.addEventListener('mouseenter', () => { clearTimeout(tid); const f=$('ttfill'); if(f) f.style.transition='none'; });
    wrap.addEventListener('mouseleave', () => { resetT(); startT(); });
  }
  const k0 = $('ts-0')?.querySelector('[data-t]');
  if (k0) setTimeout(() => animCount(k0), 600);
  startT();
})();

// ─── Keyboard accessibility ───────────────────────────────────
document.querySelectorAll('[tabindex="0"]').forEach(el => {
  el.addEventListener('keydown', e => { if (e.key==='Enter'||e.key===' ') { e.preventDefault(); el.click(); } });
});

// ─── Contact form ─────────────────────────────────────────────
function submitForm(btn) {
  const n = $('cf-name'), em = $('cf-email');
  if (!n?.value.trim() || !em?.value.trim()) {
    btn.animate([{transform:'translateX(0)'},{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:300});
    return;
  }
  btn.textContent = 'تم الإرسال ✓';
  btn.disabled = true; btn.style.opacity = '0.7'; btn.style.cursor = 'default';
}

// ─── Canvas Particle System ───────────────────────────────────
(function () {
  const cv = $('bg-canvas'); if (!cv) return;
  const ctx = cv.getContext('2d');
  let W, H, nodes=[], frame=0;

  const PALETTES = {
    dark:  { node:'rgba(88,199,126,', line:'rgba(88,199,126,', mult:1.3 },
    light: { node:'rgba(28,56,41,',   line:'rgba(28,56,41,',   mult:0.9 },
  };
  let tc = PALETTES[_saved] || PALETTES.dark;
  window._cvTheme = t => { tc = PALETTES[t] || PALETTES.dark; };

  function rnd(a,b) { return a + Math.random()*(b-a); }

  function resize() {
    W = cv.width = window.innerWidth;
    H = cv.height = window.innerHeight;
    init();
  }
  function init() {
    const n = Math.min(Math.floor(W*H/26000), 52);
    nodes = Array.from({length:n}, () => ({
      x:rnd(0,W), y:rnd(0,H), vx:rnd(-0.22,0.22), vy:rnd(-0.22,0.22),
      r:rnd(1.3,2.6), pulse:rnd(0,Math.PI*2)
    }));
  }

  function draw() {
    frame++;
    ctx.clearRect(0,0,W,H);
    nodes.forEach(n => {
      n.x+=n.vx; n.y+=n.vy;
      if(n.x<0) n.x=W; if(n.x>W) n.x=0;
      if(n.y<0) n.y=H; if(n.y>H) n.y=0;
      n.pulse+=0.009;
    });
    if (frame%2===0) {
      const DIST = Math.min(W,H)*0.17, D2=DIST*DIST;
      for (let i=0;i<nodes.length;i++) for (let j=i+1;j<nodes.length;j++) {
        const dx=nodes[i].x-nodes[j].x, dy=nodes[i].y-nodes[j].y;
        if (dx*dx+dy*dy<D2) {
          const d=Math.sqrt(dx*dx+dy*dy);
          const a=(1-d/DIST)*0.048*tc.mult;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x,nodes[i].y);
          ctx.lineTo(nodes[j].x,nodes[j].y);
          ctx.strokeStyle=tc.line+a+')';
          ctx.lineWidth=0.7; ctx.stroke();
        }
      }
    }
    nodes.forEach(n => {
      const r=n.r+Math.sin(n.pulse)*0.42;
      const a=Math.min((0.09+Math.sin(n.pulse)*0.036)*tc.mult,0.22);
      ctx.beginPath(); ctx.arc(n.x,n.y,r,0,Math.PI*2);
      ctx.fillStyle=tc.node+a+')'; ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  let _rsz;
  window.addEventListener('resize', () => { clearTimeout(_rsz); _rsz=setTimeout(resize,140); });
  resize(); draw();
})();