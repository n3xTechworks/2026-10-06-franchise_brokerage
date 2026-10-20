/* Static checks over the built pages: links, anchors, images, forms, branding rules from the client checklist. */
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..");
const PAGES = ["index", "home-2", "about", "buy-a-business", "sell-your-business", "blog", "blog-details", "contact"];
const html = Object.fromEntries(PAGES.map((p) => [p, fs.readFileSync(path.join(ROOT, p + ".html"), "utf8")]));
const exists = (rel) => fs.existsSync(path.join(ROOT, rel.split("#")[0].split("?")[0]));
const tags = (src, name) => [...src.matchAll(new RegExp(`<${name}\\b[^>]*>`, "gi"))].map((m) => m[0]);
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\s${name}\\s*=\\s*("([^"]*)"|'([^']*)')`, "i")); return m ? (m[2] ?? m[3]) : null; };
const main = (src) => src.match(/<main[\s\S]*<\/main>/)[0];

test("all required pages exist", () => PAGES.forEach((p) => assert.ok(exists(p + ".html"), p)));

test("no login/sign-up pages (Dashboard: No)", () => {
  assert.ok(!exists("login.html") && !exists("signup.html"));
});

for (const p of PAGES) {
  const src = html[p];

  test(`${p}: head basics, single h1, favicon, title/description`, () => {
    assert.match(src, /<title>[^<]{10,}<\/title>/);
    assert.match(src, /<meta name="description" content="[^"]{50,}"/);
    assert.match(src, /<link rel="icon" href="assets\/img\/favicon\.svg"/);
    assert.match(src, /<link rel="apple-touch-icon"/);
    assert.equal((src.match(/<h1[\s>]/g) || []).length, 1, "exactly one <h1>");
    assert.match(src, /lang="en"/);
  });

  test(`${p}: logo + brand name link to the home page, same markup on every page`, () => {
    const brand = [...src.matchAll(/<a class="brand" href="([^"]+)"/g)].map((m) => m[1]);
    assert.equal(brand.length, 2, "header + footer logo");
    brand.forEach((h) => assert.equal(h, "index.html"));
    assert.match(src, /<img class="brand__mark" src="assets\/img\/logo-mark\.svg" alt="" width="44" height="44">/);
  });

  test(`${p}: navbar has Home dropdown (Home 1/Home 2), theme + RTL toggles and the primary CTA`, () => {
    const header = src.match(/<header[\s\S]*?<\/header>/)[0];
    assert.match(header, /class="has-dropdown[^"]*"[\s\S]*?Home 1[\s\S]*?Home 2/);
    assert.match(header, /href="index\.html"[^>]*>Home 1/);
    assert.match(header, /href="home-2\.html"[^>]*>Home 2/);
    assert.match(header, /data-theme-toggle/);
    assert.match(header, /data-rtl-toggle/);
    assert.match(header, /class="btn btn-primary header-cta" href="contact\.html"/);
    ["about", "buy-a-business", "sell-your-business", "blog", "contact"].forEach((s) => assert.ok(header.includes(`href="${s}.html"`), s));
  });

  test(`${p}: footer has social icons and aligned columns`, () => {
    const footer = src.match(/<footer[\s\S]*<\/footer>/)[0];
    ["facebook", "linkedin", "instagram", "youtube"].forEach((n) => assert.ok(footer.includes(`#i-${n}`), n));
    assert.equal((footer.match(/class="footer-col"/g) || []).length, 4);
    assert.match(footer, /<h3>Quick Links<\/h3>/);
  });

  test(`${p}: every internal link/anchor resolves, no empty "#" links`, () => {
    const ids = new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const a of tags(src, "a")) {
      const href = attr(a, "href");
      assert.ok(href !== null, `anchor without href: ${a}`);
      assert.notEqual(href, "#", `empty href: ${a}`);
      if (/^(https?:|mailto:|tel:)/.test(href)) continue;
      if (href.startsWith("#")) { assert.ok(ids.has(href.slice(1)), `missing id ${href}`); continue; }
      assert.ok(exists(href), `broken link ${href}`);
      const [, hash] = href.split("#");
      if (hash) assert.match(fs.readFileSync(path.join(ROOT, href.split("#")[0]), "utf8"), new RegExp(`id="${hash}"`), `missing anchor ${href}`);
    }
  });

  test(`${p}: images exist, have alt + dimensions, lazy-loaded unless hero, no hot-linked photos`, () => {
    for (const img of tags(main(src), "img")) {
      const s = attr(img, "src");
      assert.ok(s && !/^https?:/.test(s), `local images only: ${img}`);
      assert.ok(exists(s), `missing image ${s}`);
      assert.ok(attr(img, "alt") !== null, `alt missing: ${s}`);
      assert.ok(attr(img, "width") && attr(img, "height"), `width/height missing: ${s}`);
      if (!/hero__bg/.test(img)) assert.equal(attr(img, "loading"), "lazy", `lazy: ${s}`);
      assert.ok(fs.statSync(path.join(ROOT, s)).size < 260 * 1024, `image too heavy: ${s}`);
    }
  });

  test(`${p}: duplicate ids, placeholder text`, () => {
    const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    const dups = ids.filter((x, i) => ids.indexOf(x) !== i);
    assert.deepEqual(dups, [], "duplicate ids");
    assert.doesNotMatch(src, /lorem ipsum/i);
  });

  test(`${p}: hero is centred and has at most two CTAs`, () => {
    const hero = src.match(/<section class="hero[^"]*"[\s\S]*?<\/section>/);
    if (!hero) return;
    assert.match(hero[0], /hero__inner/);
    assert.ok((hero[0].match(/class="btn /g) || []).length <= 2, "max two hero CTAs");
  });

  test(`${p}: forms use validation hooks (name/email/phone rules wired, no native pattern attrs)`, () => {
    const forms = [...src.matchAll(/<form\b[\s\S]*?<\/form>/g)].map((m) => m[0]).filter((f) => /data-validate-form/.test(f));
    for (const f of forms) {
      assert.match(f, /novalidate/);
      for (const input of [...tags(f, "input"), ...tags(f, "select"), ...tags(f, "textarea")].filter((t) => /data-validate=/.test(t))) {
        const name = attr(input, "name") || "";
        const rule = attr(input, "data-validate");
        if (/name/.test(name) && !/business|company/.test(name)) assert.equal(rule, "name", `name field rule (${name})`);
        if (/email/.test(name)) assert.equal(rule, "email");
        if (/phone|tel/.test(name)) { assert.equal(rule, "phone"); assert.equal(attr(input, "inputmode"), "numeric"); }
      }
      const n = (f.match(/data-validate=/g) || []).length, e = (f.match(/class="field-error"/g) || []).length;
      assert.equal(n, e, "each validated field has an error slot");
      assert.match(f, /class="form-status"/);
    }
  });
}

test("Home 1 and Home 2 have different content and headings", () => {
  const h1 = (s) => s.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)[1].trim();
  assert.notEqual(h1(html["index"]), h1(html["home-2"]));
  const a = main(html["index"]), b = main(html["home-2"]);
  const imgs = (s) => new Set(tags(s, "img").map((t) => attr(t, "src")));
  [...imgs(a)].forEach((i) => assert.ok(!imgs(b).has(i), `shared image ${i}`));
  assert.match(b, /id="services"/);
});

test("Contact page has an embedded map, an FAQ and a validated enquiry form", () => {
  const c = html["contact"];
  assert.match(c, /<iframe[^>]+maps\.google\.com\/maps\?[^"]*output=embed/);
  assert.match(c, /class="faq[ "]/);
  assert.ok((c.match(/<details class="faq-item"/g) || []).length >= 5);
  assert.match(c, /data-validate="name"[\s\S]*data-validate="email"[\s\S]*data-validate="phone"/);
});

test("Sell page has the valuation anchor and seller form; Buy page has listings + filter + buyer form", () => {
  assert.match(html["sell-your-business"], /id="valuation"/);
  assert.match(html["sell-your-business"], /id="sell-form"/);
  assert.ok((html["buy-a-business"].match(/data-listing\s/g) || []).length >= 9);
  assert.match(html["buy-a-business"], /data-listing-filter/);
  assert.match(html["buy-a-business"], /id="buyer-form"/);
});

test("testimonial cards always carry a profile photo", () => {
  for (const p of PAGES) {
    const figs = [...html[p].matchAll(/<figure class="testimonial[\s\S]*?<\/figure>/g)].map((m) => m[0]);
    figs.forEach((f) => assert.match(f, /<img [^>]*testimonial|<img /, `${p}: testimonial without avatar`));
  }
});

test("the same photo is never used on two different pages", () => {
  const seen = new Map();
  for (const p of PAGES) {
    for (const img of tags(main(html[p]), "img")) {
      const s = attr(img, "src");
      if (seen.has(s) && seen.get(s) !== p) assert.fail(`${s} used on ${seen.get(s)} and ${p}`);
      seen.set(s, p);
    }
  }
  // identical bytes under different names
  const crypto = require("node:crypto");
  const hashes = new Map();
  for (const s of seen.keys()) {
    const h = crypto.createHash("md5").update(fs.readFileSync(path.join(ROOT, s))).digest("hex");
    assert.ok(!hashes.has(h), `${s} is byte-identical to ${hashes.get(h)}`);
    hashes.set(h, s);
  }
});

test("shared assets: favicon set, fonts, CSS and JS exist", () => {
  ["assets/img/favicon.svg", "assets/img/favicon.ico", "assets/img/favicon-32.png", "assets/img/apple-touch-icon.png", "assets/img/logo-mark.svg",
   "assets/fonts/pjs-latin.woff2", "assets/css/style.css", "assets/js/main.js", "assets/js/validators.js"].forEach((f) => assert.ok(exists(f), f));
});

test("one primary CTA style: no ad-hoc button colours or inline styles on buttons", () => {
  for (const p of PAGES) {
    for (const a of [...tags(html[p], "a"), ...tags(html[p], "button")].filter((t) => /class="[^"]*\bbtn\b/.test(t)))
      assert.doesNotMatch(a, /style=/, `${p}: inline style on button ${a}`);
  }
});
