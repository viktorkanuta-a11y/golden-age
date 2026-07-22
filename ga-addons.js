/* Golden Age addons v5 */
(function () {
  var FORM_ENDPOINT = "https://formspree.io/f/FORMSPREE_ID"; // заменить на реальный код Formspree

  var T = {
    ru: {
      btn: "Связаться",
      title: "Напишите нам",
      sub: "Оставьте заявку — мы свяжемся с вами",
      name: "Ваше имя",
      contact: "Телефон или email",
      msg: "Кратко о задаче",
      send: "Отправить заявку",
      sending: "Отправляем...",
      ok: "Заявка отправлена. Спасибо!",
      err: "Не удалось отправить. Напишите нам на почту или позвоните.",
      noform: "Форма ещё не подключена.",
      onreq: "по запросу",
      npv: "чистая приведённая стоимость",
      irr: "внутренняя норма доходности"
    },
    en: {
      btn: "Contact",
      title: "Write to us",
      sub: "Leave a request — we will contact you",
      name: "Your name",
      contact: "Phone or email",
      msg: "Briefly about your task",
      send: "Send request",
      sending: "Sending...",
      ok: "Request sent. Thank you!",
      err: "Sending failed. Please email or call us.",
      noform: "The form is not connected yet.",
      onreq: "on request",
      npv: "net present value",
      irr: "internal rate of return"
    }
  };

  function lang() {
    var h = document.querySelector("header");
    return h && h.textContent.indexOf("Технологии") !== -1 ? "ru" : "en";
  }
  function t(k) { return T[lang()][k]; }

  /* ---------- модальное окно (вне React) ---------- */
  var ov = document.createElement("div");
  ov.className = "ga-ov";
  ov.innerHTML =
    '<div class="ga-md">' +
    '<button class="ga-x" type="button">\u2715</button>' +
    '<h3 class="ga-t"></h3><p class="ga-s"></p>' +
    '<div class="ga-f">' +
    '<input class="ga-i-name">' +
    '<input class="ga-i-contact">' +
    '<textarea rows="4" class="ga-i-msg"></textarea>' +
    '<button class="ga-send" type="button"></button>' +
    '<div class="ga-msg"></div>' +
    "</div></div>";
  document.body.appendChild(ov);

  function openModal() {
    ov.querySelector(".ga-t").textContent = t("title");
    ov.querySelector(".ga-s").textContent = t("sub");
    ov.querySelector(".ga-i-name").placeholder = t("name");
    ov.querySelector(".ga-i-contact").placeholder = t("contact");
    ov.querySelector(".ga-i-msg").placeholder = t("msg");
    ov.querySelector(".ga-send").textContent = t("send");
    ov.querySelector(".ga-msg").textContent = "";
    ov.classList.add("ga-show");
  }
  function closeModal() { ov.classList.remove("ga-show"); }
  ov.querySelector(".ga-x").addEventListener("click", closeModal);
  ov.addEventListener("click", function (e) { if (e.target === ov) closeModal(); });

  ov.querySelector(".ga-send").addEventListener("click", function () {
    var btn = this, m = ov.querySelector(".ga-msg");
    if (FORM_ENDPOINT.indexOf("FORMSPREE_ID") !== -1) { m.textContent = t("noform"); return; }
    var data = {
      name: ov.querySelector(".ga-i-name").value,
      contact: ov.querySelector(".ga-i-contact").value,
      message: ov.querySelector(".ga-i-msg").value
    };
    btn.disabled = true; btn.textContent = t("sending");
    fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(data)
    }).then(function (r) {
      m.textContent = r.ok ? t("ok") : t("err");
    }).catch(function () {
      m.textContent = t("err");
    }).finally(function () {
      btn.disabled = false; btn.textContent = t("send");
    });
  });

  var isTouch = window.matchMedia("(hover: none)").matches;

  /* ---------- улучшения внутри React-дерева ---------- */
  function enhance() {
    var i, el;

    /* кнопка "Связаться" в шапке, рядом с переключателем языка */
    var headRow = document.querySelector("header .justify-between");
    if (headRow && !headRow.querySelector(".ga-navbtn")) {
      var b = document.createElement("button");
      b.className = "ga-navbtn";
      b.type = "button";
      b.addEventListener("click", openModal);
      headRow.appendChild(b);
    }
    var navBtn = document.querySelector(".ga-navbtn");
    if (navBtn) navBtn.textContent = t("btn");

    /* бейдж "О компании" -> прокрутка к блоку о компании */
    var badge = null, aboutCard = null;
    var spans = document.querySelectorAll("span.text-sm.font-medium");
    for (i = 0; i < spans.length; i++) {
      var tx = spans[i].textContent.trim();
      if (tx === "О компании" || tx === "About the Company" || tx === "About Company") { badge = spans[i].parentElement; break; }
    }
    var h3s = document.querySelectorAll("h3");
    for (i = 0; i < h3s.length; i++) {
      var tx3 = h3s[i].textContent.trim();
      if (tx3 === "О компании" || tx3 === "About the Company" || tx3 === "About Company") { aboutCard = h3s[i]; break; }
    }
    if (badge && aboutCard && !badge.dataset.ga) {
      badge.dataset.ga = "1";
      badge.style.cursor = "pointer";
      (function (target) {
        badge.addEventListener("click", function () {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      })(aboutCard);
    }

    /* расшифровка NPV / IRR */
    var labels = document.querySelectorAll("div.text-sm");
    for (i = 0; i < labels.length; i++) {
      el = labels[i];
      var v = el.textContent.trim();
      if ((v === "NPV" || v === "IRR") && !el.querySelector(".ga-sub")) {
        var sub = document.createElement("div");
        sub.className = "ga-sub";
        sub.textContent = v === "NPV" ? t("npv") : t("irr");
        el.appendChild(sub);
      }
    }

    /* размытые цены: наведение -> "по запросу", клик -> форма */
    var prices = document.querySelectorAll("div.text-2xl.font-bold.text-gray-900");
    for (i = 0; i < prices.length; i++) {
      el = prices[i];
      if (el.dataset.ga) continue;
      el.dataset.ga = "1";
      el.classList.add("ga-price");
      (function (p) {
        var orig = p.textContent;
        function reveal() { p.classList.add("ga-open"); p.textContent = t("onreq"); }
        function hide() { p.classList.remove("ga-open"); p.textContent = orig; }
        if (!isTouch) {
          p.addEventListener("mouseenter", reveal);
          p.addEventListener("mouseleave", hide);
          p.addEventListener("click", openModal);
        } else {
          p.addEventListener("click", function () {
            if (!p.classList.contains("ga-open")) { reveal(); } else { openModal(); }
          });
        }
      })(el);
    }
  }

  /* React перерисовывает дерево при смене языка — следим и накатываем заново */
  var to = null;
  function schedule() { clearTimeout(to); to = setTimeout(enhance, 150); }
  var root = document.getElementById("root");
  if (root) new MutationObserver(schedule).observe(root, { childList: true, subtree: true });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule);
  } else { schedule(); }
})();
