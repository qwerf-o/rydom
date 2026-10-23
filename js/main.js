/* =========================================================
   рядом — общее поведение всех страниц
   - быстрый выход (кнопка и Esc дважды)
   - переходы по сайту не копятся в кнопке «назад»
   - экран «Срочная помощь», меню, поиск
   - росчерки и плавное появление блоков
   Ничего не сохраняется: ни localStorage, ни cookies.
   ========================================================= */

(function () {
  "use strict";

  var EXIT_URL = "https://yandex.ru/pogoda";
  var ESC_WINDOW = 900; // мс между двумя нажатиями Esc

  /* ---------- быстрый выход ---------- */

  function quickExit() {
    try { window.name = ""; } catch (e) {} // стираем путь по сайту (см. «Назад» ниже)
    try {
      document.title = "Погода";
      document.documentElement.style.background = "#fff";
      document.body.style.visibility = "hidden";
    } catch (e) {}
    // replace: текущая страница заменяется, кнопка «назад» на сайт не вернёт
    location.replace(EXIT_URL);
  }
  window.ryadomExit = quickExit;

  var lastEsc = 0;
  document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape" && e.key !== "Esc") return;
    var now = Date.now();
    if (now - lastEsc < ESC_WINDOW) {
      quickExit();
      return;
    }
    lastEsc = now;
  });

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".js-exit");
    if (btn) {
      e.preventDefault();
      quickExit();
    }
  });

  /* ---------- переходы без следа в истории «назад» ----------
     Все внутренние ссылки открываются через location.replace.
     Так сайт занимает одну запись в истории вкладки,
     и после быстрого выхода «назад» ведёт туда, откуда она пришла. */

  function samePage(url) {
    return url.pathname === location.pathname && url.search === location.search;
  }

  function isInternal(url) {
    return url.protocol === location.protocol && url.host === location.host;
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest("a[href]");
    if (!a || a.target === "_blank" || a.hasAttribute("download")) return;
    var raw = a.getAttribute("href");
    if (!raw || /^(tel|mailto|sms):/i.test(raw)) return;
    if (raw === "#") { e.preventDefault(); return; } // ссылки-заглушки

    var url = new URL(a.href, location.href);
    if (!isInternal(url)) return;

    e.preventDefault();

    if (url.hash === "#urgent") {
      openUrgent();
      return;
    }

    if (samePage(url)) {
      var target = url.hash && document.getElementById(decodeURIComponent(url.hash.slice(1)));
      history.replaceState(null, "", url.hash || location.pathname);
      if (target) {
        target.scrollIntoView({ behavior: prefersReduced() ? "auto" : "smooth", block: "start" });
        if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
        target.focus({ preventScroll: true });
      }
      window.dispatchEvent(new Event("ryadom:hash"));
      closeMenu();
      return;
    }

    location.replace(url.href);
  });

  // внешние ссылки — в новой вкладке и без передачи адреса нашего сайта
  function markExternal(root) {
    (root || document).querySelectorAll('a[href^="http"]').forEach(function (a) {
      var url = new URL(a.href);
      if (isInternal(url)) return;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
    });
  }
  window.ryadomMarkExternal = markExternal;

  function prefersReduced() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- «Срочная помощь» ---------- */

  function openUrgent() {
    var d = document.getElementById("urgent");
    if (!d) return;
    closeMenu();
    if (typeof d.showModal === "function") {
      if (!d.open) d.showModal();
    } else {
      d.setAttribute("open", "");
    }
    fitText();
  }
  window.ryadomUrgent = openUrgent;

  function closeDialog(d) {
    if (!d) return;
    if (typeof d.close === "function") d.close();
    else d.removeAttribute("open");
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest(".js-urgent")) {
      e.preventDefault();
      openUrgent();
      return;
    }
    var closer = e.target.closest("dialog [data-close]");
    if (closer) {
      closeDialog(closer.closest("dialog"));
      return;
    }
    // клик по затемнению вокруг окна
    if (e.target.tagName === "DIALOG") closeDialog(e.target);
  });

  /* ---------- мобильное меню ---------- */

  function closeMenu() {
    var t = document.querySelector(".menu-toggle");
    var p = document.getElementById("mobile-panel");
    if (!t || !p) return;
    t.setAttribute("aria-expanded", "false");
    p.hidden = true;
  }

  document.addEventListener("click", function (e) {
    var t = e.target.closest(".menu-toggle");
    if (!t) return;
    var p = document.getElementById("mobile-panel");
    var open = t.getAttribute("aria-expanded") === "true";
    t.setAttribute("aria-expanded", String(!open));
    p.hidden = open;
  });

  /* ---------- поиск ---------- */

  function norm(s) {
    return String(s || "")
      .toLowerCase()
      .replace(/ё/g, "е")
      .replace(/[«»"'().,:;!?#№—–-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  var centersLoading = false;
  function ensureCenters(cb) {
    if (window.CENTERS) { cb && cb(); return; }
    if (centersLoading) return;
    centersLoading = true;
    var s = document.createElement("script");
    s.src = "data/centers.js";
    s.onload = function () { cb && cb(); };
    document.body.appendChild(s);
  }

  function escapeHTML(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  window.ryadomEscape = escapeHTML;

  function search(q) {
    var words = norm(q).split(" ").filter(Boolean);
    if (!words.length) return [];
    function hit(text) {
      var t = norm(text);
      return words.every(function (w) { return t.indexOf(w) !== -1; });
    }
    var res = [];
    (window.RYADOM_PAGES || []).forEach(function (p) {
      if (hit(p.t + " " + p.k)) res.push({ t: p.t, sub: "Раздел", u: p.u });
    });
    (window.CENTERS || []).forEach(function (c) {
      var extra = (c.kids === "yes" ? " дети с детьми" : "") + (c.noreg === "yes" ? " без прописки" : "") + (c.h24 === "yes" ? " круглосуточно" : "");
      if (hit(c.name + " " + c.city + " " + c.region + " " + c.services.join(" ") + extra)) {
        res.push({ t: c.name, sub: (c.national ? "Вся Россия" : c.city) + ", центр помощи", u: "map.html#c-" + c.id });
      }
    });
    return res.slice(0, 8);
  }

  function initSearch(form) {
    var input = form.querySelector("input");
    var box = form.querySelector(".search-results");
    var active = -1;

    function render() {
      var q = input.value;
      if (!q.trim()) { box.hidden = true; box.innerHTML = ""; return; }
      var res = search(q);
      active = -1;
      if (!res.length) {
        box.innerHTML = '<div class="empty">Ничего не нашлось. Попробуйте другое слово, например «дети» или название города.</div>';
      } else {
        box.innerHTML = res.map(function (r) {
          return '<a role="option" href="' + escapeHTML(r.u) + '"><small>' + escapeHTML(r.sub) + "</small>" + escapeHTML(r.t) + "</a>";
        }).join("");
      }
      box.hidden = false;
    }

    input.addEventListener("focus", function () { ensureCenters(render); });
    input.addEventListener("input", render);
    input.addEventListener("keydown", function (e) {
      var items = box.querySelectorAll("a");
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!items.length) return;
        e.preventDefault();
        active = (active + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
        items.forEach(function (a, i) { a.classList.toggle("is-active", i === active); });
      }
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var items = box.querySelectorAll("a");
      var pick = items[active] || items[0];
      if (pick) pick.click();
    });
    document.addEventListener("click", function (e) {
      if (!form.contains(e.target)) box.hidden = true;
    });
  }

  /* ---------- росчерки ---------- */
  // Чтобы добавить росчерк: <svg class="squiggle" data-sq="loop" data-draw aria-hidden="true"></svg>

  var SQUIGGLES = {
    // петля между абзацами, как в макете
    loop: { vb: "0 0 300 90", d: "M4 70 C 50 74, 92 66, 118 46 C 140 29, 150 8, 131 7 C 110 6, 110 44, 142 56 C 186 72, 236 36, 296 22", dots: [[4, 70], [296, 22]] },
    // росчерк в углу карточки теста
    corner: { vb: "0 0 120 120", d: "M6 118 C 32 112, 52 100, 62 84 C 72 68, 60 55, 51 65 C 42 76, 58 93, 79 75 C 99 57, 105 31, 117 4", dots: [] },
    // короткая дуга с точкой, как в первом экране макета
    hook: { vb: "0 0 120 46", d: "M4 4 C 6 20, 30 27, 62 31 C 86 34, 102 37, 113 42", dots: [[4, 4], [113, 42]] },
    // длинная мягкая волна-разделитель
    wave: { vb: "0 0 600 60", d: "M2 40 C 80 8, 140 10, 200 34 S 330 62, 400 30 S 520 4, 598 26", dots: [] }
  };

  function drawSquiggles() {
    document.querySelectorAll("svg[data-sq]").forEach(function (svg) {
      var s = SQUIGGLES[svg.getAttribute("data-sq")];
      if (!s || svg.childElementCount) return;
      svg.setAttribute("viewBox", s.vb);
      svg.setAttribute("preserveAspectRatio", svg.getAttribute("data-stretch") ? "none" : "xMidYMid meet");
      var html = '<path pathLength="1" d="' + s.d + '"/>';
      s.dots.forEach(function (p) { html += '<circle class="dot" cx="' + p[0] + '" cy="' + p[1] + '" r="2.6"/>'; });
      svg.innerHTML = html;
    });
  }

  /* ---------- появление при прокрутке ---------- */

  function initReveal() {
    var els = document.querySelectorAll("[data-reveal], [data-draw]");
    if (!("IntersectionObserver" in window) || prefersReduced()) {
      els.forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("is-in");
          io.unobserve(en.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  }
  window.ryadomReveal = initReveal;
  window.ryadomManager = function () { initManager(); };

  /* ---------- шапка при прокрутке ---------- */

  function initHeader() {
    var h = document.querySelector(".site-header");
    if (!h) return;
    var on = false;
    function check() {
      var s = window.scrollY > 8;
      if (s !== on) { on = s; h.classList.toggle("is-scrolled", s); }
    }
    window.addEventListener("scroll", check, { passive: true });
    check();
  }

  /* ---------- «Назад» по сайту ----------
     Кнопка «назад» браузера на сайт не возвращает — это специально (быстрый выход).
     Поэтому у сайта своя кнопка «Назад». Путь по страницам хранится в window.name:
     это память открытой вкладки, на диск она не пишется и стирается при быстром выходе. */

  var TRAIL = "ryadom:";

  function readTrail() {
    try {
      if (window.name.indexOf(TRAIL) === 0) return JSON.parse(window.name.slice(TRAIL.length));
    } catch (e) {}
    return [];
  }

  function initBack() {
    var here = (window.RYADOM && window.RYADOM.page) || "index.html";
    var meta = (window.RYADOM && window.RYADOM.pages[here]) || {};
    var trail = readTrail();
    if (trail[trail.length - 1] === here) {
      // обновили страницу — путь не меняется
    } else if (trail[trail.length - 2] === here) {
      trail.pop(); // вернулись назад
    } else {
      trail.push(here);
    }
    trail = trail.slice(-15);
    try { window.name = TRAIL + JSON.stringify(trail); } catch (e) {}

    var target = trail.length > 1 ? trail[trail.length - 2] : (meta.parent || "index.html");
    var pages = (window.RYADOM && window.RYADOM.pages) || {};
    var title = pages[target] ? pages[target].title : "";
    document.querySelectorAll("[data-back]").forEach(function (a) {
      a.setAttribute("href", target);
      if (title) a.setAttribute("title", "Назад: " + title);
    });
  }

  /* ---------- «Наверх» ---------- */

  function initTop() {
    document.addEventListener("click", function (e) {
      if (!e.target.closest("[data-top]")) return;
      window.scrollTo({ top: 0, behavior: prefersReduced() ? "auto" : "smooth" });
      var logo = document.querySelector(".site-header .logo");
      if (logo) logo.focus({ preventScroll: true });
    });
    var btn = document.querySelector(".to-top");
    if (!btn) return;
    var on = false;
    function check() {
      var s = window.scrollY > window.innerHeight * 1.5;
      if (s !== on) { on = s; btn.classList.toggle("is-on", s); }
    }
    window.addEventListener("scroll", check, { passive: true });
    check();
  }

  /* ---------- «Написать менеджеру» ---------- */

  // Сайт t.me в России заблокирован, поэтому ссылку вида https://t.me/nick
  // превращаем в tg://resolve?domain=nick — она открывает само приложение Telegram.
  function managerNick() {
    var url = (window.RYADOM && window.RYADOM.managerUrl) || "";
    var m = url.match(/t\.me\/([A-Za-z0-9_]+)/);
    return m ? m[1] : "";
  }

  function initManager() {
    var url = window.RYADOM && window.RYADOM.managerUrl;
    if (!url) return; // пока ника нет — ссылки ведут на contact.html
    var nick = managerNick();
    var href = nick ? "tg://resolve?domain=" + nick : url;
    document.querySelectorAll("[data-manager]").forEach(function (a) {
      a.setAttribute("href", href);
      if (!nick) { a.target = "_blank"; a.rel = "noopener noreferrer"; }
    });
    document.querySelectorAll("[data-manager-nick]").forEach(function (el) {
      el.textContent = nick ? "@" + nick : "";
    });
  }

  /* ---------- «Поддержать проект» ----------
     Прототип: сумма никуда не отправляется. */

  function initDonate() {
    var d = document.getElementById("donate");
    if (!d) return;
    var state = { amount: 500, freq: "once" };
    var go = d.querySelector("[data-donate-go]");
    var other = d.querySelector("[data-amount-other]");

    function fmt(n) { return Number(n).toLocaleString("ru-RU") + " ₽"; }
    function render() {
      d.querySelectorAll("[data-amount]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(Number(b.getAttribute("data-amount")) === state.amount && !other.value));
      });
      d.querySelectorAll("[data-freq]").forEach(function (b) {
        b.setAttribute("aria-pressed", String(b.getAttribute("data-freq") === state.freq));
      });
      var ok = state.amount >= 50;
      go.disabled = !ok;
      go.innerHTML = ok
        ? "Поддержать на " + fmt(state.amount) + (state.freq === "month" ? " в месяц" : "") + ' <span class="arr" aria-hidden="true">→</span>'
        : "Укажите сумму от 50 ₽";
    }
    function reset() {
      state = { amount: 500, freq: "once" };
      other.value = "";
      d.querySelector('[data-step="1"]').hidden = false;
      d.querySelector('[data-step="2"]').hidden = true;
      render();
    }

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".js-donate")) return;
      e.preventDefault();
      closeMenu();
      reset();
      if (typeof d.showModal === "function") d.showModal(); else d.setAttribute("open", "");
      fitText();
    });
    d.addEventListener("click", function (e) {
      var a = e.target.closest("[data-amount]");
      if (a) { other.value = ""; state.amount = Number(a.getAttribute("data-amount")); render(); return; }
      var f = e.target.closest("[data-freq]");
      if (f) { state.freq = f.getAttribute("data-freq"); render(); return; }
      if (e.target.closest("[data-donate-go]") && !go.disabled) {
        d.querySelector("[data-summary]").textContent =
          "Вы выбрали " + fmt(state.amount) + (state.freq === "month" ? " каждый месяц" : " разово") +
          ". Деньги пойдут на обзвон центров, работу психолога, сайт и наклейки с QR-кодом.";
        d.querySelector('[data-step="1"]').hidden = true;
        d.querySelector('[data-step="2"]').hidden = false;
      }
    });
    other.addEventListener("input", function () {
      state.amount = Math.round(Number(other.value) || 0);
      render();
    });
    if (location.hash === "#support") {
      reset();
      if (typeof d.showModal === "function") d.showModal();
    }
  }

  /* ---------- линия шагов (инструкция) ---------- */

  function initTimeline() {
    var lines = document.querySelectorAll(".timeline");
    if (!lines.length) return;
    function update() {
      var mid = window.innerHeight * 0.55;
      lines.forEach(function (tl) {
        var r = tl.getBoundingClientRect();
        var p = Math.min(1, Math.max(0, (mid - r.top) / r.height));
        tl.style.setProperty("--p", p.toFixed(3));
        tl.querySelectorAll(".tl-step").forEach(function (st) {
          st.classList.toggle("is-passed", st.getBoundingClientRect().top < mid);
        });
      });
    }
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  /* ---------- типограф: без висячих предлогов ----------
     Короткие слова (в, с, и, что, на, не…) склеиваются со следующим словом
     неразрывным пробелом, тире — с предыдущим, частицы «ли», «же», «бы» — с предыдущим.
     Так в конце строки не остаётся одинокое «с» или «и». Работает и для текста,
     который появляется на странице позже (карточки центров, тесты, «23:40»). */

  var NBSP = "\u00A0";
  // слова из 1–2 букв (кроме частиц), короткие предлоги и союзы, числа
  var RE_SHORT = /(^|[\s«„"(\/])((?!(?:же|ли|бы|ль)[ \t\n\r])[А-Яа-яЁёA-Za-z]{1,2}|что|Что|как|Как|для|Для|без|Без|при|При|про|Про|над|Над|под|Под|или|Или|\d+)[ \t\n\r]+(?=\S)/g;
  var RE_DASH = /[ \t\n\r]+([—–])/g;
  var RE_PART = /[ \t\n\r]+(ли|же|бы|ль)(?=[\s.,!?:;»)]|$)/g;
  // «2–4 месяца», «8-800»: после тире между цифрами строку не рвём
  var RE_RANGE = /(\d[–—-])(?=\d)/g;
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, INPUT: 1, CODE: 1, PRE: 1, svg: 1, SVG: 1 };

  function typoText(t) {
    var prev;
    do {
      prev = t;
      t = t.replace(RE_SHORT, "$1$2" + NBSP);
    } while (t !== prev);
    return t.replace(RE_DASH, NBSP + "$1").replace(RE_PART, NBSP + "$1")
      .replace(RE_RANGE, "$1\u2060");
  }

  function typo(root) {
    if (!root) return;
    if (root.nodeType === 3) {
      var p = root.parentNode;
      if (p && !SKIP[p.nodeName] && !p.closest("svg")) {
        var v = typoText(root.nodeValue);
        if (v !== root.nodeValue) root.nodeValue = v;
      }
      return;
    }
    if (root.nodeType !== 1 || SKIP[root.nodeName] || root.closest && root.closest("svg")) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    var n;
    var list = [];
    while ((n = walker.nextNode())) list.push(n);
    list.forEach(typo);
  }

  function initTypo() {
    typo(document.body);
    if (!("MutationObserver" in window)) return;
    new MutationObserver(function (records) {
      records.forEach(function (r) { r.addedNodes.forEach(typo); });
    }).observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- заголовки под ширину экрана ----------
     IF Kica широкий: на телефоне длинное слово может не влезть в строку.
     Вместо переноса «ПРЯ-МО» чуть уменьшаем шрифт, пока слово не поместится. */

  var FIT = "h1, h2, h3, .h-display, .entry-title, .exit-banner-title, .story-quote, .card-title, .big-number .num, .phone-card .num, .stat .caps";

  function fitText() {
    document.querySelectorAll(FIT).forEach(function (el) {
      el.style.fontSize = "";
      if (!el.clientWidth) return;
      el.style.overflowWrap = "normal";
      var size = parseFloat(getComputedStyle(el).fontSize);
      var min = size * 0.7;
      while (el.scrollWidth > el.clientWidth + 1 && size > min) {
        size -= 1;
        el.style.fontSize = size + "px";
      }
      el.style.overflowWrap = "";
    });
  }

  function initFit() {
    var timer;
    function later() { clearTimeout(timer); timer = setTimeout(fitText, 120); }
    fitText();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitText);
    window.addEventListener("resize", later);
    // карточки центров, результаты тестов и окна появляются позже
    if ("MutationObserver" in window) {
      new MutationObserver(later).observe(document.body, { childList: true, subtree: true });
    }
    document.addEventListener("toggle", later, true);
  }

  /* ---------- старт ---------- */

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-search]").forEach(initSearch);
    drawSquiggles();
    initReveal();
    initHeader();
    initBack();
    initTop();
    initManager();
    initDonate();
    initTimeline();
    initTypo();
    initFit();
    markExternal();
    if (location.hash === "#urgent") openUrgent();
  });
})();
