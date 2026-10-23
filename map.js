/* =========================================================
   рядом — карта помощи и фильтры центров
   Данные: data/centers.js (window.CENTERS).
   Фильтры живут только в памяти вкладки, ничего не сохраняется.

   Контур России здесь примерный и упрощённый (без мелких островов):
   это стилизованная точечная карта, а не географическая.
   ========================================================= */

(function () {
  "use strict";

  var CENTERS = window.CENTERS || [];
  var esc = window.ryadomEscape || function (s) { return String(s); };

  // Регионы MVP — показываем первыми и подписываем на карте
  var MVP = [
    { region: "Москва", label: "Москва", anchor: "end", dx: -1.3, dy: 1.1 },
    { region: "Санкт-Петербург", label: "Санкт-Петербург", anchor: "end", dx: -1.3, dy: 0.1 },
    { region: "Республика Татарстан", label: "Казань", anchor: "middle", dx: 0, dy: -1.5 },
    { region: "Свердловская обл.", label: "Екатеринбург", anchor: "start", dx: 1.3, dy: -0.9 }
  ];
  var MVP_REGIONS = MVP.map(function (m) { return m.region; });

  var SERVICE = {
    "убежище": "Проживание",
    "психолог": "Психолог",
    "юрист": "Юрист",
    "детский психолог": "Детский психолог",
    "телефон доверия": "Телефон доверия",
    "соцпомощь": "Соцпомощь"
  };
  var TYPE = {
    "НКО": "НКО",
    "гос": "Государственный",
    "фонд": "Фонд",
    "религиозная": "Религиозная организация",
    "линия": "Линия помощи"
  };

  /* ---------- контур (долгота, широта) ---------- */

  var LAND = [
    [[30.8,69.8],[33,69.4],[36.5,69.1],[40,68],[41.2,67],[40,66.3],[37,66.2],[35,66.4],[34.6,65],[35.6,64.2],[37.4,63.9],[39.5,64.6],[40.5,64.5],[43,66],[44.2,66.2],[43.4,68.5],[47,67.6],[53,68.3],[55,68.6],[58,68.9],[60.5,69.8],[64.5,69.4],[66.6,69.4],[67,70.5],[68.6,72.8],[69.5,73.4],[72.6,72.6],[72.6,71],[73,69],[74.5,68.5],[74.6,70.5],[75.8,72.3],[78,72.5],[81,73.6],[86,74],[87,75],[95,76],[100,77],[104.3,77.7],[108,76.5],[112,75.5],[113.5,73.7],[118,73.5],[124,73.6],[127,73.5],[129.5,72],[132,71.5],[136,71.6],[140,72.5],[146,72.3],[150,71.4],[152,70.9],[157,71],[160,70],[162,69.6],[167,69.8],[170.5,70.1],[176,69.8],[180,68.9],[184,67.6],[187,66.4],[190.3,66.1],[188.5,65.3],[187.5,64.4],[184,64.6],[181.5,65.5],[178,64.5],[179.3,62.8],[176,62.2],[174,61.8],[172,61],[170,60],[166,59.9],[164,59.8],[163.3,58],[162,57],[162.5,56.2],[160.2,54.5],[158.6,52.8],[156.7,51],[156,52.8],[155.6,55.5],[156.8,57.7],[160,59.5],[162.5,61.6],[160,61.8],[156,61.5],[154,59.3],[150,59.5],[147,59.3],[143,59.3],[140,57.8],[138.2,56.4],[137.6,55],[137.5,54],[139.5,54.1],[141.2,53.2],[141.4,52.2],[140.5,50.5],[140.4,48.5],[138.5,46.5],[136,44.5],[133.5,42.8],[131.3,42.6],[130.6,42.3],[131,43],[131.3,44.9],[133,45.1],[134.8,47.8],[134.7,48.3],[131,47.7],[130.5,48.8],[127.7,49.7],[126,52.8],[123.4,53.5],[120.8,53.3],[120.2,51.6],[117.8,49.5],[116.2,50],[114.3,50.3],[111,49.4],[108.2,49.3],[106,50.3],[103,50.2],[102,51.4],[98.6,50],[97,49.8],[94.8,50],[92,50.6],[89.6,49.6],[87.8,49.2],[86.6,49.8],[83,51],[80,50.9],[77.8,53.3],[76.4,54.2],[74,53.6],[71,54.2],[70.5,55.3],[68.2,55.4],[65.6,54.6],[63,54.5],[61.2,54],[61,53],[61.6,52.4],[60,51.9],[59.6,50.6],[57.5,51],[55.7,50.5],[54.5,51],[53.3,51.5],[51,51.7],[49.5,51.1],[48.7,50.6],[48.8,49.9],[47.4,50.4],[46.6,49.4],[47,48.9],[47.2,47.9],[48.3,47.6],[49.2,46.4],[48.6,45.8],[47.4,45.4],[46.8,44.6],[47.5,43],[48.3,42.1],[48.6,41.8],[47.8,41.2],[46.6,41.9],[45.6,42.6],[44.6,42.7],[43.5,42.6],[42.4,43.2],[40.9,43.4],[40,43.4],[39.2,44],[38.2,44.5],[37.3,44.8],[36.7,45.2],[38,46],[38.4,46.6],[39.3,47.1],[39.8,47.8],[40.1,48.9],[39.7,49.6],[38.3,50],[36.5,50.3],[35.4,50.6],[34.2,51.2],[34.4,51.8],[33.2,52.3],[31.8,52.1],[31.6,52.8],[32.6,53.4],[31.3,53.8],[30.9,54.8],[30.9,55.6],[29.9,55.9],[28.2,56.1],[27.7,56.8],[27.4,57.6],[27.6,58.1],[28,59.2],[28,59.5],[29.5,59.9],[29,60.2],[28,60.5],[27.8,60.6],[29.3,61.3],[31.4,62.8],[30,63.8],[30,64.7],[29.6,65.7],[30,66.9],[29,67.8],[28.6,68.9],[30,69.6]],
    // Сахалин
    [[142,46],[143.6,46.6],[143.3,50],[143.2,53],[142.7,54.4],[142.2,53.5],[142,51],[141.8,48]],
    // Новая Земля
    [[52,71.3],[55,70.6],[57.5,70.7],[56,72.5],[57,73.5],[60,75],[69,76.9],[68,77],[60,76.3],[55,74.5],[53,73]],
    // Северная Земля
    [[95,78.5],[100,78.3],[106,79.5],[103,81],[96,80.6],[92,79.5]],
    // Новосибирские острова
    [[137.5,75],[143,74],[150,74.8],[148,75.8],[140,76.1]],
    // Калининградская область
    [[19.6,54.4],[22.8,54.4],[22.8,55.3],[21,55.3],[19.9,54.9]]
  ];

  var LON0 = 100;
  var RAD = Math.PI / 180;
  function project(lon, lat) {
    return [(lon - LON0) * Math.cos(lat * RAD), -lat];
  }

  function inPoly(lon, lat, poly) {
    var inside = false;
    for (var i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      var xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
      if ((yi > lat) !== (yj > lat) && lon < (xj - xi) * (lat - yi) / (yj - yi) + xi) inside = !inside;
    }
    return inside;
  }

  var landDots = null;
  function buildDots() {
    if (landDots) return landDots;
    var minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    LAND.forEach(function (poly) {
      poly.forEach(function (p) {
        var q = project(p[0], p[1]);
        minX = Math.min(minX, q[0]); maxX = Math.max(maxX, q[0]);
        minY = Math.min(minY, q[1]); maxY = Math.max(maxY, q[1]);
      });
    });
    var step = 0.92;
    var dots = [];
    for (var y = minY; y <= maxY; y += step) {
      var lat = -y;
      var c = Math.cos(lat * RAD);
      var row = Math.round((y - minY) / step);
      for (var x = minX + (row % 2 ? step / 2 : 0); x <= maxX; x += step) {
        var lon = LON0 + x / c;
        for (var k = 0; k < LAND.length; k++) {
          if (inPoly(lon, lat, LAND[k])) { dots.push([x, y]); break; }
        }
      }
    }
    landDots = { dots: dots, box: [minX - 9, minY - 1.5, maxX - minX + 11, maxY - minY + 3] };
    return landDots;
  }

  /* ---------- группировка по регионам ---------- */

  function regionsWithCenters() {
    var map = {};
    CENTERS.forEach(function (c) {
      if (c.national || !c.geo) return;
      if (!map[c.region]) map[c.region] = { region: c.region, geo: c.geo, list: [] };
      map[c.region].list.push(c);
    });
    return Object.keys(map).map(function (k) { return map[k]; });
  }

  function plural(n, one, few, many) {
    var m10 = n % 10, m100 = n % 100;
    if (m10 === 1 && m100 !== 11) return one;
    if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return few;
    return many;
  }

  /* ---------- рисуем карту ---------- */

  function renderMap(container, opts) {
    var land = buildDots();
    var b = land.box;
    var groups = regionsWithCenters();
    var svg = ['<svg viewBox="' + b.join(" ") + '" role="group" aria-label="Карта России: регионы, где есть центры помощи">'];
    svg.push('<g class="land" aria-hidden="true">');
    land.dots.forEach(function (d) {
      svg.push('<circle cx="' + d[0].toFixed(2) + '" cy="' + d[1].toFixed(2) + '" r=".27"/>');
    });
    svg.push("</g>");

    // сначала маленькие, потом большие и подписанные — чтобы те были сверху
    groups.sort(function (a, b2) {
      var am = MVP_REGIONS.indexOf(a.region) !== -1, bm = MVP_REGIONS.indexOf(b2.region) !== -1;
      return (am - bm) || (a.list.length - b2.list.length);
    });

    groups.forEach(function (g) {
      var p = project(g.geo[1], g.geo[0]);
      var n = g.list.length;
      var r = 0.36 + 0.17 * Math.sqrt(n);
      var mvp = MVP.filter(function (m) { return m.region === g.region; })[0];
      var label = g.region + " — " + n + " " + plural(n, "центр", "центра", "центров");
      svg.push(
        '<g class="pin" tabindex="0" role="button" data-region="' + esc(g.region) + '" aria-label="' + esc(label) + '">' +
        '<circle class="hit" cx="' + p[0] + '" cy="' + p[1] + '" r="2.4" fill="transparent"/>' +
        '<circle class="halo" cx="' + p[0] + '" cy="' + p[1] + '" r="' + (r * 1.8).toFixed(2) + '"/>' +
        '<circle class="core" cx="' + p[0] + '" cy="' + p[1] + '" r="' + r.toFixed(2) + '"/>' +
        (mvp ? '<text x="' + (p[0] + mvp.dx) + '" y="' + (p[1] + mvp.dy) + '" text-anchor="' + mvp.anchor + '">' + esc(mvp.label) + "</text>" : "") +
        "</g>"
      );
    });
    svg.push("</svg>");
    container.innerHTML = svg.join("") + '<div class="map-tip" hidden></div>';

    var tip = container.querySelector(".map-tip");
    function showTip(pin) {
      var r = pin.querySelector(".core").getBoundingClientRect();
      var c = container.getBoundingClientRect();
      tip.textContent = pin.getAttribute("aria-label");
      tip.style.left = (r.left + r.width / 2 - c.left) + "px";
      tip.style.top = (r.top - c.top) + "px";
      tip.hidden = false;
    }
    container.addEventListener("mouseover", function (e) {
      var pin = e.target.closest(".pin");
      if (pin) showTip(pin);
    });
    container.addEventListener("mouseout", function (e) {
      if (e.target.closest(".pin")) tip.hidden = true;
    });
    container.addEventListener("focusin", function (e) {
      var pin = e.target.closest(".pin");
      if (pin) showTip(pin);
    });
    container.addEventListener("focusout", function () { tip.hidden = true; });

    function pick(pin) {
      var region = pin.getAttribute("data-region");
      if (opts && opts.onPick) opts.onPick(region);
      else location.replace("map.html#r-" + encodeURIComponent(region));
    }
    container.addEventListener("click", function (e) {
      var pin = e.target.closest(".pin");
      if (pin) pick(pin);
    });
    container.addEventListener("keydown", function (e) {
      var pin = e.target.closest(".pin");
      if (pin && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); pick(pin); }
    });
  }

  function setActivePin(container, region) {
    container.querySelectorAll(".pin").forEach(function (p) {
      p.classList.toggle("is-active", p.getAttribute("data-region") === region);
    });
  }

  /* ---------- цифры ---------- */

  function fillStats() {
    var regions = {};
    var stats = { total: CENTERS.length, regions: 0, kids: 0, lines: 0, regional: 0 };
    CENTERS.forEach(function (c) {
      if (c.national) stats.lines++;
      else { regions[c.region] = 1; stats.regional++; }
      if (c.kids === "yes") stats.kids++;
    });
    stats.regions = Object.keys(regions).length;
    document.querySelectorAll("[data-stat]").forEach(function (el) {
      var v = stats[el.getAttribute("data-stat")];
      if (v != null) el.textContent = v;
    });
  }

  /* ---------- карточка центра ---------- */

  function phonesHTML(str) {
    if (!str) return "";
    var re = /(\+7|8)?[\s-]?(\(\d{3,5}\)|\d{3,5})[\s-]?\d{1,3}(?:[\s-]?\d{2,4}){1,3}/g;
    var out = "", last = 0, m;
    while ((m = re.exec(str))) {
      var digits = m[0].replace(/\D/g, "");
      var tel = null;
      if (digits.length === 11 && (digits[0] === "8" || digits[0] === "7")) tel = "+7" + digits.slice(1);
      else if (digits.length === 10) tel = "+7" + digits;
      if (!tel) continue;
      out += esc(str.slice(last, m.index)) + '<a href="tel:' + tel + '">' + esc(m[0].trim()) + "</a>";
      last = m.index + m[0].length;
    }
    out += esc(str.slice(last));
    out = out.replace(/([\w.+-]+@[\w-]+\.[\w.]+)/g, '<a href="mailto:$1">$1</a>');
    return out;
  }

  function siteHTML(site) {
    if (!site) return "";
    var clean = site.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return '<a class="arrow-link" href="https://' + esc(clean) + '" target="_blank" rel="noopener noreferrer"><span>' + esc(clean) + '</span><span class="arr" aria-hidden="true">↗</span></a>';
  }

  function cond(title, value, map) {
    var cls = value === "yes" ? "is-yes" : value === "no" ? "is-no" : "is-unknown";
    return '<div class="cond ' + cls + '"><span class="caps">' + title + "</span><strong>" + map[value || "unknown"] + "</strong></div>";
  }

  function phrase(state) {
    var want = [];
    if (state.needs.indexOf("убежище") !== -1) want.push("временное жильё");
    if (state.needs.indexOf("психолог") !== -1) want.push("консультация психолога");
    if (state.needs.indexOf("детский психолог") !== -1) want.push("психолог для ребёнка");
    if (state.needs.indexOf("юрист") !== -1) want.push("консультация юриста");
    if (state.needs.indexOf("телефон доверия") !== -1) want.push("просто поговорить");
    var s = "Здравствуйте. Дома небезопасно, мне нужна помощь";
    s += want.length ? ": " + want.join(", ") + "." : ".";
    if (state.kids) s += " Со мной будут дети.";
    if (state.noreg) s += " У меня нет прописки в вашем регионе.";
    s += " Подскажите, можете ли вы помочь и что взять с собой?";
    return s;
  }

  function centerCard(c, state) {
    var top = [TYPE[c.type] || c.type, c.national ? "Вся Россия" : c.city].filter(Boolean);
    if (c.religious && c.type !== "религиозная") top.push("Религиозная организация");
    var chips = c.services.map(function (s) { return '<span class="chip">' + esc(SERVICE[s] || s) + "</span>"; }).join("");
    var checked = c.checked
      ? "Проверено звонком " + esc(c.checked) + ". "
      : "";
    return (
      '<article class="card center" id="c-' + c.id + '">' +
      '<div class="center-top caps"><span class="type">' + esc(top[0]) + "</span>" + top.slice(1).map(function (s) { return "<span>" + esc(s) + "</span>"; }).join("") + "</div>" +
      '<h3 class="h3">' + esc(c.name) + "</h3>" +
      (chips ? '<div class="chips">' + chips + "</div>" : "") +
      '<div class="conds">' +
      cond("С детьми", c.kids, { yes: "Можно с детьми", no: "Без детей", unknown: "Неизвестно" }) +
      cond("Прописка", c.noreg, { yes: "Не нужна", no: "Нужна", unknown: "Неизвестно" }) +
      cond("Круглосуточно", c.h24, { yes: "Да", no: "Нет", unknown: "Неизвестно" }) +
      "</div>" +
      (c.note ? '<p class="known"><span class="caps muted">Что известно: </span>' + esc(c.note) + "</p>" : "") +
      '<div class="contacts">' +
      (c.phone ? '<div class="phones">' + phonesHTML(c.phone) + "</div>" : "") +
      siteHTML(c.site) +
      "</div>" +
      '<details class="mini-details"><summary>Как связаться безопасно</summary><div class="inner">' +
      "<ul class=\"list-dash\">" +
      "<li>Позвоните с телефона подруги, с рабочего или из места, где он не услышит.</li>" +
      "<li>Если звоните со своего — удалите номер из журнала вызовов и не сохраняйте его в контактах.</li>" +
      "<li>Адрес убежища центр называет сам, по телефону. На сайте адресов нет — это специально.</li>" +
      "</ul></div></details>" +
      '<details class="mini-details"><summary>Что сказать</summary><div class="inner">' +
      '<p class="say-phrase">«' + esc(phrase(state)) + "»</p>" +
      '<p class="note" style="margin-top:10px">Фраза собрана из выбранных фильтров. Можно говорить коротко. Если станет небезопасно — просто положите трубку, позвонить можно позже.</p>' +
      "</div></details>" +
      '<p class="status"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><circle cx="8" cy="8" r="6.5"/><path d="M8 4.5V8l2.5 1.5"/></svg>' +
      "<span>" + checked + 'Свободные места уточните при звонке — или <a class="link" href="contact.html" data-manager>попросите менеджера</a> позвонить за вас.</span></p>' +
      "</article>"
    );
  }

  /* ---------- страница карты ---------- */

  function initMapPage() {
    var root = document.querySelector("[data-map-page]");
    if (!root) return;

    var mapEl = root.querySelector("[data-ru-map]");
    var sel = root.querySelector("#f-region");
    var needBtns = root.querySelectorAll("[data-need]");
    var condBtns = root.querySelectorAll("[data-cond]");
    var list = root.querySelector("#results");
    var countEl = root.querySelector("#results-count");
    var resetBtn = root.querySelector("#f-reset");
    var linesEl = document.getElementById("lines-list");

    var PAGE = 10;
    var state = { region: "", needs: [], kids: false, noreg: false, h24: false, showUnknown: false, limit: PAGE };

    // список регионов: сначала MVP, потом остальные по алфавиту
    var groups = regionsWithCenters();
    var counts = {};
    groups.forEach(function (g) { counts[g.region] = g.list.length; });
    var others = groups.map(function (g) { return g.region; })
      .filter(function (r) { return MVP_REGIONS.indexOf(r) === -1; })
      .sort(function (a, b) { return a.localeCompare(b, "ru"); });
    var opt = ['<option value="">Все регионы</option><optgroup label="Города проекта">'];
    MVP.forEach(function (m) {
      opt.push('<option value="' + esc(m.region) + '">' + esc(m.label === m.region ? m.label : m.label + " (" + m.region + ")") + " — " + (counts[m.region] || 0) + "</option>");
    });
    opt.push('</optgroup><optgroup label="Другие регионы">');
    others.forEach(function (r) { opt.push('<option value="' + esc(r) + '">' + esc(r) + " — " + counts[r] + "</option>"); });
    opt.push("</optgroup>");
    sel.innerHTML = opt.join("");

    renderMap(mapEl, {
      onPick: function (region) {
        state.region = region;
        sel.value = region;
        state.limit = PAGE;
        update();
        document.getElementById("results-head").scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    function condOk(value, on) {
      if (!on) return "ok";
      if (value === "yes") return "ok";
      if (value === "unknown") return "unknown";
      return "no";
    }

    function filter() {
      var ok = [], unknown = [];
      CENTERS.forEach(function (c) {
        if (c.national) return;
        if (state.region && c.region !== state.region) return;
        for (var i = 0; i < state.needs.length; i++) {
          if (c.services.indexOf(state.needs[i]) === -1) return;
        }
        var res = [condOk(c.kids, state.kids), condOk(c.noreg, state.noreg), condOk(c.h24, state.h24)];
        if (res.indexOf("no") !== -1) return;
        if (res.indexOf("unknown") !== -1) unknown.push(c);
        else ok.push(c);
      });
      function sort(a, b) {
        var am = MVP_REGIONS.indexOf(a.region), bm = MVP_REGIONS.indexOf(b.region);
        am = am === -1 ? 99 : am; bm = bm === -1 ? 99 : bm;
        return (a.rank - b.rank) || (am - bm) || a.name.localeCompare(b.name, "ru");
      }
      ok.sort(sort);
      unknown.sort(sort);
      return { ok: ok, unknown: unknown };
    }

    function update() {
      var r = filter();
      var shown = state.showUnknown ? r.ok.concat(r.unknown) : r.ok;
      var n = shown.length;
      countEl.textContent = n ? "Подходит " + n + " " + plural(n, "центр", "центра", "центров") : "Пока ничего не нашлось";
      var html = shown.slice(0, state.limit).map(function (c) { return centerCard(c, state); }).join("");
      if (n > state.limit) {
        html += '<button type="button" class="btn btn--line btn--wide" data-more>Показать ещё ' + Math.min(PAGE, n - state.limit) + " из " + (n - state.limit) + "</button>";
      }
      if (!state.showUnknown && r.unknown.length) {
        html += '<div class="results-more">Ещё ' + r.unknown.length + " " + plural(r.unknown.length, "центр", "центра", "центров") +
          " могут подойти, но про выбранные условия у нас пока нет данных. Их можно уточнить при звонке или через менеджера. " +
          '<button type="button" class="text-btn" data-unknown>Показать и их</button></div>';
      }
      if (!n && !r.unknown.length) {
        html += '<div class="results-more">В этом регионе по таким условиям центров в базе нет. Попробуйте убрать часть фильтров, позвоните на всероссийскую линию <a class="link" href="tel:88007000600">8 800 7000-600</a> — там подскажут местные организации — или <a class="link" href="contact.html" data-manager>напишите менеджеру проекта</a>.</div>';
      }
      list.innerHTML = html;
      if (window.ryadomManager) window.ryadomManager();
      setActivePin(mapEl, state.region);
      needBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(state.needs.indexOf(b.getAttribute("data-need")) !== -1)); });
      condBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(!!state[b.getAttribute("data-cond")])); });
      if (linesEl) {
        linesEl.innerHTML = CENTERS.filter(function (c) { return c.national; })
          .sort(function (a, b) { return a.rank - b.rank || a.name.localeCompare(b.name, "ru"); })
          .map(function (c) { return centerCard(c, state); }).join("");
      }
    }

    sel.addEventListener("change", function () { state.region = sel.value; state.limit = PAGE; update(); });
    needBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var v = b.getAttribute("data-need");
        var i = state.needs.indexOf(v);
        if (i === -1) state.needs.push(v); else state.needs.splice(i, 1);
        state.limit = PAGE;
        update();
      });
    });
    condBtns.forEach(function (b) {
      b.addEventListener("click", function () {
        var k = b.getAttribute("data-cond");
        state[k] = !state[k];
        state.limit = PAGE;
        update();
      });
    });
    resetBtn.addEventListener("click", function () {
      state = { region: "", needs: [], kids: false, noreg: false, h24: false, showUnknown: false, limit: PAGE };
      sel.value = "";
      update();
    });
    list.addEventListener("click", function (e) {
      if (e.target.closest("[data-more]")) { state.limit += PAGE; update(); }
      if (e.target.closest("[data-unknown]")) { state.showUnknown = true; update(); }
    });

    function flash(el) {
      if (!el) return;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      el.style.transition = "box-shadow .4s";
      el.style.boxShadow = "0 0 0 3px var(--blue)";
      setTimeout(function () { el.style.boxShadow = ""; }, 2200);
    }

    // адрес после # задаёт стартовые фильтры: #segodnya, #r-Регион, #c-id
    function applyHash() {
      var h = decodeURIComponent(location.hash.slice(1));
      if (!h) return;
      if (h === "segodnya") {
        state = { region: "", needs: ["убежище"], kids: false, noreg: false, h24: true, showUnknown: false, limit: PAGE };
        sel.value = "";
        update();
        var note = document.getElementById("today-note");
        if (note) note.hidden = false;
        document.getElementById("results-head").scrollIntoView({ block: "start" });
      } else if (h.indexOf("r-") === 0) {
        state.region = h.slice(2);
        sel.value = state.region;
        state.limit = PAGE;
        update();
        document.getElementById("results-head").scrollIntoView({ block: "start" });
      } else if (h.indexOf("c-") === 0) {
        var c = CENTERS.filter(function (x) { return x.id === h.slice(2); })[0];
        if (!c) return;
        if (!c.national) {
          state = { region: c.region, needs: [], kids: false, noreg: false, h24: false, showUnknown: true, limit: 999 };
          sel.value = c.region;
        }
        update();
        flash(document.getElementById("c-" + c.id));
      }
    }

    update();
    applyHash();
    window.addEventListener("ryadom:hash", applyHash);
    window.addEventListener("hashchange", applyHash);
    if (window.ryadomMarkExternal) window.ryadomMarkExternal(list);
  }

  /* ---------- мини-карта на главной ---------- */

  function initMini() {
    document.querySelectorAll('[data-ru-map="mini"]').forEach(function (el) { renderMap(el); });
  }

  document.addEventListener("DOMContentLoaded", function () {
    fillStats();
    initMini();
    initMapPage();
  });
})();
