/* Article content for blog-details.html?post=<slug>.
   With no slug, blog-details.html shows its static article ("7 Due-Diligence Checks"). */
(function () {
  "use strict";

  var AUTHORS = {
    reyes: { name: "Daniel Reyes", role: "Founder &amp; Managing Partner", img: "assets/img/about/team-1.jpg", bio: "Daniel has closed more than 150 deals across retail, services and hospitality since founding the firm in 2010." },
    carter: { name: "Naomi Carter", role: "Director of Franchise Consulting", img: "assets/img/about/team-2.jpg", bio: "A former multi-unit franchise operator, Naomi helps first-time owners choose, fund and launch the right business." },
    johnson: { name: "Marcus Johnson", role: "Senior Business Broker", img: "assets/img/about/team-3.jpg", bio: "Marcus specialises in sell-side mandates for owner-operated companies, from first valuation to final signature." },
    whitmore: { name: "Elaine Whitmore", role: "Head of Valuation &amp; Due Diligence", img: "assets/img/about/team-4.jpg", bio: "A certified valuation analyst, Elaine turns messy financials into clear, defensible pricing for buyers and sellers." }
  };

  var POSTS = {
    "ready-to-scale": {
      crumb: "Ready to Scale", badge: "Growth", title: "5 Metrics That Show a Business Is Ready to Scale",
      date: "October 8, 2026", author: "reyes", read: "6 min read", tags: ["Growth", "Metrics", "Cash flow"],
      cover: "assets/img/blog/post-1.jpg", coverAlt: "Laptop screen showing a sales dashboard with revenue charts",
      body: "<p>Growing revenue feels like proof that a business is ready to expand, but sales alone can hide thin margins, unhappy customers and a cash squeeze. Before you open a second location or hire a new team, check these five numbers.</p>" +
        "<h2>1. Gross margin that holds as volume grows</h2><p>If margin falls every time sales rise, growth will make the problem bigger. Look for a stable or improving gross margin over at least four quarters, and know which products or services carry it.</p>" +
        "<h2>2. Customer retention and repeat rate</h2><p>Scaling a business that loses customers is like filling a leaking bucket. Track the share of customers who buy again within 12 months and the revenue they bring back.</p>" +
        "<ul><li>Service businesses: aim for 70% or more of clients renewing each year.</li><li>Retail and food: watch the repeat-visit rate and average order value together.</li></ul>" +
        "<h2>3. Customer acquisition cost versus lifetime value</h2><p>A healthy business earns at least three times what it spends to win a customer. If you cannot measure this yet, start with a simple marketing spend divided by new customers each month.</p>" +
        "<blockquote>&ldquo;Expansion multiplies whatever is already true about your business, the good and the bad.&rdquo;</blockquote>" +
        "<h2>4. Operating cash flow, not just profit</h2><p>Growth ties up cash in stock, staff and receivables before the extra revenue arrives. Twelve months of positive operating cash flow and a buffer of three months of expenses are a sensible minimum.</p>" +
        "<h2>5. Systems that run without the owner</h2><p>If every decision still needs you, a second site will stretch you thin. Documented processes, a capable manager and reliable reporting are the clearest signs the business can grow beyond you.</p>" +
        "<h2>Final thoughts</h2><p>Hit four of these five and you are in a strong position to scale. Our advisors can review your numbers and help you decide whether to expand, acquire or prepare for a future sale.</p>"
    },
    "read-financial-statements": {
      crumb: "Reading Financial Statements", badge: "Buying", title: "How to Read a Seller&rsquo;s Financial Statements",
      date: "September 24, 2026", author: "whitmore", read: "8 min read", tags: ["Buying", "Financials", "Due diligence"],
      cover: "assets/img/blog/post-2.jpg", coverAlt: "Tax forms, a calculator and a folder of financial paperwork on a dark desk",
      body: "<p>Every listing comes with a set of numbers, and most buyers are not accountants. You do not need to be one, but you do need to know what each statement tells you and where the important questions hide.</p>" +
        "<h2>1. The profit and loss statement</h2><p>The P&amp;L shows revenue, costs and profit over a period. Read at least three years side by side and look for trends rather than single figures. Rising revenue with falling net profit is a warning sign worth exploring.</p>" +
        "<h2>2. Tax returns as the reality check</h2><p>Owners sometimes present management accounts that look better than what they report to the IRS. Federal tax returns are the most reliable record, so reconcile them with the P&amp;L line by line.</p>" +
        "<h2>3. Add-backs and seller&rsquo;s discretionary earnings</h2><p>Add-backs are expenses that will not continue under a new owner, such as the owner&rsquo;s salary, a personal car or a one-off legal bill. They are added back to profit to calculate seller&rsquo;s discretionary earnings (SDE).</p>" +
        "<ul><li>Ask for receipts or evidence for every add-back.</li><li>Be wary of &ldquo;one-off&rdquo; costs that appear every year.</li><li>Check that a manager&rsquo;s salary is included if you will not work in the business.</li></ul>" +
        "<blockquote>&ldquo;If an add-back cannot be documented, treat it as a real cost.&rdquo;</blockquote>" +
        "<h2>4. The balance sheet</h2><p>The balance sheet lists what the business owns and owes on a given date. Pay attention to inventory value, receivables that may never be collected and any debts or leases that will transfer with the sale.</p>" +
        "<h2>5. Bank statements</h2><p>Finally, compare monthly bank deposits with reported revenue. The numbers should be close; large gaps need an explanation before you make an offer.</p>" +
        "<h2>Final thoughts</h2><p>Reading financials is a skill you build deal by deal. Our valuation team can review a seller&rsquo;s package with you and highlight the questions to ask before you sign a letter of intent.</p>"
    },
    "business-worth-2026": {
      crumb: "Business Valuation 2026", badge: "Selling", title: "What Is My Small Business Worth in 2026?",
      date: "September 10, 2026", author: "johnson", read: "7 min read", tags: ["Selling", "Valuation", "SDE"],
      cover: "assets/img/blog/post-3.jpg", coverAlt: "Smiling small business owner in an apron standing in front of her cafe counter",
      body: "<p>Most owners have a number in mind long before they speak to a broker. The market price, however, comes from earnings, risk and demand. Here is how buyers and lenders will actually value your business this year.</p>" +
        "<h2>1. Start with seller&rsquo;s discretionary earnings</h2><p>For most businesses under $5 million in revenue, value begins with SDE: net profit plus the owner&rsquo;s salary, interest, depreciation and documented personal expenses. It shows the total cash benefit one owner-operator receives.</p>" +
        "<h2>2. Apply an industry multiple</h2><p>Buyers pay a multiple of SDE that reflects the industry and risk. In the Chicago market today, typical ranges are:</p>" +
        "<ul><li><strong>Restaurants and cafes:</strong> 1.8x to 2.6x SDE.</li><li><strong>Home and personal services:</strong> 2.5x to 3.5x SDE.</li><li><strong>B2B services with contracts:</strong> 3x to 4.5x SDE.</li></ul>" +
        "<h2>3. The factors that move your multiple</h2><p>Two businesses with identical earnings can sell for very different prices. Recurring revenue, a diverse customer base, a long lease, trained staff and clean books push the multiple up. Owner dependence and declining sales push it down.</p>" +
        "<blockquote>&ldquo;Buyers pay for predictable cash flow. Everything you do to make it more predictable raises your price.&rdquo;</blockquote>" +
        "<h2>4. Assets, inventory and working capital</h2><p>Equipment is usually included in the multiple, while inventory is often added at cost on the closing date. Agree early how working capital will be handled to avoid surprises later.</p>" +
        "<h2>5. Prepare 12 to 24 months ahead</h2><p>The best results come from owners who plan early: tidy financial records, reduce owner involvement and fix obvious issues before going to market.</p>" +
        "<h2>Final thoughts</h2><p>A professional valuation gives you a realistic range and a plan to improve it. Request a confidential valuation and we will come back within one business day.</p>"
    },
    "first-12-months": {
      crumb: "First 12 Months", badge: "Planning", title: "Your First 12 Months as an Owner: A Planning Framework",
      date: "August 27, 2026", author: "carter", read: "9 min read", tags: ["Planning", "Transition", "Buying"],
      cover: "assets/img/blog/post-4.jpg", coverAlt: "Two colleagues arranging quarterly planning sticky notes on a glass wall",
      body: "<p>Closing day is the start of the hard work, not the end. New owners who plan their first year quarter by quarter keep staff and customers loyal and avoid the cash surprises that catch many first-time buyers.</p>" +
        "<h2>Quarter 1: listen and learn</h2><p>Resist the urge to change everything. Spend the first 90 days with the team, customers and suppliers. Work alongside the previous owner during the agreed transition period and document how things really get done.</p>" +
        "<ul><li>Meet every employee one-on-one.</li><li>Call your top 20 customers to introduce yourself.</li><li>Confirm terms with key suppliers in writing.</li></ul>" +
        "<h2>Quarter 2: stabilise the numbers</h2><p>Set up a simple monthly dashboard covering sales, gross margin, payroll and cash. Compare it with the figures from due diligence so you can spot problems early.</p>" +
        "<h2>Quarter 3: make your first improvements</h2><p>With six months of data, choose two or three changes with clear payback, such as updated pricing, a new marketing channel or better scheduling. Small wins build confidence with your team.</p>" +
        "<blockquote>&ldquo;Your staff are watching to see whether you will protect what works. Earn that trust before you change things.&rdquo;</blockquote>" +
        "<h2>Quarter 4: plan the next year</h2><p>Review the year against your purchase assumptions, set a budget and decide on growth priorities. This is also a good time to check your loan covenants and refinance options.</p>" +
        "<h2>Final thoughts</h2><p>A clear 12-month plan turns a stressful handover into a steady start. Our advisors include transition planning as part of every buyer engagement.</p>"
    },
    "negotiating-price": {
      crumb: "Negotiating the Price", badge: "Buying", title: "Negotiating the Purchase Price: A Buyer&rsquo;s Playbook",
      date: "August 13, 2026", author: "reyes", read: "6 min read", tags: ["Buying", "Negotiation", "Letter of intent"],
      cover: "assets/img/blog/post-5.jpg", coverAlt: "Two professionals shaking hands across a table to close a deal",
      body: "<p>Price matters, but terms often matter more. The best negotiators treat the deal as a package and build trust with the seller while protecting their own downside.</p>" +
        "<h2>1. Base your offer on evidence</h2><p>Anchor your offer to verified earnings and a reasonable multiple for the industry. A well-reasoned offer is harder to dismiss than a low number with no explanation.</p>" +
        "<h2>2. Understand what the seller really wants</h2><p>Many owners care about their staff, their legacy or a quick close as much as the headline price. Ask questions early; meeting those needs can be worth more than an extra few percent.</p>" +
        "<h2>3. Use terms to bridge the gap</h2><ul><li><strong>Seller financing:</strong> part of the price is paid over time, which shows the seller&rsquo;s confidence.</li><li><strong>Earn-outs:</strong> extra payments if the business hits agreed targets.</li><li><strong>Transition support:</strong> paid consulting time from the seller after closing.</li></ul>" +
        "<blockquote>&ldquo;Never negotiate against yourself. Make an offer, explain it and wait for a response.&rdquo;</blockquote>" +
        "<h2>4. Put it in a letter of intent</h2><p>The letter of intent (LOI) sets the price, structure, exclusivity period and key conditions. It is mostly non-binding, but it frames the rest of the deal, so be specific about due diligence and financing contingencies.</p>" +
        "<h2>5. Keep the relationship intact</h2><p>You will likely rely on the seller during the transition. Stay respectful, keep communication through your broker when talks get tense, and avoid surprises late in the process.</p>" +
        "<h2>Final thoughts</h2><p>A good deal is one both sides can live with. Our brokers can help you structure an offer that is competitive and protects you.</p>"
    },
    "financing-sba": {
      crumb: "Financing a Purchase", badge: "Financing", title: "Financing a Business Purchase: SBA Loans and Alternatives",
      date: "July 30, 2026", author: "whitmore", read: "8 min read", tags: ["Financing", "SBA loans", "Seller financing"],
      cover: "assets/img/blog/post-6.jpg", coverAlt: "Pink piggy bank surrounded by gold coins with one coin dropping in",
      body: "<p>Few buyers pay cash for a business. Most combine a bank or SBA loan with their own equity and, often, a seller note. Understanding the options early helps you make a credible offer.</p>" +
        "<h2>1. How SBA 7(a) loans work</h2><p>The SBA 7(a) program guarantees part of a bank loan, which lets lenders offer longer terms (typically 10 years) and lower down payments, often around 10% of the price.</p>" +
        "<ul><li>Loans up to $5 million are available.</li><li>Lenders require a personal guarantee from owners with 20% or more.</li><li>Approval usually takes 45 to 90 days.</li></ul>" +
        "<h2>2. What lenders look for</h2><p>Banks focus on the business&rsquo;s ability to repay. Expect them to review three years of tax returns, a debt service coverage ratio of at least 1.25x, your industry experience and your personal credit.</p>" +
        "<h2>3. Seller financing</h2><p>A seller note covers part of the price, paid back over three to seven years. It reduces the cash you need and keeps the seller invested in a smooth handover. SBA lenders often accept a seller note as part of your equity if it is on standby.</p>" +
        "<blockquote>&ldquo;A seller who is willing to finance part of the deal is telling you they believe in the business.&rdquo;</blockquote>" +
        "<h2>4. Other options</h2><p>Conventional bank loans, equipment financing, home equity and investor partners can all play a role. Each has a different cost and level of risk, so compare them side by side.</p>" +
        "<h2>Final thoughts</h2><p>Line up financing before you fall in love with a business. Our team works with lenders across Chicago and can introduce you to the right one for your deal.</p>"
    }
  };

  var slug = new URLSearchParams(window.location.search).get("post");
  var post = slug && POSTS[slug];
  if (!post) return;
  var author = AUTHORS[post.author];
  function $(s) { return document.querySelector(s); }
  function icon(id) { return '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-' + id + '"/></svg>'; }

  var tmp = document.createElement("div");
  tmp.innerHTML = post.title;
  document.title = tmp.textContent + " | Franchise Consulting & Business Brokerage";

  var crumb = $(".breadcrumb [aria-current]");
  if (crumb) crumb.innerHTML = post.crumb;
  var badge = $(".hero--page .badge");
  if (badge) badge.textContent = post.badge;
  var h1 = $(".hero--page h1");
  if (h1) h1.innerHTML = post.title;
  var meta = $(".hero--page .meta");
  if (meta) meta.innerHTML = "<span>" + icon("calendar") + " " + post.date + "</span><span>" + icon("user") + " " + author.name + "</span><span>" + icon("clock") + " " + post.read + "</span>";

  var article = $("article.article");
  if (article) {
    var cover = article.querySelector("img");
    cover.src = post.cover; cover.alt = post.coverAlt; cover.width = 800; cover.height = 600;
    var tags = article.querySelector(".tags");
    var node = cover.nextElementSibling;
    while (node && node !== tags) { var next = node.nextElementSibling; node.remove(); node = next; }
    cover.insertAdjacentHTML("afterend", post.body);
    tags.innerHTML = "<strong>Tags:</strong>" + post.tags.map(function (t) {
      return '<a class="tag" href="blog.html?q=' + encodeURIComponent(t.toLowerCase()) + '">' + t + "</a>";
    }).join("");
    var who = article.querySelector(".testimonial__who");
    if (who) {
      var img = who.querySelector("img");
      img.src = author.img; img.alt = "Portrait of " + author.name + ", " + tmpText(author.role);
      who.querySelector("strong").textContent = author.name;
      who.querySelector("figcaption span").innerHTML = author.role + ", Franchise Consulting &amp; Business Brokerage";
      who.querySelector("figcaption p").textContent = author.bio;
    }
  }
  function tmpText(html) { var d = document.createElement("div"); d.innerHTML = html; return d.textContent.toLowerCase(); }
})();
