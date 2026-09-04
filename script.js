/* ===== Birthday messages: title = who it's from, tap to reveal ===== */
const REVIEWS = [
  {
    from: "From The Kempins",
    body: [
      "33 years ago you came into our lives. From the moment you looked into our eyes you melted our hearts. At 3 weeks old you were boxing your mobile above your bassinet, with a look of such fierce determination. That set the tone for your future years to come. You tackle life head on, achieving your goals and dreams with relentless dedication.",
      "We are extremely proud to have walked beside you in your journey to date.",
      "You're compassionate and extremely protective of those you love, with a deep connection to your family.",
      "We all wish you a very happy birthday with much love. May your new journey ahead with the beautiful Coral be filled with love, happiness and much success.",
      "Lots of love from Mum, Dad and Boden.",
    ],
  },
  {
    from: "From Miss Tea",
    body: [
      "I love it when you come back home to see me, I get very excited when I hear your car. Thank you for all the love and cuddles, oh and the most important part the extra treats you give me. Love from Miss Tea.",
    ],
  },
  {
    from: "From Oma",
    body: ["Gelukkige Verjaardag Ziggy!!"],
  },
  {
    from: "From Scully and Piper",
    body: [
      "We appreciate all snuggles you give us. Thank you for taking care of us when mum is at work, we really love playing with you! Love from Scully and Piper.",
    ],
  },
  {
    from: "From Nan and Pop",
    body: [
      "Nan and Pop often smile when remembering the little guy in the back seat giving Pop directions on how to get home from Opa's house. Speaking Dutch to other people's dogs while playing at Lakes Entrance.",
      "You were always patient while helping us out with technology, leaving little notes behind for us.",
      "We have loved having the opportunity to spend time together with you.",
      "Have a fabulous day, lots of love Nan and Pop.",
    ],
  },
  {
    from: "From Uncle Shane",
    body: [
      "Uncle Shane still laughs at your beginners luck the first time he took you out fishing, you caught the biggest fish. Proudly showing it off while dressed in your black woollen work jacket. The fish only like well dressed fisherman.",
      "Again you were always there to help out Uncle Shane with any technology problems.",
      "Have a good one for your birthday!!",
    ],
  },
];

const TONES = ["", "cyan", "violet"];

document.getElementById('reviewGrid').innerHTML = REVIEWS.map((r, i) => `
  <article class="riddle letter ${TONES[i % TONES.length]}" tabindex="0" role="button" aria-expanded="false">
    <div class="corner tl"></div><div class="corner br"></div>
    <div class="riddle-tag">Message ${String(i + 1).padStart(2, '0')}</div>
    <h3 class="riddle-title">${r.from}</h3>
    <div class="riddle-body">
      <div>${r.body.map(p => `<p>${p}</p>`).join('')}</div>
    </div>
    <div class="riddle-cta">Tap to open</div>
  </article>
`).join('');

/* ===== Click to open / decrypt ===== */
const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
const GLYPHS = '!<>-_\\/[]{}—=+*^?#________';

/* scramble the label text as it changes — cheap, on-theme */
function scramble(el, target) {
  if (REDUCED) { el.textContent = target; return; }
  const from = el.textContent;
  const len = Math.max(from.length, target.length);
  const queue = Array.from({ length: len }, (_, i) => ({
    to: target[i] || '',
    start: Math.floor(Math.random() * 8),
    end: Math.floor(Math.random() * 8) + 8,
  }));
  let frame = 0;
  cancelAnimationFrame(el._raf);
  (function tick() {
    let out = '', done = 0;
    for (let i = 0; i < queue.length; i++) {
      const q = queue[i];
      if (frame >= q.end) { out += q.to; done++; }
      else if (frame >= q.start) out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      else out += from[i] || '';
    }
    el.textContent = out;
    if (done === queue.length) return;
    frame++;
    el._raf = requestAnimationFrame(tick);
  })();
}

function burstHearts(x, y) {
  if (REDUCED) return;
  for (let i = 0; i < 5; i++) {
    const h = document.createElement('div');
    h.className = 'pop-heart';
    h.textContent = ['♥', '❤', '♥'][i % 3];
    h.style.left = x + (Math.random() * 90 - 45) + 'px';
    h.style.top = y + 'px';
    const cs = getComputedStyle(document.documentElement);
    h.style.color = `rgb(${cs.getPropertyValue(['--c1','--c2','--c3'][i % 3]).trim()})`;
    h.style.animationDelay = (i * 70) + 'ms';
    document.body.appendChild(h);
    setTimeout(() => h.remove(), 1800);
  }
}

/* ===== Character-by-character decrypt for the puzzle cards ===== */
/* Reveals the riddle left-to-right behind a moving band of junk glyphs.
   Hidden characters become nbsp so the line boxes never reflow. */
