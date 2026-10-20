import { chromium } from "playwright";
const BASE = process.env.BASE || "http://localhost:8080/";
const pages = ["index","home-2","about","buy-a-business","sell-your-business","blog","blog-details","contact"];
const widths = [360, 768, 1024, 1280];
const themes = ["light","dark"];
const browser = await chromium.launch();
const issues = [];
const logoSizes = new Set();

import { contrastFn } from "./contrast.mjs";

for (const theme of themes) {
  const ctx = await browser.newContext({ viewport: {width:1280,height:900} });
  await ctx.addInitScript((t) => { try { localStorage.setItem("fcbb-theme", t); } catch(e){} }, theme);
  const page = await ctx.newPage();
  const errs = [];
  page.on("console", m => { if (m.type()==="error") errs.push(m.text()); });
  page.on("pageerror", e => errs.push("pageerror: "+e.message));
  page.on("requestfailed", r => { if (!/maps\.google|google\.com/.test(r.url())) errs.push("reqfail "+r.url()); });
  for (const p of pages) for (const w of widths) {
    await page.setViewportSize({width:w, height:900});
    await page.goto(BASE+p+".html", {waitUntil:"load"});
    await page.addStyleTag({content:"*,*::before,*::after{transition:none!important;animation:none!important}.reveal{opacity:1!important;transform:none!important}"});
    await page.waitForTimeout(150);
    const tag = `${p}@${w}/${theme}`;
    const r = await page.evaluate(() => {
      const de = document.documentElement; const vw = de.clientWidth; const over = [];
      document.querySelectorAll("body *").forEach(el => { const b = el.getBoundingClientRect(); if (b.width && (b.right > vw+1 || b.left < -1) && !el.closest(".sr-only,.skip-link,.back-top,.mobile-panel:not(.is-open),.dropdown") ) { const cs = getComputedStyle(el); if (cs.position!=="fixed") over.push(el.tagName+"."+(el.className?.toString().slice(0,30))+" "+Math.round(b.left)+"-"+Math.round(b.right)); } });
      const broken = [...document.images].filter(i => i.complete && i.naturalWidth===0).map(i=>i.src);
      const brand = document.querySelector(".site-header .brand__mark").getBoundingClientRect();
      const bt = document.querySelector(".site-header .brand__text strong").getBoundingClientRect();
      const ctl = [...document.querySelectorAll(".header-actions .icon-btn:not(.nav-toggle), .header-actions .header-cta")].filter(e=>e.offsetParent).map(e=>{const b=e.getBoundingClientRect(); return {h:Math.round(b.height), r:getComputedStyle(e).borderRadius}});
      return { scrollW: de.scrollWidth, vw, over: over.slice(0,5), broken, logo: Math.round(brand.width)+"x"+Math.round(brand.height)+"/"+Math.round(bt.width), ctl };
    });
    if (r.scrollW > r.vw) issues.push(`${tag}: horizontal overflow ${r.scrollW}>${r.vw}`);
    if (r.over.length) issues.push(`${tag}: elements outside viewport: ${r.over.join(" | ")}`);
    if (r.broken.length) issues.push(`${tag}: broken images ${r.broken.join(",")}`);
    logoSizes.add(`${w}:${r.logo}`);
    if (w>=1180) { const hs = new Set(r.ctl.map(c=>c.h)), rs = new Set(r.ctl.map(c=>c.r)); if (hs.size!==1 || rs.size!==1) issues.push(`${tag}: header controls differ ${JSON.stringify(r.ctl)}`); }
    const low = await page.evaluate(contrastFn);
    if (low.length) issues.push(`${tag}: contrast ${JSON.stringify(low.slice(0,6))}${low.length>6?" +"+(low.length-6):""}`);
  }
  if (errs.length) issues.push(`[${theme}] console: ${[...new Set(errs)].slice(0,6).join(" || ")}`);
  await ctx.close();
}
console.log("logo sizes by width:", [...logoSizes].sort().join("  "));
console.log(issues.length ? issues.join("\n") : "NO ISSUES");
await browser.close();
