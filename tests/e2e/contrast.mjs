export const contrastFn = () => {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if(!m) return null; const p = m[1].split(",").map(s=>parseFloat(s)); return {r:p[0],g:p[1],b:p[2],a:p.length>3?p[3]:1}; };
  const lum = ({r,g,b}) => { const f = v => { v/=255; return v<=.03928? v/12.92 : Math.pow((v+.055)/1.055,2.4); }; return .2126*f(r)+.7152*f(g)+.0722*f(b); };
  const blend = (top, bot) => ({ r: top.r*top.a+bot.r*(1-top.a), g: top.g*top.a+bot.g*(1-top.a), b: top.b*top.a+bot.b*(1-top.a), a:1 });
  const bgOf = (el) => { // returns {color} or {image:true}
    const stack = []; let n = el;
    while (n && n.nodeType===1) { const cs = getComputedStyle(n); if (cs.backgroundImage !== "none") return {image:true}; const c = parse(cs.backgroundColor); if (c && c.a>0) { stack.push(c); if (c.a>=1) break; } n = n.parentElement; }
    let base = {r:255,g:255,b:255,a:1}; for (let i=stack.length-1;i>=0;i--) base = blend(stack[i], base); return {color:base};
  };
  const out = [];
  const seen = new Set();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walker.nextNode()) {
    const t = walker.currentNode; if (!t.nodeValue.trim()) continue; const el = t.parentElement; if (!el || seen.has(el)) continue; seen.add(el);
    const cs = getComputedStyle(el); if (cs.visibility==="hidden"||cs.display==="none") continue;
    const r = el.getBoundingClientRect(); if (r.width===0||r.height===0) continue;
    if (el.closest("[hidden],.sr-only,svg,script,style,.mobile-panel:not(.is-open)")) continue;
    // skip opacity-0 ancestors / non-rendered
    let op = 1, n = el; while(n){ op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } if (op < .5) continue;
    const bg = bgOf(el); if (bg.image) continue; // photo overlays checked separately
    let fg = parse(cs.color); fg = blend(fg, bg.color);
    const L1 = lum(fg), L2 = lum(bg.color); const ratio = (Math.max(L1,L2)+.05)/(Math.min(L1,L2)+.05);
    const size = parseFloat(cs.fontSize), bold = parseInt(cs.fontWeight)>=700; const large = size>=24 || (size>=18.66 && bold);
    if (ratio < (large?3:4.5)) out.push({txt: t.nodeValue.trim().slice(0,40), ratio: +ratio.toFixed(2), cls: el.className?.toString().slice(0,40), tag: el.tagName, fg: cs.color, bg: `rgb(${bg.color.r|0},${bg.color.g|0},${bg.color.b|0})`});
  }
  return out;
};
