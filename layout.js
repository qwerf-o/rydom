/* =========================================================
   рядом — шапка, подвал, окна «Срочная помощь» и «Поддержать проект»,
   кнопки «Назад» / «Наверх» / «Продолжить» внизу страниц.
   Один файл на все страницы: меню, подвал и порядок страниц правятся здесь.
   Подключается первым тегом внутри <body>.

   Яндекс Метрика: когда будет счётчик, вставить код сюда
   (или в <head> каждой страницы) с настройками
   webvisor: false, clickmap: false, trackLinks: false.
   Вебвизор не включать: он записывает экран, в том числе ответы тестов.
   Рекламные пиксели (VK, Яндекс Директ и т.п.) не ставить.
   ========================================================= */

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---------- настройки, которые меняет автор ---------- */

  // Ссылка на менеджера проекта в Telegram, например "https://t.me/nickname".
  // Пока пусто — кнопки «Написать менеджеру» ведут на страницу contact.html.
  var MANAGER_URL = "https://t.me/asdAkdk";

  // Ссылки на соцсети проекта (пока заглушки)
  var SOCIAL = { vk: "#", tg: "#", dzen: "#" };

  /* ---------- меню ---------- */

  var NAV = [
    {
      href: "help.html", text: "Мне нужна помощь", also: ["instruction.html", "contact.html"],
      children: [
        { href: "instruction.html", text: "Инструкция для пострадавших", note: "Что можно сделать, по шагам" },
        { href: "close.html", text: "Инструкция для близких", note: "Что сказать и чего не говорить" },
        { href: "map.html", text: "Центры помощи в России", note: "Карта и фильтры" },
        { href: "contact.html", text: "Связаться", note: "Позвонить или написать менеджеру" },
        { href: "#urgent", text: "Мне страшно прямо сейчас", note: "112 и телефон доверия" }
      ]
    },
    {
      href: "violence.html", text: "Про насилие", also: ["stories.html", "myths.html"],
      children: [
        { href: "violence.html", text: "Что такое насилие", note: "Виды, признаки, вопросы" },
        { href: "myths.html", text: "Мифы о насилии", note: "Что говорят исследования" },
        { href: "stories.html", text: "Истории", note: "Собирательные истории" }
      ]
    },
    { href: "map.html", text: "Карта помощи" },
    { href: "plan.html", text: "План безопасности", also: ["safety.html"] },
    { href: "tests.html", text: "Тесты" },
    { href: "close.html", text: "Близким" },
    { href: "about.html", text: "О нас" }
  ];

  /* ---------- порядок страниц ----------
     title  — как страница называется в кнопке «Назад»
     parent — куда ведёт «Назад», если пришли на страницу не с сайта
     next   — кнопка «Продолжить» внизу страницы */

  var PAGES = {
    "index.html": { title: "Главная", next: { href: "help.html", text: "Мне нужна помощь" } },
    "help.html": { title: "Мне нужна помощь", parent: "index.html", next: { href: "instruction.html", text: "Инструкция по шагам" } },
    "instruction.html": { title: "Инструкция", parent: "help.html", next: { href: "plan.html", text: "План безопасности" } },
    "plan.html": { title: "План безопасности", parent: "help.html", next: { href: "contact.html", text: "Продолжить: связаться" } },
    "contact.html": { title: "Связаться", parent: "help.html", next: { href: "map.html", text: "Карта помощи" } },
    "map.html": { title: "Карта помощи", parent: "help.html", next: { href: "contact.html", text: "Не нашли центр? Написать менеджеру" } },
    "tests.html": { title: "Тесты", parent: "index.html", next: { href: "help.html", text: "Что делать дальше" } },
    "violence.html": { title: "Про насилие", parent: "index.html", next: { href: "myths.html", text: "Мифы о насилии" } },
    "myths.html": { title: "Мифы о насилии", parent: "violence.html", next: { href: "tests.html", text: "Пройти тест" } },
    "stories.html": { title: "Истории", parent: "violence.html", next: { href: "help.html", text: "Мне нужна помощь" } },
    "close.html": { title: "Близким", parent: "help.html", next: { href: "map.html", text: "Куда направить: карта помощи" } },
    "about.html": { title: "О нас", parent: "index.html", next: { donate: true, text: "Поддержать проект" } },
    "safety.html": { title: "Безопасность в телефоне", parent: "plan.html", next: { href: "plan.html", text: "План безопасности" } }
  };

  var page = (location.pathname.split("/").pop() || "index.html").toLowerCase();
  if (page.indexOf(".html") === -1) page = "index.html";

  window.RYADOM = { page: page, pages: PAGES, managerUrl: MANAGER_URL };

  function isCurrent(n) {
    return n.href === page || (n.also && n.also.indexOf(page) !== -1);
  }

  function navLinks() {
    return NAV.map(function (n) {
      var link = '<a href="' + n.href + '"' + (isCurrent(n) ? ' aria-current="page"' : "") + ">" + n.text + "</a>";
      if (!n.children) return link;
      return (
        '<div class="nav-item">' + link +
        '<div class="nav-drop"><div class="nav-drop-inner">' +
        n.children.map(function (c) {
          return '<a href="' + c.href + '"' + (c.href === page ? ' aria-current="page"' : "") + ">" + c.text + "<small>" + c.note + "</small></a>";
        }).join("") +
        "</div></div></div>"
      );
    }).join("");
  }

  function mobileLinks() {
    return NAV.map(function (n) {
      var html = '<a href="' + n.href + '"' + (isCurrent(n) ? ' aria-current="page"' : "") + ">" + n.text + '<span aria-hidden="true">→</span></a>';
      if (n.children) {
        html += n.children.filter(function (c) { return c.href !== n.href; }).map(function (c) {
          return '<a class="sub" href="' + c.href + '">' + c.text + "</a>";
        }).join("");
      }
      return html;
    }).join("");
  }

  var searchIcon =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21" stroke-linecap="round"/></svg>';

  function searchForm(id) {
    return (
      '<form class="search" role="search" data-search autocomplete="off">' +
      '<label class="visually-hidden" for="' + id + '">Поиск по сайту</label>' +
      '<div class="search-field">' + searchIcon +
      '<input id="' + id + '" type="search" placeholder="Поиск по сайту" enterkeyhint="search" autocomplete="off" spellcheck="false">' +
      "</div>" +
      '<div class="search-results" role="listbox" hidden></div>' +
      "</form>"
    );
  }

  var header =
    '<a class="skip-link" href="#main">К содержанию</a>' +
    '<header class="site-header">' +
    '<div class="wrap header-row">' +
    '<a class="logo" href="index.html" aria-label="рядом, на главную">' +
    '<span class="logo-word">рядом</span>' +
    '<span class="logo-tag">помощь ближе, чем вы думаете</span>' +
    "</a>" +
    searchForm("search-top") +
    '<div class="header-actions">' +
    '<button type="button" class="btn btn--sm js-urgent" aria-haspopup="dialog">' +
    '<span class="full">Срочная помощь</span><span class="short">Срочно</span></button>' +
    '<button type="button" class="btn btn--sm btn--line js-exit" title="Быстрый выход: откроется прогноз погоды. Или нажмите Esc дважды">' +
    '<span class="full">Быстрый выход</span><span class="short">Выход</span></button>' +
    '<button type="button" class="menu-toggle" aria-expanded="false" aria-controls="mobile-panel" aria-label="Меню">' +
    '<svg width="20" height="14" viewBox="0 0 20 14" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M0 1h20M0 7h20M0 13h20"/></svg>' +
    "</button>" +
    "</div>" +
    "</div>" +
    '<nav class="main-nav wrap" aria-label="Основное меню">' + navLinks() + "</nav>" +
    '<div class="mobile-panel" id="mobile-panel" hidden>' +
    searchForm("search-mobile") +
    '<nav aria-label="Меню">' + mobileLinks() + "</nav>" +
    '<button type="button" class="btn btn--line js-donate">Поддержать проект</button>' +
    '<p class="note">Уйти с сайта можно в любой момент: кнопка «Выход» вверху. Откроется прогноз погоды.</p>' +
    "</div>" +
    "</header>";

  // Шапка встаёт сразу после этого <script>, до остального содержимого
  document.currentScript.insertAdjacentHTML("afterend", header);

  /* ---------- подвал ---------- */

  var icons = {
    tg: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.7 4.3 2.9 11.2c-1.2.5-1.2 1.2-.2 1.5l4.6 1.4 1.7 5.4c.2.6.1.8.7.8.5 0 .7-.2.9-.4l2.2-2.2 4.6 3.4c.8.5 1.4.2 1.6-.8l3-14.2c.3-1.2-.5-1.8-1.3-1.4ZM8.7 14.2l9.4-5.9c.4-.3.9-.1.5.3l-7.8 7.1-.3 3.3-1.8-4.8Z"/></svg>',
    vk: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.9 17.6c-5.6 0-8.8-3.8-8.9-10.2h2.8c.1 4.7 2.2 6.6 3.8 7V7.4h2.6v4c1.6-.2 3.3-2 3.9-4h2.6c-.4 2.5-2.3 4.3-3.6 5 1.3.6 3.4 2.2 4.2 5.2h-2.9c-.6-2-2.2-3.5-4.2-3.7v3.7h-.3Z"/></svg>',
    dzen: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5c.2 5.2 4.3 9.3 9.5 9.5-5.2.2-9.3 4.3-9.5 9.5-.2-5.2-4.3-9.3-9.5-9.5 5.2-.2 9.3-4.3 9.5-9.5Z"/></svg>'
  };

  var footer =
    '<footer class="site-footer">' +
    '<div class="wrap">' +
    '<div class="safety-hint">' +
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.3" aria-hidden="true"><rect x="6" y="2.5" width="12" height="19" rx="2.5"/><path d="M10.5 18.5h3"/></svg>' +
    "<span>Если телефон могут проверить — откройте сайт в режиме инкогнито или удалите его из истории.</span>" +
    '<a class="pill-link" href="safety.html">Как это сделать <span class="arr" aria-hidden="true">→</span></a>' +
    "</div>" +
    '<div class="footer-grid">' +
    "<div>" +
    '<a class="logo" href="index.html" aria-label="рядом, на главную"><span class="logo-word">рядом</span><span class="logo-tag">помощь ближе, чем вы думаете</span></a>' +
    '<p class="note" style="margin-top:18px">Мы не собираем имя, телефон и адрес. Ответы тестов и отметки в чек-листе живут только в открытой вкладке и стираются, когда вы её закрываете.</p>' +
    '<button type="button" class="btn js-donate" style="margin-top:18px">Поддержать проект <span class="arr" aria-hidden="true">→</span></button>' +
    "</div>" +
    "<div>" +
    '<h2 class="caps">Позвонить</h2>' +
    '<a class="footer-phone" href="tel:112">112</a>' +
    '<p class="note">если опасно прямо сейчас</p>' +
    '<a class="footer-phone" href="tel:88007000600">8 800 7000-600</a>' +
    '<p class="note">поговорить: бесплатно, анонимно, круглосуточно</p>' +
    '<a class="pill-link" href="contact.html" data-manager>Написать менеджеру <span class="arr" aria-hidden="true">→</span></a>' +
    "</div>" +
    "<div>" +
    '<h2 class="caps">Разделы</h2>' +
    "<ul>" +
    NAV.map(function (n) { return '<li><a class="link" href="' + n.href + '">' + n.text + "</a></li>"; }).join("") +
    '<li><a class="link" href="myths.html">Мифы о насилии</a></li>' +
    '<li><a class="link" href="stories.html">Истории</a></li>' +
    '<li><a class="link" href="safety.html">Безопасность в телефоне</a></li>' +
    "</ul>" +
    "</div>" +
    "<div>" +
    '<h2 class="caps">Мы в соцсетях</h2>' +
    '<div class="socials">' +
    '<a href="' + SOCIAL.vk + '" aria-label="ВКонтакте">' + icons.vk + "</a>" +
    '<a href="' + SOCIAL.tg + '" aria-label="Telegram">' + icons.tg + "</a>" +
    '<a href="' + SOCIAL.dzen + '" aria-label="Дзен">' + icons.dzen + "</a>" +
    "</div>" +
    '<p class="note" style="margin-top:14px">Подписка на сообщество видна в профиле. Если это небезопасно — просто вернитесь на сайт, когда будет нужно.</p>' +
    "</div>" +
    "</div>" +
    '<p class="footer-credits">Проект и сайт — <b>Евгения Дувидович</b>. Тексты, тесты и логика сайта — вместе с психологом <b>Ульяной Гаковой</b>.</p>' +
    '<div class="footer-bottom caps muted">' +
    "<span>Учебный проект НИУ ВШЭ, 2026</span>" +
    '<span>Уйти с сайта: «Быстрый выход» или <span class="kbd">Esc</span> <span class="kbd">Esc</span></span>' +
    "</div>" +
    "</div>" +
    "</footer>";

  var urgent =
    '<dialog class="urgent" id="urgent" aria-labelledby="urgent-title">' +
    '<div class="urgent-inner">' +
    '<div class="urgent-top">' +
    '<h2 id="urgent-title">Если страшно прямо сейчас</h2>' +
    '<button type="button" class="urgent-close" data-close aria-label="Закрыть"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg></button>' +
    "</div>" +
    '<a class="phone-card phone-card--main" href="tel:112">' +
    '<span class="caps">Опасно прямо сейчас</span>' +
    '<span class="num">112</span>' +
    '<span class="what">Полиция, скорая и спасатели. Бесплатно, даже без денег на счёте.</span>' +
    "</a>" +
    '<a class="phone-card" href="tel:88007000600">' +
    '<span class="caps">Поговорить с консультантом</span>' +
    '<span class="num">8 800 7000-600</span>' +
    '<span class="what">Бесплатно, анонимно, круглосуточно, из любого региона.</span>' +
    "</a>" +
    '<a class="btn btn--line btn--wide" href="map.html#segodnya">Кто может принять сегодня <span class="arr" aria-hidden="true">→</span></a>' +
    '<div class="urgent-exit">' +
    "<p><strong>Если он рядом</strong> — закройте сайт. Вместо него откроется прогноз погоды.</p>" +
    '<button type="button" class="btn js-exit">Быстрый выход</button>' +
    "</div>" +
    "</div>" +
    "</dialog>";

  // На что идут пожертвования — правится здесь
  var donate =
    '<dialog class="modal" id="donate" aria-labelledby="donate-title">' +
    '<div class="modal-inner">' +
    '<div class="urgent-top">' +
    '<h2 id="donate-title">Поддержать проект</h2>' +
    '<button type="button" class="urgent-close" data-close aria-label="Закрыть"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" aria-hidden="true"><path d="M3 3l10 10M13 3 3 13"/></svg></button>' +
    "</div>" +
    '<div class="modal-step" data-step="1">' +
    '<p>«рядом» — некоммерческий проект. Мы не показываем рекламу и не собираем данные, поэтому живём на пожертвования.</p>' +
    '<div style="margin-top:18px"><div class="seg" role="group" aria-label="Как часто">' +
    '<button type="button" data-freq="once" aria-pressed="true">Разово</button>' +
    '<button type="button" data-freq="month" aria-pressed="false">Каждый месяц</button>' +
    "</div></div>" +
    '<div class="amounts" role="group" aria-label="Сумма" style="margin-top:14px">' +
    [300, 500, 1000, 3000].map(function (a) {
      return '<button type="button" class="chip chip-toggle" data-amount="' + a + '" aria-pressed="' + (a === 500) + '">' + a.toLocaleString("ru-RU") + " ₽</button>";
    }).join("") +
    '<label class="amount-other"><span class="visually-hidden">Другая сумма</span><input type="number" min="50" step="50" inputmode="numeric" placeholder="Своя сумма" data-amount-other> ₽</label>' +
    "</div>" +
    '<div class="where" style="margin-top:18px">' +
    "<h3>Куда пойдут деньги</h3>" +
    '<ul class="list-dash">' +
    "<li><strong>Обзвон центров.</strong> Раз в 30 дней звоним в каждый центр и обновляем условия на карте.</li>" +
    "<li><strong>Работа психолога.</strong> Тексты, тесты и будущие программы для женщин, которые уже ушли.</li>" +
    "<li><strong>Сайт.</strong> Домен, хостинг и поддержка.</li>" +
    "<li><strong>Наклейки с QR-кодом</strong> для женских туалетов в клиниках и торговых центрах — там, куда он не зайдёт.</li>" +
    "</ul>" +
    '<p class="note" style="margin-top:10px">Отчёт о расходах будем публиковать в сообществе проекта.</p>' +
    "</div>" +
    '<button type="button" class="btn btn--wide" data-donate-go style="margin-top:18px">Поддержать</button>' +
    '<p class="note" style="margin-top:10px">Оплата пройдёт на стороне платёжного сервиса — данные карты мы не видим.</p>' +
    "</div>" +
    '<div class="modal-step" data-step="2" hidden>' +
    '<p class="thanks">Спасибо!</p>' +
    '<p data-summary style="margin-top:10px"></p>' +
    '<p class="note" style="margin-top:10px">Это прототип: приём пожертвований подключится после регистрации НКО.</p>' +
    '<button type="button" class="btn btn--line" data-close style="margin-top:18px">Закрыть</button>' +
    "</div>" +
    "</div>" +
    "</dialog>";

  /* ---------- «Назад» сверху и навигация внизу ---------- */

  function pageNav() {
    var meta = PAGES[page] || {};
    var next = meta.next;
    var nextHTML = "";
    if (next) {
      nextHTML = next.donate
        ? '<button type="button" class="btn js-donate">' + next.text + ' <span class="arr" aria-hidden="true">→</span></button>'
        : '<a class="btn" href="' + next.href + '"' + (next.href === "contact.html" ? " data-next-contact" : "") + ">" + next.text + ' <span class="arr" aria-hidden="true">→</span></a>';
    }
    return (
      '<nav class="wrap page-nav" aria-label="Навигация по страницам">' +
      '<div class="left">' +
      (page !== "index.html" ? '<a class="pill-link" href="' + (meta.parent || "index.html") + '" data-back><span class="arr-back" aria-hidden="true">←</span> Назад</a>' : "") +
      '<button type="button" class="pill-link" data-top>Наверх <span aria-hidden="true">↑</span></button>' +
      "</div>" +
      nextHTML +
      "</nav>"
    );
  }

  document.addEventListener("DOMContentLoaded", function () {
    var main = document.getElementById("main");
    if (main && page !== "index.html") {
      var meta = PAGES[page] || {};
      main.insertAdjacentHTML(
        "afterbegin",
        '<div class="wrap back-row"><a class="pill-link back-link" href="' + (meta.parent || "index.html") + '" data-back>' +
        '<span class="arr-back" aria-hidden="true">←</span> Назад</a></div>'
      );
    }
    if (main) main.insertAdjacentHTML("beforeend", pageNav());
    document.body.insertAdjacentHTML(
      "beforeend",
      footer + urgent + donate +
      '<button type="button" class="to-top" data-top aria-label="Наверх"><svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 15V3M4 8l5-5 5 5"/></svg></button>'
    );
  });

  /* ---------- поиск: страницы ---------- */

  window.RYADOM_PAGES = [
    { t: "Мне нужна помощь", u: "help.html", k: "помощь куда обратиться с чего начать что делать" },
    { t: "Инструкция: что делать по шагам", u: "instruction.html", k: "инструкция шаги 112 полиция травмпункт заявление зафиксировать побои справка юрист психолог вернулась" },
    { t: "Если страшно прямо сейчас", u: "#urgent", k: "срочно страшно опасно 112 позвонить сейчас ночь" },
    { t: "Связаться: позвонить или написать менеджеру", u: "contact.html", k: "связаться менеджер написать телеграм позвонить контакты" },
    { t: "Про насилие", u: "violence.html", k: "насилие конфликт ссора виды признаки вопросы психологическое физическое экономическое сексуальное контроль газлайтинг молчание деньги" },
    { t: "Мифы о насилии", u: "myths.html", k: "мифы статистика исследования воз сама виновата ради детей он изменится" },
    { t: "Карта помощи: центры", u: "map.html", k: "карта центры убежище кризисный центр приют переночевать жильё дети прописка круглосуточно город регион" },
    { t: "Всероссийские линии", u: "map.html#lines", k: "телефон доверия горячая линия 8 800 чат онлайн" },
    { t: "План безопасности", u: "plan.html", k: "план уйти уход документы деньги подготовка кодовое слово" },
    { t: "Что взять с собой: чек-лист", u: "plan.html#checklist", k: "чек-лист взять с собой документы паспорт свидетельство снилс полис лекарства зарядка" },
    { t: "Безопасность в телефоне", u: "safety.html", k: "инкогнито история браузера удалить журнал звонков телефон проверяет следы" },
    { t: "Тесты самопомощи", u: "tests.html", k: "тест ссора что я чувствую готова ли я к изменениям" },
    { t: "Тест: Ссора или что-то большее?", u: "tests.html#test-1", k: "тест ссора конфликт отношения" },
    { t: "Тест: Готова ли я к изменениям?", u: "tests.html#test-2", k: "тест готова изменения уйти опоры" },
    { t: "Тест: Что я чувствую?", u: "tests.html#test-3", k: "тест чувства вина страх тревога усталость" },
    { t: "Истории", u: "stories.html", k: "истории женщины опыт юля марина алёна наталья елена оля" },
    { t: "Близким: как помочь подруге", u: "close.html", k: "близким подруга сестра мама помочь что сказать не говорить" },
    { t: "Интерактив «23:40»", u: "close.html#chat", k: "23:40 подруга написала сообщение ответить" },
    { t: "О нас", u: "about.html", k: "о нас проект команда психолог ульяна евгения проверка центров принципы поправка вшэ" },
    { t: "Поддержать проект", u: "about.html#support", k: "поддержать пожертвование донат помочь деньгами благотворительность" }
  ];
})();
