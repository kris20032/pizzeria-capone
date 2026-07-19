// STOLBASZ — drobna interaktywność (nav mobile + reveal)
(function () {
  // mobilne menu
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('open');
    });
    links.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); });
    });
  }

  // reveal przy scrollu
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    els.forEach(function (el) { el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  els.forEach(function (el) { io.observe(el); });
  // od razu pokaż to, co jest w pierwszym ekranie (hero/intro) — nie czekaj na próg observera.
  // (hero bywa WYŻSZE niż viewport i nigdy nie osiąga 12% swojej powierzchni → zostawało puste do scrolla)
  requestAnimationFrame(function () {
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9 && r.bottom > 0) { el.classList.add('in'); io.unobserve(el); }
    });
  });
})();

// nav kondensuje się po przewinięciu (cienka linia + niższy pasek) — addytywne, lekkie
(function () {
  var nav = document.querySelector('.nav') || document.querySelector('header');
  if (!nav) return;
  var ticking = false;
  function upd() { nav.classList.toggle('is-stuck', window.scrollY > 24); ticking = false; }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(upd); }
  }, { passive: true });
  upd();
})();

/* === rodzina: gastro === */
/* === rodzina GASTRO: nav jak Nobu - JEDEN kontroler stanu (koniec wyścigu z base.js is-stuck).
   - sama GÓRA (y<=TOP): przezroczysty overlay nad hero (bez nav-solid, bez nav-hidden)
   - scroll w DÓŁ: chowa OD RAZU (.nav-hidden)
   - scroll w GÓRĘ: pokazuje lity krem (.nav-solid)
   Histereza (TH) = brak migania. is-stuck z base.js jest wizualnie zneutralizowane w gastro.css. === */
(function () {
  var nav = document.querySelector('.nav');
  if (!nav) return;
  var last = window.scrollY || 0;
  var TOP = 8;   // "sama góra" -> przezroczysty overlay nad hero
  var TH = 6;    // martwa strefa na mikro-ruch (anty-miganie)
  var ticking = false;
  function upd() {
    var y = window.scrollY || 0;
    if (y <= TOP) {
      nav.classList.remove('nav-hidden', 'nav-solid');   // góra: przezroczysty, widoczny
      last = y; ticking = false; return;
    }
    var d = y - last;
    if (Math.abs(d) <= TH) { ticking = false; return; }  // ignoruj mikro-ruch (stabilność)
    if (d > 0) {
      nav.classList.add('nav-hidden');                   // w DÓŁ -> chowaj
    } else {
      nav.classList.remove('nav-hidden');
      nav.classList.add('nav-solid');                    // w GÓRĘ -> pokaż lity
    }
    last = y; ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(upd); }
  }, { passive: true });
  upd();
})();

// podświetlenie dzisiejszego dnia w godzinach otwarcia
(function () {
  var today = new Date().getDay();
  var row = document.querySelector('.godz-row[data-day="' + today + '"]');
  if (row) row.classList.add('is-today');
})();

// lightbox galerii v2 (strzałki + klawiatura + licznik)
(function () {
  var tiles = Array.prototype.slice.call(document.querySelectorAll('.gallery .tile img'));
  if (!tiles.length || !window.HTMLDialogElement) return;
  var dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.innerHTML = '<button class="lb-x" aria-label="Zamknij">&times;</button>' +
    '<button class="lb-nav lb-prev" aria-label="Poprzednie">&#8592;</button><img alt="">' +
    '<button class="lb-nav lb-next" aria-label="Nast\u0119pne">&#8594;</button><span class="lb-count"></span>';
  document.body.appendChild(dlg);
  var big = dlg.querySelector('img'), count = dlg.querySelector('.lb-count'), cur = 0;
  function show(n) {
    cur = (n + tiles.length) % tiles.length;
    big.src = tiles[cur].src; big.alt = tiles[cur].alt || '';
    count.textContent = (cur + 1) + ' / ' + tiles.length;
  }
  tiles.forEach(function (im, n) {
    im.parentElement.addEventListener('click', function () { show(n); dlg.showModal(); });
  });
  dlg.querySelector('.lb-prev').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
  dlg.querySelector('.lb-next').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
  dlg.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowLeft') show(cur - 1);
    if (e.key === 'ArrowRight') show(cur + 1);
  });
  dlg.addEventListener('click', function (e) {
    if (e.target === dlg || e.target === big || e.target.classList.contains('lb-x')) dlg.close();
  });
})();

// status "Otwarte teraz" (12:00-22:00 codziennie)
(function () {
  var chips = document.querySelectorAll('.open-chip');
  if (!chips.length) return;
  function upd() {
    var now = new Date(), h = now.getHours() + now.getMinutes() / 60;
    var open = h >= 12 && h < 22;
    chips.forEach(function (c) {
      c.hidden = false;
      c.classList.toggle('closed', !open);
      c.querySelector('.oc-txt').textContent = open ? 'Otwarte do 22:00' : 'Otwieramy o 12:00';
    });
  }
  upd(); setInterval(upd, 60000);
})();

// scrollspy paska kategorii menu
(function () {
  var nav = document.querySelector('.mnav');
  if (!nav) return;
  var links = nav.querySelectorAll('a');
  var map = {};
  links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
  var blocks = document.querySelectorAll('.menu2-block[id]');
  if (!('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        links.forEach(function (a) { a.classList.remove('active'); });
        var a = map[e.target.id];
        if (a) { a.classList.add('active'); a.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' }); }
      }
    });
  }, { rootMargin: '-140px 0px -60% 0px', threshold: 0 });
  blocks.forEach(function (b) { io.observe(b); });
})();

// przycisk "do góry"
(function () {
  var b = document.createElement('button');
  b.className = 'to-top'; b.setAttribute('aria-label', 'Wr\u00f3\u0107 na g\u00f3r\u0119');
  b.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
  document.body.appendChild(b);
  b.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  var t;
  window.addEventListener('scroll', function () {
    if (t) return;
    t = setTimeout(function () { b.classList.toggle('show', window.scrollY > 700); t = null; }, 120);
  }, { passive: true });
})();
