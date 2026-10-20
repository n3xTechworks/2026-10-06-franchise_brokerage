// Browser interaction test for Franchise Consulting & Business Brokerage (06. franchise_brokerage).
// Needs Chrome + playwright-core (not installed in this site):
//   NODE_PATH=C:/Users/ELCOT/Downloads/qa-tools/node_modules node tests/interaction.test.cjs
// Covers: Home dropdown (hover/click/keyboard/Escape), mobile menu, theme + RTL persistence, every link,
// form rejection/acceptance cases, FAQ, map, listing filter, blog search, no login/dashboard, console errors.
'use strict';
const C = {
  marketingPages: ['index.html', 'home-2.html', 'about.html', 'buy-a-business.html', 'sell-your-business.html', 'blog.html', 'blog-details.html', 'contact.html'],
  dropBtn: '.site-header .has-dropdown > .site-nav__link',
  dropMenu: '.site-header .has-dropdown > .dropdown',
  menuBtn: '.site-header [data-nav-toggle]',
  drawer: '#mobile-panel',
  mobileExpand: '#mobile-panel [data-m-toggle]',
  themeBtn: '.site-header [data-theme-toggle]',
  rtlBtn: '.site-header [data-rtl-toggle]',
  navLinks: '.site-header nav.site-nav a',
  jsAnchors: [],
  phoneStrips: true, // letters typed or pasted into phone fields are removed as you type
  contactForm: { form: 'form.form-card', name: '#c-name', email: '#c-email', phone: '#c-phone', submit: 'form.form-card [type=submit]', success: 'form.form-card .form-status' },
  otherForms: [
    ['buy-a-business.html', 'form.form-card', '.form-status'],
    ['sell-your-business.html', 'form.form-card', '.form-status'],
    ['blog.html', 'form[data-validate-form]', '.form-status'],
    ['blog-details.html', 'form.form-card', '.form-status'],
  ],
  faqCheck: async () => {
    const tick = () => new Promise((r) => setTimeout(r, 80));
    const items = [...document.querySelectorAll('.faq details')];
    if (items.length < 4) return 'only ' + items.length + ' FAQ items';
    for (const d of items) {
      const s = d.querySelector('summary');
      if (d.open) { s.click(); await tick(); }
      s.click(); await tick();
      if (!d.open || d.querySelector('p').getBoundingClientRect().height < 4) return 'did not open: ' + s.textContent.trim().slice(0, 40);
      s.click(); await tick();
      if (d.open) return 'did not close';
    }
    return true;
  },
  async extra({ page, BASE, ok, settle }) {
    // Dashboard: NO
    const fs = require('fs'), path = require('path');
    const root = path.join(__dirname, '..');
    const pages = fs.readdirSync(root).filter((f) => f.endsWith('.html'));
    ok('no login/sign-up/dashboard pages or links', !pages.some((p) => /login|signup|dashboard/i.test(p)) && !pages.some((p) => /href="[^"]*(login|signup|sign-up|dashboard)[^"]*"/i.test(fs.readFileSync(path.join(root, p), 'utf8'))));

    // Phone: pasted symbols are stripped consistently
    await page.goto(BASE + 'contact.html', { waitUntil: 'load' });
    await page.fill('#c-phone', '(312) 555-0148');
    ok('pasted "(312) 555-0148" becomes 3125550148', (await page.inputValue('#c-phone')) === '3125550148');

    // Listing filter
    await page.goto(BASE + 'buy-a-business.html', { waitUntil: 'load' });
    const all = await page.$$eval('[data-listing]', (c) => c.filter((x) => !x.hidden).length);
    await page.fill('#f-q', 'zzzz-no-match'); await settle(page);
    const none = await page.$$eval('[data-listing]', (c) => c.filter((x) => !x.hidden).length);
    const emptyShown = await page.$eval('[data-empty]', (e) => getComputedStyle(e).display !== 'none');
    await page.click('[data-filter-reset]'); await settle(page);
    const back = await page.$$eval('[data-listing]', (c) => c.filter((x) => !x.hidden).length);
    ok('buy page: search filter hides listings, shows the empty state, reset restores them', all > 0 && none === 0 && emptyShown && back === all, `${all}/${none}/${back}`);

    // Blog search, category links and empty state
    await page.goto(BASE + 'blog.html', { waitUntil: 'load' });
    const total = await page.$$eval('[data-blog-posts] article', (a) => a.length);
    await page.fill('#blog-search', 'buying'); await page.press('#blog-search', 'Enter'); await settle(page);
    const shown = await page.$$eval('[data-blog-posts] article', (a) => a.filter((x) => !x.hidden).length);
    const note = await page.textContent('[data-blog-count]');
    ok('blog search filters articles in place (no reload) and announces the count', page.url().includes('blog.html') && shown > 0 && shown < total && /found/.test(note), `${shown}/${total} ${note}`);
    await page.goto(BASE + 'blog.html?q=valuation', { waitUntil: 'load' });
    const cat = await page.$$eval('[data-blog-posts] article', (a) => a.filter((x) => !x.hidden).length);
    const listed = await page.$eval('a[href="blog.html?q=valuation"] span:last-child', (s) => Number(s.textContent));
    ok('category link ?q=valuation shows the same number of posts as its count', cat === listed && cat > 0, `${cat} vs ${listed}`);
    await page.fill('#blog-search', 'qwertyuiop'); await settle(page);
    ok('blog search with no match shows the empty state', await page.$eval('[data-blog-empty]', (e) => getComputedStyle(e).display !== 'none'));
    ok('blog has no fake pagination links', (await page.$$('nav[aria-label="Blog pagination"]')).length === 0);
  }
};

