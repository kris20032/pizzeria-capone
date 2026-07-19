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

// lightbox galerii (klik = powiększenie)
(function () {
  var tiles = document.querySelectorAll('.gallery .tile img');
  if (!tiles.length || !window.HTMLDialogElement) return;
  var dlg = document.createElement('dialog');
  dlg.className = 'lb';
  dlg.innerHTML = '<button class="lb-x" aria-label="Zamknij">&times;</button><img alt="">';
  document.body.appendChild(dlg);
  var big = dlg.querySelector('img');
  tiles.forEach(function (im) {
    im.parentElement.addEventListener('click', function () {
      big.src = im.src; big.alt = im.alt || '';
      dlg.showModal();
    });
  });
  dlg.addEventListener('click', function (e) {
    if (e.target !== big) dlg.close();
  });
})();
