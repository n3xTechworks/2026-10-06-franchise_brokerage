/* Behaviour tests: loads the built pages in jsdom WITH the real scripts and drives the forms, toggles and filter. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { JSDOM } = require("jsdom");

const ROOT = path.join(__dirname, "..");
function load(page) {
  const dom = new JSDOM(fs.readFileSync(path.join(ROOT, page + ".html"), "utf8"), { runScripts: "outside-only", pretendToBeVisual: true, url: "http://localhost/" + page + ".html" });
  const w = dom.window;
  w.IntersectionObserver = class { observe() {} unobserve() {} disconnect() {} };
  w.scrollTo = () => {};
  w.eval(fs.readFileSync(path.join(ROOT, "assets/js/validators.js"), "utf8"));
  w.eval(fs.readFileSync(path.join(ROOT, "assets/js/main.js"), "utf8"));
  return w;
}
const fire = (w, el, type) => el.dispatchEvent(new w.Event(type, { bubbles: true, cancelable: true }));
function fill(w, form, name, value) { const el = form.querySelector(`[name="${name}"]`); el.value = value; fire(w, el, "input"); fire(w, el, "blur"); return el; }
const err = (el) => el.closest(".field").querySelector(".field-error").textContent;
const invalid = (el) => el.closest(".field").classList.contains("is-invalid");

for (const page of ["contact", "sell-your-business", "buy-a-business", "blog", "blog-details"]) {
  test(`${page}: forms reject bad name/email/phone and accept good data`, () => {
    const w = load(page);
    const forms = [...w.document.querySelectorAll("form[data-validate-form]")];
    assert.ok(forms.length >= 1, "has a validated form");
    for (const form of forms) {
      const nameEl = form.querySelector('[data-validate="name"]'), emailEl = form.querySelector('[data-validate="email"]'), phoneEl = form.querySelector('[data-validate="phone"]');
      if (nameEl) {
        for (const bad of ["A", "John3", "1234"]) { fill(w, form, nameEl.name, bad); assert.ok(invalid(nameEl), `name "${bad}" should be rejected`); }
        fill(w, form, nameEl.name, "Jane Doe"); assert.ok(!invalid(nameEl));
      }
      if (emailEl) {
        for (const bad of ["abc", "abc@", "abc@example", "@example.com"]) { fill(w, form, emailEl.name, bad); assert.ok(invalid(emailEl), `email "${bad}" should be rejected`); assert.ok(err(emailEl).length > 0); }
        fill(w, form, emailEl.name, "jane@example.com"); assert.ok(!invalid(emailEl));
      }
      if (phoneEl) {
        fill(w, form, phoneEl.name, "abc123"); assert.equal(phoneEl.value, "123", "letters stripped from phone"); assert.ok(invalid(phoneEl));
        fill(w, form, phoneEl.name, "3125550148"); assert.ok(!invalid(phoneEl));
      }
    }
  });
}

test("contact: empty submit shows errors and no success; valid submit shows success and resets", () => {
  const w = load("contact");
  const form = w.document.querySelector("form[data-validate-form]");
  const status = form.querySelector(".form-status");
  fire(w, form, "submit");
  assert.ok(form.querySelectorAll(".field.is-invalid").length >= 3);
  assert.ok(!status.classList.contains("is-visible"));
  fill(w, form, "name", "Jane Doe"); fill(w, form, "email", "jane@example.com"); fill(w, form, "phone", "3125550148");
  form.querySelectorAll("select[data-validate]").forEach((s) => { s.value = s.options[1].value; fire(w, s, "change"); });
  const msg = form.querySelector("textarea"); msg.value = "I would like to discuss selling my business."; fire(w, msg, "input");
  form.querySelectorAll('input[type="checkbox"][data-validate]').forEach((c) => { c.checked = true; fire(w, c, "change"); });
  fire(w, form, "submit");
  assert.equal(form.querySelectorAll(".field.is-invalid").length, 0);
  assert.ok(status.classList.contains("is-visible"));
  assert.equal(form.querySelector('[name="name"]').value, "");
});

test("toggles: theme and RTL switch attributes and persist", () => {
  const w = load("index");
  const d = w.document.documentElement;
  assert.equal(d.getAttribute("data-theme"), "light");
  w.document.querySelector("[data-theme-toggle]").click();
  assert.equal(d.getAttribute("data-theme"), "dark");
  assert.equal(w.localStorage.getItem("fcbb-theme"), "dark");
  w.document.querySelector("[data-rtl-toggle]").click();
  assert.equal(d.getAttribute("dir"), "rtl");
  w.document.querySelector("[data-rtl-toggle]").click();
  assert.equal(d.getAttribute("dir"), "ltr");
});

test("mobile menu opens/closes and Home dropdown toggles", () => {
  const w = load("index");
  const btn = w.document.querySelector("[data-nav-toggle]"), panel = w.document.getElementById("mobile-panel");
  btn.click(); assert.ok(panel.classList.contains("is-open")); assert.equal(btn.getAttribute("aria-expanded"), "true");
  btn.click(); assert.ok(!panel.classList.contains("is-open"));
  const dd = w.document.querySelector(".has-dropdown > .site-nav__link");
  dd.click(); assert.ok(dd.parentElement.classList.contains("is-open"));
});

test("buy page: filter by industry, price, search, reset and empty state", () => {
  const w = load("buy-a-business");
  const f = w.document.querySelector("[data-listing-filter]");
  const cards = [...w.document.querySelectorAll("[data-listing]")];
  const visible = () => cards.filter((c) => !c.hidden).length;
  assert.equal(visible(), cards.length);
  const cat = f.querySelector('[name="category"]');
  const first = cards[0].getAttribute("data-category");
  cat.value = first; fire(w, cat, "change");
  assert.equal(visible(), cards.filter((c) => c.getAttribute("data-category") === first).length);
  f.querySelector("[data-filter-reset]").click(); assert.equal(visible(), cards.length);
  const q = f.querySelector('[name="q"]'); q.value = "zzzz-no-match"; fire(w, q, "input");
  assert.equal(visible(), 0); assert.ok(w.document.querySelector("[data-empty]").classList.contains("is-visible"));
  q.value = ""; fire(w, q, "input");
  const price = f.querySelector('[name="price"]');
  [...price.options].filter((o) => o.value).forEach((o) => {
    price.value = o.value; fire(w, price, "change");
    const [lo, hi] = o.value.split("-").map(Number);
    assert.ok(visible() > 0, `price range ${o.value} returns listings`);
    cards.filter((c) => !c.hidden).forEach((c) => { const p = Number(c.getAttribute("data-price")); assert.ok(p >= lo && p <= hi); });
  });
});
