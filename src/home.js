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
  function portraitCard(e) {
    var a = el('a', 'cm-nrow'); a.href = entryUrl(e);
    var content = (e.content && e.content.$t) || '', cats = realLabels((e.category || []).map(function (c) { return c.term; })), lv = levelOf(e);
    var tx = el('span', 'cm-nrow-tx'), top = el('span', 'cm-nrow-k');
    if (cats[0]) top.appendChild(el('b', '', cats[0]));
    if (lv) top.appendChild(el('i', 'cm-lv ' + lvlClass(lv), lv));
    if (top.childNodes.length) tx.appendChild(top);
    tx.appendChild(el('span', 'cm-nrow-t', e.title.$t));
    tx.appendChild(el('span', 'cm-nrow-m', fmtDate(e.published.$t) + ' · ' + readMin(content) + ' min read'));
    a.appendChild(tx);
    var th = thumbOf(e), im = el('span', 'cm-nrow-img'); if (th) { var i = el('img'); i.src = bigImg(th, 160, 160); i.alt = ''; i.loading = 'lazy'; i.width = 64; i.height = 64; im.appendChild(i); }
    a.appendChild(im); return a;
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
    var pg = el('div', 'cm-nlist'); ents.slice(1, 5).forEach(function (e) { pg.appendChild(portraitCard(e)); }); side.appendChild(pg);
    feat.appendChild(main); feat.appendChild(side); wrap.appendChild(feat);
    var hero = heroBlock(ents, feedData.cats); if (hero) wrap.appendChild(hero);
    var cont = continueBlock(); if (cont) wrap.appendChild(cont);
    var anchor = el('div'); wrap.appendChild(anchor); startHereBlock(wrap, anchor);
    var adh = $('.cm-ad-home'); if (adh) wrap.appendChild(adh);
    if (ds.showBannerHome !== 'no') { var ab = authorStrip(); if (ab) wrap.appendChild(ab); }
    var cb = connectBlock('home'); if (cb) wrap.appendChild(cb);
    var ns = newsStrip(); if (ns) wrap.appendChild(ns);
    var sAnchor = el('div'); wrap.appendChild(sAnchor); seriesBlock(wrap, sAnchor);
    if (ents.length > 5) wrap.appendChild(latestBlock(ents));
    var host = el('div', 'cm-cats'); wrap.appendChild(host);
    var row = el('div', 'cm-actions-row'), btn = el('a', 'cm-btn', 'View full articles'); btn.href = '/search'; row.appendChild(btn); wrap.appendChild(row);
    setContent(wrap); randomCats(host, feedData.cats);
  }

  /* =====================================================================
     CONNECT / COMMUNITY: Discord, Telegram, WhatsApp channel, Slack, Reddit,
     any custom link. Shown on the home page, after each post and in the footer.
     Everything comes from settings (Theme > Customize or the JSON gadget).
     ===================================================================== */
  /* brand logos: Simple Icons paths (CC0), 24x24, filled */
  var CH_ICON = {
    discord: 'M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z',
    whatsapp: 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z',
    slack: 'M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z',
    reddit: 'M12 0C5.373 0 0 5.373 0 12c0 3.314 1.343 6.314 3.515 8.485l-2.286 2.286C.775 23.225 1.097 24 1.738 24H12c6.627 0 12-5.373 12-12S18.627 0 12 0Zm4.388 3.199c1.104 0 1.999.895 1.999 1.999 0 1.105-.895 2-1.999 2-.946 0-1.739-.657-1.947-1.539v.002c-1.147.162-2.032 1.15-2.032 2.341v.007c1.776.067 3.4.567 4.686 1.363.473-.363 1.064-.58 1.707-.58 1.547 0 2.802 1.254 2.802 2.802 0 1.117-.655 2.081-1.601 2.531-.088 3.256-3.637 5.876-7.997 5.876-4.361 0-7.905-2.617-7.998-5.87-.954-.447-1.614-1.415-1.614-2.538 0-1.548 1.255-2.802 2.803-2.802.645 0 1.239.218 1.712.585 1.275-.79 2.881-1.291 4.64-1.365v-.01c0-1.663 1.263-3.034 2.88-3.207.188-.911.993-1.595 1.959-1.595Zm-8.085 8.376c-.784 0-1.459.78-1.506 1.797-.047 1.016.64 1.429 1.426 1.429.786 0 1.371-.369 1.418-1.385.047-1.017-.553-1.841-1.338-1.841Zm7.406 0c-.786 0-1.385.824-1.338 1.841.047 1.017.634 1.385 1.418 1.385.785 0 1.473-.413 1.426-1.429-.046-1.017-.721-1.797-1.506-1.797Zm-3.703 4.013c-.974 0-1.907.048-2.77.135-.147.015-.241.168-.183.305.483 1.154 1.622 1.964 2.953 1.964 1.33 0 2.47-.81 2.953-1.964.057-.137-.037-.29-.184-.305-.863-.087-1.795-.135-2.769-.135Z',
    link: 'M10 14a4 4 0 0 0 5.600 0l3-3a4 4 0 0 0-5.600-5.600l-1 1M14 10a4 4 0 0 0-5.600 0l-3 3a4 4 0 0 0 5.600 5.600l1-1'
  };
  var CH = [
    { k: 'discord', n: 'Discord', u: 'discordUrl', c: '#5865f2', t: 'Join our Discord', sub: 'Chat and ask questions' },
    { k: 'telegram', n: 'Telegram', u: 'telegramUrl', c: '#27a7e7', t: 'Join on Telegram', sub: 'Channel with new posts' },
    { k: 'whatsapp', n: 'WhatsApp', u: 'whatsappUrl', c: '#25d366', t: 'Join the WhatsApp channel', sub: 'Updates on your phone' },
    { k: 'slack', n: 'Slack', u: 'slackUrl', c: '#e01e5a', t: 'Join our Slack', sub: 'Workspace for learners' },
    { k: 'reddit', n: 'Reddit', u: 'redditUrl', c: '#ff4500', t: 'Join r/ community', sub: 'Discuss and share' },
    { k: 'link', n: ds.customChannelLabel || 'Community', u: 'customChannelUrl', c: '', t: ds.customChannelLabel || 'Join the community', sub: '' }
  ];
  function channels() {
    var list = CH.filter(function (c) { return /^https?:\/\//.test(ds[c.u] || ''); });
    if (!list.length && /^https?:\/\//.test(ds.communityUrl || '')) list = [{ k: 'link', n: 'Community', u: 'communityUrl', c: '', t: ds.communityLabel || 'Join the community', sub: '' }];
    return list;
  }
  function connectPlace(where) { return ds.showConnect !== 'no' && (ds.connectPlaces || 'home,post,footer').toLowerCase().split(/[\s,]+/).indexOf(where) >= 0; }
  function chIcon(k) {
    var sv = sico(k === 'telegram' ? ICONS.telegram : (CH_ICON[k] || CH_ICON.link));
    if (k === 'link') { sv.setAttribute('class', 'cm-i ln'); sv.setAttribute('fill', 'none'); sv.setAttribute('stroke', 'currentColor'); sv.setAttribute('stroke-width', '2'); sv.setAttribute('stroke-linecap', 'round'); sv.setAttribute('stroke-linejoin', 'round'); }
    else { sv.setAttribute('fill', 'currentColor'); sv.setAttribute('stroke', 'none'); }
    return sv;
  }
  function connectBlock(where) {
    if (!connectPlace(where)) return null;
    var list = channels(); if (!list.length) return null;
    var s = el('section', 'cm-connect cm-connect-' + where), tx = el('div', 'cm-cn-tx');
    tx.appendChild(el('span', 'cm-cn-k', 'Community')); tx.appendChild(el('h2', '', ds.connectTitle || 'Join the community'));
    tx.appendChild(el('p', '', ds.connectText || 'Get new guides first, ask questions and learn with other readers.'));
    var row = el('div', 'cm-cn-row');
    list.forEach(function (c) {
      var a = el('a', 'cm-cn-btn'); a.href = ds[c.u]; a.target = '_blank'; a.rel = 'noopener'; if (c.c) a.style.setProperty('--ch', c.c);
      var ic = el('span', 'cm-cn-ic'); ic.appendChild(chIcon(c.k)); a.appendChild(ic);
      var t = el('span', 'cm-cn-t'); t.appendChild(el('b', '', c.t)); if (c.sub && where !== 'post') t.appendChild(el('small', '', c.sub)); a.appendChild(t);
      a.addEventListener('click', function () { track('join_channel', { channel: c.k, place: where }); }); row.appendChild(a);
    });
    s.appendChild(tx); s.appendChild(row); return s;
  }
  function connectFooter() {
    if (!connectPlace('footer')) return; var list = channels(), f = $('.cm-foot-in'); if (!list.length || !f || $('.cm-cn-foot')) return;
    var r = el('div', 'cm-cn-foot'); r.appendChild(el('span', '', ds.connectTitle || 'Join the community'));
    list.forEach(function (c) { var a = el('a', 'cm-cn-dot'); a.href = ds[c.u]; a.target = '_blank'; a.rel = 'noopener'; a.title = c.n; a.setAttribute('aria-label', c.n); if (c.c) a.style.setProperty('--ch', c.c); a.appendChild(chIcon(c.k)); r.appendChild(a); });
    var b = $('.cm-foot-bottom', f); if (b) f.insertBefore(r, b); else f.appendChild(r);
  }
  connectFooter();
