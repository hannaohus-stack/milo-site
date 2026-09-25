/* MILO kit landing — interactions (vanilla, no dependencies) */
(function () {
  const root = document.documentElement;
  root.classList.add('js');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Hero typing title */
  const typeEl = document.querySelector('.d-type');
  if (typeEl && !reduce) {
    const text = typeEl.dataset.type || '';
    const out = typeEl.querySelector('.d-type-text');
    out.textContent = '';
    let i = 0;
    const tick = () => {
      out.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, text[i - 1] === ' ' ? 180 : 95);
    };
    setTimeout(tick, 450);
  }

  /* 2. Scroll reveal + one-shot triggers */
  const once = (el, fn, threshold = 0.25) => {
    if (!el) return;
    if (!('IntersectionObserver' in window)) { fn(el); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { fn(e.target); io.unobserve(e.target); } });
    }, { threshold, rootMargin: '0px 0px -8% 0px' });
    io.observe(el);
  };
  document.querySelectorAll('.reveal').forEach((el) => once(el, (t) => t.classList.add('in'), 0.15));

  /* Orbit pop-in */
  once(document.querySelector('.d-orbit'), (t) => t.classList.add('in'), 0.3);

  /* Chat bubbles: one by one */
  once(document.querySelector('.d-chat'), (chat) => {
    chat.querySelectorAll('.d-say').forEach((b, i) => {
      setTimeout(() => b.classList.add('in'), reduce ? 0 : i * 380);
    });
  }, 0.2);

  /* Counters */
  document.querySelectorAll('.d-count').forEach((el) => {
    once(el, () => {
      const to = +el.dataset.to;
      if (reduce) { el.textContent = to; return; }
      const start = performance.now(), dur = 1100;
      const step = (now) => {
        const p = Math.min(1, (now - start) / dur);
        el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 0.6);
  });

  /* 3. Sliders (cases, reviews) */
  document.querySelectorAll('[data-slide]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const track = document.getElementById(btn.dataset.slide);
      if (!track) return;
      const card = track.firstElementChild;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      const stepX = card ? card.getBoundingClientRect().width + gap : track.clientWidth;
      track.scrollBy({ left: stepX * +btn.dataset.dir, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* 4. Price tabs */
  const tabs = [...document.querySelectorAll('.d-tab')];
  const selectTab = (tab) => {
    tabs.forEach((t) => {
      const on = t === tab;
      t.classList.toggle('is-on', on);
      t.setAttribute('aria-selected', on);
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
      const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });

  /* 5. Sticky header line + floating CTA */
  const header = document.querySelector('.d-header');
  const hero = document.querySelector('.d-hero');
  const floatCta = document.getElementById('float-cta');
  const price = document.getElementById('price');
  const footer = document.querySelector('.d-footer');
  const inView = (el) => { if (!el) return false; const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0; };
  const onScroll = () => {
    header.classList.toggle('is-stuck', scrollY > 40);
    const pastHero = hero.getBoundingClientRect().bottom < 0;
    const show = pastHero && !inView(price) && !inView(footer);
    floatCta.classList.toggle('show', show);
    floatCta.setAttribute('aria-hidden', !show);
    floatCta.querySelector('a').tabIndex = show ? 0 : -1;
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();
