/* Global behaviour: theme + RTL toggles, navigation, reveal-on-scroll, forms, listing filter. */
(function () {
  "use strict";
  var doc = document, root = doc.documentElement;
  function $(s, c) { return (c || doc).querySelector(s); }
  function $$(s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); }
  function store(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

  root.classList.remove("no-js");

  /* ---------- Theme (contrast) toggle ---------- */
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    $$("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(t === "dark"));
      b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
      b.title = b.getAttribute("aria-label");
    });
  }
  applyTheme(root.getAttribute("data-theme") || "light");
  $$("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      store("fcbb-theme", next); applyTheme(next);
    });
  });

  /* ---------- RTL toggle ---------- */
  function applyDir(d) {
    root.setAttribute("dir", d);
    $$("[data-rtl-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(d === "rtl"));
      b.setAttribute("aria-label", d === "rtl" ? "Switch to left-to-right layout" : "Switch to right-to-left layout");
      b.title = b.getAttribute("aria-label");
    });
  }
  applyDir(root.getAttribute("dir") || "ltr");
  $$("[data-rtl-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var next = root.getAttribute("dir") === "rtl" ? "ltr" : "rtl";
      store("fcbb-dir", next); applyDir(next);
    });
  });

  /* ---------- Mobile menu + dropdowns ---------- */
  var navBtn = $("[data-nav-toggle]"), panel = $("#mobile-panel");
  function closePanel() { if (!panel) return; panel.classList.remove("is-open"); navBtn.setAttribute("aria-expanded", "false"); navBtn.setAttribute("aria-label", "Open menu"); }
  if (navBtn && panel) {
    navBtn.addEventListener("click", function () {
      var open = panel.classList.toggle("is-open");
      navBtn.setAttribute("aria-expanded", String(open));
      navBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });
    $$("a", panel).forEach(function (a) { a.addEventListener("click", closePanel); });
    window.addEventListener("resize", function () { if (window.innerWidth >= 1180) closePanel(); });
  }
  $$("[data-m-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var sub = b.nextElementSibling, open = sub.classList.toggle("is-open");
      b.setAttribute("aria-expanded", String(open));
    });
  });
  function closeDrop(li) { li.classList.remove("is-open"); $(".site-nav__link", li).setAttribute("aria-expanded", "false"); }
  $$(".has-dropdown").forEach(function (li) {
    var btn = $(".site-nav__link", li);
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      li.classList.remove("is-dismissed");
      var open = li.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", String(open));
    });
    li.addEventListener("mouseenter", function () { if (!li.classList.contains("is-dismissed")) btn.setAttribute("aria-expanded", "true"); });
    li.addEventListener("mouseleave", function () { li.classList.remove("is-dismissed"); closeDrop(li); });
    li.addEventListener("focusout", function (e) { if (li.contains(e.relatedTarget)) return; li.classList.remove("is-dismissed"); closeDrop(li); });
  });
  doc.addEventListener("click", function () { $$(".has-dropdown.is-open").forEach(closeDrop); });
  doc.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;
    if (panel && panel.classList.contains("is-open")) { closePanel(); navBtn.focus(); }
    $$(".has-dropdown").forEach(function (li) {
      var focused = li.contains(doc.activeElement);
      if (!(li.classList.contains("is-open") || focused || li.matches(":hover"))) return;
      closeDrop(li);
      li.classList.add("is-dismissed");                  /* hide it even while hovered / focused */
      if (focused) $(".site-nav__link", li).focus();     /* return focus to the Home button */
    });
  });

  /* ---------- Reveal on scroll (IntersectionObserver, no scroll listeners) ---------- */
  var reveals = $$(".reveal");
  if ("IntersectionObserver" in window && reveals.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
  } else { reveals.forEach(function (el) { el.classList.add("is-in"); }); }

  /* ---------- Back to top (passive, rAF-throttled) ---------- */
  var top = $(".back-top");
  if (top) {
    var ticking = false;
    window.addEventListener("scroll", function () {
      if (ticking) return; ticking = true;
      requestAnimationFrame(function () { top.classList.toggle("is-visible", window.scrollY > 700); ticking = false; });
    }, { passive: true });
    top.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  }

  /* ---------- Footer year ---------- */
  $$("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- Form validation ---------- */
  var V = window.Validators;
  var RULES = {
    name: function (v) { return V.name(v); },
    email: function (v) { return V.email(v); },
    phone: function (v) { return V.phone(v); },
    select: function (v) { return V.select(v); },
    message: function (v, el) { return V.message(v, Number(el.getAttribute("data-min")) || 10); },
    amount: function (v) { return V.amount(v); },
    checked: function (v, el) { return V.checked(el.checked); },
    required: function (v, el) { return V.required(v, el.getAttribute("data-label")); }
  };

  function setState(field, res) {
    var wrap = field.closest(".field") || field.parentNode, err = $(".field-error", wrap);
    wrap.classList.toggle("is-invalid", !res.valid);
    wrap.classList.toggle("is-valid", res.valid && String(field.value).trim() !== "");
    field.setAttribute("aria-invalid", String(!res.valid));
    if (err) err.textContent = res.valid ? "" : res.message;
  }
  /* Tie each error message to its field for screen readers. */
  function wireError(field) {
    var wrap = field.closest(".field") || field.parentNode, err = $(".field-error", wrap);
    if (!err) return;
    if (!err.id) err.id = (field.id || field.name || "field") + "-error";
    var ids = (field.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
    if (ids.indexOf(err.id) === -1) ids.push(err.id);
    field.setAttribute("aria-describedby", ids.join(" "));
  }
  function check(field) {
    var rule = RULES[field.getAttribute("data-validate")];
    if (!rule) return true;
    var res = rule(field.value, field);
    setState(field, res);
    return res.valid;
  }

  $$("form[data-validate-form]").forEach(function (form) {
    form.setAttribute("novalidate", "novalidate");
    var fields = $$("[data-validate]", form);
    fields.forEach(function (f) {
      var type = f.getAttribute("data-validate");
      wireError(f);
      f.setAttribute("aria-required", "true");   /* every validated field is required */
      if (type === "phone" || type === "amount") {      /* digits only: letters are never accepted while typing */
        f.addEventListener("input", function () {
          var clean = V.digitsOnly(f.value);
          if (clean !== f.value) { f.value = clean; setState(f, { valid: false, message: type === "phone" ? "Phone number can only contain digits (0-9)." : "Digits only, please." }); }
          else if (f.closest(".field").classList.contains("is-invalid")) check(f);
        });
      } else {
        f.addEventListener("input", function () { if (f.closest(".field").classList.contains("is-invalid")) check(f); });
      }
      f.addEventListener("blur", function () { if (String(f.value).trim() !== "" || f.closest(".field").classList.contains("is-invalid")) check(f); });
      if (f.tagName === "SELECT" || f.type === "checkbox") f.addEventListener("change", function () { check(f); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (f) { if (!check(f) && !firstBad) firstBad = f; });
      var status = $(".form-status", form);
      if (firstBad) { if (status) status.classList.remove("is-visible"); firstBad.focus(); return; }
      /* Front-end only project: no backend, so show a confirmation instead of posting. */
      if (status) { status.textContent = form.getAttribute("data-success") || "Thank you! Your details are complete. This preview site doesn’t send forms yet, so nothing was sent."; status.classList.add("is-visible"); }
      form.reset();
      fields.forEach(function (f) { var w = f.closest(".field"); if (w) w.classList.remove("is-valid", "is-invalid"); f.removeAttribute("aria-invalid"); });
    });
  });

  /* ---------- Listing filter (Buy a Business) ---------- */
  var filter = $("[data-listing-filter]");
  if (filter) {
    var cards = $$("[data-listing]"), note = $("[data-results-count]"), empty = $("[data-empty]");
    var q = $("[name=q]", filter), cat = $("[name=category]", filter), price = $("[name=price]", filter);
    var run = function () {
      var term = q.value.trim().toLowerCase(), c = cat.value, p = price.value, shown = 0;
      cards.forEach(function (card) {
        var price_ = Number(card.getAttribute("data-price")), hay = card.getAttribute("data-search").toLowerCase();
        var okTerm = !term || hay.indexOf(term) !== -1;
        var okCat = !c || card.getAttribute("data-category") === c;
        var okPrice = true;
        if (p) { var r = p.split("-"); okPrice = price_ >= Number(r[0]) && price_ <= Number(r[1]); }
        var show = okTerm && okCat && okPrice;
        card.hidden = !show; if (show) shown++;
      });
      if (note) note.textContent = shown + (shown === 1 ? " business" : " businesses") + " found";
      if (empty) empty.classList.toggle("is-visible", shown === 0);
    };
    filter.addEventListener("submit", function (e) { e.preventDefault(); run(); });
    filter.addEventListener("input", run); filter.addEventListener("change", run);
    var reset = $("[data-filter-reset]", filter);
    if (reset) reset.addEventListener("click", function () { filter.reset(); run(); });
    run();
  }

  /* ---------- Blog search (filters the articles on this page; category/tag links use ?q=) ---------- */
  var blogForm = $("[data-blog-search]"), posts = $("[data-blog-posts]");
  if (blogForm && posts) {
    var input = $("input[name=q]", blogForm), articles = $$("article", posts);
    var count = $("[data-blog-count]"), none = $("[data-blog-empty]");
    var search = function () {
      var term = input.value.trim().toLowerCase(), shown = 0;
      articles.forEach(function (a) {
        var show = !term || a.textContent.toLowerCase().indexOf(term) !== -1;
        a.hidden = !show; if (show) shown++;
      });
      if (count) count.textContent = term ? shown + (shown === 1 ? " article" : " articles") + " found for “" + input.value.trim() + "”" : "";
      if (none) none.classList.toggle("is-visible", shown === 0);
    };
    try { input.value = new URLSearchParams(location.search).get("q") || ""; } catch (e) { /* old browsers: show all */ }
    blogForm.addEventListener("submit", function (e) {
      e.preventDefault(); search();
      try { history.replaceState(null, "", input.value.trim() ? "?q=" + encodeURIComponent(input.value.trim()) : location.pathname); } catch (err) { /* file:// */ }
    });
    input.addEventListener("input", search);
    search();
  }
})();
