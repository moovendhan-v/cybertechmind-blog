  /* =====================================================================
     LINK PREVIEWS: hover (or keyboard focus) a link inside a post to see a
     small card above it. Rich cards for your own posts, topics and pages,
     GitHub repos and YouTube; a simple card (domain, icon) for other links.
     Theme variable / JSON key linkPreviews: "on" (default), "rich" (also
     fetches title + image for other sites from Microlink), "off".
     ===================================================================== */
  (function linkPreviews() {
    var mode = (ds.linkPreviews || 'on').toLowerCase(); if (mode === 'off') return;
    var canHover = window.matchMedia && window.matchMedia('(hover: hover)').matches; if (!canHover) return;
    var card = null, showT = null, hideT = null, cur = null, token = 0;
    var NO = '.cm-toc a,.cm-tags a,.cm-anchor,.cm-share a,.cm-btn,.cm-download,.cm-topics a,.cm-crumbs a,pre a,.cm-win a,.cm-series a,.cm-nextup,.cm-writer a';

    function build() {
      card = el('div', 'cm-lp'); card.hidden = true; card.setAttribute('role', 'tooltip'); d.body.appendChild(card);
      card.addEventListener('mouseenter', function () { clearTimeout(hideT); });
      card.addEventListener('mouseleave', hide);
    }
    function hide() {
      clearTimeout(showT); clearTimeout(hideT);
      hideT = setTimeout(function () { if (!card) return; card.classList.remove('on'); setTimeout(function () { if (!card.classList.contains('on')) card.hidden = true; }, 160); cur = null; }, 140);
    }
    function place(a) {
      var r = a.getBoundingClientRect(), w = Math.min(350, innerWidth - 24), left = Math.max(12, Math.min(r.left, innerWidth - w - 12));
      card.style.width = w + 'px'; card.style.left = left + 'px';
      if (r.top > 210) { card.style.bottom = (innerHeight - r.top + 10) + 'px'; card.style.top = 'auto'; card.classList.remove('below'); }
      else { card.style.top = (r.bottom + 10) + 'px'; card.style.bottom = 'auto'; card.classList.add('below'); }
    }
    function sameHost(h) { return h.replace(/^www\./, '') === location.host.replace(/^www\./, ''); }
    function kind(a) {
      var u; try { u = new URL(a.getAttribute('href'), location.href); } catch (e) { return null; }
      if (!/^https?:$/.test(u.protocol)) return null;
      if (u.hash && u.pathname === location.pathname && sameHost(u.host)) return null;
      if (sameHost(u.host)) {
        if (/^\/\d{4}\/\d{2}\/.+\.html$/.test(u.pathname)) return { t: 'post', u: u };
        if (/^\/search\/label\//.test(u.pathname)) return { t: 'label', u: u };
        if (/^\/p\/.+\.html$/.test(u.pathname)) return { t: 'page', u: u };
        return { t: 'site', u: u };
      }
      if (u.host === 'github.com') { var p = u.pathname.split('/').filter(Boolean); if (p.length >= 2) return { t: 'gh', u: u, owner: p[0], repo: p[1].replace(/\.git$/, '') }; }
      var ym = /(?:youtube\.com\/watch\?(?:.*&)?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/.exec(u.href); if (ym) return { t: 'yt', u: u, id: ym[1] };
      return { t: 'ext', u: u };
    }
    function favicon(host) { var i = el('img', 'cm-lp-fav'); i.src = 'https://www.google.com/s2/favicons?domain=' + encodeURIComponent(host) + '&sz=64'; i.alt = ''; i.width = 16; i.height = 16; return i; }
    function kicker(text, host) { var k = el('div', 'cm-lp-k'); if (host) k.appendChild(favicon(host)); k.appendChild(el('span', '', text)); return k; }
    function skeleton() { var f = el('div', 'cm-lp-body'); f.appendChild(sk('', '40%', '10px')); f.appendChild(sk('', '90%', '14px')); f.lastChild.style.marginTop = '10px'; f.appendChild(sk('', '100%', '10px')); f.lastChild.style.marginTop = '10px'; f.appendChild(sk('', '70%', '10px')); f.lastChild.style.marginTop = '6px'; return f; }
    function media(src) { var m = el('div', 'cm-lp-media'), i = el('img'); i.src = src; i.alt = ''; i.loading = 'lazy'; m.appendChild(i); return m; }
    function fill(nodes) { card.textContent = ''; nodes.forEach(function (n) { if (n) card.appendChild(n); }); }
    function body(k, title, desc, meta) { var b = el('div', 'cm-lp-body'); if (k) b.appendChild(k); if (title) b.appendChild(el('div', 'cm-lp-t', title)); if (desc) b.appendChild(el('div', 'cm-lp-d', desc)); if (meta) b.appendChild(el('div', 'cm-lp-m', meta)); return b; }

    function render(a, kd, my) {
      var u = kd.u, host = u.host.replace(/^www\./, '');
      var basic = function () { fill([body(kicker(host, host), a.textContent.trim() || u.pathname, u.pathname.length > 1 ? u.pathname.replace(/\/$/, '') : '', 'External link · opens in a new tab')]); place(a); };
      if (kd.t === 'post' || kd.t === 'page') {
        getJSON('/feeds/' + (kd.t === 'post' ? 'posts' : 'pages') + '/default?alt=json&path=' + encodeURIComponent(u.pathname), function (j) {
          if (my !== token) return; var e = j && j.feed && j.feed.entry && j.feed.entry[0];
          if (!e) { fill([body(kicker('This blog', host), a.textContent.trim(), '', 'Internal link')]); place(a); return; }
          var th = thumbOf(e), content = (e.content && e.content.$t) || '', lv = levelOf(e), lab = realLabels((e.category || []).map(function (c) { return c.term; }))[0];
          var meta = [fmtDate(e.published.$t), readMin(content) + ' min read'].join(' · ');
          var k = kicker(kd.t === 'post' ? (lab ? 'Post · ' + lab : 'Post') : 'Page', host);
          if (lv) { var bd = el('span', 'cm-lvl-inline ' + lvlClass(lv), lv); k.appendChild(bd); }
          fill([th ? media(bigImg(th, 700, 360)) : null, body(k, e.title.$t, leadText(content).slice(0, 130) + '…', meta)]); place(a);
        });
      } else if (kd.t === 'label') {
        var name = decodeURIComponent(u.pathname.replace(/^\/search\/label\//, ''));
        getJSON('/feeds/posts/default/-/' + encodeURIComponent(name) + '?alt=json&max-results=3', function (j) {
          if (my !== token) return; var ents = (j && j.feed && j.feed.entry) || [], total = j && j.feed && j.feed.openSearch$totalResults ? j.feed.openSearch$totalResults.$t : ents.length;
          var b = body(kicker(isSeries(name) ? 'Series' : 'Topic', host), name.replace(/^series\s*:\s*/i, ''), '', total + (+total === 1 ? ' post' : ' posts'));
          if (ents.length) { var ul = el('ul', 'cm-lp-list'); ents.forEach(function (e) { ul.appendChild(el('li', '', e.title.$t)); }); b.insertBefore(ul, b.lastChild); }
          fill([b]); place(a);
        });
      } else if (kd.t === 'gh') {
        getJSON('https://api.github.com/repos/' + encodeURIComponent(kd.owner) + '/' + encodeURIComponent(kd.repo), function (r) {
          if (my !== token) return; if (!r || !r.full_name) { basic(); return; }
          var meta = ['★ ' + (r.stargazers_count || 0).toLocaleString(), r.language, r.forks_count != null ? '⑂ ' + r.forks_count : '', r.updated_at ? 'Updated ' + fmtDate(r.updated_at) : ''].filter(Boolean).join(' · ');
          fill([body(kicker('GitHub repository', 'github.com'), r.full_name, r.description || 'No description provided.', meta)]); place(a);
        });
      } else if (kd.t === 'yt') {
        fill([media('https://img.youtube.com/vi/' + encodeURIComponent(kd.id) + '/hqdefault.jpg'), body(kicker('YouTube video', 'youtube.com'), a.textContent.trim() || 'Watch on YouTube', '', 'Opens on youtube.com')]); place(a);
      } else if (kd.t === 'ext' && mode === 'rich') {
        getJSON('https://api.microlink.io/?url=' + encodeURIComponent(u.href), function (r) {
          if (my !== token) return; var dt = r && r.status === 'success' && r.data; if (!dt) { basic(); return; }
          fill([dt.image && dt.image.url ? media(dt.image.url) : null, body(kicker(dt.publisher || host, host), dt.title || a.textContent.trim(), dt.description ? String(dt.description).slice(0, 140) : '', 'External link · opens in a new tab')]); place(a);
        });
      } else basic();
    }

    function show(a) {
      var kd = kind(a); if (!kd) return; if (!card) build();
      clearTimeout(hideT); var my = ++token; cur = a;
      fill([skeleton()]); card.hidden = false; place(a); setTimeout(function () { if (cur === a) card.classList.add('on'); }, 20);
      render(a, kd, my);
    }
    function target(e) { var a = e.target.closest && e.target.closest('.cm-body a[href]'); if (!a || a.closest(NO) || (a.querySelector('img') && !a.textContent.trim())) return null; return a; }
    d.addEventListener('mouseover', function (e) { var a = target(e); if (!a || a === cur) { if (a) clearTimeout(hideT); return; } clearTimeout(showT); showT = setTimeout(function () { show(a); }, 320); });
    d.addEventListener('mouseout', function (e) { var a = target(e); if (a) hide(); });
    d.addEventListener('focusin', function (e) { var a = target(e); if (a) { clearTimeout(showT); showT = setTimeout(function () { show(a); }, 150); } });
    d.addEventListener('focusout', function (e) { if (target(e)) hide(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && card && !card.hidden) { clearTimeout(showT); card.classList.remove('on'); card.hidden = true; cur = null; } });
    window.addEventListener('scroll', function () { if (card && !card.hidden) { clearTimeout(showT); card.classList.remove('on'); card.hidden = true; cur = null; } }, { passive: true });
  })();