/* ------------------------------------------------------------------------------------------
   Engine (identical in 05 and 06): static server + headless Chrome, plain pass/fail output.
   ------------------------------------------------------------------------------------------ */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright-core');

const ROOT = path.join(__dirname, '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.txt': 'text/plain' };
const PAGES = fs.readdirSync(ROOT).filter((f) => f.endsWith('.html') && f !== 'tests.html').sort();

let passed = 0, failed = 0;
const failures = [];
function ok(name, cond, detail) {
  if (cond) { passed++; console.log('  \u2714 ' + name); }
  else { failed++; failures.push(name + (detail ? ' :: ' + detail : '')); console.log('  \u2718 ' + name + (detail ? '  (' + detail + ')' : '')); }
}
const section = (t) => console.log('\n' + t);

const server = http.createServer((req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  const file = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); return res.end('404'); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});

const consoleErrors = [];
async function newPage(ctx) {
  const page = await ctx.newPage();
  page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(page.url().split('/').pop() + ': ' + m.text().slice(0, 160)); });
  page.on('pageerror', (e) => consoleErrors.push(page.url().split('/').pop() + ': ' + e.message.slice(0, 160)));
  return page;
}
const visible = (page, sel) => page.evaluate((s) => {
  const el = document.querySelector(s); if (!el) return false;
  const cs = getComputedStyle(el); const r = el.getBoundingClientRect();
  return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.5 && r.width > 0 && r.height > 0;
}, sel);
const settle = (page) => page.waitForTimeout(350);

// Fill every field of a form with valid data (works for both sites' markup).
async function fillValid(page, formSel) {
  await page.evaluate((fs_) => {
    const form = document.querySelector(fs_);
    const future = new Date(Date.now() + 60 * 86400000).toISOString().slice(0, 10);
    for (const el of form.querySelectorAll('input, select, textarea')) {
      if (el.type === 'hidden' || el.type === 'submit' || el.disabled) continue;
      const key = ((el.getAttribute('data-rule') || el.getAttribute('data-validate') || '') + ' ' + el.type + ' ' + el.name).toLowerCase();
      const set = (v) => { el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); };
      if (el.type === 'checkbox') { if (!el.checked) el.click(); continue; }
      if (el.type === 'radio') { if (!form.querySelector(`input[name="${el.name}"]:checked`)) el.click(); continue; }
      if (el.tagName === 'SELECT') { if (!el.value && el.options.length > 1) { el.selectedIndex = 1; el.dispatchEvent(new Event('change', { bubbles: true })); } continue; }
      if (el.type === 'search') continue;
      if (/match/.test(key)) continue; // confirm-password filled after password
      if (/password/.test(key)) { set('Snapshot2027'); const c = form.querySelector('[data-rule="match"]'); if (c) { c.value = 'Snapshot2027'; } continue; }
      if (/email/.test(key)) set('jess.morgan@example.com');
      else if (/phone|tel/.test(key)) set('5557627627');
      else if (/amount/.test(key)) set('250000');
      else if (/date/.test(key)) set(future);
      else if (/name/.test(key)) set('Jess Morgan');
      else if (el.tagName === 'TEXTAREA' || /message/.test(key)) set('We are planning an event for about 120 guests and would love more details.');
      else if (!el.value) set('Sample answer');
    }
  }, formSel);
}