function decryptText(el, delayFrames) {
  const nodes = [];
  const walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let n; (n = walk.nextNode());) nodes.push(n);
  if (!nodes.length) return;

  if (!el._orig) el._orig = nodes.map(t => t.nodeValue);
  const orig = el._orig;
  const total = orig.reduce((a, s) => a + s.length, 0);
  const SPEED = 2.2;   // characters resolved per frame
  const TAIL  = 16;    // width of the scrambling band

  cancelAnimationFrame(el._draf);
  let frame = -delayFrames;

  const restore = () => nodes.forEach((t, k) => { t.nodeValue = orig[k]; });

  (function tick() {
    const head = frame * SPEED;
    if (head - TAIL > total) { restore(); return; }
    let idx = 0;
    for (let k = 0; k < nodes.length; k++) {
      const s = orig[k];
      let out = '';
      for (let c = 0; c < s.length; c++, idx++) {
        const ch = s[c];
        if (ch === ' ' || ch === '\n' || ch === '\t') { out += ch; continue; }
        if (idx < head - TAIL) out += ch;
        else if (idx < head)   out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        else                   out += '\u00A0';
      }
      nodes[k].nodeValue = out;
    }
    frame++;
    el._draf = requestAnimationFrame(tick);
  })();
}

function decryptCard(card) {
  card.querySelectorAll('.riddle-body p').forEach((p, i) => decryptText(p, 8 + i * 12));
}

/* the sweeping scan bar each puzzle card runs while it decrypts */
document.querySelectorAll('.riddle.puzzle').forEach(card => {
  const scan = document.createElement('div');
  scan.className = 'scan';
  scan.setAttribute('aria-hidden', 'true');
  card.appendChild(scan);
});

document.querySelectorAll('.riddle').forEach(card => {
  const cta = card.querySelector('.riddle-cta');
  const isLetter = card.classList.contains('letter');

  const toggle = () => {
    const open = card.classList.toggle('open');
    card.setAttribute('aria-expanded', String(open));
    scramble(cta, open
      ? (isLetter ? 'With love ♥' : 'Decrypted')
      : (isLetter ? 'Tap to open' : 'Click to decrypt'));

    if (open && isLetter) {
      const r = card.getBoundingClientRect();
      burstHearts(r.left + r.width / 2, r.top + 40);
    }

    if (!isLetter && !REDUCED) {
      if (open) {
        decryptCard(card);
        card.classList.remove('scanning');
        void card.offsetWidth;          // restart the sweep on re-open
        card.classList.add('scanning');
      } else {
        card.classList.remove('scanning');
        card.querySelectorAll('.riddle-body p').forEach(p => cancelAnimationFrame(p._draf));
      }
    }
  };

  card.addEventListener('click', toggle);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
  });
});

/* ===== Cursor-tracking glow on cards ===== */
if (!REDUCED) {
  document.querySelectorAll('.riddle, .stat').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      el.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
  });
}

/* ===== Menu ===== */
const menuBtn = document.getElementById('menuBtn');
const menu = document.getElementById('menu');
menuBtn.addEventListener('click', e => {
  e.stopPropagation();
  const open = menu.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', String(open));
});
menu.addEventListener('click', e => {
  if (e.target.tagName === 'A') {
    menu.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
  }
});
document.addEventListener('click', () => {
  menu.classList.remove('open');
  menuBtn.setAttribute('aria-expanded', 'false');
});

/* ===== Scroll progress ===== */
const bar = document.querySelector('.progress');
addEventListener('scroll', () => {
  const max = document.documentElement.scrollHeight - innerHeight;
  bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}, { passive: true });

/* ===== Scroll reveal ===== */
document.querySelectorAll('.stat, .riddle, .section-title, .eyebrow, .thanks-lead, .thanks-names, .thanks-note')
  .forEach(el => el.classList.add('reveal'));

const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => io.observe(el));
document.querySelectorAll('.riddle-stack').forEach(stack => {
  stack.querySelectorAll('.reveal').forEach((el, i) => {
    el.style.transitionDelay = `${Math.min(i, 5) * 80}ms`;
  });
});
document.querySelectorAll('.stats .reveal').forEach((el, i) => {
  el.style.transitionDelay = `${i * 90 + 500}ms`;
});

/* ===== Drifting embers + hearts ===== */
const PARTICLE = { main: '255,92,149', warm: '255,179,123' };
function readPaletteColours() {
  const cs = getComputedStyle(document.documentElement);
  PARTICLE.main = cs.getPropertyValue('--c1').trim() || PARTICLE.main;
  PARTICLE.warm = cs.getPropertyValue('--c2').trim() || PARTICLE.warm;
  for (const b of bits) b.c = Math.random() > 0.7 ? PARTICLE.warm : PARTICLE.main;
}

const canvas = document.getElementById('stars');
const ctx = canvas.getContext('2d');
let bits = [];

