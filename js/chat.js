/* =========================================================
   рядом — интерактив «23:40» для близких
   Сообщение подруги → 4 шага с выбором ответа → короткий разбор.
   Выборы нигде не сохраняются и никуда не отправляются.
   ========================================================= */

(function () {
  "use strict";

  var esc = window.ryadomEscape || function (s) { return String(s); };

  var STEPS = [
    {
      time: "23:40",
      her: "Он ударил меня. Я не знаю, что делать",
      choices: [
        { t: "Просто уйди от него.", ok: false, why: "Звучит как забота, но давит. Уход без плана — самое опасное время. А если она пока не готова, ей станет стыдно писать вам снова." },
        { t: "Я тебе верю. Что тебе сейчас нужно?", ok: true, why: "Да. Сначала — поверить и спросить, что нужно ей. Решения принимает она." },
        { t: "А что ты ему сказала?", ok: false, why: "Вопрос звучит так, будто она могла спровоцировать удар. Вина всегда на том, кто ударил." }
      ],
      best: "Я тебе верю. Что тебе сейчас нужно?"
    },
    {
      time: "23:42",
      her: "Он сейчас в другой комнате. Может, я сама его довела…",
      choices: [
        { t: "Ничто не оправдывает удар. Ты не виновата.", ok: true, why: "Да. Чувство вины держит сильнее всего — важно снять его прямо и просто." },
        { t: "Ну, вы оба хороши. Помиритесь.", ok: false, why: "Так насилие превращается в «обычную ссору». Она услышит: со мной об этом говорить бесполезно." },
        { t: "Я сейчас позвоню в полицию!", ok: false, why: "Решать за неё — снова отнимать у неё выбор. Звонок без её согласия может сделать опаснее. Исключение — если угроза жизни прямо сейчас: тогда 112." }
      ],
      best: "Ничто не оправдывает удар. Ты не виновата."
    },
    {
      time: "23:45",
      her: "Мне некуда идти. У меня дети",
      choices: [
        { t: "Терпи ради детей, им нужен отец.", ok: false, why: "Дети, которые живут рядом с насилием, тоже от него страдают — даже если их не трогают." },
        { t: "Почему ты раньше молчала? Я же говорила, что он такой.", ok: false, why: "Упрёк вызывает стыд, а стыд заставляет молчать. Сейчас важно то, что она написала." },
        { t: "Моя дверь для тебя открыта. И давай вместе посмотрим, куда можно обратиться с детьми в твоём городе.", ok: true, why: "Да. Опора и один конкретный шаг. На карте помощи можно выбрать центры, где принимают с детьми." }
      ],
      best: "Моя дверь для тебя открыта. И давай вместе посмотрим, куда можно обратиться с детьми."
    },
    {
      time: "23:48",
      her: "Он проверяет мой телефон",
      choices: [
        { t: "Скинь мне фото синяков, сохраню как доказательство.", ok: false, why: "Фото останутся в её телефоне и в вашей переписке — он может их увидеть. Зафиксировать побои лучше у врача или в травмпункте." },
        { t: "Удаляй нашу переписку. Давай договоримся о кодовом слове: если напишешь «купи хлеба», я звоню 112.", ok: true, why: "Да. Безопасная связь важнее подробностей. Кодовое слово — часть плана безопасности." },
        { t: "Давай я ему напишу и всё выскажу.", ok: false, why: "Это может разозлить его ещё больше, и достанется ей. Выяснять отношения с ним — не ваша задача." }
      ],
      best: "Удаляй нашу переписку. Давай договоримся о кодовом слове."
    }
  ];

  var root = document.querySelector("[data-chat]");
  if (!root) return;
  var body = root.querySelector(".chat-body");
  var choicesEl = root.querySelector(".chat-choices");

  var step = 0;
  var good = 0;

  var interacted = false; // до первого выбора страницу не прокручиваем

  function add(html, cls) {
    var div = document.createElement("div");
    div.className = "msg " + cls;
    div.innerHTML = html;
    body.appendChild(div);
    if (interacted) div.scrollIntoView({ block: "nearest", behavior: "smooth" });
    return div;
  }

  function showStep() {
    var s = STEPS[step];
    add(esc(s.her) + "<time>" + s.time + "</time>", "msg--her");
    choicesEl.innerHTML =
      '<span class="caps">Шаг ' + (step + 1) + " из " + STEPS.length + ". Что вы ответите?</span>" +
      s.choices.map(function (c, i) {
        return '<button type="button" class="choice-btn" data-c="' + i + '">' + esc(c.t) + "</button>";
      }).join("");
  }

  function pick(i) {
    var s = STEPS[step];
    var c = s.choices[i];
    if (c.ok) good++;
    add(esc(c.t), "msg--me");
    var note = '<span class="caps">' + (c.ok ? "Бережный ответ" : "Лучше иначе") + "</span>" + esc(c.why);
    if (!c.ok) note += "<br><br>Что сказать вместо этого: «" + esc(s.best) + "»";
    add(note, "msg--note");
    var last = step === STEPS.length - 1;
    choicesEl.innerHTML = '<button type="button" class="btn" data-next>' + (last ? "Что в итоге" : "Дальше") + ' <span class="arr" aria-hidden="true">→</span></button>';
    choicesEl.querySelector("[data-next]").focus({ preventScroll: true });
  }

  function finish() {
    if (window.ryadomGoal) window.ryadomGoal("chat_done");
    add("Спасибо. Мне правда стало спокойнее<time>23:52</time>", "msg--her");
    choicesEl.innerHTML =
      '<p class="caps">Итог</p>' +
      "<p>Бережных ответов: <strong>" + good + " из " + STEPS.length + "</strong>. Главное — поверить, не винить, не решать за неё и помнить, что её переписку могут читать.</p>" +
      '<div class="btn-row">' +
      '<button type="button" class="btn" data-share>Переслать <span class="arr" aria-hidden="true">→</span></button>' +
      '<a class="btn btn--line" href="map.html">Карта помощи</a>' +
      '<button type="button" class="text-btn" data-restart>Пройти ещё раз</button>' +
      "</div>" +
      '<p class="note" data-share-note hidden></p>';
  }

  function share() {
    var url = location.href.split("#")[0] + "#chat";
    var note = choicesEl.querySelector("[data-share-note]");
    function done(text) { note.textContent = text; note.hidden = false; }
    if (navigator.share) {
      navigator.share({ title: "рядом", url: url }).catch(function () {});
    } else if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(function () {
        done("Ссылка скопирована. Превью у неё нейтральное: в мессенджере будет видно только «рядом».");
      }, function () { done(url); });
    } else {
      done(url);
    }
  }

  choicesEl.addEventListener("click", function (e) {
    interacted = true;
    var c = e.target.closest("[data-c]");
    if (c) { pick(Number(c.getAttribute("data-c"))); return; }
    if (e.target.closest("[data-next]")) {
      step++;
      if (step < STEPS.length) showStep(); else finish();
      return;
    }
    if (e.target.closest("[data-share]")) { share(); return; }
    if (e.target.closest("[data-restart]")) {
      step = 0; good = 0; body.innerHTML = "";
      showStep();
    }
  });

  showStep();
})();
