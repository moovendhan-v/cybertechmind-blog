  /* =====================================================================
     HOME: hero + topic tiles, continue reading, "Start here", featured post,
     newsletter strip, series cards with progress, filterable latest posts,
     random topic panels.
     ===================================================================== */
  function levelOf(e) { var m = /data-level=["']([^"']+)["']/i.exec((e.content && e.content.$t) || ''); return m ? m[1] : ''; }
  function lvlClass(l) { return 'lv-' + l.toLowerCase().replace(/[^a-z]/g, ''); }
  var TOPIC_ICON = { shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', cloud: 'M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1 .5 9z', layout: 'M3 4h18v16H3zM3 9h18M9 9v11', server: 'M4 5h16v6H4zM4 13h16v6H4zM8 8h.01M8 16h.01', code: 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14', tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01' };
  function topicIcon(n) {
    n = n.toLowerCase();
    if (/secur|hack|pentest|cyber|malware|forensic|ctf/.test(n)) return TOPIC_ICON.shield;
    if (/aws|cloud|azure|gcp|devops|terraform|kubern|docker/.test(n)) return TOPIC_ICON.cloud;
    if (/front|react|css|html|vue|ui|ux/.test(n)) return TOPIC_ICON.layout;
    if (/back|api|node|python|java|database|sql|server/.test(n)) return TOPIC_ICON.server;
    if (/full|code|program|dev/.test(n)) return TOPIC_ICON.code;
    return TOPIC_ICON.tag;
  }
  function section(title, link, linkText) {
    var p = el('section', 'cm-panel'), hd = el('div', 'cm-panel-head'); hd.appendChild(el('h2', '', title));
    if (link) { var a = el('a', '', linkText || 'View all →'); a.href = link; hd.appendChild(a); } p.appendChild(hd); return p;
  }
  function heroBlock(ents, cats) {
    if (ds.showHero === 'no') return null;
    var s = el('section', 'cm-hero2');
    s.appendChild(el('span', 'cm-hero2-k', 'Hands-on tech guides'));
    s.appendChild(el('h1', '', ds.heroTitle || 'Learn cybersecurity, AWS and full-stack by doing'));
    s.appendChild(el('p', '', ds.heroSub || 'Practical, tested tutorials with copy-paste code, diagrams and cheat sheets.'));
    var act = el('div', 'cm-hero2-act'), a1 = el('a', 'cm-btn', 'Start learning'), a2 = el('a', 'cm-btn ghost', 'Browse topics'); a1.href = '/search'; a2.href = '#cm-topics';
    a2.addEventListener('click', function (e) { var t = $('#cm-topics'); if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'center' }); } });
    act.appendChild(a1); act.appendChild(a2); s.appendChild(act);
    var tally = {}; ents.forEach(function (e) { realLabels((e.category || []).map(function (c) { return c.term; })).forEach(function (l) { tally[l] = (tally[l] || 0) + 1; }); });
    var top = cats.slice().sort(function (a, b) { return (tally[b] || 0) - (tally[a] || 0); }).slice(0, 4);
    if (top.length) {
      var g = el('div', 'cm-tiles'); g.id = 'cm-topics';
      top.forEach(function (c) { var t = el('a', 'cm-tile'); t.href = '/search/label/' + encodeURIComponent(c); var ic = el('span', 'cm-tile-i'); ic.appendChild(sico(topicIcon(c))); t.appendChild(ic); var tx = el('span', 'cm-tile-t'); tx.appendChild(el('b', '', c)); tx.appendChild(el('small', '', (tally[c] || 0) + ((tally[c] || 0) === 1 ? ' post' : ' posts'))); t.appendChild(tx); t.appendChild(sico(SI.chev, 'cm-tile-go')); g.appendChild(t); });
      s.appendChild(g);
    }
    return s;
  }
  function continueBlock() {
    var map = window.cmRead.posMap(), keys = Object.keys(map).filter(function (k) { return map[k].r < .9; }).sort(function (a, b) { return map[b].t - map[a].t; }).slice(0, 3);
    if (!keys.length) return null;
    var p = section('Continue reading'), g = el('div', 'cm-grid');
    keys.forEach(function (k) {
      var m = map[k], a = el('a', 'cm-post cm-cont'); a.href = k; var im = el('span', 'cm-img'); if (m.thumb) { var i = el('img'); i.src = bigImg(m.thumb, 640, 360); i.alt = ''; i.loading = 'lazy'; im.appendChild(i); } else im.appendChild(el('div', 'cm-noimg'));
      a.appendChild(im); a.appendChild(el('h3', '', m.title));
      var bar = el('span', 'cm-prog'), fill = el('i'); fill.style.width = Math.round(m.r * 100) + '%'; bar.appendChild(fill); a.appendChild(bar); a.appendChild(el('span', 'cm-meta', Math.round(m.r * 100) + '% read · ' + ago(new Date(m.t).toISOString())));
      g.appendChild(a);
    });
    p.appendChild(g); return p;
  }
  function startHereBlock(wrap, before) {
    getJSON('/feeds/posts/default/-/' + encodeURIComponent('Start here') + '?alt=json&max-results=3', function (j) {
      var list = (j && j.feed && j.feed.entry) || []; if (!list.length) return;
      var p = section('Start here'), g = el('div', 'cm-grid'); list.forEach(function (e) { g.appendChild(cardFromEntry(e)); }); p.appendChild(g); wrap.insertBefore(p, before);
    });
  }
  function newsStrip() {
    if (!ds.newsAction || ds.showNews === 'no') return null;
    var s = el('section', 'cm-newsstrip'), tx = el('div'); tx.appendChild(el('h2', '', ds.newsTitle || 'Get new guides in your inbox')); tx.appendChild(el('p', '', ds.newsText || 'One email a week. No spam.'));
    var f = el('form'); f.action = ds.newsAction; f.method = 'post'; f.target = '_blank'; var i = el('input'); i.type = 'email'; i.name = 'EMAIL'; i.required = true; i.placeholder = 'you@example.com'; i.setAttribute('aria-label', 'Email address');
    var b = el('button', 'cm-btn', 'Subscribe'); b.type = 'submit'; f.appendChild(i); f.appendChild(b);
    f.addEventListener('submit', function (e) { if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())) { e.preventDefault(); i.style.borderColor = '#ef4444'; i.focus(); } else track('newsletter_submit', {}); });
    s.appendChild(tx); s.appendChild(f); return s;
  }
  function seriesBlock(wrap, before) {
    var list = (feedData.series || []).slice(0, 4); if (!list.length) return;
    var p = section('Learning paths'), g = el('div', 'cm-series-grid'); p.appendChild(g); wrap.insertBefore(p, before);
    var read = window.cmRead.readSet();
    list.forEach(function (label) {
      var card = el('div', 'cm-scard'); card.appendChild(sk('', '60%', '16px')); card.appendChild(sk('', '100%', '10px')); g.appendChild(card);
      getJSON('/feeds/posts/default/-/' + encodeURIComponent(label) + '?alt=json&max-results=100', function (j) {
        var parts = ((j && j.feed && j.feed.entry) || []).slice().sort(function (a, b) { return new Date(a.published.$t) - new Date(b.published.$t); });
        if (!parts.length) { card.remove(); return; }
        var done = parts.filter(function (x) { return read.indexOf(entryUrl(x).replace(/^http:/, 'https:')) >= 0 || read.indexOf(entryUrl(x)) >= 0; }).length, next = parts.filter(function (x) { return read.indexOf(entryUrl(x)) < 0; })[0] || parts[0];
        card.textContent = ''; card.appendChild(el('span', 'cm-st-k', 'Series')); card.appendChild(el('h3', '', label.replace(/^series\s*:\s*/i, '')));
        card.appendChild(el('span', 'cm-meta', parts.length + (parts.length === 1 ? ' part' : ' parts') + (done ? ' · ' + done + ' read' : '')));
        var bar = el('span', 'cm-prog'), fill = el('i'); fill.style.width = Math.round(done / parts.length * 100) + '%'; bar.appendChild(fill); card.appendChild(bar);
        var a = el('a', 'cm-btn' + (done ? '' : ' ghost'), done ? (done >= parts.length ? 'Read again' : 'Continue') : 'Start series'); a.href = entryUrl(next); card.appendChild(a);
      });
    });
  }
  function latestBlock(ents) {
    var p = section('Latest articles', '/search', 'View full articles →'), chips = el('div', 'cm-fchips'), grid = el('div', 'cm-grid'), cur = 'All';
    var levels = {}, labels = {}; ents.forEach(function (e) { var l = levelOf(e); if (l) levels[l] = 1; realLabels((e.category || []).map(function (c) { return c.term; })).forEach(function (x) { labels[x] = (labels[x] || 0) + 1; }); });
    var order = ['Beginner', 'Intermediate', 'Advanced'].filter(function (l) { return levels[l]; });
    var topL = Object.keys(labels).sort(function (a, b) { return labels[b] - labels[a]; }).slice(0, 4);
    var opts = ['All'].concat(order, topL);
    function matches(e) { if (cur === 'All') return true; if (levelOf(e) === cur) return true; return (e.category || []).some(function (c) { return c.term === cur; }); }
    function draw() {
      grid.textContent = ''; var list = ents.filter(matches).slice(0, 9);
      if (!list.length) grid.appendChild(el('p', 'cm-muted', 'No posts match this filter yet.')).style.padding = '30px';
      list.forEach(function (e) { grid.appendChild(cardFromEntry(e)); });
      $$('button', chips).forEach(function (b) { b.classList.toggle('on', b.textContent === cur); b.setAttribute('aria-pressed', String(b.textContent === cur)); });
    }
    if (opts.length > 2) opts.forEach(function (o) { var b = el('button', 'cm-chip2', o); b.type = 'button'; b.addEventListener('click', function () { cur = o; draw(); track('home_filter', { value: o }); }); chips.appendChild(b); }); else chips.hidden = true;
    p.appendChild(chips); p.appendChild(grid); draw(); return p;
  }
  function authorStrip() {
    var bn = bannerEl('cm-banner-strip'); if (!bn) return null;
    var s = el('section', 'cm-aboutauthor'), h = el('div', 'cm-fkick', 'About the author');
    s.appendChild(h); s.appendChild(bn);
    var cap = el('p', 'cm-cap'), nm = el('b', '', ds.authorName || 'The author');
    cap.appendChild(nm);
    cap.appendChild(document.createTextNode((ds.authorRole ? ' - ' + ds.authorRole + '. ' : '. ') + (ds.authorBio || 'I write practical, tested guides on security, cloud and full-stack.') + ' '));
    var a = el('a', '', 'Meet the author \u2192'); a.href = ds.authorUrl || ds.authorBannerLink || '/'; a.target = '_blank'; a.rel = 'noopener'; cap.appendChild(a);
    s.appendChild(cap); return s;
  }
  function buildHome() {
    homeWanted = false;
    var ents = feedData.ents; if (!ents.length) return;
    var wrap = el('div', 'cm-content');
    var feat = el('section', 'cm-panel cm-feature'), side = el('div', 'cm-hlist'), main = el('div', 'cm-fmain');
    var fk = el('div', 'cm-fkick'); fk.appendChild(el('span', 'cm-live')); fk.appendChild(document.createTextNode('Latest post')); main.appendChild(fk);
    main.appendChild(bigFromEntry(ents[0]));
    side.appendChild(el('div', 'cm-fkick', 'Also new'));
    ents.slice(1, 5).forEach(function (e) { side.appendChild(rowFromEntry(e)); });
    feat.appendChild(main); feat.appendChild(side); wrap.appendChild(feat);
    var hero = heroBlock(ents, feedData.cats); if (hero) wrap.appendChild(hero);
    var cont = continueBlock(); if (cont) wrap.appendChild(cont);
    var anchor = el('div'); wrap.appendChild(anchor); startHereBlock(wrap, anchor);
    var adh = $('.cm-ad-home'); if (adh) wrap.appendChild(adh);
    if (ds.showBannerHome !== 'no') { var ab = authorStrip(); if (ab) wrap.appendChild(ab); }
    var ns = newsStrip(); if (ns) wrap.appendChild(ns);
    var sAnchor = el('div'); wrap.appendChild(sAnchor); seriesBlock(wrap, sAnchor);
    if (ents.length > 5) wrap.appendChild(latestBlock(ents));
    var host = el('div', 'cm-cats'); wrap.appendChild(host);
    var row = el('div', 'cm-actions-row'), btn = el('a', 'cm-btn', 'View full articles'); btn.href = '/search'; row.appendChild(btn); wrap.appendChild(row);
    setContent(wrap); randomCats(host, feedData.cats);
  }