async function errorState(page, inputSel) {
  return page.evaluate((s) => {
    const i = document.querySelector(s);
    const ids = (i.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    const err = ids.map((id) => document.getElementById(id)).find((e) => e && e.textContent.trim());
    const live = err && (err.getAttribute('aria-live') || err.getAttribute('role'));
    return { invalid: i.getAttribute('aria-invalid') === 'true', msg: err ? err.textContent.trim() : '', live: !!live, value: i.value };
  }, inputSel);
}

async function run() {
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  const BASE = `http://127.0.0.1:${server.address().port}/`;
  const browser = await chromium.launch({ executablePath: CHROME, headless: true });
  const desk = await browser.newContext({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
  const mob = await browser.newContext({ viewport: { width: 360, height: 780 }, reducedMotion: 'reduce', hasTouch: true });
  try {
    const page = await newPage(desk);

    /* 1. Home dropdown: hover, click, keyboard, Escape */
    section('1. Home dropdown');
    for (const p of C.marketingPages) {
      await page.goto(BASE + p, { waitUntil: 'load' }); await settle(page);
      await page.hover(C.dropBtn); await settle(page);
      const hover = await visible(page, C.dropMenu);
      await page.mouse.move(5, 600); await settle(page);
      const away = !(await visible(page, C.dropMenu));
      await page.click(C.dropBtn); await settle(page);
      const clickOpen = (await visible(page, C.dropMenu)) && (await page.getAttribute(C.dropBtn, 'aria-expanded')) === 'true';
      const links = await page.$$eval(C.dropMenu + ' a', (as) => as.map((a) => a.getAttribute('href')));
      await page.keyboard.press('Escape'); await settle(page);
      const escClosed = !(await visible(page, C.dropMenu)) && (await page.getAttribute(C.dropBtn, 'aria-expanded')) === 'false';
      ok(`${p}: opens on hover, closes on leave, opens on click, closes on Escape (while hovered/focused)`, hover && away && clickOpen && escClosed, JSON.stringify({ hover, away, clickOpen, escClosed }));
      ok(`${p}: dropdown holds Home 1 and Home 2`, links.includes('index.html') && links.includes('home-2.html'), links.join(','));
    }
    await page.goto(BASE + 'index.html', { waitUntil: 'load' }); await page.mouse.move(5, 600);
    await page.focus(C.dropBtn); await page.keyboard.press('Enter'); await settle(page);
    const kbOpen = await visible(page, C.dropMenu);
    await page.keyboard.press('Tab'); await settle(page);
    const inMenu = await page.evaluate((s) => document.querySelector(s).contains(document.activeElement), C.dropMenu);
    await page.keyboard.press('Escape'); await settle(page);
    const kbClosed = !(await visible(page, C.dropMenu));
    const focusBack = await page.evaluate((s) => document.activeElement === document.querySelector(s), C.dropBtn);
    ok('keyboard: Enter opens, Tab reaches the links, Escape closes and returns focus to Home', kbOpen && inMenu && kbClosed && focusBack, JSON.stringify({ kbOpen, inMenu, kbClosed, focusBack }));
    await page.keyboard.press('Enter'); await settle(page);
    ok('keyboard: Enter re-opens the menu after Escape', await visible(page, C.dropMenu));

    /* 2. Mobile menu */
    section('2. Mobile menu (360px)');
    const m = await newPage(mob);
    for (const p of C.marketingPages) {
      await m.goto(BASE + p, { waitUntil: 'load' }); await settle(m);
      const btnShown = await visible(m, C.menuBtn);
      await m.click(C.menuBtn); await settle(m);
      const opened = (await visible(m, C.drawer)) && (await m.getAttribute(C.menuBtn, 'aria-expanded')) === 'true';
      await m.keyboard.press('Escape'); await settle(m);
      const closed = !(await visible(m, C.drawer)) && (await m.getAttribute(C.menuBtn, 'aria-expanded')) === 'false';
      ok(`${p}: menu button opens and Escape closes the drawer`, btnShown && opened && closed, JSON.stringify({ btnShown, opened, closed }));
    }
    await m.goto(BASE + 'index.html', { waitUntil: 'load' }); await m.click(C.menuBtn); await settle(m);
    if (C.mobileExpand) { await m.click(C.mobileExpand); await settle(m); }
    await m.click(C.drawer + ' a[href="about.html"]'); await m.waitForLoadState('load');
    ok('mobile menu link navigates (About)', m.url().endsWith('about.html'), m.url());
    await m.goto(BASE + 'index.html', { waitUntil: 'load' }); await m.click(C.menuBtn); await settle(m);
    if (C.mobileExpand) { await m.click(C.mobileExpand); await settle(m); }
    const h2Shown = await visible(m, C.drawer + ' a[href="home-2.html"]');
    ok('mobile menu exposes Home 2', h2Shown);

    /* 3. Theme + RTL toggles persist across pages */
    section('3. Theme and RTL toggles');
    const t = await newPage(await browser.newContext({ viewport: { width: 1280, height: 900 } }));
    await t.goto(BASE + 'index.html', { waitUntil: 'load' });
    const theme0 = await t.getAttribute('html', 'data-theme');
    await t.click(C.themeBtn);
    const theme1 = await t.getAttribute('html', 'data-theme');
    await t.click(C.rtlBtn);
    const dir1 = await t.getAttribute('html', 'dir');
    for (const p of PAGES) {
      await t.goto(BASE + p, { waitUntil: 'load' });
      const th = await t.getAttribute('html', 'data-theme'), dr = await t.getAttribute('html', 'dir');
      const sw = await t.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1);
      ok(`${p}: theme (${th}) and dir (${dr}) persisted, no horizontal scroll in RTL`, th === theme1 && dr === 'rtl' && sw);
    }
    ok('theme toggle flips the theme', theme0 !== theme1 && /^(light|dark)$/.test(theme1), theme0 + ' -> ' + theme1);
    ok('RTL toggle sets dir=rtl', dir1 === 'rtl');
    await t.goto(BASE + 'about.html', { waitUntil: 'load' });
    await t.click(C.themeBtn); await t.click(C.rtlBtn);
    await t.goto(BASE + 'contact.html', { waitUntil: 'load' });
    ok('toggling back persists too (theme restored, dir=ltr)', (await t.getAttribute('html', 'data-theme')) === theme0 && (await t.getAttribute('html', 'dir')) === 'ltr');
    await t.context().close();

    /* 4. Every link: local pages exist, in-page anchors exist, nav links navigate */
    section('4. Links');
    const missing = [];
    for (const p of PAGES) {
      await page.goto(BASE + p, { waitUntil: 'domcontentloaded' });
      const hrefs = await page.$$eval('a[href]', (as) => as.map((a) => a.getAttribute('href')));
      for (const h of hrefs) {
        if (/^(https?:|mailto:|tel:|javascript:)/.test(h)) continue;
        if (h === '#') { missing.push(`${p}: dead href="#"`); continue; }
        const [file, hash] = h.split('#');
        const target = (file || p).split('?')[0];
        if (!fs.existsSync(path.join(ROOT, target))) { missing.push(`${p} -> ${h}`); continue; }
        if (hash) {
          const src = fs.readFileSync(path.join(ROOT, target), 'utf8');
          if (!new RegExp(`id="${hash}"`).test(src) && !C.jsAnchors.includes(hash)) missing.push(`${p} -> ${h} (no #${hash})`);
        }
      }
      const bad = hrefs.filter((h) => /^(tel:|mailto:)/.test(h) && !/^(tel:\+?\d{7,15}|mailto:[^@\s]+@[^@\s]+\.[a-z]{2,})$/i.test(h));
      if (bad.length) missing.push(`${p}: invalid ${bad.join(',')}`);
    }
    ok('every local link, anchor, tel: and mailto: on every page is valid', missing.length === 0, missing.slice(0, 6).join(' | '));
    await page.goto(BASE + 'index.html', { waitUntil: 'load' });
    const navHrefs = await page.$$eval(C.navLinks, (as) => [...new Set(as.map((a) => a.getAttribute('href')))]);
    for (const h of navHrefs) {
      await page.goto(BASE + 'index.html', { waitUntil: 'load' });
      const a = await page.$(`${C.navLinks}[href="${h}"]`);
      if (!(await a.isVisible())) await page.hover(C.dropBtn);
      await a.click(); await page.waitForLoadState('load');
      ok(`header link ${h} navigates`, page.url().split('/').pop() === h, page.url());
    }

    /* 5. Forms */
    section('5. Forms');
    const f = C.contactForm;
    await page.goto(BASE + 'contact.html', { waitUntil: 'load' });
    const nameCases = [['J0hn', false], ['A', false], ['   ', false], ['Jess Morgan', true], ["Anne-Marie O'Neil", true]];
    for (const [v, good] of nameCases) {
      await page.fill(f.name, v); await page.click(f.submit); await settle(page);
      const s = await errorState(page, f.name);
      ok(`name "${v}" ${good ? 'accepted' : 'rejected with an accessible message'}`, good ? !s.invalid : (s.invalid && !!s.msg && s.live), JSON.stringify(s));
    }
    for (const [v, good] of [['jess.example.com', false], ['jess@', false], ['jess@example', false], ['   ', false], ['jess@example.com', true]]) {
      await page.fill(f.email, v); await page.click(f.submit); await settle(page);
      const s = await errorState(page, f.email);
      ok(`email "${v}" ${good ? 'accepted' : 'rejected'}`, good ? !s.invalid : (s.invalid && !!s.msg), JSON.stringify(s));
    }
    for (const [v, good] of [['555abc7627', false], ['   ', false], ['5557627627', true]]) {
      await page.fill(f.phone, ''); await page.type(f.phone, v); await page.click(f.submit); await settle(page);
      const s = await errorState(page, f.phone);
      const handled = C.phoneStrips ? (good ? !s.invalid : /^\d*$/.test(s.value)) : (good ? !s.invalid : s.invalid && !!s.msg);
      ok(`phone typed "${v}" ${good ? 'accepted' : (C.phoneStrips ? 'stripped to digits / flagged' : 'rejected')}`, handled, JSON.stringify(s));
    }
    await page.fill(f.name, 'J0hn'); await page.fill(f.email, 'jess@example.com'); await page.click(f.submit); await settle(page);
    const kept = await page.inputValue(f.name);
    const succHidden = !(await visible(page, f.success));
    ok('invalid submit is blocked, keeps the input and moves focus to the first error', kept === 'J0hn' && succHidden && (await page.evaluate((s) => document.activeElement === document.querySelector(s), f.name)));
    await page.goto(BASE + 'contact.html', { waitUntil: 'load' });
    await fillValid(page, f.form); await page.click(f.submit); await settle(page);
    const succText = (await page.textContent(f.success)) || '';
    ok('valid contact submit shows a success message that does not claim it was sent', (await visible(page, f.success)) && /nothing was sent/i.test(succText), succText.trim().slice(0, 90));
    // keyboard-only submit
    await page.goto(BASE + 'contact.html', { waitUntil: 'load' });
    await page.focus(f.name); await page.keyboard.press('Enter'); await settle(page);
    ok('Enter in a field submits via keyboard and shows errors', (await errorState(page, f.email)).invalid);

    // every other validated form: empty submit errors, valid submit succeeds
    for (const [p, sel, success] of C.otherForms) {
      await page.goto(BASE + p, { waitUntil: 'load' });
      await page.$eval(sel, (form) => form.querySelector('[type=submit],button:not([type])').click()); await settle(page);
      const errs = await page.$$eval(sel + ' [aria-invalid="true"]', (e) => e.length);
      await fillValid(page, sel);
      await page.$eval(sel, (form) => form.querySelector('[type=submit],button:not([type])').click()); await settle(page);
      const txt = await page.$eval(sel, (form, s) => { const e = form.querySelector(s) || form.parentElement.querySelector(s); return e ? e.textContent.trim() : ''; }, success);
      const ok2 = /nothing was sent/i.test(txt);
      ok(`${p} ${sel}: empty submit flags ${errs} field(s); valid submit shows an honest success message`, errs > 0 && ok2, txt.slice(0, 80));
    }

    /* 6. FAQ */
    section('6. FAQ + map');
    await page.goto(BASE + 'contact.html', { waitUntil: 'load' });
    const faqOk = await page.evaluate(C.faqCheck);
    ok('FAQ items open and close', faqOk === true, String(faqOk));
    const map = await page.$eval('iframe', (i) => ({ src: i.src, title: i.title, w: i.getBoundingClientRect().width }));
    ok('contact page embeds a titled Google map', /^https:\/\/(www\.|maps\.)?google\.com\/maps\?/.test(map.src) && !!map.title && map.w > 200, JSON.stringify(map));
    await m.goto(BASE + 'contact.html', { waitUntil: 'load' });
    const mapM = await m.$eval('iframe', (i) => i.getBoundingClientRect().width <= document.documentElement.clientWidth);
    ok('map fits the 360px viewport', mapM);

    /* 7. Site-specific checks */
    section('7. Site-specific');
    await C.extra({ browser, page, m, BASE, ok, visible, settle, fillValid, newPage });

    /* 8. Console */
    section('8. Console');
    ok('no console errors or page errors during the whole run', consoleErrors.length === 0, consoleErrors.slice(0, 5).join(' | '));
  } finally {
    await browser.close();
    server.close();
  }
  console.log(`\nResult: ${passed} passed, ${failed} failed`);
  if (failed) { console.log('Failures:\n - ' + failures.join('\n - ')); process.exitCode = 1; }
}
run().catch((e) => { console.error(e); process.exitCode = 1; server.close(); });
