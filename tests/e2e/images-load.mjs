import { chromium } from "playwright";
const pages = ["index","home-2","about","buy-a-business","sell-your-business","blog","blog-details","contact"];
const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1280,height:900}});
for (const pg of pages) {
  await p.goto(`http://localhost:8080/${pg}.html`, {waitUntil:"load"});
  await p.evaluate(async()=>{ for (const i of document.images){ i.scrollIntoView(); await new Promise(r=>setTimeout(r,120)); } await new Promise(r=>setTimeout(r,800)); });
  const bad = await p.evaluate(()=>[...document.images].filter(i=>!(i.complete&&i.naturalWidth>0)).map(i=>i.getAttribute("src")));
  console.log(pg, bad.length? "BAD "+bad.join(","): "all "+(await p.evaluate(()=>document.images.length))+" images ok");
}
await b.close();