function sizeCanvas() {
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const count = Math.min(Math.round((innerWidth * innerHeight) / 14000), 130);
  bits = Array.from({ length: count }, () => spawn(true));
}

function spawn(anywhere) {
  return {
    x: Math.random() * innerWidth,
    y: anywhere ? Math.random() * innerHeight : innerHeight + 12,
    r: Math.random() * 1.6 + 0.5,
    a: Math.random() * 0.55 + 0.18,
    vy: Math.random() * 0.22 + 0.06,      // slow rise
    drift: Math.random() * 0.3 - 0.15,
    s: Math.random() * 0.012 + 0.004,
    p: Math.random() * Math.PI * 2,
    c: Math.random() > 0.7 ? PARTICLE.warm : PARTICLE.main,
  };
}

function draw(t) {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (let i = 0; i < bits.length; i++) {
    const b = bits[i];
    b.y -= b.vy;
    b.x += Math.sin(t * 0.0004 + b.p) * 0.22 + b.drift * 0.1;
    if (b.y < -12) bits[i] = spawn(false);

    const tw = b.a * (0.5 + 0.5 * Math.sin(t * b.s + b.p));
    ctx.beginPath();
    ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${b.c},${tw})`;
    ctx.fill();
  }
  requestAnimationFrame(draw);
}

if (!REDUCED) {
  sizeCanvas();
  addEventListener('resize', sizeCanvas);
  requestAnimationFrame(draw);
} else {
  canvas.style.display = 'none';
}

/* ===== Page ready fade ===== */
addEventListener('DOMContentLoaded', () => document.body.classList.add('ready'));
if (document.readyState !== 'loading') document.body.classList.add('ready');

/* ===== Parallax: aurora + glow drift with pointer and scroll ===== */
const aurora = document.querySelector('.aurora');
const glow = document.querySelector('.bg-glow');

if (!REDUCED) {
  let px = 0, py = 0, sy = 0, raf = null;

  const apply = () => {
    aurora.style.translate = `${px * 22}px ${py * 18 - sy * 0.04}px`;
    glow.style.translate = `${px * -12}px ${py * -10 - sy * 0.02}px`;
    raf = null;
  };
  const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };

  addEventListener('pointermove', e => {
    px = (e.clientX / innerWidth) - 0.5;
    py = (e.clientY / innerHeight) - 0.5;
    queue();
  }, { passive: true });

  addEventListener('scroll', () => { sy = scrollY; queue(); }, { passive: true });
}

/* ===== Card tilt toward the cursor ===== */
if (!REDUCED && matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.riddle.puzzle, .stat').forEach(el => {
    el.addEventListener('pointermove', e => {
      if (!el.classList.contains('in')) return;   // let the reveal finish first
      const r = el.getBoundingClientRect();
      const cx = (e.clientX - r.left) / r.width - 0.5;
      const cy = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform =
        `translateY(-5px) rotateX(${-cy * 4}deg) rotateY(${cx * 5}deg)`;
    });
    el.addEventListener('pointerleave', () => { el.style.transform = ''; });
  });
}

/* ===== Nav hides going down, comes back going up ===== */
const nav = document.querySelector('.nav');
let lastY = 0;
addEventListener('scroll', () => {
  const y = scrollY;
  nav.classList.toggle('hidden', y > lastY && y > 260);
  lastY = y;
}, { passive: true });

/* ===== Shooting stars, now and then ===== */
function shootingStar() {
  if (REDUCED || document.hidden) return;
  const s = document.createElement('div');
  s.className = 'shooter';
  s.style.left = (Math.random() * innerWidth * 0.6) + 'px';
  s.style.top = (Math.random() * innerHeight * 0.4) + 'px';
  document.body.appendChild(s);
  setTimeout(() => s.remove(), 1700);
}
if (!REDUCED) {
  const loop = () => {
    shootingStar();
    setTimeout(loop, 9000 + Math.random() * 14000);
  };
  setTimeout(loop, 4000);
}

/* ===== Tab title when you wander off ===== */
const REAL_TITLE = document.title;
document.addEventListener('visibilitychange', () => {
  document.title = document.hidden ? '🎂 come back, Ziggy!' : REAL_TITLE;
});

/* ===== Easter egg: type "ziggy" anywhere ===== */
let typed = '';
addEventListener('keydown', e => {
  if (e.key.length !== 1) return;
  typed = (typed + e.key.toLowerCase()).slice(-5);
  if (typed === 'ziggy') {
    typed = '';
    for (let i = 0; i < 26; i++) {
      setTimeout(() => burstHearts(Math.random() * innerWidth, innerHeight - 60), i * 70);
    }
  }
});


/* single ZGK palette — read once so the particle canvas matches it */
readPaletteColours();
document.querySelector('meta[name="theme-color"]')
  ?.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg').trim());
