  /* =====================================================================
     SEARCH: command-palette style modal. Live-fetches the blog's posts from
     the public feed and filters locally: text, categories, author, scope,
     year and sort. Opens with the search buttons, Cmd/Ctrl+K or "/".
     ===================================================================== */
  var cmFind = (function () {
    var root_, panel, qIn, chipsEl, listEl, countEl, selAuthor, selScope, selYear, selSort, selSeries, serW, clearBtn, moreBtn;
    var serverHits = {}, reqId = 0, typeT = null;
    var idx = null, loading = false, pending = [], open = false, sel = -1, shown = 0, PAGE = 20, lastFocus = null;
    var state = { q: '', cats: [], author: '', scope: 'all', year: '', series: '', sort: 'rel' };
    var RK = 'cmRecentSearch';

    function recents() { try { return JSON.parse(localStorage.getItem(RK) || '[]'); } catch (e) { return []; } }
    function saveRecent(q) {
      q = (q || '').trim(); if (q.length < 2) return;
      var r = recents().filter(function (x) { return x !== q; }); r.unshift(q);
      try { localStorage.setItem(RK, JSON.stringify(r.slice(0, 6))); } catch (e) {}
    }

    /* ---------- data ---------- */
    function load(cb) {
      if (idx) return cb();
      pending.push(cb); if (loading) return; loading = true;
      getJSON('/feeds/posts/default?alt=json&max-results=500', function (j) {
        var ents = (j && j.feed && j.feed.entry) || [];
        idx = ents.map(function (e) {
          var content = (e.content && e.content.$t) || (e.summary && e.summary.$t) || '', text = plain(content).slice(0, 30000);
          var au = (e.author && e.author[0] && e.author[0].name && e.author[0].name.$t) || '';
          var allL = (e.category || []).map(function (c) { return c.term; }), labels = realLabels(allL), series = allL.filter(isSeries), dt = new Date(e.published.$t);
          return { e: e, title: e.title.$t, tl: e.title.$t.toLowerCase(), au: au, al: au.toLowerCase(), labels: labels, series: series, ll: labels.join(' ').toLowerCase(), text: text, xl: text.toLowerCase(), date: dt, year: dt.getFullYear(), url: entryUrl(e), thumb: thumbOf(e), mins: readMin(content) };
        });
        loading = false; pending.splice(0).forEach(function (f) { f(); });
      });
    }

    /* ---------- DOM ---------- */
    function ico(path, cls) { return sico(path, cls); }
    var P = { search: 'M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14zM21 21l-4.3-4.3', x: 'M6 6l12 12M18 6 6 18', clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2', tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01', user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0', cal: 'M4 6h16v14H4zM4 10h16M8 3v4M16 3v4', filter: 'M3 5h18l-7 8v6l-4-2v-4z', ret: 'M20 5v7a3 3 0 0 1-3 3H5m0 0 4-4m-4 4 4 4' };
    function mkSelect(label, icon, opts) {
      var w = el('label', 'cm-fsel'), s = el('select'); w.appendChild(ico(icon)); opts.forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; s.appendChild(op); }); w.setAttribute('title', label); s.setAttribute('aria-label', label); w.appendChild(s); return { w: w, s: s };
    }
    function build() {
      root_ = el('div', 'cm-find'); root_.id = 'cm-find'; root_.hidden = true; root_.setAttribute('role', 'dialog'); root_.setAttribute('aria-modal', 'true'); root_.setAttribute('aria-label', 'Search');
      var back = el('div', 'cm-find-back'); root_.appendChild(back); back.addEventListener('click', close);
      panel = el('div', 'cm-find-panel');
      var top = el('div', 'cm-find-top'); top.appendChild(ico(P.search));
      qIn = el('input'); qIn.type = 'text'; qIn.placeholder = 'Search posts, topics, authors…'; qIn.autocomplete = 'off'; qIn.setAttribute('aria-label', 'Search query'); qIn.spellcheck = false; top.appendChild(qIn);
      var cl = el('button', 'cm-find-esc'); cl.type = 'button'; cl.setAttribute('aria-label', 'Close search'); cl.appendChild(el('kbd', '', 'Esc')); cl.addEventListener('click', close); top.appendChild(cl);
      panel.appendChild(top);

      var fl = el('div', 'cm-find-filters');
      var a = mkSelect('Author', P.user, [['', 'All authors']]); selAuthor = a.s; fl.appendChild(a.w);
      var sc = mkSelect('Search in', P.filter, [['all', 'Everything'], ['title', 'Titles only'], ['content', 'Content only'], ['labels', 'Categories only']]); selScope = sc.s; fl.appendChild(sc.w);
      var y = mkSelect('Year', P.cal, [['', 'Any year']]); selYear = y.s; fl.appendChild(y.w);
      var se = mkSelect('Series', P.tag, [['', 'Any series']]); selSeries = se.s; serW = se.w; serW.hidden = true; fl.appendChild(se.w);
      var so = mkSelect('Sort', P.clock, [['rel', 'Best match'], ['new', 'Newest first'], ['old', 'Oldest first'], ['az', 'Title A to Z']]); selSort = so.s; fl.appendChild(so.w);
      clearBtn = el('button', 'cm-find-clear', 'Clear filters'); clearBtn.type = 'button'; clearBtn.hidden = true; fl.appendChild(clearBtn);
      panel.appendChild(fl);

      chipsEl = el('div', 'cm-find-chips'); chipsEl.setAttribute('role', 'group'); chipsEl.setAttribute('aria-label', 'Filter by category'); panel.appendChild(chipsEl);
      listEl = el('div', 'cm-find-list'); listEl.setAttribute('role', 'listbox'); panel.appendChild(listEl);

      var ft = el('div', 'cm-find-foot'); countEl = el('span', 'cm-find-count', ''); countEl.setAttribute('aria-live', 'polite');
      var keys = el('span', 'cm-find-keys'); [['↑↓', 'navigate'], ['↵', 'open'], ['Esc', 'close']].forEach(function (k) { var s = el('span'); s.appendChild(el('kbd', '', k[0])); s.appendChild(document.createTextNode(' ' + k[1])); keys.appendChild(s); });
      ft.appendChild(countEl); ft.appendChild(keys); panel.appendChild(ft);
      root_.appendChild(panel); document.body.appendChild(root_);

      qIn.addEventListener('input', function () {
        state.q = qIn.value; clearTimeout(typeT);
        var q = state.q.trim();
        if (!idx || q.length < 2) { reqId++; run(true); return; }
        skeletonList('Searching\u2026');
        typeT = setTimeout(function () { fetchServer(q); }, 260);
      });
      selAuthor.addEventListener('change', function () { state.author = selAuthor.value; run(true); });
      selScope.addEventListener('change', function () { state.scope = selScope.value; run(true); });
      selYear.addEventListener('change', function () { state.year = selYear.value; run(true); });
      selSort.addEventListener('change', function () { state.sort = selSort.value; run(true); });
      selSeries.addEventListener('change', function () { state.series = selSeries.value; run(true); });
      clearBtn.addEventListener('click', function () { state.cats = []; state.author = ''; state.scope = 'all'; state.year = ''; state.series = ''; state.sort = 'rel'; syncControls(); run(true); });
      root_.addEventListener('keydown', onKey);
    }

    function syncControls() { selSeries.value = state.series; selAuthor.value = state.author; selScope.value = state.scope; selYear.value = state.year; selSort.value = state.sort; drawChips(); }
    function fillFilters() {
      var authors = {}, years = {}, cats = {}, sers = {};
      idx.forEach(function (p) { if (p.au) authors[p.au] = (authors[p.au] || 0) + 1; years[p.year] = 1; p.series.forEach(function (x) { sers[x] = (sers[x] || 0) + 1; }); p.labels.forEach(function (l) { cats[l] = (cats[l] || 0) + 1; }); });
      selAuthor.textContent = ''; var o = el('option', '', 'All authors'); o.value = ''; selAuthor.appendChild(o);
      Object.keys(authors).sort().forEach(function (n) { var op = el('option', '', n + ' (' + authors[n] + ')'); op.value = n; selAuthor.appendChild(op); });
      selYear.textContent = ''; var oy = el('option', '', 'Any year'); oy.value = ''; selYear.appendChild(oy);
      Object.keys(years).sort(function (a, b) { return b - a; }).forEach(function (n) { var op = el('option', '', n); op.value = n; selYear.appendChild(op); });
      selSeries.textContent = ''; var os = el('option', '', 'Any series'); os.value = ''; selSeries.appendChild(os);
      Object.keys(sers).sort().forEach(function (n) { var op = el('option', '', n.replace(/^series\s*:\s*/i, '') + ' (' + sers[n] + ')'); op.value = n; selSeries.appendChild(op); });
      serW.hidden = !Object.keys(sers).length;
      fillFilters.cats = Object.keys(cats).sort(function (a, b) { return cats[b] - cats[a] || (a < b ? -1 : 1); }).map(function (n) { return [n, cats[n]]; });
      drawChips();
    }
    var chipsOpen = false, CHIP_LIMIT = 8;
    function drawChips() {
      chipsEl.textContent = ''; var cats = fillFilters.cats || [];
      var list = chipsOpen ? cats : cats.filter(function (c, i) { return i < CHIP_LIMIT || state.cats.indexOf(c[0]) >= 0; });
      list.forEach(function (c) {
        var b = el('button', 'cm-chip2' + (state.cats.indexOf(c[0]) >= 0 ? ' on' : '')); b.type = 'button'; b.setAttribute('aria-pressed', String(state.cats.indexOf(c[0]) >= 0));
        b.appendChild(el('span', '', c[0])); b.appendChild(el('small', '', String(c[1])));
        b.addEventListener('click', function () { var i = state.cats.indexOf(c[0]); if (i >= 0) state.cats.splice(i, 1); else state.cats.push(c[0]); drawChips(); run(true); });
        chipsEl.appendChild(b);
      });
      if (cats.length > list.length || (chipsOpen && cats.length > CHIP_LIMIT)) {
        var mb = el('button', 'cm-chip2 more', chipsOpen ? 'Show less' : '+' + (cats.length - list.length) + ' more'); mb.type = 'button';
        mb.addEventListener('click', function () { chipsOpen = !chipsOpen; drawChips(); }); chipsEl.appendChild(mb);
      }
      chipsEl.hidden = !cats.length;
    }

    /* ---------- live server search (merges fresh hits into the index) ---------- */
    function fetchServer(q) {
      var my = ++reqId;
      getJSON('/feeds/posts/default?alt=json&max-results=60&q=' + encodeURIComponent(q), function (j) {
        if (my !== reqId || !open) return;
        var ents = (j && j.feed && j.feed.entry) || [], hits = {};
        ents.forEach(function (e) {
          var url = entryUrl(e); hits[url] = true;
          if (idx.some(function (p) { return p.url === url; })) return;
          var content = (e.content && e.content.$t) || (e.summary && e.summary.$t) || '', text = plain(content).slice(0, 30000);
          var au = (e.author && e.author[0] && e.author[0].name && e.author[0].name.$t) || '', allL = (e.category || []).map(function (c) { return c.term; }), dt = new Date(e.published.$t), labels = realLabels(allL);
          idx.push({ e: e, title: e.title.$t, tl: e.title.$t.toLowerCase(), au: au, al: au.toLowerCase(), labels: labels, series: allL.filter(isSeries), ll: labels.join(' ').toLowerCase(), text: text, xl: text.toLowerCase(), date: dt, year: dt.getFullYear(), url: url, thumb: thumbOf(e), mins: readMin(content) });
        });
        serverHits[q.toLowerCase()] = hits; run(true);
      });
    }

    /* ---------- matching ---------- */
    function esc_(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
    function hl(text, toks) {
      var f = document.createDocumentFragment(); if (!toks.length) { f.appendChild(document.createTextNode(text)); return f; }
      var re = new RegExp('(' + toks.map(esc_).join('|') + ')', 'ig'), last = 0, m;
      while ((m = re.exec(text))) { if (m.index > last) f.appendChild(document.createTextNode(text.slice(last, m.index))); f.appendChild(el('mark', '', m[0])); last = m.index + m[0].length; if (m[0].length === 0) re.lastIndex++; }
      if (last < text.length) f.appendChild(document.createTextNode(text.slice(last)));
      return f;
    }
    function snippet(p, toks) {
      var t = p.text; if (!t) return ''; var i = -1;
      for (var k = 0; k < toks.length && i < 0; k++) i = p.xl.indexOf(toks[k]);
      if (i < 0) return t.slice(0, 150) + (t.length > 150 ? '…' : '');
      var s = Math.max(0, i - 60), e = Math.min(t.length, i + 110);
      return (s > 0 ? '…' : '') + t.slice(s, e) + (e < t.length ? '…' : '');
    }
    function results() {
      var toks = state.q.toLowerCase().split(/\s+/).filter(Boolean), sc = state.scope, out = [];
      idx.forEach(function (p) {
        if (state.cats.length && !state.cats.some(function (c) { return p.labels.indexOf(c) >= 0; })) return;
        if (state.author && p.au !== state.author) return;
        if (state.year && String(p.year) !== state.year) return;
        if (state.series && p.series.indexOf(state.series) < 0) return;
        var score = 0;
        if (toks.length) {
          var ok = toks.every(function (t) {
            var s = 0;
            if (sc === 'all' || sc === 'title') { if (p.tl.indexOf(t) >= 0) s += p.tl.indexOf(t) === 0 ? 8 : 5; }
            if (sc === 'all' || sc === 'labels') { if (p.ll.indexOf(t) >= 0) s += 3; }
            if (sc === 'all') { if (p.al.indexOf(t) >= 0) s += 2; }
            if (sc === 'all' || sc === 'content') { var c = p.xl.indexOf(t); if (c >= 0) s += 1 + Math.min(3, (p.xl.split(t).length - 1) / 3); }
            score += s; return s > 0;
          });
          if (!ok) return;
        }
        var sh = serverHits[state.q.trim().toLowerCase()]; if (sh && sh[p.url]) score += 2;
        out.push({ p: p, s: score });
      });
      var by = state.sort === 'rel' && !toks.length ? 'new' : state.sort;
      out.sort(function (a, b) {
        if (by === 'rel') return b.s - a.s || b.p.date - a.p.date;
        if (by === 'old') return a.p.date - b.p.date;
        if (by === 'az') return a.p.tl < b.p.tl ? -1 : 1;
        return b.p.date - a.p.date;
      });
      return { list: out, toks: toks };
    }

    /* ---------- rendering ---------- */
    function row(p, toks) {
      var a = el('a', 'cm-res'); a.href = p.url; a.setAttribute('role', 'option');
      var im = el('span', 'cm-res-img'); if (p.thumb) { var i = el('img'); i.src = bigImg(p.thumb, 128, 128); i.alt = ''; i.loading = 'lazy'; i.width = 56; i.height = 56; im.appendChild(i); }
      var tx = el('span', 'cm-res-tx'), t = el('span', 'cm-res-t'); t.appendChild(hl(p.title, toks));
      var meta = el('span', 'cm-res-m'); meta.appendChild(document.createTextNode([p.au, fmtDate(p.e.published.$t), p.mins + ' min read'].filter(Boolean).join(' · ')));
      var sn = el('span', 'cm-res-s'); sn.appendChild(hl(snippet(p, toks), toks));
      tx.appendChild(t); tx.appendChild(meta); tx.appendChild(sn);
      if (p.labels.length) { var lb = el('span', 'cm-res-l'); p.labels.slice(0, 3).forEach(function (l) { lb.appendChild(el('em', '', l)); }); tx.appendChild(lb); }
      a.appendChild(im); a.appendChild(tx); a.appendChild(ico(P.ret, 'cm-res-go'));
      a.addEventListener('click', function () { saveRecent(state.q); });
      return a;
    }
    function skeletonList(msg) { listEl.textContent = ''; for (var i = 0; i < 5; i++) { var r = el('div', 'cm-res'); r.appendChild(sk('', '56px', '56px')); var t = el('span', 'cm-res-tx'); t.appendChild(sk('', '70%', '14px')); t.appendChild(sk('', '40%', '11px')); t.lastChild.style.marginTop = '8px'; t.appendChild(sk('', '95%', '11px')); t.lastChild.style.marginTop = '8px'; r.appendChild(t); listEl.appendChild(r); } countEl.textContent = msg || 'Loading posts…'; }
    function activeFilters() { return state.cats.length + (state.author ? 1 : 0) + (state.year ? 1 : 0) + (state.series ? 1 : 0) + (state.scope !== 'all' ? 1 : 0) + (state.sort !== 'rel' ? 1 : 0); }
    function run(reset) {
      if (!idx) return; if (reset) { shown = PAGE; sel = -1; }
      clearBtn.hidden = !activeFilters();
      var has = state.q.trim() || state.cats.length || state.author || state.year || state.series;
      listEl.textContent = '';
      if (!has) { home(); return; }
      var r = results(), list = r.list;
      countEl.textContent = list.length + (list.length === 1 ? ' result' : ' results');
      if (!list.length) {
        var em = el('div', 'cm-find-empty'); em.appendChild(el('b', '', 'No posts found')); em.appendChild(el('span', '', 'Try fewer words, another spelling, or clear the filters.'));
        listEl.appendChild(em); return;
      }
      list.slice(0, shown).forEach(function (x) { listEl.appendChild(row(x.p, r.toks)); });
      if (list.length > shown) { moreBtn = el('button', 'cm-find-more', 'Show ' + Math.min(PAGE, list.length - shown) + ' more'); moreBtn.type = 'button'; moreBtn.addEventListener('click', function () { shown += PAGE; run(false); }); listEl.appendChild(moreBtn); }
      if (state.q.trim()) { var all = el('a', 'cm-find-all', 'See all results for “' + state.q.trim() + '” on the blog →'); all.href = '/search?q=' + encodeURIComponent(state.q.trim()); listEl.appendChild(all); }
      setSel(sel < 0 ? 0 : Math.min(sel, listEl.querySelectorAll('.cm-res').length - 1), false);
    }
    function home() {
      var rec = recents();
      if (rec.length) {
        var h = el('div', 'cm-find-h'); h.appendChild(el('span', '', 'Recent searches')); var clr = el('button', '', 'Clear'); clr.type = 'button'; clr.addEventListener('click', function () { try { localStorage.removeItem(RK); } catch (e) {} run(true); }); h.appendChild(clr); listEl.appendChild(h);
        var rl = el('div', 'cm-find-recent'); rec.forEach(function (q) { var b = el('button', 'cm-chip2'); b.type = 'button'; b.appendChild(ico(P.clock)); b.appendChild(el('span', '', q)); b.addEventListener('click', function () { qIn.value = q; state.q = q; run(true); qIn.focus(); }); rl.appendChild(b); }); listEl.appendChild(rl);
      }
      var h2 = el('div', 'cm-find-h'); h2.appendChild(el('span', '', 'Latest posts')); listEl.appendChild(h2);
      idx.slice().sort(function (a, b) { return b.date - a.date; }).slice(0, 6).forEach(function (p) { listEl.appendChild(row(p, [])); });
      countEl.textContent = idx.length + ' posts';
      setSel(0, false);
    }
    function setSel(i, scroll) {
      var items = $$('.cm-res', listEl); items.forEach(function (n) { n.classList.remove('sel'); n.removeAttribute('aria-selected'); });
      if (!items.length) { sel = -1; return; }
      sel = (i + items.length) % items.length; items[sel].classList.add('sel'); items[sel].setAttribute('aria-selected', 'true');
      if (scroll !== false) items[sel].scrollIntoView({ block: 'nearest' });
    }
    function onKey(e) {
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSel(sel + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSel(sel - 1); }
      else if (e.key === 'Enter') { var items = $$('.cm-res', listEl); if (items[sel] && d.activeElement === qIn || (items[sel] && d.activeElement === d.body)) { e.preventDefault(); saveRecent(state.q); location.href = items[sel].href; } }
      else if (e.key === 'Tab') { var f = $$('input,select,button,a[href]', panel).filter(function (n) { return !n.hidden && n.offsetParent !== null; }); if (!f.length) return; var first = f[0], last = f[f.length - 1]; if (e.shiftKey && d.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && d.activeElement === last) { e.preventDefault(); first.focus(); } }
    }

    /* ---------- open / close ---------- */
    function openIt(prefill) {
      if (!root_) build(); lastFocus = d.activeElement; open = true; root_.hidden = false; B.classList.add('find-open');
      requestAnimationFrame(function () { root_.classList.add('on'); });
      if (typeof prefill === 'string') { qIn.value = prefill; state.q = prefill; }
      skeletonList(); qIn.focus();
      load(function () { fillFilters(); syncControls(); run(true); if (open) qIn.select(); });
    }
    function close() {
      if (!root_ || !open) return; open = false; root_.classList.remove('on'); B.classList.remove('find-open');
      setTimeout(function () { if (!open) root_.hidden = true; }, 180); if (lastFocus && lastFocus.focus) lastFocus.focus();
    }
    return { open: openIt, close: close, isOpen: function () { return open; } };
  })();
  window.cmFind = cmFind;
