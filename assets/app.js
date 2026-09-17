/* =========================================================
   Raj Patel — Portfolio IV
   Vanilla JS. No dependencies, no network requests.
   ========================================================= */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer:fine)').matches;

  /* ---------- Preloader ---------- */
  var pre = document.getElementById('preloader');
  var count = document.getElementById('pre-count');
  var fill = document.getElementById('pre-fill');
  var finished = false;

  function finish() {
    if (finished) return;
    finished = true;
    if (count) count.textContent = '100';
    if (fill) fill.style.width = '100%';
    document.body.classList.remove('locked');
    document.body.classList.add('ready');
    if (pre) pre.classList.add('done');
    setTimeout(function () { if (pre && pre.parentNode) pre.parentNode.removeChild(pre); }, 700);
  }

  if (pre && !reduced) {
    document.body.classList.add('locked');
    var value = 0;
    var timer = setInterval(function () {
      value += Math.max(1, Math.round((100 - value) * 0.12));
      if (value >= 100) { value = 100; clearInterval(timer); setTimeout(finish, 260); }
      if (count) count.textContent = value < 10 ? '0' + value : String(value);
      if (fill) fill.style.width = value + '%';
    }, 55);
    setTimeout(finish, 3200); // failsafe
  } else {
    finish();
  }

  /* ---------- Local clock ---------- */
  var clock = document.getElementById('clock');
  function tick() {
    if (!clock) return;
    try {
      clock.textContent = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit', hour12: false
      }).format(new Date()) + ' ET';
    } catch (e) {
      var d = new Date();
      clock.textContent = ('0' + d.getHours()).slice(-2) + ':' + ('0' + d.getMinutes()).slice(-2);
    }
  }
  tick();
  setInterval(tick, 20000);

  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Mobile navigation ---------- */
  var burger = document.querySelector('.burger');
  var mobileNav = document.querySelector('.nav-mobile');
  if (burger && mobileNav) {
    burger.addEventListener('click', function () {
      var open = mobileNav.classList.toggle('open');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      document.body.classList.toggle('locked', open);
    });
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
        burger.setAttribute('aria-label', 'Open navigation');
        document.body.classList.remove('locked');
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach(function (el) { el.classList.add('in'); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Number counters ---------- */
  var counters = document.querySelectorAll('[data-count]');
  function runCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced) { el.textContent = target + suffix; return; }
    var start = null;
    function step(time) {
      if (!start) start = time;
      var progress = Math.min((time - start) / 1400, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCount(entry.target); countObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { countObserver.observe(el); });
  } else {
    counters.forEach(runCount);
  }

  /* ---------- Text scramble / decode ---------- */
  var glyphs = '#%&$@01ABCDEFGHIJKLMNOPQRSTUVWXYZ/\\<>*';
  function scramble(el, finalText, duration) {
    if (reduced) { el.textContent = finalText; return; }
    var frame = 0;
    var total = Math.round(duration / 16);
    var queue = finalText.split('');
    function render() {
      var output = '';
      for (var i = 0; i < queue.length; i++) {
        var char = queue[i];
        var revealAt = Math.floor((i / queue.length) * total * 0.7);
        if (char === ' ') { output += ' '; continue; }
        if (frame >= revealAt + 14) output += char;
        else if (frame >= revealAt) output += glyphs[Math.floor(Math.random() * glyphs.length)];
        else output += glyphs[Math.floor(Math.random() * glyphs.length)];
      }
      el.textContent = output;
      frame++;
      if (frame <= total) requestAnimationFrame(render);
      else el.textContent = finalText;
    }
    render();
  }

  function initScramble(el, text) {
    if (!('IntersectionObserver' in window) || reduced) { el.textContent = text; return; }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { scramble(el, text, 1500); observer.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    observer.observe(el);
  }

  document.querySelectorAll('[data-scramble]').forEach(function (el) {
    initScramble(el, el.textContent.trim());
  });
  document.querySelectorAll('[data-decode]').forEach(function (el) {
    initScramble(el, el.getAttribute('data-decode'));
  });

  /* ---------- Header behaviour ---------- */
  var head = document.querySelector('.head');
  var lightSections = document.querySelectorAll('.about, .faq');
  var lastY = window.pageYOffset;

  function onScroll() {
    var y = window.pageYOffset;
    if (head) {
      var navOpen = mobileNav && mobileNav.classList.contains('open');
      if (!navOpen && y > 160 && y > lastY) head.classList.add('hidden');
      else head.classList.remove('hidden');

      var light = false;
      lightSections.forEach(function (section) {
        var rect = section.getBoundingClientRect();
        if (rect.top <= 84 && rect.bottom >= 84) light = true;
      });
      head.classList.toggle('light', light);
    }
    lastY = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Active navigation state ---------- */
  var navLinks = document.querySelectorAll('.nav-desktop a');
  if ('IntersectionObserver' in window && navLinks.length) {
    var sectionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        navLinks.forEach(function (link) {
          link.classList.toggle('on', link.getAttribute('href') === '#' + entry.target.id);
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    document.querySelectorAll('main section[id]').forEach(function (section) {
      sectionObserver.observe(section);
    });
  }

  /* ---------- Custom cursor ---------- */
  var cursor = document.querySelector('.cursor');
  if (cursor && fine && !reduced) {
    cursor.style.display = 'block';
    var label = cursor.querySelector('em');
    var targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
    var currentX = targetX, currentY = targetY;

    window.addEventListener('mousemove', function (event) {
      targetX = event.clientX;
      targetY = event.clientY;
    }, { passive: true });

    (function loop() {
      currentX += (targetX - currentX) * 0.18;
      currentY += (targetY - currentY) * 0.18;
      cursor.style.transform = 'translate3d(' + currentX + 'px,' + currentY + 'px,0)';
      requestAnimationFrame(loop);
    })();

    document.querySelectorAll('a,button,summary').forEach(function (el) {
      el.addEventListener('mouseenter', function () {
        cursor.classList.add('hot');
        var mode = el.getAttribute('data-cursor');
        if (label) label.textContent = mode === 'scroll' ? 'SCROLL' : (mode === 'view' ? 'VIEW' : 'OPEN');
      });
      el.addEventListener('mouseleave', function () { cursor.classList.remove('hot'); });
    });
  }

  /* ---------- Accordion: one open at a time ---------- */
  ['.stack-list', '.faq-list'].forEach(function (selector) {
    var group = document.querySelector(selector);
    if (!group) return;
    var items = group.querySelectorAll('details');
    items.forEach(function (item) {
      item.addEventListener('toggle', function () {
        if (!item.open) return;
        items.forEach(function (other) { if (other !== item) other.open = false; });
      });
    });
  });
})();
