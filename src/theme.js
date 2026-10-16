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

  /* ---------- JSON settings gadget (Layout > Theme options) override the Theme variables ---------- */
  var CFG = {};
  $$('script[type="application/json"][id^="cm-config"]').forEach(function (n) { try { var o = JSON.parse(n.textContent) || {}; Object.keys(o).forEach(function (k) { CFG[k] = o[k]; }); } catch (e) {} });
  (function applyConfig() {
    var R = d.documentElement, alias = { securityNotice: 'secNotice', showSecurityNotice: 'showSec', newsletterAction: 'newsAction', newsletterTitle: 'newsTitle', newsletterText: 'newsText', showNewsletter: 'showNews', gaId: 'ga', brandName: 'brand', logoImage: 'logo', showLeftSidebar: 'showLsb', showRightRail: 'showRrail', showHeaderCategories: 'showSubnav', sidebarDefault: 'sbDefault' };
    Object.keys(CFG).forEach(function (k) { var v = CFG[k]; if (v === true) v = 'yes'; else if (v === false) v = 'no'; ds[alias[k] || k] = String(v); });
    var off = function (v) { return v === 'no' || v === 'false' || v === '0'; };
    R.classList.toggle('no-lsb', off(ds.showLsb)); R.classList.toggle('no-rrail', off(ds.showRrail)); R.classList.toggle('no-footer', off(ds.showFooter)); R.classList.toggle('no-subnav', off(ds.showSubnav));
    var setText = function (sel, t) { $$(sel).forEach(function (n) { n.textContent = t; }); };
    if (CFG.brandName) { setText('.cm-logo span', CFG.brandName); setText('.cm-footname', CFG.brandName); }
    if (CFG.tagline) setText('.cm-footbrand p', CFG.tagline);
    if (CFG.footerText || CFG.brandName) { var cd = $('.cm-copy-default'); if (cd) cd.textContent = '\u00a9 ' + (CFG.brandName || ds.brand || '') + ' \u00b7 ' + (CFG.footerText || ''); }
    if (CFG.logoImage) { var lg = $('.cm-logo'); if (lg) { var im = lg.querySelector('img') || lg.insertBefore(el('img'), lg.firstChild); im.src = CFG.logoImage; im.alt = CFG.brandName || ''; im.height = 32; } }
    if (CFG.faviconUrl) { $$('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]').forEach(function (l) { l.remove(); }); [['icon', ''], ['apple-touch-icon', '']].forEach(function (r) { var l = el('link'); l.rel = r[0]; l.href = CFG.faviconUrl; d.head.appendChild(l); }); }
    if (CFG.accentColor) R.style.setProperty('--accent', CFG.accentColor);
    if (CFG.contentWidth) R.style.setProperty('--width', /^\d+$/.test(String(CFG.contentWidth)) ? CFG.contentWidth + 'px' : CFG.contentWidth);
    if (CFG.contactUrl || CFG.contactLabel) { var cta = $('.cm-cta'); if (cta) { if (CFG.contactUrl) cta.href = CFG.contactUrl; if (CFG.contactLabel) cta.textContent = CFG.contactLabel; } }
    [['menuLinks', '#cm-nav'], ['socialLinks', '.cm-social'], ['footerLinks', '.cm-footnav']].forEach(function (m) { if (CFG[m[0]]) { var n = $(m[1]); if (n) n.setAttribute('data-links', CFG[m[0]]); } });
    var stored = null; try { stored = localStorage.getItem('cmTheme'); } catch (e) {}
    if (!stored && CFG.defaultTheme) { var t = CFG.defaultTheme === 'auto' ? (matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark') : CFG.defaultTheme; if (/^(dark|light|sepia)$/.test(t)) R.setAttribute('data-theme', t); }
  })();
  function words(html) { return (html || '').replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length; }
  function plain(html) { var t = new DOMParser().parseFromString(html || '', 'text/html'); return (t.body.textContent || '').replace(/\s+/g, ' ').trim(); }
  function thumbOf(e) {
    var t = e['media$thumbnail'] && e['media$thumbnail'].url;
    if (t) return t;
    var m = /<img[^>]+src=["']([^"']+)["']/i.exec((e.content && e.content.$t) || '');
    return m ? m[1] : '';
  }
  function leadText(html) {
    var dd = new DOMParser().parseFromString(html || '', 'text/html');
    [].forEach.call(dd.querySelectorAll('.cm-pinfo,pre,h1,h2,h3,h4,blockquote,table,figure,script,style,ul,ol'), function (n) { n.remove(); });
    var p = dd.querySelector('p'); return ((p ? p.textContent : dd.body.textContent) || '').replace(/\s+/g, ' ').trim();
  }
  function isSeries(l) { return /^series\s*:/i.test(l); }
  function realLabels(a) { return a.filter(function (l) { return !isSeries(l); }); }
  function ago(iso) {
    var s = (Date.now() - new Date(iso).getTime()) / 1000;
    if (!(s >= 0)) return fmtDate(iso);
    var u = [[31536000, 'year'], [2592000, 'month'], [86400, 'day'], [3600, 'hour'], [60, 'minute']];
    for (var i = 0; i < u.length; i++) { var n = Math.floor(s / u[i][0]); if (n >= 1) return n + ' ' + u[i][1] + (n > 1 ? 's' : '') + ' ago'; }
    return 'just now';
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
  /* feed fetch with a short session cache (5 min); { fresh: true } always goes to the network */
  function getJSON(url, cb, opts) {
    var fresh = opts && opts.fresh, key = 'cm:' + url;
    if (!fresh) {
      var c = store.get(key);
      if (c) { try { var o = JSON.parse(c); if (o && o.t && Date.now() - o.t < 300000) return cb(o.v); } catch (e) {} }
    }
    fetch(fresh ? url + (url.indexOf('?') < 0 ? '?' : '&') + '_=' + Date.now() : url).then(function (r) { return r.ok ? r.json() : Promise.reject(); }).then(function (j) { if (!fresh) store.set(key, JSON.stringify({ t: Date.now(), v: j })); cb(j); }).catch(function () { cb(null); });
  }
  function entryUrl(e) { var l = (e.link || []).filter(function (x) { return x.rel === 'alternate'; })[0]; return l ? l.href : ''; }

  /* ---------- Header, theme, search, menu ---------- */
  var header = $('#cm-header'), nav = $('#cm-nav'), root = d.documentElement;
  var wide = window.matchMedia('(min-width: 1241px)'), condensed = false;
  function onScroll() {
    var y = window.scrollY; header.classList.toggle('is-scrolled', y > 8);
    var c = wide.matches && !root.classList.contains('no-subnav') && (condensed ? y > 50 : y > 130);
    if (c !== condensed) { condensed = c; header.classList.toggle('is-condensed', c); root.classList.toggle('is-condensed', c); }
  }
  if (wide.addEventListener) wide.addEventListener('change', onScroll);
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  $('#cm-theme').addEventListener('click', function () {
    var t = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('cmTheme', t); } catch (e) {}
  });

  d.addEventListener('keydown', function (e) {
    var typing = /INPUT|TEXTAREA|SELECT/.test(d.activeElement.tagName) || d.activeElement.isContentEditable;
    if (e.key === 'Escape') nav.classList.remove('open');
    if (((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') || (e.key === '/' && !typing)) { e.preventDefault(); if (window.cmFind) window.cmFind.open(); }
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



/*@@SEARCH@@*/
/*@@BLOCKS@@*/
/*@@READING@@*/
/*@@LINKS@@*/
  /* =====================================================================
     SIDEBAR + PAGES: every page is drawn from the public feed into a
     3-column shell (collapsible sidebar / content / right rail)
     ===================================================================== */
  var main = $('#cm-main'), endMark = $('#cm-main-end');
  var isItem = B.classList.contains('pt-item'), isStatic = B.classList.contains('pt-static_page'), isHome = B.classList.contains('is-home');
  var curUrl = location.href.split(/[?#]/)[0].replace(/^https?:/, '');
  var curLabel = '', curSeries = '';
  function notCur(e) { return entryUrl(e).replace(/^https?:/, '') !== curUrl; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var k = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[k]; a[k] = t; } return a; }
  function sico(path, cls) { var sv = d.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('viewBox', '0 0 24 24'); sv.setAttribute('class', 'cm-i' + (cls ? ' ' + cls : '')); var p = d.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', path); sv.appendChild(p); return sv; }
  var SI = {
    home: 'M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
    article: 'M5 4h14v16H5zM8 8h8M8 12h8M8 16h5',
    tag: 'M3 12V4h8l10 10-8 8zM7.5 8.5h.01',
    list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
    user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0',
    mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
    rss: 'M4 11a9 9 0 0 1 9 9M4 4a16 16 0 0 1 16 16M5 19h.01',
    link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1',
    chev: 'M9 6l6 6-6 6',
    updown: 'M8 9l4-4 4 4M8 15l4 4 4-4'
  };
  function iconFor(name) {
    var n = name.toLowerCase();
    if (/home/.test(n)) return SI.home;
    if (/about|author|team|profile/.test(n)) return SI.user;
    if (/contact|mail|email/.test(n)) return SI.mail;
    if (/categor|topic|tag|label/.test(n)) return SI.tag;
    if (/article|post|blog|archive|all/.test(n)) return SI.article;
    return SI.link;
  }


  /* ---------- shared feed (30 newest posts + all categories) ---------- */
  var feedData = null, feedCbs = [];
  function onFeed(cb) { if (feedData) cb(feedData); else feedCbs.push(cb); }
  getJSON('/feeds/posts/default?alt=json&max-results=30', function (j) {
    var f = (j && j.feed) || {};
    feedData = { ents: f.entry || [], series: (f.category || []).map(function (c) { return c.term; }).filter(isSeries), cats: realLabels((f.category || []).map(function (c) { return c.term; })) };
    feedCbs.forEach(function (cb) { cb(feedData); });
  });

  /* ---------- mega menu navbar (second header row) ---------- */
  (function mega() {
    var nav = $('#cm-mega-nav'), panel = $('#cm-mega'), sub = $('#cm-subnav');
    if (!nav || !panel || !sub) return;
    var openBtn = null, openT = null, closeT = null, token = 0, topCats = [], restCats = [];
    function close() {
      clearTimeout(openT); if (!openBtn) return;
      openBtn.setAttribute('aria-expanded', 'false'); openBtn.classList.remove('open'); openBtn = null;
      panel.classList.remove('open'); setTimeout(function () { if (!openBtn) panel.hidden = true; }, 180);
    }
    function mlink(href, text, small) { var a = el('a', 'cm-mlink'); a.href = href; a.appendChild(el('span', '', text)); if (small) a.appendChild(el('small', '', small)); return a; }
    function col(title) { var c = el('div', 'cm-mcol'); c.appendChild(el('h3', '', title)); return c; }
    function promo(e, kicker) {
      var a = el('a', 'cm-promo'), th = e && thumbOf(e);
      a.href = e ? entryUrl(e) : '/search';
      if (th) a.style.backgroundImage = 'url("' + bigImg(th, 640, 720) + '")';
      a.appendChild(el('span', 'cm-promo-k', kicker)); a.appendChild(el('strong', '', e ? e.title.$t : 'Browse all articles'));
      a.appendChild(el('span', 'cm-btn light', e ? 'Read article' : 'View all'));
      return a;
    }
    function skeleton() {
      var g = el('div', 'cm-mega-grid');
      for (var c = 0; c < 3; c++) { var cc = el('div', 'cm-mcol'); cc.appendChild(sk('', c === 2 ? '100%' : '55%', c === 2 ? '240px' : '12px')); for (var i = 0; c < 2 && i < 5; i++) { cc.appendChild(sk('', (60 + (i * 7) % 30) + '%', '12px')); cc.lastChild.style.margin = '16px 0 0'; } g.appendChild(cc); }
      return g;
    }
    function build(cat, posts) {
      var g = el('div', 'cm-mega-grid');
      var a = col(cat ? 'Latest in ' + cat : 'Latest posts');
      posts.slice(0, 5).forEach(function (e) { a.appendChild(mlink(entryUrl(e), e.title.$t, fmtDate(e.published.$t))); });
      if (cat) { var all = mlink('/search/label/' + encodeURIComponent(cat), 'View all in ' + cat + ' →'); all.className += ' cm-mall'; a.appendChild(all); }
      var b = col(cat ? 'Explore topics' : 'All topics'), list = cat ? topCats.filter(function (c) { return c !== cat; }).concat(restCats).slice(0, 7) : restCats;
      var bl = el('div', cat ? 'cm-mlist' : 'cm-mlist two'); list.forEach(function (c) { bl.appendChild(mlink('/search/label/' + encodeURIComponent(c), c)); }); b.appendChild(bl);
      g.appendChild(a); g.appendChild(b); g.appendChild(promo(posts[0], cat ? 'Featured in ' + cat : 'New'));
      return g;
    }
    function open(btn, cat) {
      clearTimeout(closeT); if (openBtn === btn) return;
      if (openBtn) { openBtn.setAttribute('aria-expanded', 'false'); openBtn.classList.remove('open'); }
      openBtn = btn; btn.setAttribute('aria-expanded', 'true'); btn.classList.add('open');
      var my = ++token; panel.textContent = ''; panel.appendChild(skeleton());
      panel.hidden = false; requestAnimationFrame(function () { panel.classList.add('open'); });
      var done = function (posts) { if (my !== token) return; panel.textContent = ''; panel.appendChild(build(cat, posts)); };
      if (cat) getJSON('/feeds/posts/default/-/' + encodeURIComponent(cat) + '?alt=json&max-results=6', function (j) { done((j && j.feed && j.feed.entry) || []); });
      else done(feedData ? feedData.ents.slice(0, 5) : []);
    }
    function item(label, cat) {
      var b = el('button', 'cm-mi'); b.type = 'button'; b.setAttribute('aria-expanded', 'false'); b.setAttribute('aria-haspopup', 'true');
      b.appendChild(el('span', '', label)); b.appendChild(sico(SI.chev, 'cm-mi-chev'));
      if (cat && decodeURIComponent(location.pathname).indexOf('/search/label/' + cat) === 0) b.classList.add('current');
      b.addEventListener('mouseenter', function () { clearTimeout(closeT); clearTimeout(openT); openT = setTimeout(function () { open(b, cat); }, 90); });
      b.addEventListener('click', function (e) { e.stopPropagation(); if (openBtn === b) close(); else open(b, cat); });
      nav.appendChild(b);
    }
    onFeed(function (f) {
      var tally = {}; f.ents.forEach(function (e) { (e.category || []).forEach(function (c) { tally[c.term] = (tally[c.term] || 0) + 1; }); });
      var cats = f.cats.slice().sort(function (a, b) { return (tally[b] || 0) - (tally[a] || 0); });
      topCats = cats.slice(0, 6); restCats = cats.slice(6);
      topCats.forEach(function (c) { item(c, c); });
      if (restCats.length) item('More', null);
      if (!cats.length) sub.classList.add('empty');
    });
    sub.addEventListener('mouseleave', function () { clearTimeout(openT); clearTimeout(closeT); closeT = setTimeout(close, 220); });
    panel.addEventListener('mouseenter', function () { clearTimeout(closeT); });
    d.addEventListener('click', function (e) { if (openBtn && !panel.contains(e.target)) close(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    panel.addEventListener('click', function (e) { if (e.target.closest('a')) close(); });
  })();

  /* ---------- skeleton loaders ---------- */
  function sk(cls, w, h) { var s = el('i', 'cm-sk ' + (cls || '')); if (w) s.style.width = w; if (h) s.style.height = h; return s; }
  function skRows(n) { var f = d.createDocumentFragment(); for (var i = 0; i < n; i++) { var r = el('div', 'cm-row'); r.appendChild(sk('', '60px', '60px')); var t = el('div', 'cm-row-tx'); t.style.flex = '1'; t.appendChild(sk('', '92%', '12px')); t.appendChild(sk('', '60%', '12px')); r.appendChild(t); f.appendChild(r); } return f; }
  function skCard() { var c = el('div', 'cm-post'); c.appendChild(sk('', '100%', '0')); c.firstChild.style.aspectRatio = '16/9'; c.appendChild(sk('', '90%', '16px')); c.appendChild(sk('', '100%', '12px')); c.appendChild(sk('', '70%', '12px')); return c; }
  function skPanel(n) { var p = el('section', 'cm-panel'), h = el('div', 'cm-panel-head'); h.appendChild(sk('', '140px', '18px')); p.appendChild(h); var g = el('div', 'cm-grid'); for (var i = 0; i < n; i++) g.appendChild(skCard()); p.appendChild(g); return p; }
  function skeletonFor() {
    var w = el('div', 'cm-content cm-loading'); w.setAttribute('aria-busy', 'true');
    if (isItem || isStatic) {
      w.appendChild(sk('', '120px', '28px')); w.lastChild.style.margin = '0 0 18px';
      w.appendChild(sk('', '92%', '40px')); w.lastChild.style.margin = '0 0 10px'; w.appendChild(sk('', '68%', '40px')); w.lastChild.style.margin = '0 0 22px';
      var by = el('div', 'cm-author'); by.appendChild(sk('', '46px', '46px')); by.firstChild.style.borderRadius = '50%'; var bt = el('div'); bt.style.flex = '1'; bt.appendChild(sk('', '160px', '14px')); bt.appendChild(sk('', '110px', '12px')); bt.lastChild.style.marginTop = '8px'; by.appendChild(bt); w.appendChild(by);
      var hero = sk('', '100%', '0'); hero.style.aspectRatio = '16/9'; hero.style.borderRadius = '16px'; hero.style.margin = '12px 0 30px'; w.appendChild(hero);
      for (var i = 0; i < 7; i++) { var l = sk('', i % 3 === 2 ? '72%' : '100%', '14px'); l.style.margin = '0 0 14px'; w.appendChild(l); }
    } else if (isHome && !qs('page') && !location.search) {
      var f = el('section', 'cm-panel cm-feature'), big = el('div', 'cm-big'); var im = sk('', '100%', '0'); im.style.aspectRatio = '16/8.4'; big.appendChild(im); big.appendChild(sk('', '80%', '26px')); big.appendChild(sk('', '100%', '12px')); big.appendChild(sk('', '60%', '12px'));
      var hl = el('div', 'cm-hlist'); hl.appendChild(skRows(4)); f.appendChild(big); f.appendChild(hl); w.appendChild(f); w.appendChild(skPanel(3)); w.appendChild(skPanel(3));
    } else {
      w.appendChild(sk('', '220px', '30px')); w.lastChild.style.margin = '6px 0 22px'; var p = el('section', 'cm-panel'), g = el('div', 'cm-grid'); for (var j = 0; j < 6; j++) g.appendChild(skCard()); p.appendChild(g); w.appendChild(p);
    }
    return w;
  }

  /* ---------- sidebar (shadcn style, collapsible) ---------- */
  var mq = window.matchMedia('(max-width: 1240px)');
  function setCollapsed(on) {
    root.setAttribute('data-sb', on ? 'min' : 'full');
    try { localStorage.setItem('cmSb', on ? 'min' : 'full'); } catch (e) {}
    $$('[data-act="sidebar"]').forEach(function (t) { t.setAttribute('aria-expanded', String(!on)); });
  }
  var saved = null; try { saved = localStorage.getItem('cmSb'); } catch (e) {}
  root.setAttribute('data-sb', saved === 'full' ? 'full' : saved === 'min' ? 'min' : (ds.sbDefault === 'expanded' ? 'full' : 'min'));
  function toggleSb() {
    if (mq.matches) { B.classList.toggle('sb-open'); return; }
    setCollapsed(root.getAttribute('data-sb') !== 'min');
  }
  d.addEventListener('click', function (e) {
    var b = e.target.closest('[data-act]'); if (!b) return; var a = b.getAttribute('data-act');
    if (a === 'search') { e.preventDefault(); if (window.cmFind) window.cmFind.open(); }
    else if (a === 'sidebar') { e.preventDefault(); toggleSb(); }
  });
  d.addEventListener('keydown', function (e) {
    if ((e.key === 'b' || e.key === 'B') && !e.metaKey && !e.ctrlKey && !/INPUT|TEXTAREA|SELECT/.test(d.activeElement.tagName) && !d.activeElement.isContentEditable) { e.preventDefault(); toggleSb(); }
    if (e.key === 'Escape') B.classList.remove('sb-open');
  });
  d.addEventListener('click', function (e) { if (B.classList.contains('sb-open') && !e.target.closest('.cm-rail-l') && !e.target.closest('[data-act="sidebar"]')) B.classList.remove('sb-open'); });

  function sbItem(label, path, href) {
    var li = el('li', 'cm-sb-li'), a = el(href ? 'a' : 'button', 'cm-sb-item');
    if (href) { a.href = href; if (href === location.pathname && !location.search) a.className += ' active'; } else a.type = 'button';
    a.title = label; a.appendChild(sico(path)); a.appendChild(el('span', 'cm-sb-label', label)); li.appendChild(a);
    return { li: li, a: a };
  }
  function sbSub(label, path, id) {
    var it = sbItem(label, path), sub = el('ul', 'cm-sb-sub'); if (id) sub.id = id;
    it.a.appendChild(sico(SI.chev, 'cm-sb-chev')); it.li.classList.add('has-sub'); it.li.appendChild(sub);
    it.a.addEventListener('click', function () {
      if (root.getAttribute('data-sb') === 'min' && !mq.matches) setCollapsed(false);
      it.li.classList.toggle('open');
    });
    return { li: it.li, sub: sub };
  }
  function leftRail() {
    var left = el('aside', 'cm-rail cm-rail-l'), sb = el('nav', 'cm-sb'); sb.id = 'cm-sb'; sb.setAttribute('aria-label', 'Sidebar');
    var bn = $('.cm-footname'), bt = $('.cm-footbrand p'), name = (bn && bn.textContent.trim()) || ds.brand || d.title.split(/[|\u2013\u2014-]/).pop().trim() || location.hostname.replace(/^www\./, '').split('.')[0];
    /* brand header */
    var hd = el('a', 'cm-sb-head'); hd.href = '/'; hd.title = name;
    var tile = el('span', 'cm-sb-tile'); var gl = $('.cm-logo-w img') ? $('.cm-logo-w img').src : ds.logo; if (gl) { var li = el('img'); li.src = gl; li.alt = ''; tile.appendChild(li); } else tile.textContent = name.charAt(0).toUpperCase();
    var tx = el('span', 'cm-sb-htx'); tx.appendChild(el('b', '', name)); tx.appendChild(el('small', '', (bt && bt.textContent.split(/[.,]/)[0]) || 'Blog'));
    hd.appendChild(tile); hd.appendChild(tx); hd.appendChild(sico(SI.updown, 'cm-sb-ud')); sb.appendChild(hd);
    /* navigation */
    sb.appendChild(el('div', 'cm-sb-glabel', 'Explore'));
    var ul = el('ul', 'cm-sb-menu');
    ul.appendChild(sbItem('Home', SI.home, '/').li);
    ul.appendChild(sbItem('All articles', SI.article, '/search').li);
    if (isItem) { var tc = sbSub('On this page', SI.list, 'cm-toc'); tc.li.id = 'cm-toc-item'; tc.li.hidden = true; ul.appendChild(tc.li); }
    var cs = sbSub('Categories', SI.tag, 'cm-cat-sub'); ul.appendChild(cs.li); cs.sub.appendChild(sk('', '70%', '12px')); cs.sub.appendChild(sk('', '55%', '12px')); cs.sub.appendChild(sk('', '65%', '12px'));
    var seen = { home: 1, articles: 1, 'all articles': 1, categories: 1 };
    var wl = $$('#cm-nav .widget a').map(function (a) { return (a.textContent || '').trim() + '|' + a.getAttribute('href'); }).join(';');
    (wl || ($('#cm-nav') ? $('#cm-nav').getAttribute('data-links') || '' : '')).split(';').forEach(function (p) {
      var i = p.indexOf('|'); if (i < 1) return; var n = p.slice(0, i).trim(), u = p.slice(i + 1).trim();
      if (!n || seen[n.toLowerCase()] || !/^(https?:\/\/|\/|#|mailto:)/i.test(u)) return; seen[n.toLowerCase()] = 1;
      ul.appendChild(sbItem(n, iconFor(n), u).li);
    });
    sb.appendChild(ul);
    /* footer: subscribe block */
    var ft = el('a', 'cm-sb-foot'); ft.href = $('#cm-subscribe') ? '#cm-subscribe' : '/feeds/posts/default?alt=rss'; ft.title = 'Subscribe';
    var av = el('span', 'cm-sb-av'); av.appendChild(sico(SI.rss));
    var ftx = el('span', 'cm-sb-htx'); ftx.appendChild(el('b', '', 'Stay updated')); ftx.appendChild(el('small', '', $('#cm-subscribe') ? 'Get new posts by email' : 'Subscribe via RSS'));
    ft.appendChild(av); ft.appendChild(ftx); ft.appendChild(sico(SI.updown, 'cm-sb-ud')); sb.appendChild(ft);
    var adl = $('.cm-ad-sl'); if (adl) sb.appendChild(adl);
    left.appendChild(sb); return left;
  }

  /* ---------- right rail ---------- */
  function rowFromEntry(e) {
    var u = entryUrl(e), r = el('a', 'cm-row'); r.href = u;
    var t = el('span', 'cm-row-img'), th = thumbOf(e);
    if (th) { var im = el('img'); im.src = bigImg(th, 120, 120); im.alt = ''; im.loading = 'lazy'; im.width = 60; im.height = 60; t.appendChild(im); }
    var tx = el('span', 'cm-row-tx'); tx.appendChild(el('span', 'cm-row-t', e.title.$t)); tx.appendChild(el('span', 'cm-meta', fmtDate(e.published.$t)));
    r.appendChild(t); r.appendChild(tx); return r;
  }
  function box(title, id) { var b = el('section', 'cm-box'); if (id) b.id = id; b.appendChild(el('h2', '', title)); b.appendChild(skRows(5)); return b; }
  function clearRows(b) { $$('.cm-row', b).forEach(function (n) { n.remove(); }); }
  function rightRail() {
    var right = el('aside', 'cm-rail cm-rail-r'), st = el('div', 'cm-sticky');
    st.appendChild(box('Recent posts', 'cm-recent')); st.appendChild(box('Recommended', 'cm-reco'));
    var adr = $('.cm-ad-sr'); if (adr) st.appendChild(adr);
    var sbw = $('#cm-sidebar'); if (sbw) st.appendChild(sbw);
    right.appendChild(st); return right;
  }

  /* ---------- shell: built once (with skeleton), content swapped later ---------- */
  var shell = null, contentReady = false, recentUrls = [];
  function ensureShell() {
    if (shell) return shell;
    shell = el('div', 'cm-shell'); shell.appendChild(leftRail()); shell.appendChild(skeletonFor()); shell.appendChild(rightRail());
    main.insertBefore(shell, endMark);
    onFeed(function () { fillCats(); fillRecent(); tryReco(); if (homeWanted) buildHome(); });
    return shell;
  }
  function setContent(node) {
    var old = $('.cm-content', shell); if (old) shell.replaceChild(node, old); else shell.insertBefore(node, shell.children[1]);
    contentReady = true; tryReco();
  }
  function fillCats() {
    var ul = $('#cm-cat-sub', shell); if (!ul) return; ul.textContent = '';
    var here = decodeURIComponent(location.pathname);
    feedData.cats.forEach(function (c) {
      var li = el('li'), a = el('a', '', c); a.href = '/search/label/' + encodeURIComponent(c);
      if (here.indexOf('/search/label/' + c) === 0 || c === curLabel) { a.className = 'on'; ul.parentNode.classList.add('open'); }
      li.appendChild(a); ul.appendChild(li);
    });
    if (!feedData.cats.length) { var it = ul.closest('.cm-sb-li'); if (it) it.remove(); }
  }
  function fillRecent() {
    var rb = $('#cm-recent', shell); if (!rb) return; clearRows(rb);
    var recent = feedData.ents.filter(notCur).slice(0, 5); recentUrls = recent.map(entryUrl);
    if (!recent.length) { rb.remove(); return; }
    recent.forEach(function (e) { rb.appendChild(rowFromEntry(e)); });
  }
  function tryReco() {
    if (!feedData || !contentReady) return;
    var reco = $('#cm-reco', shell); if (!reco || reco.getAttribute('data-done')) return; reco.setAttribute('data-done', '1');
    var ents = feedData.ents;
    var show = function (list) {
      clearRows(reco);
      var pick = list.filter(function (e) { return notCur(e) && recentUrls.indexOf(entryUrl(e)) < 0; }).slice(0, 5);
      if (!pick.length) pick = list.filter(notCur).slice(0, 5);
      if (!pick.length) { reco.remove(); return; }
      pick.forEach(function (e) { reco.appendChild(rowFromEntry(e)); });
    };
    if (isItem && curLabel) getJSON('/feeds/posts/default/-/' + encodeURIComponent(curLabel) + '?alt=json&max-results=12', function (j) {
      var l = (j && j.feed && j.feed.entry) || []; show(l.length > 1 ? shuffle(l) : shuffle(ents.slice(5)));
    }); else show(shuffle(ents.slice(5).length >= 5 ? ents.slice(5) : ents));
  }

  /* ---------- cards ---------- */
  function cardFromEntry(e) {
    var url = entryUrl(e), c = el('article', 'cm-post');
    var imgA = el('a', 'cm-img'); imgA.href = url; imgA.tabIndex = -1; imgA.setAttribute('aria-hidden', 'true');
    var th = thumbOf(e);
    if (th) { var im = el('img'); im.src = bigImg(th, 640, 360); im.alt = ''; im.loading = 'lazy'; im.width = 640; im.height = 360; imgA.appendChild(im); } else imgA.appendChild(el('div', 'cm-noimg'));
    var lv = levelOf(e); if (lv) imgA.appendChild(el('span', 'cm-lvl ' + lvlClass(lv), lv));
    var tp = realLabels((e.category || []).map(function (c) { return c.term; }))[0], topic = tp ? el('span', 'cm-topic', tp) : null;
    var h = el('h3'), ha = el('a', '', e.title.$t); ha.href = url; h.appendChild(ha);
    var content = (e.content && e.content.$t) || (e.summary && e.summary.$t) || '';
    var ex = el('p', 'cm-ex', plain(content).slice(0, 180));
    var foot = el('div', 'cm-foot'), meta = el('span', 'cm-meta');
    meta.appendChild(d.createTextNode(fmtDate(e.published.$t))); meta.appendChild(el('span', 'dot', ' ' + readMin(content) + ' min read'));
    var more = el('a', 'cm-more', 'Read more →'); more.href = url;
    foot.appendChild(meta); foot.appendChild(more);
    [imgA].concat(topic ? [topic] : [], [h, ex, foot]).forEach(function (n) { c.appendChild(n); });
    return c;
  }
  function bigFromEntry(e) {
    var url = entryUrl(e), c = el('article', 'cm-big');
    var a = el('a', 'cm-img'); a.href = url; a.tabIndex = -1;
    var th = thumbOf(e);
    if (th) { var im = el('img'); im.src = bigImg(th, 1000, 560); im.alt = ''; im.width = 1000; im.height = 560; a.appendChild(im); } else a.appendChild(el('div', 'cm-noimg'));
    var h = el('h2'), ha = el('a', '', e.title.$t); ha.href = url; h.appendChild(ha);
    var content = (e.content && e.content.$t) || '';
    c.appendChild(a); c.appendChild(h); c.appendChild(el('p', 'cm-ex', plain(content).slice(0, 200)));
    var foot = el('div', 'cm-foot'), meta = el('span', 'cm-meta', fmtDate(e.published.$t) + ' · ' + readMin(content) + ' min read');
    var more = el('a', 'cm-more', 'Read more →'); more.href = url; foot.appendChild(meta); foot.appendChild(more); c.appendChild(foot);
    return c;
  }

  /* ---------- HOME ---------- */
  var homeWanted = false;
  function randomCats(host, names) {
    var n = parseInt(ds.catCount, 10); if (!(n >= 0)) n = 3;
    var perRow = Math.min(6, Math.max(1, parseInt(ds.catPosts, 10) || 3));
    var skip = (ds.catExclude || '').toLowerCase().split(',').map(function (s) { return s.trim(); }).filter(Boolean);
    shuffle(names.filter(function (c) { return skip.indexOf(c.toLowerCase()) < 0; })).slice(0, n).forEach(function (name) {
      var panel = el('section', 'cm-panel'), head = el('div', 'cm-panel-head'), h2 = el('h2', '', name);
      var va = el('a', '', 'View all →'); va.href = '/search/label/' + encodeURIComponent(name);
      head.appendChild(h2); head.appendChild(va);
      var grid = el('div', 'cm-grid'); for (var s = 0; s < perRow; s++) grid.appendChild(skCard());
      panel.appendChild(head); panel.appendChild(grid); host.appendChild(panel);
      getJSON('/feeds/posts/default/-/' + encodeURIComponent(name) + '?alt=json&max-results=' + perRow, function (j) {
        if (!j || !j.feed || !j.feed.entry) { panel.remove(); return; }
        grid.textContent = ''; j.feed.entry.forEach(function (e) { grid.appendChild(cardFromEntry(e)); });
      });
    });
  }
/*@@HOME@@*/
/*@@SEO@@*/
  function renderHome() { homeWanted = true; ensureShell(); seoHome(); if (feedData) buildHome(); }

  /* ---------- LABEL / SEARCH / ARCHIVE ---------- */
  function qs(name) { var m = new RegExp('[?&]' + name + '=([^&]*)').exec(location.search); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; }
  function renderList() {
    ensureShell();
    var path = decodeURIComponent(location.pathname), page = Math.max(1, parseInt(qs('page'), 10) || 1), start = (page - 1) * PER + 1;
    var title = 'All articles', url = '/feeds/posts/default?alt=json&max-results=' + PER + '&start-index=' + start, m;
    if ((m = /^\/search\/label\/(.+)$/.exec(path))) { title = m[1]; curLabel = m[1]; url = '/feeds/posts/default/-/' + encodeURIComponent(m[1]) + '?alt=json&max-results=' + PER + '&start-index=' + start; }
    else if (qs('q')) { title = 'Results for “' + qs('q') + '”'; url += '&q=' + encodeURIComponent(qs('q')); }
    else if ((m = /^\/(\d{4})\/(\d{2})\/?/.exec(path))) {
      var y = +m[1], mo = +m[2], ny = mo === 12 ? y + 1 : y, nm = mo === 12 ? 1 : mo + 1, p2 = function (n) { return (n < 10 ? '0' : '') + n; };
      title = new Date(y, mo - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
      url += '&published-min=' + y + '-' + p2(mo) + '-01T00:00:00-00:00&published-max=' + ny + '-' + p2(nm) + '-01T00:00:00-00:00';
    }
    getJSON(url, function (j) {
      var ents = (j && j.feed && j.feed.entry) || [];
      var wrap = el('div', 'cm-content'), head = el('div', 'cm-listing-head'); head.appendChild(el('h1', '', title)); wrap.appendChild(head);
      var panel = el('section', 'cm-panel'), grid = el('div', 'cm-grid'); panel.appendChild(grid); wrap.appendChild(panel);
      if (!ents.length) { seoPage({ title: title, noindex: true }); var np = el('p', 'cm-muted', 'No posts found.'); np.style.padding = '40px'; grid.appendChild(np); setContent(wrap); fillCats(); return; }
      ents.forEach(function (e) { grid.appendChild(cardFromEntry(e)); });
      seoList(title, ents, page, /^\/search\/label\//.test(path));
      var total = parseInt(j.feed.openSearch$totalResults.$t, 10) || 0, pager = el('nav', 'cm-pager'); pager.setAttribute('aria-label', 'Pagination');
      var base = location.pathname + location.search.replace(/[?&]page=\d+/, '').replace(/^&/, '?'), sep = base.indexOf('?') < 0 ? '?' : '&';
      if (page > 1) { var a = el('a', 'cm-btn ghost', '← Newer posts'); a.href = page === 2 ? base : base + sep + 'page=' + (page - 1); pager.appendChild(a); } else pager.appendChild(el('span'));
      if (start + PER <= total) { var b = el('a', 'cm-btn ghost', 'Older posts →'); b.href = base + sep + 'page=' + (page + 1); pager.appendChild(b); }
      wrap.appendChild(pager); setContent(wrap); if (feedData) fillCats();
    });
  }

  /* ---------- STATIC PAGE ---------- */
  function renderStatic() {
    ensureShell();
    getJSON('/feeds/pages/default?alt=json&path=' + encodeURIComponent(location.pathname), function (j) {
      var e = j && j.feed && j.feed.entry && j.feed.entry[0]; if (!e) return;
      var wrap = el('div', 'cm-content'), art = el('article', 'cm-article'), body = el('div', 'cm-body post-content');
      art.insertBefore(crumbs(cats, e.title.$t), art.firstChild);
      art.appendChild(el('h1', 'cm-title', e.title.$t)); body.innerHTML = (e.content && e.content.$t) || ''; art.appendChild(body); wrap.appendChild(art);
      var sd = $('.cm-seo', body); seoPage({ title: e.title.$t, desc: (sd && sd.getAttribute('data-description')) || plain(e.content ? e.content.$t : ''), type: 'website', image: sd && sd.getAttribute('data-image') });
      setContent(wrap); enhanceBody(body);
    });
  }

  /* ---------- SINGLE POST ---------- */
  function idsOf(e) { var m = /blog-(\d+)\.(?:post|page)-(\d+)/.exec(e.id.$t) || []; return { blog: m[1], post: m[2] }; }
  function icon(path) { var sv = d.createElementNS('http://www.w3.org/2000/svg', 'svg'); sv.setAttribute('viewBox', '0 0 24 24'); var p = d.createElementNS('http://www.w3.org/2000/svg', 'path'); p.setAttribute('d', path); sv.appendChild(p); return sv; }

  function renderItem() {
    ensureShell();
    getJSON('/feeds/posts/default?alt=json&path=' + encodeURIComponent(location.pathname), function (j) {
      var e = j && j.feed && j.feed.entry && j.feed.entry[0]; if (!e) return;
      var ids = idsOf(e), allCats = (e.category || []).map(function (c) { return c.term; }), cats = realLabels(allCats), series = allCats.filter(isSeries)[0] || '';
      curLabel = cats[0] || ''; curSeries = series;
      var content = (e.content && e.content.$t) || '', th = thumbOf(e);
      var an = (e.author && e.author[0] && e.author[0].name && e.author[0].name.$t) || '';
      var wrap = el('div', 'cm-content'), art = el('article', 'cm-article'); art.setAttribute('data-post-id', ids.post);
      if (cats.length) { var tg = el('div', 'cm-topics'); cats.slice(0, 4).forEach(function (c) { var a = el('a', '', c); a.href = '/search/label/' + encodeURIComponent(c); tg.appendChild(a); }); art.appendChild(tg); }
      art.appendChild(el('h1', 'cm-title', e.title.$t));
      if (ds.subtitle !== 'no') { var pl = leadText(content) || plain(content), sub = pl.slice(0, 150); if (sub) art.appendChild(el('p', 'cm-sub', sub + (pl.length > 150 ? '…' : ''))); }
      var row = el('div', 'cm-byline'), au = el('div', 'cm-author'), av = el('span', 'av', an.charAt(0).toUpperCase()); av.setAttribute('aria-hidden', 'true');
      var ad = el('div'), nm = el('b', '', 'by ' + (an || 'Author')), mt = el('div', 'cm-meta');
      mt.appendChild(el('span', '', fmtDate(e.published.$t))); mt.appendChild(el('span', 'dot', ' ' + readMin(content) + ' min read'));
      if (new Date(e.updated.$t) - new Date(e.published.$t) > 864e5 * 2) mt.appendChild(el('span', 'dot cm-upd', ' Updated ' + fmtDate(e.updated.$t)));
      ad.appendChild(nm); ad.appendChild(mt); au.appendChild(av); au.appendChild(ad); row.appendChild(au);
      var sh = el('div', 'cm-share'); row.appendChild(sh); art.appendChild(row);
      if (th && ds.heroImage !== 'no') { var fig = el('figure', 'cm-hero'), im = el('img'); im.src = bigImg(th, 1200, 675); im.alt = e.title.$t; im.width = 1200; im.height = 675; fig.appendChild(im); art.appendChild(fig); }
      var body = el('div', 'cm-body post-content entry-content'); body.id = 'cm-body'; body.innerHTML = content; art.appendChild(body);
      if (ds.showSec !== 'no' && ds.secNotice && cats.some(function (c) { return /security|hack|pentest|exploit|ctf|malware|vuln|cve|red.?team|forensic/i.test(c); }) && !/authori[sz]ed/i.test(content)) {
        var bq = el('blockquote', '', '[!SECURITY] ' + ds.secNotice), pi = body.querySelector('.cm-pinfo');
        if (pi) pi.after(bq); else body.insertBefore(bq, body.firstChild);
      }
      var ae = $('.cm-ad-end'); if (ae) art.appendChild(ae);
      if (cats.length) { var tg2 = el('div', 'cm-tags'); cats.forEach(function (c) { var a = el('a', '', c); a.href = '/search/label/' + encodeURIComponent(c); a.rel = 'tag'; tg2.appendChild(a); }); art.appendChild(tg2); }
      art.appendChild(authorBox(an));
      var cnb = connectBlock('post'); if (cnb) art.appendChild(cnb);
      wrap.appendChild(art);
      var cm = el('section', 'cm-comments'); cm.id = 'comments'; wrap.appendChild(cm);
      var pfe = $('.cm-pfe'); if (pfe) wrap.appendChild(pfe);
      setContent(wrap);
      if (feedData) fillCats();
      initArticle(art, e);
      renderComments(cm, ids);
      if (series) buildSeries(series, art, cm);
      relatedBlock(art, e, cm);
    });
  }

  /* wide author banner (theme variable authorBanner / JSON key); returns null when not set */
  function bannerEl(cls) {
    if (!ds.authorBanner) return null;
    var a = el('a', cls || 'cm-w-banner'); a.href = ds.authorBannerLink || ds.authorUrl || '/'; a.target = '_blank'; a.rel = 'noopener';
    a.setAttribute('aria-label', (ds.authorName || 'Author') + ' - about the author');
    var im = el('img'); im.src = ds.authorBanner; im.alt = (ds.authorName || 'Author') + (ds.authorRole ? ', ' + ds.authorRole : ''); im.width = 1584; im.height = 396; im.loading = 'lazy'; im.decoding = 'async';
    a.appendChild(im); return a;
  }

  function authorBox(an) {
    var name = ds.authorName || an || 'Author', box = el('aside', 'cm-writer'), av = el('span', 'av');
    if (ds.authorImage) { var im = el('img'); im.src = ds.authorImage; im.alt = name; im.width = 56; im.height = 56; av.appendChild(im); } else av.textContent = name.charAt(0).toUpperCase();
    var tx = el('div', 'cm-w-tx'); tx.appendChild(el('small', '', 'Written by')); tx.appendChild(el('b', '', name));
    if (ds.authorRole) tx.appendChild(el('span', 'cm-w-role', ds.authorRole));
    if (ds.authorBio) tx.appendChild(el('p', '', ds.authorBio));
    if (ds.authorUrl) { var a = el('a', 'cm-w-link', 'View profile \u2192'); a.href = ds.authorUrl; a.target = '_blank'; a.rel = 'noopener'; tx.appendChild(a); }
    var bn = bannerEl('cm-w-banner'), row = el('div', 'cm-w-row'); row.appendChild(av); row.appendChild(tx);
    if (bn) { box.classList.add('has-banner'); box.appendChild(el('div', 'cm-fkick', 'About the author')); box.appendChild(bn); }
    box.appendChild(row); return box;
  }

  function buildSeries(label, art, cm) {
    var name = label.replace(/^series\s*:\s*/i, '');
    getJSON('/feeds/posts/default/-/' + encodeURIComponent(label) + '?alt=json&max-results=100', function (j) {
      var list = ((j && j.feed && j.feed.entry) || []).slice().sort(function (a, b) { return new Date(a.published.$t) - new Date(b.published.$t); });
      if (list.length < 2) return;
      var cur = -1; list.forEach(function (x, i) { if (entryUrl(x).replace(/^https?:/, '') === curUrl) cur = i; });
      var tb = el('a', 'cm-series-top'); tb.href = '/search/label/' + encodeURIComponent(label);
      tb.appendChild(el('span', 'cm-st-k', 'Series')); tb.appendChild(el('b', '', name)); tb.appendChild(el('span', 'cm-st-p', cur >= 0 ? 'Part ' + (cur + 1) + ' of ' + list.length : list.length + ' parts'));
      var by = $('.cm-byline', art); if (by) by.parentNode.insertBefore(tb, by);
      var box = el('section', 'cm-series'); box.appendChild(el('h2', '', 'Series: ' + name));
      var ol = el('ol'); list.forEach(function (x, i) { var li = el('li', i === cur ? 'cur' : ''), n = x.title.$t; if (i === cur) { li.appendChild(el('b', '', n)); li.appendChild(el('small', '', 'You are here')); } else { var a = el('a', '', n); a.href = entryUrl(x); li.appendChild(a); } ol.appendChild(li); });
      box.appendChild(ol);
      if (cur >= 0) {
        var nv = el('div', 'cm-series-nav');
        if (cur > 0) { var pv = el('a', 'cm-btn ghost', '\u2190 Previous: ' + list[cur - 1].title.$t); pv.href = entryUrl(list[cur - 1]); nv.appendChild(pv); } else nv.appendChild(el('span'));
        if (cur < list.length - 1) { var nx = el('a', 'cm-btn', 'Next: ' + list[cur + 1].title.$t + ' \u2192'); nx.href = entryUrl(list[cur + 1]); nv.appendChild(nx); }
        box.appendChild(nv);
      }
      cm.parentNode.insertBefore(box, cm);
    });
  }

  function initArticle(art, e) {
    var body = $('#cm-body'), hero = $('.cm-hero img');
    var bar = el('div', 'cm-progress'); B.appendChild(bar);
    window.addEventListener('scroll', function () { var h = d.documentElement.scrollHeight - innerHeight; bar.style.width = (h > 0 ? scrollY / h * 100 : 0) + '%'; }, { passive: true });
    if (hero) {
      var fit = function () { if (hero.naturalWidth && hero.naturalWidth < 640) hero.parentNode.classList.add('small'); };
      if (hero.complete) fit(); else hero.addEventListener('load', fit);
    }
    enhanceBody(body);
    var pa1 = $('.cm-ad-pa1'); if (pa1 && body) body.insertAdjacentElement('beforebegin', pa1);
    if (hero && body) {
      var first = body.querySelector('img'), key = function (u) { return (u || '').replace(/\/(?:s|w|h)\d+[^/]*\//, '/').replace(/=.*$/, ''); };
      if (first && key(first.src) === key(hero.src)) { (first.closest('.separator') || first.closest('a') || first).remove(); }
    }

    // sidebar "On this page" with scroll-spy
    var item = $('#cm-toc-item'), sub = $('#cm-toc'), links = [];
    if (item && sub && body && ds.toc !== 'no') {
      var hs = $$('h2,h3', body);
      if (hs.length >= 2) {
        hs.forEach(function (h, i) {
          if (!h.id) h.id = 'sec-' + (i + 1);
          var li = el('li', h.tagName === 'H3' ? 'l3' : ''), a = el('a', '', h.textContent); a.href = '#' + h.id; li.appendChild(a); sub.appendChild(li); links.push([h, a]);
        });
        item.hidden = false; item.classList.add('open');
        var spy = function () {
          var cur = links[0];
          links.forEach(function (p) { if (p[0].getBoundingClientRect().top < 170) cur = p; });
          links.forEach(function (p) { p[1].classList.toggle('on', p === cur); });
        };
        spy(); window.addEventListener('scroll', spy, { passive: true });
      }
    }

    if (body) anchors(body);
    var adIn = $('.cm-ad-in');
    if (adIn && body) {
      var ps = $$(':scope > p, :scope > div', body).filter(function (p) { return p.textContent.trim().length > 60; });
      var at = Math.max(1, parseInt(ds.adPara, 10) || 3), pick = null;
      var isCode = function (n) { return n && /cm-win|cm-mermaid|cm-pinfo-card|cm-callout/.test(n.className || ''); };
      for (var ai = at - 1; ai < ps.length && !pick; ai++) { if (!isCode(ps[ai].nextElementSibling) && !isCode(ps[ai].previousElementSibling)) pick = ps[ai]; }
      if (pick) pick.insertAdjacentElement('afterend', adIn);
    }

    var u = encodeURIComponent(location.href.split('#')[0]), tt = encodeURIComponent(($('.cm-title') || {}).textContent || '');
    var NETS = [['X', 'x', 'https://twitter.com/intent/tweet?url=' + u + '&text=' + tt], ['Facebook', 'facebook', 'https://www.facebook.com/sharer/sharer.php?u=' + u], ['LinkedIn', 'linkedin', 'https://www.linkedin.com/sharing/share-offsite/?url=' + u], ['Telegram', 'telegram', 'https://t.me/share/url?url=' + u + '&text=' + tt]];
    $$('.cm-share').forEach(function (share) {
      share.textContent = ''; share.appendChild(el('span', 'cm-share-l', 'Share this'));
      NETS.forEach(function (n) { var a = el('a'); a.href = n[2]; a.target = '_blank'; a.rel = 'noopener noreferrer'; a.setAttribute('aria-label', 'Share on ' + n[0]); a.title = 'Share on ' + n[0]; a.appendChild(icon(ICONS[n[1]])); share.appendChild(a); });
      var cp = el('button'); cp.type = 'button'; cp.setAttribute('aria-label', 'Copy link'); cp.title = 'Copy link';
      cp.appendChild(icon('M10.6 13.4a1 1 0 0 1 0-1.4l3-3a3 3 0 1 1 4.2 4.2l-1.5 1.5a1 1 0 1 1-1.4-1.4l1.5-1.5a1 1 0 0 0-1.4-1.4l-3 3a1 1 0 0 1-1.4 0zm2.8-2.8a1 1 0 0 1 0 1.4l-3 3a3 3 0 1 1-4.2-4.2l1.5-1.5a1 1 0 0 1 1.4 1.4L7.6 12.2a1 1 0 0 0 1.4 1.4l3-3a1 1 0 0 1 1.4 0z'));
      cp.addEventListener('click', function () { if (navigator.clipboard) navigator.clipboard.writeText(location.href).then(function () { cp.classList.add('ok'); setTimeout(function () { cp.classList.remove('ok'); }, 2000); }); });
      share.appendChild(cp);
    });

    var title = $('.cm-title').textContent, content0 = (e.content && e.content.$t) || '', cats0 = realLabels((e.category || []).map(function (c) { return c.term; }));
    var sa = seoArticle(e, { body: body, content: content0, th: thumbOf(e), cats: cats0 }), img = sa.img || (hero && hero.src) || '';
    lcpHint(hero);
    var site = ds.brand || location.hostname.replace(/^www\./, '').split('.')[0], origin = location.origin, ft = $('.cm-tags a'), words = plain(content0).split(/\s+/).filter(Boolean).length;
    var data = [{
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: clip(title, 110), description: sa.desc,
      image: img ? [img] : undefined, datePublished: e.published.$t, dateModified: e.updated.$t, inLanguage: 'en', wordCount: words,
      articleSection: cats0[0] || undefined, keywords: cats0.length ? cats0.join(', ') : undefined,
      author: Object.assign(personLd(), { name: ds.authorName || ($('.cm-author b') || {}).textContent.replace(/^by /, '') || site }),
      publisher: orgLd(),
      mainEntityOfPage: { '@type': 'WebPage', '@id': ($('link[rel=canonical]') || {}).href || cleanUrl() },
      hasPart: codeLd(body)
    }, {
      '@context': 'https://schema.org', '@type': 'BreadcrumbList',
      itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: origin + '/' }].concat(ft ? [{ '@type': 'ListItem', position: 2, name: ft.textContent, item: ft.href }, { '@type': 'ListItem', position: 3, name: title }] : [{ '@type': 'ListItem', position: 2, name: title }])
    }];
    if (!data[0].hasPart.length) delete data[0].hasPart;
    var pc = $('.cm-pinfo-card'), tmTxt = pc ? pc.getAttribute('data-time') : '';
    var hm = /(\d+)\s*(?:h|hr|hrs|hour|hours)\b/i.exec(tmTxt || ''), mm = /(\d+)\s*(?:m|min|mins|minutes)\b/i.exec(tmTxt || '');
    var steps = $$('.cm-body ol.steps > li');
    if (steps.length >= 2) data.push({ '@context': 'https://schema.org', '@type': 'HowTo', name: title, totalTime: (hm || mm) ? 'PT' + (hm ? hm[1] + 'H' : '') + (mm ? mm[1] + 'M' : '') : undefined, step: steps.map(function (li, i) { return { '@type': 'HowToStep', position: i + 1, text: li.textContent.trim() }; }) });
    var faq = $$('.cm-body details');
    if (faq.length) data.push({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(function (dt) { var s = dt.querySelector('summary'); return { '@type': 'Question', name: s ? s.textContent.trim() : '', acceptedAnswer: { '@type': 'Answer', text: dt.textContent.replace(s ? s.textContent : '', '').trim() } }; }) });
    ldAdd(data);
    readingInit(art, e, curSeries);
  }

  function renderComments(cm, ids) {
    var full = 'https://www.blogger.com/comment/fullpage/post/' + ids.blog + '/' + ids.post;
    var head = el('h2', 'cm-ch'); head.appendChild(icon('M21 12a8 8 0 0 1-11.7 7.1L4 20l1-4.6A8 8 0 1 1 21 12z')); var ht = el('span', '', 'Comments'); head.appendChild(ht); cm.appendChild(head);
    var bx = el('div', 'cm-cbox'), inp = el('a', 'cm-cinput', 'Share your thoughts…'); inp.href = full; inp.target = '_blank'; inp.rel = 'noopener';
    var rowb = el('div', 'cm-cbtn'), pb = el('a', 'cm-btn', 'Post comment'); pb.href = full; pb.target = '_blank'; pb.rel = 'noopener'; rowb.appendChild(pb);
    if (ds.communityUrl) { var cb = el('a', 'cm-btn ghost', ds.communityLabel || 'Ask in the community'); cb.href = ds.communityUrl; cb.target = '_blank'; cb.rel = 'noopener'; rowb.insertBefore(cb, pb); }
    bx.appendChild(inp); bx.appendChild(rowb); cm.appendChild(bx);
    var list = el('div', 'cm-clist'); cm.appendChild(list);
    list.appendChild(sk('', '100%', '72px')); list.lastChild.style.borderRadius = '16px';
    function load() {
    getJSON('/feeds/' + ids.post + '/comments/default?alt=json&max-results=50', function (j) {
      var items = (j && j.feed && j.feed.entry) || []; list.textContent = '';
      ht.textContent = 'Comments' + (items.length ? ' (' + items.length + ')' : '');
      if (!items.length) list.appendChild(el('p', 'cm-muted', 'No comments yet. Be the first to comment.'));
      items.forEach(function (c) {
        var who = (c.author && c.author[0] && c.author[0].name && c.author[0].name.$t) || 'Anonymous';
        var card = el('div', 'cm-comment'), av = el('span', 'av', who.charAt(0).toUpperCase()), bd = el('div');
        var top = el('div', 'cm-ctop'); top.appendChild(el('b', '', who)); top.appendChild(el('span', 'cm-meta', ago(c.published.$t)));
        bd.appendChild(top); bd.appendChild(el('p', '', plain((c.content && c.content.$t) || '')));
        card.appendChild(av); card.appendChild(bd); list.appendChild(card);
      });
    }, { fresh: true });
    }
    load();
    var lastLoad = Date.now();
    d.addEventListener('visibilitychange', function () { if (!d.hidden && Date.now() - lastLoad > 15000) { lastLoad = Date.now(); load(); } });
    window.addEventListener('focus', function () { if (Date.now() - lastLoad > 15000) { lastLoad = Date.now(); load(); } });
  }

  /* ---------- footer: newsletter validation, back to top ---------- */
  $$('.cm-subform').forEach(function (f) {
    f.addEventListener('submit', function (ev) {
      var i = f.querySelector('input[type=email]');
      if (!i || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())) { ev.preventDefault(); i.style.borderColor = '#ef4444'; i.focus(); }
    });
  });
  var tt0 = $('#cm-totop'); if (tt0) tt0.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  /* ---------- join our community: round follower avatars + Follow ---------- */
  (function () {
    var sec = $('#cm-join'); if (!sec) return;
    var faces = $('.cm-join-faces', sec), cnt = $('.cm-join-count', sec), id = sec.getAttribute('data-blog'), api = ds.followersApi, MAX = 8, done = false;
    function render(o) {
      var us = (o && o.users) || [], total = (o && o.count) || us.length;
      if (!us.length) return frame();
      faces.textContent = '';
      us.slice(0, MAX).forEach(function (u) {
        var a = el('span', 'cm-join-av'), im = el('img'); a.setAttribute('role', 'listitem'); a.title = u.name;
        im.src = u.avatar; im.alt = u.name; im.width = im.height = 64; im.loading = 'lazy'; im.referrerPolicy = 'no-referrer';
        a.appendChild(im); faces.appendChild(a);
      });
      if (total > MAX) faces.appendChild(el('span', 'cm-join-av cm-join-more', '+' + (total - MAX)));
      cnt.textContent = total + (total === 1 ? ' reader follows' : ' readers follow') + ' this blog';
    }
    /* no relay: Blogger's own followers box, cropped to "Followers (N)" + one row of avatars and
       masked into circles (its layout: 14px title, 32px photos every 38px from y=20, 8 per row at 320px) */
    function frame() {
      var cs = getComputedStyle(d.documentElement), t = cs.getPropertyValue('--muted').trim() || '#9aa3b2', a = cs.getPropertyValue('--accent').trim() || '#6728FF';
      var c = btoa('\x3a' + String.fromCharCode(t.length) + t + '\x42' + String.fromCharCode(a.length) + a).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      var crop = el('div', 'cm-join-crop'), f = el('iframe', 'cm-join-frame'); f.title = 'Followers'; f.width = 320; f.height = 120; f.scrolling = 'no';
      f.src = 'https://www.blogger.com/followers/frame/' + id + '?colors=' + c + '&pageSize=21&hl=en&origin=' + encodeURIComponent(location.origin);
      f.onload = function () { sec.classList.add('is-ready'); };
      crop.appendChild(f); faces.textContent = ''; cnt.textContent = ''; faces.appendChild(crop); sec.classList.add('is-frame');
    }
    /* no relay, upgraded: work out the follower count from two frame heights (one avatar per row at 40px
       wide = 54 + 42n; all in one row at 4000px = 82), then show each avatar in its own cropped frame */
    var stacked = -1, SLOTS = 6;
    function frameUrl(size) { return 'https://www.blogger.com/followers/frame/' + id + '?pageSize=' + size + '&hl=en&origin=' + encodeURIComponent(location.origin); }
    function stack(n) {
      if (stacked === n) return;
      stacked = n; sec.classList.remove('is-frame'); faces.textContent = '';
      try { localStorage.setItem('cmFollowersN', String(n)); } catch (e) {}
      if (n < 1) { cnt.textContent = 'Be the first to follow this blog'; return; }
      for (var i = 0; i < Math.min(n, SLOTS); i++) {
        var a = el('span', 'cm-join-av cm-join-sk'), f = el('iframe', 'cm-join-slot'); a.setAttribute('role', 'listitem');
        f.title = 'Follower ' + (i + 1); f.width = 320; f.height = 120; f.scrolling = 'no'; f.tabIndex = -1;
        f.style.left = 'calc(' + (-i * 38) + 'px * var(--s))'; f.src = frameUrl(21);
        f.onload = (function (s) { return function () { s.classList.remove('cm-join-sk'); }; })(a);
        a.appendChild(f); faces.appendChild(a);
      }
      if (n > SLOTS) faces.appendChild(el('span', 'cm-join-av cm-join-more', '+' + (n - SLOTS)));
      cnt.textContent = (n >= 100 ? '100+' : n) + (n === 1 ? ' reader follows' : ' readers follow') + ' this blog';
    }
    function probe() {
      if (!(window.gapi && gapi.load)) return;
      gapi.load('gapi.iframes', function () {
        if (!gapi.iframes || !gapi.iframes.getContext) return;
        var hs = {}, frs = [];
        [40, 4000].forEach(function (w) {
          var host = el('div', 'cm-join-probe'); host.style.width = w + 'px'; sec.appendChild(host);
          var fr = gapi.iframes.getContext().openChild({
            url: frameUrl(100), where: host, messageHandlersFilter: gapi.iframes.CROSS_ORIGIN_IFRAMES_FILTER,
            messageHandlers: { '_ready': function (o) {
              hs[w] = parseFloat(o.height); if (!(40 in hs && 4000 in hs)) return;
              var x = (hs[40] - hs[4000] + 28) / 42, n = Math.round(x);
              frs.forEach(function (f) { try { f.close(); } catch (e) {} }); $$('.cm-join-probe', sec).forEach(function (h) { h.remove(); });
              if (isFinite(x) && Math.abs(x - n) < 0.25 && n >= 0 && n <= 100) stack(n);
            } }
          });
          frs.push(fr);
        });
      });
    }
    if (!api) {
      /* placeholders until the count is known (or the remembered count, instantly); Blogger's box only if counting fails */
      var known = null; try { known = localStorage.getItem('cmFollowersN'); } catch (e) {}
      if (known !== null && /^\d+$/.test(known)) stack(+known);
      setTimeout(function () { if (stacked < 0) frame(); }, 6000);
      new MutationObserver(function () { if (stacked < 0 && sec.classList.contains('is-frame')) frame(); }).observe(d.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
      if (window.gapi && gapi.load) probe();
      else { var gs = el('script'); gs.src = 'https://apis.google.com/js/platform.js'; gs.async = true; gs.onload = probe; gs.onerror = function () { if (stacked < 0) frame(); }; d.head.appendChild(gs); }
      return;
    }
    var cb = 'cmFollowers' + Date.now(), s = el('script');
    window[cb] = function (o) { done = true; try { delete window[cb]; } catch (e) {} s.remove(); render(o); };
    s.onerror = function () { if (!done) { done = true; frame(); } };
    setTimeout(function () { if (!done) { done = true; frame(); } }, 8000);
    s.src = api + (api.indexOf('?') < 0 ? '?' : '&') + 'callback=' + cb; d.body.appendChild(s);
  })();

  /* ---------- route ---------- */
  if (isItem) renderItem();
  else if (B.classList.contains('pt-error_page')) renderNotFound();
  else if (isStatic) renderStatic();
  else if (isHome && !qs('page') && !location.search) renderHome();
  else renderList();
})();
