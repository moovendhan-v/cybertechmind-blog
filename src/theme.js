(function () {
  'use strict';
  var d = document, B = d.body, ds = B.dataset;
  var $ = function (s, r) { return (r || d).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || d).querySelectorAll(s)); };
  var PER = 12;
  var store = {
    get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  function el(tag, cls, text) { var n = d.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function words(html) { return (html || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length; }
  function plain(html) { var t = new DOMParser().parseFromString(html || '', 'text/html'); return (t.body.textContent || '').replace(/\s+/g, ' ').trim(); }
  function thumbOf(e) {
    var t = e['media$thumbnail'] && e['media$thumbnail'].url;
    if (t) return t;
    var m = /<img[^>]+src=["']([^"']+)["']/i.exec((e.content && e.content.$t) || '');
    return m ? m[1] : '';
  }
  function readMin(html) { return Math.max(1, Math.round(words(html) / 220)); }
  function fmtDate(iso) { try { return new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }); } catch (e) { return ''; } }
  function bigImg(u, w, h) {
    if (!u) return '';
    u = u.replace(/^http:/, 'https:');
    if (/googleusercontent\.com|blogger\.com|blogspot\.com/.test(u)) {
      u = u.replace(/\/(?:s|w|h)\d+[^\/]*\/([^\/]+)$/, '/w' + w + '-h' + h + '-c/$1').replace(/=(?:s|w)\d+[^=]*$/, '=w' + w + '-h' + h + '-c');
    }
    return u;
  }
  function getJSON(url, cb) {
    var c = store.get('cm:' + url);
    if (c) { try { return cb(JSON.parse(c)); } catch (e) {} }
    fetch(url).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (j) { store.set('cm:' + url, JSON.stringify(j)); cb(j); }).catch(function () { cb(null); });
  }
  function entryUrl(e) { var l = (e.link || []).filter(function (x) { return x.rel === 'alternate'; })[0]; return l ? l.href : ''; }

  /* ---------- Header, theme, search, menu ---------- */
  var header = $('#cm-header'), nav = $('#cm-nav'), root = d.documentElement;
  function onScroll() { header.classList.toggle('is-scrolled', window.scrollY > 8); }
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  $('#cm-theme').addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('cmTheme', t); } catch (e) {}
  });
  $('#cm-burger').addEventListener('click', function (e) { e.stopPropagation(); nav.classList.toggle('open'); });
  d.addEventListener('click', function (e) { if (!nav.contains(e.target)) nav.classList.remove('open'); });

  var sr = $('#cm-search'), si = $('#cm-search-input');
  function openS() { sr.classList.add('open'); setTimeout(function () { si.focus(); }, 20); }
  function closeS() { sr.classList.remove('open'); }
  $('#cm-search-open').addEventListener('click', openS);
  sr.addEventListener('click', function (e) { if (e.target === sr) closeS(); });
  d.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeS(); nav.classList.remove('open'); }
    if (e.key === '/' && !/INPUT|TEXTAREA|SELECT/.test(d.activeElement.tagName) && !d.activeElement.isContentEditable) { e.preventDefault(); openS(); }
  });

  /* ---------- Link lists from theme variables ("Label|URL;Label|URL") ---------- */
  $$('[data-links]').forEach(function (box) {
    var ul = box.querySelector('.cm-links'); if (!ul) return;
    (box.getAttribute('data-links') || '').split(';').forEach(function (p) {
      var i = p.indexOf('|'); if (i < 1) return;
      var name = p.slice(0, i).trim(), url = p.slice(i + 1).trim();
      if (!name || !/^(https?:\/\/|\/|#|mailto:)/i.test(url)) return;
      var li = el('li'), a = el('a', '', name); a.href = url; li.appendChild(a); ul.appendChild(li);
    });
  });

  /* ---------- Social icons (name -> svg path, static trusted markup) ---------- */
  var ICONS = {
    x: 'M18.9 2H22l-7.2 8.2L23 22h-6.6l-5.2-6.8L5.3 22H2l7.7-8.8L1.5 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20z',
    twitter: 'M18.9 2H22l-7.2 8.2L23 22h-6.6l-5.2-6.8L5.3 22H2l7.7-8.8L1.5 2h6.8l4.7 6.2L18.9 2zm-1.2 18h1.8L7.4 3.9H5.5L17.7 20z',
    github: 'M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 6.844c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.216.694.825.576C20.565 21.796 24 17.3 24 12.297c0-6.627-5.373-12-12-12',
    linkedin: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
    youtube: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
    facebook: 'M22 12a10 10 0 1 0-11.600 9.900v-7H7.900V12h2.500V9.800c0-2.500 1.500-3.900 3.800-3.900 1.100 0 2.200.2 2.200.2v2.500h-1.300c-1.200 0-1.600.8-1.600 1.600V12h2.800l-.4 2.900h-2.300v7A10 10 0 0 0 22 12z',
    instagram: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5zm0 2a3 3 0 0 0-3 3v10a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V7a3 3 0 0 0-3-3H7zm5 3.5a4.5 4.5 0 1 1 0 9 4.5 4.5 0 0 1 0-9zm0 2a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM17.5 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z',
    telegram: 'M9.78 18.65l.28-4.23 7.68-6.92c.34-.31-.07-.46-.52-.19L7.74 13.3 3.64 12c-.88-.25-.89-.86.2-1.3l15.97-6.16c.73-.33 1.43.18 1.15 1.3l-2.72 12.81c-.19.91-.74 1.13-1.5.71L12.6 16.3l-1.99 1.93c-.23.23-.42.42-.83.42z',
    website: 'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm6.900 9h-3.100a15.700 15.700 0 0 0-1.400-6A8 8 0 0 1 18.900 11zM12 4c.8 1 1.600 3 1.800 7h-3.600C10.400 7 11.200 5 12 4zM4.300 13h3.100c.1 2.200.6 4.300 1.400 6a8 8 0 0 1-4.500-6zm3.100-2H4.300a8 8 0 0 1 4.500-6c-.8 1.700-1.300 3.800-1.400 6zM12 20c-.8-1-1.600-3-1.800-7h3.600c-.2 4-1 6-1.800 7zm3.200-1c.8-1.700 1.300-3.800 1.400-6h3.100a8 8 0 0 1-4.500 6z'
  };
  $$('.cm-social a').forEach(function (a) {
    var k = a.textContent.trim().toLowerCase().replace(/[^a-z]/g, '');
    var p = ICONS[k] || ICONS.website;
    a.setAttribute('aria-label', a.textContent.trim());
    a.setAttribute('rel', 'noopener me');
    a.textContent = '';
    var s = d.createElementNS('http://www.w3.org/2000/svg', 'svg');
    s.setAttribute('viewBox', '0 0 24 24');
    var path = d.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', p); s.appendChild(path); a.appendChild(s);
  });

  /* ---------- Google Analytics 4 ---------- */
  if (/^G-[A-Z0-9]+$/i.test(ds.ga || '')) {
    var g = el('script'); g.async = true; g.src = 'https://www.googletagmanager.com/gtag/js?id=' + ds.ga; d.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date()); window.gtag('config', ds.ga);
  }

  /* ---------- Label list (from hidden Label widget) ---------- */
  var labels = $$('#cm-label-src li').map(function (li) {
    var a = li.querySelector('a');
    return { name: a.getAttribute('data-name') || a.textContent.trim(), url: a.href, count: parseInt(a.getAttribute('data-count'), 10) || 0 };
  });

  /* ---------- Card builders (DOM, textContent only) ---------- */
  function cardFromEntry(e) {
    var url = entryUrl(e), c = el('article', 'cm-post');
    var imgA = el('a', 'cm-img'); imgA.href = url; imgA.tabIndex = -1; imgA.setAttribute('aria-hidden', 'true');
    var th = thumbOf(e);
    if (th) { var im = el('img'); im.src = bigImg(th, 640, 360); im.alt = ''; im.loading = 'lazy'; im.width = 640; im.height = 360; imgA.appendChild(im); } else imgA.appendChild(el('div', 'cm-noimg'));
    var h = el('h3'), ha = el('a', '', e.title.$t); ha.href = url; h.appendChild(ha);
    var content = (e.content && e.content.$t) || (e.summary && e.summary.$t) || '';
    var ex = el('p', 'cm-ex', plain(content).slice(0, 180));
    var foot = el('div', 'cm-foot'), meta = el('span', 'cm-meta');
    meta.appendChild(d.createTextNode(fmtDate(e.published.$t)));
    var rt = el('span', 'dot', ' ' + readMin(content) + ' min read'); meta.appendChild(rt);
    var more = el('a', 'cm-more', 'Read more →'); more.href = url;
    foot.appendChild(meta); foot.appendChild(more);
    [imgA, h, ex, foot].forEach(function (n) { c.appendChild(n); });
    return c;
  }

  /* ---------- HOME ---------- */
  function miniFromEntry(e) {
    var url = entryUrl(e), c = el('article', 'cm-mini');
    var a = el('a', 'cm-img'); a.href = url; a.tabIndex = -1;
    var th = thumbOf(e);
    if (th) { var im = el('img'); im.src = bigImg(th, 500, 280); im.alt = ''; im.loading = 'lazy'; a.appendChild(im); } else a.appendChild(el('div', 'cm-noimg'));
    var h = el('h3'), ha = el('a', '', e.title.$t); ha.href = url; h.appendChild(ha);
    c.appendChild(a); c.appendChild(h); c.appendChild(el('div', 'cm-meta', fmtDate(e.published.$t)));
    return c;
  }
  function bigFromEntry(e) {
    var url = entryUrl(e), c = el('article', 'cm-big');
    var a = el('a', 'cm-img'); a.href = url; a.tabIndex = -1;
    var th = thumbOf(e);
    if (th) { var im = el('img'); im.src = bigImg(th, 1000, 560); im.alt = ''; a.appendChild(im); } else a.appendChild(el('div', 'cm-noimg'));
    var h = el('h2'), ha = el('a', '', e.title.$t); ha.href = url; h.appendChild(ha);
    var content = (e.content && e.content.$t) || '';
    c.appendChild(a); c.appendChild(h);
    c.appendChild(el('p', 'cm-ex', plain(content).slice(0, 220)));
    c.appendChild(el('div', 'cm-meta', fmtDate(e.published.$t) + ' · ' + readMin(content) + ' min read'));
    return c;
  }
  function randomCats(host, list) {
    var n = parseInt(ds.catCount, 10); if (!(n >= 0)) n = 3;
    var perRow = Math.min(6, Math.max(1, parseInt(ds.catPosts, 10) || 3));
    var skip = (ds.catExclude || '').toLowerCase().split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    var pool = list.filter(function (l) { return l.count !== 0 && skip.indexOf(l.name.toLowerCase()) < 0; });
    for (var i = pool.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)), t = pool[i]; pool[i] = pool[k]; pool[k] = t; }
    pool.slice(0, n).forEach(function (l) {
      var panel = el('section', 'cm-panel'), head = el('div', 'cm-panel-head');
      var h2 = el('h2', '', l.name); if (l.count > 0) h2.appendChild(el('span', 'cm-count', l.count + (l.count === 1 ? ' post' : ' posts')));
      var va = el('a', '', 'View all →'); va.href = l.url;
      head.appendChild(h2); head.appendChild(va);
      var grid = el('div', 'cm-grid cm-skel');
      for (var s = 0; s < perRow; s++) { var sk = el('div', 'cm-post'); sk.appendChild(el('i')); sk.firstChild.style.height = '150px'; grid.appendChild(sk); }
      panel.appendChild(head); panel.appendChild(grid); host.appendChild(panel);
      getJSON('/feeds/posts/default/-/' + encodeURIComponent(l.name) + '?alt=json&max-results=' + perRow, function (j) {
        if (!j || !j.feed || !j.feed.entry) { panel.remove(); return; }
        grid.className = 'cm-grid'; grid.textContent = '';
        j.feed.entry.forEach(function (e) { grid.appendChild(cardFromEntry(e)); });
      });
    });
  }
  function homeSetup(list) {
    var brand = $('.cm-brand'), slot = $('#cm-slot-brand'), adHome = $('.cm-ad-home');
    if (brand && slot) { slot.appendChild(brand); if (adHome) slot.appendChild(adHome); }
    var host = $('#cm-cats');
    if (host && list.length) randomCats(host, list);
  }

  if (B.classList.contains('pt-index')) {
    var isHome = location.pathname === '/' || /^\/(index\.html)?$/.test(location.pathname);
    if ($('.cm-feature') || $('.cm-post')) {
      if (labels.length) homeSetup(labels);
      else getJSON('/feeds/posts/default?alt=json&max-results=1', function (j) {
        homeSetup(((j && j.feed && j.feed.category) || []).map(function (c) { return { name: c.term, url: '/search/label/' + encodeURIComponent(c.term), count: -1 }; }));
      });
      var rts = $$('.cm-rt[data-href]');
      if (rts.length) {
        getJSON('/feeds/posts/default?alt=json&max-results=' + Math.min(30, rts.length + 10), function (j) {
          if (!j || !j.feed || !j.feed.entry) return;
          var map = {};
          j.feed.entry.forEach(function (e) { map[entryUrl(e).replace(/^https?:/, '')] = readMin((e.content && e.content.$t) || ''); });
          rts.forEach(function (s) { var m = map[s.getAttribute('data-href').replace(/^https?:/, '')]; if (m) s.textContent = m + ' min read'; });
        });
      }
    } else if (isHome && !location.search) {
      /* Fallback: the Blog widget did not render (empty layout). Build the homepage from the public feed. */
      var main = $('#cm-main'), brandEl = $('.cm-brand');
      getJSON('/feeds/posts/default?alt=json&max-results=14', function (j) {
        var ents = (j && j.feed && j.feed.entry) || [];
        if (!ents.length) return;
        var wrap = el('div', 'cm-fallback');
        var feat = el('section', 'cm-panel cm-feature'), c1 = el('div', 'cm-col'), c3 = el('div', 'cm-col');
        [1, 2].forEach(function (i) { if (ents[i]) c1.appendChild(miniFromEntry(ents[i])); });
        [3, 4].forEach(function (i) { if (ents[i]) c3.appendChild(miniFromEntry(ents[i])); });
        feat.appendChild(c1); feat.appendChild(bigFromEntry(ents[0])); feat.appendChild(c3);
        wrap.appendChild(feat);
        var slot2 = el('div'); slot2.id = 'cm-slot-brand'; wrap.appendChild(slot2);
        var cats = el('div', 'cm-cats'); cats.id = 'cm-cats'; wrap.appendChild(cats);
        if (ents.length > 5) {
          var lp = el('section', 'cm-panel'), hd = el('div', 'cm-panel-head'), g = el('div', 'cm-grid');
          hd.appendChild(el('h2', '', 'Latest articles')); var all = el('a', '', 'View full articles →'); all.href = '/search'; hd.appendChild(all);
          ents.slice(5).forEach(function (e) { g.appendChild(cardFromEntry(e)); });
          lp.appendChild(hd); lp.appendChild(g); wrap.appendChild(lp);
        }
        var row = el('div', 'cm-actions-row'), btn = el('a', 'cm-btn', 'View full articles'); btn.href = '/search'; row.appendChild(btn); wrap.appendChild(row);
        place(wrap);
        var fl = ((j.feed.category) || []).map(function (c) { return { name: c.term, url: '/search/label/' + encodeURIComponent(c.term), count: -1 }; });
        homeSetup(labels.length ? labels : fl);
      });
    } else if (!isHome) {
      renderList();
    }
  }

  /* ---------- ARTICLE ---------- */
  function initArticle(art) {

    var body = $('#cm-body'), pid = art.getAttribute('data-post-id');

    // reading progress
    var bar = el('div', 'cm-progress'); B.appendChild(bar);
    window.addEventListener('scroll', function () {
      var h = d.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%';
    }, { passive: true });

    // drop duplicate leading image (hero already shows it)
    var hero = $('.cm-hero img');
    if (hero) {
      var fit = function () { if (hero.naturalWidth && hero.naturalWidth < 640) hero.parentNode.classList.add('small'); };
      if (hero.complete) fit(); else hero.addEventListener('load', fit);
    }
    if (hero && body) {
      var first = body.querySelector('img');
      var key = function (u) { return (u || '').replace(/\/(s|w)\d+[^/]*\//, '/').replace(/=.*$/, ''); };
      if (first && key(first.src) === key(hero.src)) {
        var box = first.closest('.separator') || first.closest('a') || first; box.remove();
      }
    }

    // table of contents (left rail) with scroll-spy; falls back to an "about" card
    var toc = $('#cm-toc'), about = $('#cm-about'), tocLinks = [];
    if (toc && body && ds.toc !== 'no') {
      var hs = $$('h2,h3', body);
      if (hs.length >= 2) {
        var ol = el('ol');
        hs.forEach(function (h, i) {
          if (!h.id) h.id = 'sec-' + (i + 1);
          var li = el('li', h.tagName === 'H3' ? 'l3' : ''), a = el('a', '', h.textContent); a.href = '#' + h.id; li.appendChild(a); ol.appendChild(li); tocLinks.push([h, a]);
        });
        toc.appendChild(ol); toc.hidden = false;
        var spy = function () {
          var cur = tocLinks[0];
          tocLinks.forEach(function (p) { if (p[0].getBoundingClientRect().top < 140) cur = p; });
          tocLinks.forEach(function (p) { p[1].classList.toggle('on', p === cur); });
        };
        spy(); window.addEventListener('scroll', spy, { passive: true });
      }
    }
    if (about && (!toc || toc.hidden)) about.hidden = false;

    var pa1 = $('.cm-ad-pa1'); if (pa1 && body) body.insertAdjacentElement('beforebegin', pa1);
    // in-article ad after paragraph N
    var adIn = $('.cm-ad-in');
    if (adIn && body) {
      var ps = $$(':scope > p, :scope > div', body).filter(function (p) { return p.textContent.trim().length > 60; });
      var at = Math.max(1, parseInt(ds.adPara, 10) || 3);
      if (ps[at - 1]) ps[at - 1].insertAdjacentElement('afterend', adIn);
    }
    var adEnd = $('.cm-ad-end'), tags = $('.cm-tags');
    if (adEnd && tags) tags.insertAdjacentElement('beforebegin', adEnd);

    // share bars (top + bottom): icon buttons
    var u = encodeURIComponent(location.href.split('#')[0]), tt = encodeURIComponent(($('.cm-title') || {}).textContent || '');
    var NETS = [['X', 'x', 'https://twitter.com/intent/tweet?url=' + u + '&text=' + tt], ['Facebook', 'facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + u], ['LinkedIn', 'linkedin', 'https://www.linkedin.com/sharing/share-offsite/?url=' + u], ['Telegram', 'telegram', 'https://t.me/share/url?url=' + u + '&text=' + tt]];
    function icon(path, vb) { var sv = d.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('viewBox', vb || '0 0 24 24'); var p = d.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', path); sv.appendChild(p); return sv; }
    $$('.cm-share').forEach(function (share) {
      share.textContent = '';
      NETS.forEach(function (n) {
        var a = el('a'); a.href = n[2]; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', 'Share on ' + n[0]); a.title = 'Share on ' + n[0]; a.appendChild(icon(ICONS[n[1]])); share.appendChild(a);
      });
      var cp = el('button'); cp.type = 'button'; cp.setAttribute('aria-label', 'Copy link'); cp.title = 'Copy link';
      cp.appendChild(icon('M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 1 1 4.2 4.2l-1.500 1.500a1 1 0 1 1-1.400-1.400l1.500-1.500a1 1 0 0 0-1.400-1.400l-3 3a1 1 0 0 1-1.400 0zm2.800-2.800a1 1 0 0 1 0 1.400l-3 3a3 3 0 1 1-4.200-4.200l1.500-1.500a1 1 0 0 1 1.400 1.400L7.600 12.200a1 1 0 0 0 1.400 1.400l3-3a1 1 0 0 1 1.400 0z'));
      cp.addEventListener('click', function () { if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { cp.classList.add('ok'); cp.title = 'Copied'; setTimeout(function () { cp.classList.remove('ok'); cp.title = 'Copy link'; }, 2000); }); });
      share.appendChild(cp);
    });

    // feed data: updated date, read time, JSON-LD
    var rtEl = $('#cm-rt'), upEl = $('#cm-updated');
    var firstTag = $('.cm-tags a');
    function ld(entry) {
      var title = $('.cm-title').textContent, img = (hero && hero.src) || ($('meta[property="og:image"]') || {}).content || ds.shareImage || '';
      var pub = entry ? entry.published.$t : '', mod = entry ? entry.updated.$t : pub;
      var site = ds.brand || 'CyberTechMind', origin = location.origin;
      var data = [{
        '@context': 'https://schema.org', '@type': 'BlogPosting', headline: title, description: ($('.cm-sub') || {}).textContent || '',
        image: img ? [img] : undefined, datePublished: pub || undefined, dateModified: mod || undefined,
        author: { '@type': 'Person', name: ($('.cm-author b') || {}).textContent || site },
        publisher: { '@type': 'Organization', name: site, logo: ds.logo ? { '@type': 'ImageObject', url: ds.logo } : undefined },
        mainEntityOfPage: { '@type': 'WebPage', '@id': ($('link[rel=canonical]') || {}).href || location.href }
      }, {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' }].concat(firstTag ? [{ '@type': 'ListItem', position: 2, name: firstTag.textContent.replace(/^#/, ''), item: firstTag.href }, { '@type': 'ListItem', position: 3, name: title }] : [{ '@type': 'ListItem', position: 2, name: title }])
      }];
      var s = el('script'); s.type = 'application/ld+json'; s.text = JSON.stringify(data); d.head.appendChild(s);
    }
    if (pid) {
      getJSON('/feeds/posts/default/' + pid + '?alt=json', function (j) {
        var e = j && j.entry;
        if (e) {
          if (rtEl) rtEl.textContent = readMin((e.content && e.content.$t) || '') + ' min read';
        } else if (body && rtEl) rtEl.textContent = readMin(body.innerHTML) + ' min read';
        ld(e);
      });
    }

    // related posts
    var rel = $('#cm-related');
    if (rel) {
      var lab = firstTag ? firstTag.textContent.replace(/^#/, '') : '';
      var url = lab ? '/feeds/posts/default/-/' + encodeURIComponent(lab) + '?alt=json&max-results=6' : '/feeds/posts/default?alt=json&max-results=6';
      var self = location.href.split(/[?#]/)[0].replace(/^https?:/, '');
      var pick = function (j) { return (j && j.feed && j.feed.entry || []).filter(function (e) { return entryUrl(e).replace(/^https?:/, '') !== self; }).slice(0, 5); };
      getJSON(url, function (j0) {
        var list = pick(j0);
        if (!list.length && lab) { return getJSON('/feeds/posts/default?alt=json&max-results=6', function (j1) { show(pick(j1)); }); }
        show(list);
      });
      function show(list) {
        if (!list.length) { rel.remove(); return; }
        var panel = $('.cm-panel', rel);
        list.forEach(function (e) {
          var u2 = entryUrl(e), row = el('article', 'cm-rel'), txt = el('div');
          var h = el('h3'), a = el('a', '', e.title.$t); a.href = u2; h.appendChild(a);
          var c = (e.content && e.content.$t) || '';
          var meta = el('div', 'cm-meta', fmtDate(e.published.$t) + ' · ' + readMin(c) + ' min read');
          txt.appendChild(h); txt.appendChild(el('p', 'cm-ex', plain(c).slice(0, 150))); txt.appendChild(meta);
          row.appendChild(txt);
          var th = thumbOf(e);
          if (th) { var ia = el('a', 'cm-img'); ia.href = u2; ia.tabIndex = -1; var im = el('img'); im.src = bigImg(th, 480, 300); im.alt = ''; im.loading = 'lazy'; ia.appendChild(im); row.appendChild(ia); }
          panel.appendChild(row);
        });
      }
    }
  }

  /* ---------- FEED-RENDERED PAGES (used when Blogger's Blog widget is not present) ---------- */
  function qs(name) { var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; }
  function idsOf(e) { var m = /blog-(\d+)\.post-(\d+)/.exec(e.id.$t) || /blog-(\d+)\.page-(\d+)/.exec(e.id.$t) || []; return { blog: m[1], post: m[2] }; }
  function place(w) {
    var main = $('#cm-main'), sb = $('#cm-sidebar'), brand = $('.cm-brand');
    if (sb && sb.querySelector('.widget') && !B.classList.contains('pt-item')) {
      var sp = el('div', 'cm-split'); sp.appendChild(w); sp.appendChild(sb); main.insertBefore(sp, brand);
    } else main.insertBefore(w, brand);
  }
  function mount(node) { var old = $('.cm-fallback'); if (old) old.remove(); var w = el('div', 'cm-fallback'); w.appendChild(node); place(w); return w; }

  function renderList() {
    var path = decodeURIComponent(location.pathname), page = Math.max(1, parseInt(qs('page'), 10) || 1), start = (page - 1) * PER + 1;
    var title = 'All articles', url = '/feeds/posts/default?alt=json&max-results=' + PER + '&start-index=' + start, m;
    if ((m = /^\/search\/label\/(.+)$/.exec(path))) { title = m[1]; url = '/feeds/posts/default/-/' + encodeURIComponent(m[1]) + '?alt=json&max-results=' + PER + '&start-index=' + start; }
    else if (qs('q')) { title = 'Results for “' + qs('q') + '”'; url += '&q=' + encodeURIComponent(qs('q')); }
    else if ((m = /^\/(\d{4})\/(\d{2})\/?/.exec(path))) {
      var y = +m[1], mo = +m[2], ny = mo === 12 ? y + 1 : y, nm = mo === 12 ? 1 : mo + 1, p2 = function (n) { return (n < 10 ? '0' : '') + n; };
      title = new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      url += '&published-min=' + y + '-' + p2(mo) + '-01T00:00:00-00:00&published-max=' + ny + '-' + p2(nm) + '-01T00:00:00-00:00';
    }
    var box = el('div'), head = el('div', 'cm-listing-head'), h1 = el('h1', '', title); head.appendChild(h1); box.appendChild(head);
    var panel = el('section', 'cm-panel'), grid = el('div', 'cm-grid'); panel.appendChild(grid); box.appendChild(panel);
    mount(box);
    getJSON(url, function (j) {
      var ents = (j && j.feed && j.feed.entry) || [];
      if (!ents.length) { grid.appendChild(el('p', 'cm-muted', 'No posts found.')).style.padding = '40px'; return; }
      ents.forEach(function (e) { grid.appendChild(cardFromEntry(e)); });
      var total = parseInt(j.feed.openSearch$totalResults.$t, 10) || 0, pager = el('nav', 'cm-pager'); pager.setAttribute('aria-label', 'Pagination');
      var base = location.pathname + location.search.replace(/[?&]page=\d+/, '').replace(/^&/, '?');
      var sep = base.indexOf('?') < 0 ? '?' : '&';
      if (page > 1) { var a = el('a', 'cm-btn ghost', '← Newer posts'); a.href = page === 2 ? base : base + sep + 'page=' + (page - 1); pager.appendChild(a); } else pager.appendChild(el('span'));
      if (start + PER <= total) { var b = el('a', 'cm-btn ghost', 'Older posts →'); b.href = base + sep + 'page=' + (page + 1); pager.appendChild(b); }
      box.appendChild(pager);
    });
  }

  function renderStatic() {
    getJSON('/feeds/pages/default?alt=json&path=' + encodeURIComponent(location.pathname), function (j) {
      var e = j && j.feed && j.feed.entry && j.feed.entry[0]; if (!e) return;
      var art = el('article', 'cm-panel cm-static'), h = el('h1', 'cm-title', e.title.$t), rd = el('div', 'cm-reading'), body = el('div', 'cm-body post-content');
      rd.style.marginTop = '28px'; body.innerHTML = (e.content && e.content.$t) || ''; rd.appendChild(body); art.appendChild(h); art.appendChild(rd);
      mount(art);
    });
  }

  function renderItem() {
    getJSON('/feeds/posts/default?alt=json&path=' + encodeURIComponent(location.pathname), function (j) {
      var e = j && j.feed && j.feed.entry && j.feed.entry[0]; if (!e) return;
      var ids = idsOf(e), cats = (e.category || []).map(function (c) { return c.term; });
      var content = (e.content && e.content.$t) || '', th = thumbOf(e);
      var an = (e.author && e.author[0] && e.author[0].name && e.author[0].name.$t) || '';

      var layout = el('div', 'cm-post-layout');
      /* left rail: contents + about + ad */
      var left = el('aside', 'cm-rail cm-rail-l'), sticky = el('div', 'cm-sticky');
      var toc = el('nav', 'cm-toc'); toc.id = 'cm-toc'; toc.hidden = true; toc.setAttribute('aria-label', 'Table of contents'); toc.appendChild(el('h2', '', 'On this page'));
      var about = el('div', 'cm-about'); about.id = 'cm-about'; about.hidden = true;
      var bn = $('.cm-brand strong'), bt = $('.cm-brand p');
      about.appendChild(el('b', '', bn ? bn.textContent : '')); about.appendChild(el('p', '', bt ? bt.textContent : ''));
      var fl = el('a', 'cm-more', 'All articles →'); fl.href = '/search'; about.appendChild(fl);
      sticky.appendChild(toc); sticky.appendChild(about);
      var adl = $('.cm-ad-sl'); if (adl) sticky.appendChild(adl);
      left.appendChild(sticky);

      /* centre: article + comments + related */
      var col = el('div', 'cm-main-col');
      var art = el('article', 'cm-article'); art.setAttribute('data-post-id', ids.post);
      if (cats.length) { var tg = el('div', 'cm-topics'); cats.slice(0, 5).forEach(function (c) { var a = el('a', '', c); a.href = '/search/label/' + encodeURIComponent(c); tg.appendChild(a); }); art.appendChild(tg); }
      art.appendChild(el('h1', 'cm-title', e.title.$t));
      if (ds.subtitle !== 'no') { var pl = plain(content), sub = pl.slice(0, 150); if (sub) art.appendChild(el('p', 'cm-sub', sub + (pl.length > 150 ? '…' : ''))); }
      var au = el('div', 'cm-author'), av = el('span', 'av', an.charAt(0).toUpperCase()); av.setAttribute('aria-hidden', 'true');
      var ad = el('div'), nm = el('b', '', an || 'Author'), mt = el('div', 'cm-meta');
      var rtn = el('span', '', readMin(content) + ' min read'); rtn.id = 'cm-rt'; var dt = el('span', 'dot', fmtDate(e.published.$t)); dt.id = 'cm-updated';
      mt.appendChild(rtn); mt.appendChild(dt); ad.appendChild(nm); ad.appendChild(mt); au.appendChild(av); au.appendChild(ad); art.appendChild(au);
      var sh = el('div', 'cm-share'); art.appendChild(sh);
      if (th && ds.heroImage !== 'no') { var fig = el('figure', 'cm-hero'); var im = el('img'); im.src = bigImg(th, 1200, 675); im.alt = e.title.$t; im.width = 1200; im.height = 675; fig.appendChild(im); art.appendChild(fig); }
      var body = el('div', 'cm-body post-content entry-content'); body.id = 'cm-body'; body.innerHTML = content; art.appendChild(body);
      var ae = $('.cm-ad-end'); if (ae) art.appendChild(ae);
      if (cats.length) { var tg2 = el('div', 'cm-tags'); cats.forEach(function (c) { var a = el('a', '', c); a.href = '/search/label/' + encodeURIComponent(c); a.rel = 'tag'; tg2.appendChild(a); }); art.appendChild(tg2); }
      art.appendChild(el('div', 'cm-share cm-share-b'));
      var wr = el('div', 'cm-writer'), wa = el('span', 'av', an.charAt(0).toUpperCase()), wt = el('div');
      wt.appendChild(el('small', '', 'Written by')); wt.appendChild(el('b', '', an || (bn ? bn.textContent : ''))); wr.appendChild(wa); wr.appendChild(wt); art.appendChild(wr);
      col.appendChild(art);
      var cm = el('section', 'cm-comments'); cm.id = 'comments'; col.appendChild(cm);
      var rel = el('section', 'cm-related'); rel.id = 'cm-related'; rel.appendChild(el('h2', '', 'More from this blog')); rel.appendChild(el('div', 'cm-panel')); col.appendChild(rel);

      /* right rail: ads */
      var right = el('aside', 'cm-rail cm-rail-r'), st2 = el('div', 'cm-sticky'), adr = $('.cm-ad-sr'); if (adr) st2.appendChild(adr); var sbar = $('#cm-sidebar'); if (sbar) st2.appendChild(sbar); right.appendChild(st2);
      var pfe = $('.cm-pfe'); if (pfe) col.appendChild(pfe);

      layout.appendChild(left); layout.appendChild(col); layout.appendChild(right);
      mount(layout);
      initArticle(art);
      renderComments(cm, ids);
    });
  }

  function renderComments(cm, ids) {
    var head = el('h4', '', 'Comments'); cm.appendChild(head);
    var link = el('a', 'cm-btn ghost', 'Join the discussion'); link.href = 'https://www.blogger.com/comment/fullpage/post/' + ids.blog + '/' + ids.post; link.target = '_blank'; link.rel = 'noopener';
    getJSON('/feeds/' + ids.post + '/comments/default?alt=json&max-results=50', function (j) {
      var list = (j && j.feed && j.feed.entry) || [];
      head.textContent = 'Comments' + (list.length ? ' (' + list.length + ')' : '');
      if (!list.length) cm.appendChild(el('p', 'cm-muted', 'No comments yet. Be the first to comment.')).style.margin = '0 0 14px';
      list.forEach(function (c) {
        var row = el('div'), who = (c.author && c.author[0] && c.author[0].name && c.author[0].name.$t) || 'Anonymous';
        row.style.cssText = 'padding:12px 0;border-top:1px solid var(--line)';
        var b = el('b', '', who); b.style.fontSize = '.9rem'; row.appendChild(b);
        var t = el('span', 'cm-meta', ' · ' + fmtDate(c.published.$t)); row.appendChild(t);
        var p = el('p', '', plain((c.content && c.content.$t) || '')); p.style.margin = '6px 0 0'; row.appendChild(p); cm.appendChild(row);
      });
      cm.appendChild(link);
    });
  }

  var serverRendered = $('.cm-article') || $('.cm-feature') || $('.cm-post') || $('.cm-static');
  if (serverRendered) { var a0 = $('.cm-article'); if (a0 && B.classList.contains('pt-item')) initArticle(a0); }
  else if (B.classList.contains('pt-item')) renderItem();
  else if (B.classList.contains('pt-static_page')) renderStatic();


  /* ---------- Newsletter (posts to the configured provider) ---------- */
  $$('.cm-news form').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      var i = f.querySelector('input[type=email]');
      if (!i || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())) { e.preventDefault(); i.style.borderColor = '#ef4444'; i.focus(); }
    });
  });
})();
