  /* =====================================================================
     READING + ENGAGEMENT: focus mode, reading controls (size / width / font /
     sepia), resume reading, save for later, up-next card, "was this helpful",
     keyboard shortcuts help, J/K navigation, 404 page, analytics events.
     Everything is stored in the visitor's browser (no account, no backend).
     ===================================================================== */
  function track(name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) {} }
  var LS = {
    get: function (k, dflt) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : dflt; } catch (e) { return dflt; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  };
  var SI2 = { bookmark: 'M6 4h12v17l-6-4-6 4z', focus: 'M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5', aa: 'M3 19 9 5l6 14M5 14h8M16 19l3-8 3 8M17 17h4', code: 'M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14', check: 'M5 13l4 4L19 7', up: 'M7 14l5-5 5 5', thumbUp: 'M7 11v9H4v-9zM7 11l4-8a2 2 0 0 1 2 2v4h6a2 2 0 0 1 2 2l-1 6a2 2 0 0 1-2 2H7', thumbDn: 'M7 13V4H4v9zM7 13l4 8a2 2 0 0 0 2-2v-4h6a2 2 0 0 0 2-2l-1-6a2 2 0 0 0-2-2H7', keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10' };

  /* ---------- reading preferences (applied on every page) ---------- */
  var PREFS = LS.get('cmPrefs', { size: 1, width: 'normal', font: 'sans' });
  function applyPrefs() {
    root.style.setProperty('--rd-scale', PREFS.size);
    root.setAttribute('data-rwidth', PREFS.width); root.setAttribute('data-rfont', PREFS.font);
  }
  function savePrefs() { LS.set('cmPrefs', PREFS); applyPrefs(); }
  applyPrefs();
  function setThemeName(t) { root.setAttribute('data-theme', t); try { localStorage.setItem('cmTheme', t); } catch (e) {} }

  /* ---------- focus mode ---------- */
  var exitPill = null;
  function setFocus(on) {
    root.classList.toggle('focus', on); LS.set('cmFocus', on ? 1 : 0);
    if (on) {
      if (!exitPill) { exitPill = el('button', 'cm-focus-exit'); exitPill.type = 'button'; exitPill.appendChild(sico(SI2.focus)); exitPill.appendChild(el('span', '', 'Exit focus')); exitPill.addEventListener('click', function () { setFocus(false); }); d.body.appendChild(exitPill); }
      track('focus_mode', { on: 1 });
    }
    $$('.cm-tool-focus').forEach(function (b) { b.classList.toggle('on', on); });
  }
  function typingNow() { return /INPUT|TEXTAREA|SELECT/.test(d.activeElement.tagName) || d.activeElement.isContentEditable; }

  /* ---------- read / resume / saved storage ---------- */
  function readSet() { return LS.get('cmRead', []); }
  function markRead(url) { var r = readSet(); if (r.indexOf(url) < 0) { r.push(url); LS.set('cmRead', r.slice(-300)); } }
  function posMap() { return LS.get('cmPos', {}); }
  function savedList() { return LS.get('cmSaved', []); }
  function isSaved(url) { return savedList().some(function (s) { return s.url === url; }); }
  function toggleSaved(item) {
    var l = savedList(), i = -1; l.forEach(function (s, k) { if (s.url === item.url) i = k; });
    if (i >= 0) l.splice(i, 1); else { l.unshift(item); track('save_post', { url: item.url }); }
    LS.set('cmSaved', l.slice(0, 100)); updateSavedBadge(); return i < 0;
  }
  function updateSavedBadge() { var n = savedList().length; $$('.cm-sb-badge').forEach(function (b) { b.textContent = n || ''; b.hidden = !n; }); }

  /* sidebar item "Saved" */
  function savedItem() {
    var li = el('li', 'cm-sb-li'), b = el('button', 'cm-sb-item'); b.type = 'button'; b.title = 'Saved posts';
    b.appendChild(sico(SI2.bookmark)); b.appendChild(el('span', 'cm-sb-label', 'Saved')); var bd = el('span', 'cm-sb-badge'); b.appendChild(bd); li.appendChild(b);
    b.addEventListener('click', openSaved); setTimeout(updateSavedBadge, 0); return li;
  }
  var savedModal = null;
  function openSaved() {
    if (!savedModal) {
      savedModal = el('div', 'cm-find'); savedModal.hidden = true; savedModal.setAttribute('role', 'dialog'); savedModal.setAttribute('aria-label', 'Saved posts');
      var back = el('div', 'cm-find-back'), panel = el('div', 'cm-find-panel');
      var top = el('div', 'cm-find-top'); top.appendChild(sico(SI2.bookmark)); top.appendChild(el('b', 'cm-sv-h', 'Saved posts'));
      var x = el('button', 'cm-find-esc'); x.type = 'button'; x.appendChild(el('kbd', '', 'Esc')); top.appendChild(x); panel.appendChild(top);
      var list = el('div', 'cm-find-list'); list.id = 'cm-sv-list'; panel.appendChild(list);
      savedModal.appendChild(back); savedModal.appendChild(panel); d.body.appendChild(savedModal);
      var close = function () { savedModal.classList.remove('on'); B.classList.remove('find-open'); setTimeout(function () { savedModal.hidden = true; }, 160); };
      back.addEventListener('click', close); x.addEventListener('click', close);
      savedModal.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
      savedModal._close = close;
    }
    var list = $('#cm-sv-list', savedModal); list.textContent = '';
    var items = savedList();
    if (!items.length) { var em = el('div', 'cm-find-empty'); em.appendChild(el('b', '', 'Nothing saved yet')); em.appendChild(el('span', '', 'Use the bookmark button on a post to keep it here.')); list.appendChild(em); }
    items.forEach(function (s) {
      var row = el('a', 'cm-res'); row.href = s.url; var im = el('span', 'cm-res-img'); if (s.thumb) { var i = el('img'); i.src = bigImg(s.thumb, 128, 128); i.alt = ''; i.width = 56; i.height = 56; im.appendChild(i); }
      var tx = el('span', 'cm-res-tx'); tx.appendChild(el('span', 'cm-res-t', s.title)); tx.appendChild(el('span', 'cm-res-m', s.date || ''));
      var rm = el('button', 'cm-sv-rm', 'Remove'); rm.type = 'button'; rm.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); toggleSaved(s); openSaved(); });
      row.appendChild(im); row.appendChild(tx); row.appendChild(rm); list.appendChild(row);
    });
    savedModal.hidden = false; B.classList.add('find-open'); requestAnimationFrame(function () { savedModal.classList.add('on'); }); savedModal.querySelector('.cm-find-esc').focus();
  }

  /* ---------- post tools bar (reading controls, focus, save, code) ---------- */
  function seg(label, opts, cur, onPick) {
    var row = el('div', 'cm-rd-row'); row.appendChild(el('span', 'cm-rd-l', label)); var s = el('div', 'cm-seg');
    opts.forEach(function (o) { var b = el('button', cur === o[0] ? 'on' : '', o[1]); b.type = 'button'; b.addEventListener('click', function () { $$('button', s).forEach(function (x) { x.classList.toggle('on', x === b); }); onPick(o[0]); }); s.appendChild(b); });
    row.appendChild(s); return row;
  }
  function buildTools(art, e, thumb) {
    var bar = el('div', 'cm-tools'), url = location.href.split(/[?#]/)[0];
    function tool(cls, path, label, fn) { var b = el('button', 'cm-tool ' + cls); b.type = 'button'; b.appendChild(sico(path)); b.appendChild(el('span', '', label)); b.addEventListener('click', fn); bar.appendChild(b); return b; }

    /* reading controls popover */
    var rb = tool('cm-tool-rd', SI2.aa, 'Reading', function (ev) { ev.stopPropagation(); pop.hidden = !pop.hidden; });
    var pop = el('div', 'cm-rd-pop'); pop.hidden = true;
    var sz = el('div', 'cm-rd-row'); sz.appendChild(el('span', 'cm-rd-l', 'Text size'));
    var szc = el('div', 'cm-seg'), dec = el('button', '', 'A−'), val = el('span', 'cm-rd-val', Math.round(PREFS.size * 100) + '%'), inc = el('button', '', 'A+');
    dec.type = inc.type = 'button';
    dec.addEventListener('click', function () { PREFS.size = Math.max(.85, Math.round((PREFS.size - .05) * 100) / 100); val.textContent = Math.round(PREFS.size * 100) + '%'; savePrefs(); });
    inc.addEventListener('click', function () { PREFS.size = Math.min(1.4, Math.round((PREFS.size + .05) * 100) / 100); val.textContent = Math.round(PREFS.size * 100) + '%'; savePrefs(); });
    szc.appendChild(dec); szc.appendChild(val); szc.appendChild(inc); sz.appendChild(szc); pop.appendChild(sz);
    pop.appendChild(seg('Width', [['narrow', 'Narrow'], ['normal', 'Normal'], ['wide', 'Wide']], PREFS.width, function (v) { PREFS.width = v; savePrefs(); }));
    pop.appendChild(seg('Font', [['sans', 'Sans'], ['serif', 'Serif']], PREFS.font, function (v) { PREFS.font = v; savePrefs(); }));
    pop.appendChild(seg('Theme', [['dark', 'Dark'], ['light', 'Light'], ['sepia', 'Sepia']], root.getAttribute('data-theme'), function (v) { setThemeName(v); }));
    var wrapR = el('span', 'cm-rd-wrap'); wrapR.appendChild(pop); bar.appendChild(wrapR);
    d.addEventListener('click', function (ev) { if (!pop.hidden && !pop.contains(ev.target) && !rb.contains(ev.target)) pop.hidden = true; });

    tool('cm-tool-focus' + (root.classList.contains('focus') ? ' on' : ''), SI2.focus, 'Focus', function () { setFocus(!root.classList.contains('focus')); });
    var bm = tool('cm-tool-save' + (isSaved(url) ? ' on' : ''), SI2.bookmark, isSaved(url) ? 'Saved' : 'Save', function () {
      var on = toggleSaved({ url: url, title: e.title.$t, thumb: thumb || '', date: fmtDate(e.published.$t) }); bm.classList.toggle('on', on); bm.lastChild.textContent = on ? 'Saved' : 'Save';
    });
    var wins = $$('.cm-win', art);
    if (wins.length >= 2) {
      var allOpen = false;
      var cb = tool('cm-tool-code', SI2.code, 'Expand code', function () {
        allOpen = !allOpen; wins.forEach(function (w) { var dot = w.querySelector(allOpen ? '.d.g' : '.d.r'); if (dot) dot.click(); }); cb.lastChild.textContent = allOpen ? 'Collapse code' : 'Expand code'; track('code_toggle_all', { open: allOpen ? 1 : 0 });
      });
    }
    var by = $('.cm-byline', art); if (by) by.insertAdjacentElement('afterend', bar);
  }

  /* ---------- progress: resume, read-time left, sections done ---------- */
  function trackProgress(art, e, thumb) {
    var body = $('#cm-body'); if (!body) return;
    var url = location.href.split(/[?#]/)[0], title = e.title.$t, totalMin = readMin((e.content && e.content.$t) || ''), left = null, links = $$('#cm-toc a');
    var tocBox = $('#cm-toc'); if (tocBox && links.length) { left = el('li', 'cm-toc-meta', ''); tocBox.insertBefore(left, tocBox.firstChild); }
    var pos = posMap()[url], t = null, doneMarked = false;
    function ratio() { var r = body.getBoundingClientRect(), h = r.height - innerHeight * .5; return h <= 0 ? 1 : Math.min(1, Math.max(0, (-r.top + innerHeight * .35) / h)); }
    function tick() {
      var r = ratio();
      if (left) { var m = Math.max(0, Math.ceil(totalMin * (1 - r))); left.textContent = r > .97 ? 'Finished' : '~' + m + ' min left'; }
      $$('#cm-toc a').forEach(function (a) { var h = d.getElementById(a.getAttribute('href').slice(1)); if (h) a.classList.toggle('done', h.getBoundingClientRect().top < 120); });
      var map = posMap();
      if (r >= .9) { if (!doneMarked) { doneMarked = true; markRead(url); track('read_complete', { url: url }); } if (map[url]) { delete map[url]; LS.set('cmPos', map); } }
      else if (r > .04) { map[url] = { r: Math.round(r * 1000) / 1000, t: Date.now(), title: title, thumb: thumb || '' }; var keys = Object.keys(map).sort(function (a, b) { return map[b].t - map[a].t; }); keys.slice(20).forEach(function (k) { delete map[k]; }); LS.set('cmPos', map); }
    }
    window.addEventListener('scroll', function () { clearTimeout(t); t = setTimeout(tick, 250); }, { passive: true }); tick();
    if (pos && pos.r > .05 && pos.r < .9 && window.scrollY < 80 && !location.hash) {
      var bar = el('div', 'cm-toast cm-resume'); bar.appendChild(el('span', '', 'Continue where you left off (' + Math.round(pos.r * 100) + '%)?'));
      var go = el('button', 'cm-btn', 'Resume'), no = el('button', 'cm-toast-x', 'Start over'); go.type = no.type = 'button';
      go.addEventListener('click', function () { var r = body.getBoundingClientRect(); window.scrollTo({ top: Math.max(0, r.top + scrollY + pos.r * (r.height - innerHeight * .5) - innerHeight * .35), behavior: 'smooth' }); bar.remove(); });
      no.addEventListener('click', function () { var m = posMap(); delete m[url]; LS.set('cmPos', m); bar.remove(); });
      bar.appendChild(go); bar.appendChild(no); d.body.appendChild(bar); setTimeout(function () { bar.classList.add('on'); }, 50); setTimeout(function () { bar.remove(); }, 15000);
    }
  }

  /* ---------- was this helpful ---------- */
  function buildHelpful(art) {
    var url = location.href.split(/[?#]/)[0], votes = LS.get('cmVote', {}), box = el('div', 'cm-helpful'), q = el('span', '', 'Was this helpful?'), yes = el('button', 'cm-vote'), no = el('button', 'cm-vote');
    yes.type = no.type = 'button'; yes.appendChild(sico(SI2.thumbUp)); yes.appendChild(el('span', '', 'Yes')); no.appendChild(sico(SI2.thumbDn)); no.appendChild(el('span', '', 'No'));
    function done(v) { box.textContent = ''; box.appendChild(el('span', 'cm-thanks', v > 0 ? 'Glad it helped. Thanks for the feedback.' : 'Thanks. Tell us what was missing in the comments or via Contact.')); }
    function vote(v) { votes[url] = v; LS.set('cmVote', votes); track('helpful_vote', { value: v, url: url }); done(v); }
    yes.addEventListener('click', function () { vote(1); }); no.addEventListener('click', function () { vote(-1); });
    if (votes[url]) done(votes[url]); else { box.appendChild(q); box.appendChild(yes); box.appendChild(no); }
    var tags = $('.cm-tags', art); if (tags) tags.insertAdjacentElement('beforebegin', box); else art.appendChild(box);
  }

  /* ---------- up next ---------- */
  function buildNextUp(art, cm, e, series) {
    var url = location.href.split(/[?#]/)[0].replace(/^https?:/, ''), place = function (p, kicker) {
      var a = el('a', 'cm-nextup'); a.href = entryUrl(p); var im = el('span', 'cm-nu-img'), th = thumbOf(p); if (th) { var i = el('img'); i.src = bigImg(th, 640, 360); i.alt = ''; i.loading = 'lazy'; im.appendChild(i); }
      var tx = el('span', 'cm-nu-tx'); tx.appendChild(el('span', 'cm-nu-k', kicker)); tx.appendChild(el('strong', '', p.title.$t)); tx.appendChild(el('span', 'cm-nu-s', plain((p.content && p.content.$t) || '').slice(0, 130) + '…')); tx.appendChild(el('span', 'cm-btn', 'Read next →'));
      a.appendChild(im); a.appendChild(tx); var host = $('.cm-series', art.parentNode) || cm; host.parentNode.insertBefore(a, $('.cm-series') ? host.nextSibling : cm);
    };
    var fromFeed = function () {
      onFeed(function (f) {
        var mine = realLabels((e.category || []).map(function (c) { return c.term; })), pool = f.ents.filter(function (p) { return entryUrl(p).replace(/^https?:/, '') !== url; });
        var rel = pool.filter(function (p) { return (p.category || []).some(function (c) { return mine.indexOf(c.term) >= 0; }); });
        var pick = (rel.length ? rel : pool)[0]; if (pick) place(pick, rel.length ? 'Up next in ' + mine[0] : 'Up next');
      });
    };
    if (series) getJSON('/feeds/posts/default/-/' + encodeURIComponent(series) + '?alt=json&max-results=100', function (j) {
      var list = ((j && j.feed && j.feed.entry) || []).slice().sort(function (a, b) { return new Date(a.published.$t) - new Date(b.published.$t); }), cur = -1;
      list.forEach(function (x, i) { if (entryUrl(x).replace(/^https?:/, '') === url) cur = i; });
      if (cur >= 0 && cur < list.length - 1) place(list[cur + 1], 'Next in the series'); else fromFeed();
    }); else fromFeed();
  }

  /* ---------- keyboard shortcuts help + J/K ---------- */
  var helpModal = null;
  function openHelp() {
    if (!helpModal) {
      helpModal = el('div', 'cm-find'); helpModal.hidden = true; helpModal.setAttribute('role', 'dialog'); helpModal.setAttribute('aria-label', 'Keyboard shortcuts');
      var back = el('div', 'cm-find-back'), panel = el('div', 'cm-find-panel cm-help'); var top = el('div', 'cm-find-top'); top.appendChild(sico(SI2.keyboard)); top.appendChild(el('b', 'cm-sv-h', 'Keyboard shortcuts')); var x = el('button', 'cm-find-esc'); x.type = 'button'; x.appendChild(el('kbd', '', 'Esc')); top.appendChild(x); panel.appendChild(top);
      var g = el('div', 'cm-help-grid');
      [['/', 'or', 'Ctrl/Cmd + K', 'Search'], ['B', '', '', 'Toggle sidebar'], ['F', '', '', 'Focus mode (reading)'], ['J', '', '', 'Next (older) post'], ['K', '', '', 'Previous (newer) post'], ['?', '', '', 'Show this help'], ['Esc', '', '', 'Close dialogs, exit focus']].forEach(function (r) {
        var row = el('div', 'cm-help-row'), k = el('span', 'cm-help-k'); k.appendChild(el('kbd', '', r[0])); if (r[2]) { k.appendChild(document.createTextNode(' ' + r[1] + ' ')); k.appendChild(el('kbd', '', r[2])); } row.appendChild(k); row.appendChild(el('span', '', r[3])); g.appendChild(row);
      });
      panel.appendChild(g); helpModal.appendChild(back); helpModal.appendChild(panel); d.body.appendChild(helpModal);
      var close = function () { helpModal.classList.remove('on'); setTimeout(function () { helpModal.hidden = true; }, 160); };
      back.addEventListener('click', close); x.addEventListener('click', close); helpModal._close = close;
    }
    helpModal.hidden = false; requestAnimationFrame(function () { helpModal.classList.add('on'); });
  }
  d.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    var k = e.key;
    if (k === 'Escape') { if (helpModal && !helpModal.hidden) helpModal._close(); else if (savedModal && !savedModal.hidden) savedModal._close(); else if (root.classList.contains('focus')) setFocus(false); return; }
    if (typingNow()) return;
    if (k === '?') { e.preventDefault(); openHelp(); }
    else if ((k === 'f' || k === 'F') && B.classList.contains('pt-item')) { e.preventDefault(); setFocus(!root.classList.contains('focus')); }
    else if ((k === 'j' || k === 'J' || k === 'k' || k === 'K') && B.classList.contains('pt-item')) {
      onFeed(function (f) {
        var here = location.href.split(/[?#]/)[0].replace(/^https?:/, ''), i = -1; f.ents.forEach(function (p, n) { if (entryUrl(p).replace(/^https?:/, '') === here) i = n; });
        var tgt = f.ents[i + (k === 'j' || k === 'J' ? 1 : -1)]; if (i >= 0 && tgt) location.href = entryUrl(tgt);
      });
    }
  });

  /* ---------- 404 page ---------- */
  function renderNotFound() {
    ensureShell();
    onFeed(function (f) {
      var wrap = el('div', 'cm-content'), box = el('section', 'cm-panel cm-404');
      box.appendChild(el('div', 'cm-404-n', '404')); box.appendChild(el('h1', '', 'This page could not be found'));
      box.appendChild(el('p', 'cm-muted', 'The link may be old or mistyped. Search the blog or pick one of the posts below.'));
      var b = el('button', 'cm-btn', 'Search the blog'); b.type = 'button'; b.setAttribute('data-act', 'search'); box.appendChild(b); wrap.appendChild(box);
      var p = el('section', 'cm-panel'), hd = el('div', 'cm-panel-head'); hd.appendChild(el('h2', '', 'Popular starting points')); p.appendChild(hd);
      var g = el('div', 'cm-grid'); f.ents.slice(0, 6).forEach(function (x) { g.appendChild(cardFromEntry(x)); }); p.appendChild(g); wrap.appendChild(p);
      setContent(wrap); track('page_not_found', { path: location.pathname });
    });
  }

  /* ---------- per-post init (called from initArticle) ---------- */
  function readingInit(art, e, series) {
    var th = thumbOf(e);
    buildTools(art, e, th); buildHelpful(art); trackProgress(art, e, th);
    var cm = $('#comments'); if (cm) buildNextUp(art, cm, e, series);
    if (LS.get('cmFocus', 0)) setFocus(true);
    $$('.cm-win-copy').forEach(function (b) { b.addEventListener('click', function () { track('code_copy', {}); }); });
  }
  window.cmRead = { markRead: markRead, posMap: posMap, readSet: readSet };
