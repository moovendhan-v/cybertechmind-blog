  /* =====================================================================
     SEO: per-page title/description/robots/Open Graph/Twitter, JSON-LD
     (WebSite, CollectionPage, Article extras), visible breadcrumbs,
     related posts, LCP hints. Everything is client-side because posts are
     rendered from the feeds, so keep values deterministic and short.
     ===================================================================== */
  function metaTag(attrName, key, val) {
    if (val === undefined || val === null || val === '') return;
    var m = d.head.querySelector('meta[' + attrName + '="' + key + '"]');
    if (!m) { m = el('meta'); m.setAttribute(attrName, key); d.head.appendChild(m); }
    m.setAttribute('content', val);
  }
  function clip(s, n) { s = (s || '').replace(/\s+/g, ' ').trim(); if (s.length <= n) return s; var c = s.slice(0, n - 1), i = c.lastIndexOf(' '); return (i > n * .6 ? c.slice(0, i) : c).replace(/[,;:.\-\s]+$/, '') + '…'; }
  function siteName() { return ds.brand || location.hostname.replace(/^www\./, '').split('.')[0]; }
  function siteDesc() { return ds.heroSub || (($('meta[name=description]') || {}).content) || ''; }
  function setCanonical(href) {
    var l = d.head.querySelector('link[rel=canonical]'); if (!l) { l = el('link'); l.rel = 'canonical'; d.head.appendChild(l); }
    l.href = href;
  }
  function cleanUrl() { return location.origin + location.pathname.replace(/\/index\.html$/, '/'); }
  function seoPage(o) {
    var title = o.title ? clip(o.title, 70) + (o.noSuffix ? '' : ' | ' + siteName()) : d.title, desc = clip(o.desc || siteDesc(), 158);
    if (o.title) d.title = title;
    metaTag('name', 'description', desc);
    metaTag('property', 'og:title', o.title ? clip(o.title, 90) : d.title); metaTag('property', 'og:description', desc);
    metaTag('property', 'og:type', o.type || 'website'); metaTag('property', 'og:site_name', siteName()); metaTag('property', 'og:url', o.url || cleanUrl());
    metaTag('property', 'og:locale', ds.locale || 'en_US');
    var img = o.image || ds.shareImage; if (img) { metaTag('property', 'og:image', img); metaTag('name', 'twitter:image', img); metaTag('property', 'og:image:width', '1200'); metaTag('property', 'og:image:height', '630'); }
    metaTag('name', 'twitter:card', 'summary_large_image'); metaTag('name', 'twitter:title', o.title ? clip(o.title, 70) : d.title); metaTag('name', 'twitter:description', desc);
    if (ds.twitter) { var h = ds.twitter.replace(/^@?/, '@'); metaTag('name', 'twitter:site', h); metaTag('name', 'twitter:creator', h); }
    metaTag('name', 'robots', o.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1');
    if (o.canonical !== false) setCanonical(o.canonical || cleanUrl());
  }
  function ldAdd(list) {
    list = list.filter(Boolean); if (!list.length) return;
    var old = d.head.querySelector('script[data-cm-ld]'); if (old) old.remove();
    var s = el('script'); s.type = 'application/ld+json'; s.setAttribute('data-cm-ld', '1'); s.text = JSON.stringify(list); d.head.appendChild(s);
  }
  function sameAs() { return (ds.authorSameAs || '').split(/[,\s]+/).filter(function (u) { return /^https?:\/\//.test(u); }); }
  function personLd() {
    return { '@type': 'Person', name: ds.authorName || siteName(), url: ds.authorUrl || undefined, jobTitle: ds.authorRole || undefined, image: ds.authorImage || undefined, sameAs: sameAs().length ? sameAs() : (ds.authorUrl ? [ds.authorUrl] : undefined) };
  }
  function orgLd() {
    return { '@type': 'Organization', name: siteName(), url: location.origin + '/', logo: ds.logo ? { '@type': 'ImageObject', url: ds.logo } : undefined, sameAs: sameAs().length ? sameAs() : undefined };
  }
  function seoHome() {
    seoPage({ title: siteName() + ' - ' + (ds.heroTitle || 'Cybersecurity, AWS and full-stack guides'), noSuffix: true, desc: siteDesc() });
    ldAdd([{ '@context': 'https://schema.org', '@type': 'WebSite', name: siteName(), url: location.origin + '/', description: siteDesc(), inLanguage: 'en', publisher: orgLd(),
      potentialAction: { '@type': 'SearchAction', target: location.origin + '/search?q={search_term_string}', 'query-input': 'required name=search_term_string' } }, Object.assign({ '@context': 'https://schema.org' }, personLd())]);
  }
  function seoList(title, ents, page, isLabel) {
    var q = qs('q'), arch = /^\/\d{4}\/\d{2}/.test(location.pathname);
    var desc = isLabel ? clip(title + ' guides and tutorials on ' + siteName() + '. ' + ents.slice(0, 3).map(function (e) { return e.title.$t; }).join(' · '), 158) : siteDesc();
    seoPage({ title: (isLabel ? title + ' tutorials and guides' : title) + (page > 1 ? ' - Page ' + page : ''), desc: desc, noindex: !!q || arch || page > 1, canonical: (q ? location.origin + location.pathname : cleanUrl()) });
    if (isLabel && page === 1) ldAdd([{ '@context': 'https://schema.org', '@type': 'CollectionPage', name: title, url: cleanUrl(), isPartOf: { '@type': 'WebSite', name: siteName(), url: location.origin + '/' },
      mainEntity: { '@type': 'ItemList', itemListElement: ents.slice(0, 10).map(function (e, i) { return { '@type': 'ListItem', position: i + 1, url: entryUrl(e), name: e.title.$t }; }) } },
      { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: location.origin + '/' }, { '@type': 'ListItem', position: 2, name: title }] }]);
  }
  function crumbs(cats, title) {
    var nav = el('nav', 'cm-crumbs'); nav.setAttribute('aria-label', 'Breadcrumb');
    var home = el('a', '', 'Home'); home.href = '/'; nav.appendChild(home);
    if (cats[0]) { nav.appendChild(el('span', 'sep', '›')); var c = el('a', '', cats[0]); c.href = '/search/label/' + encodeURIComponent(cats[0]); nav.appendChild(c); }
    nav.appendChild(el('span', 'sep', '›')); var cur = el('span', 'cur', clip(title, 60)); cur.setAttribute('aria-current', 'page'); nav.appendChild(cur);
    return nav;
  }
  /* article: meta + extra schema; returns nothing, called from initArticle */
  function seoArticle(e, o) {
    var seoEl = $('.cm-seo', o.body), manual = seoEl ? seoEl.getAttribute('data-description') : '', mimg = seoEl ? seoEl.getAttribute('data-image') : '';
    var desc = manual || ($('meta[name=description]') || {}).content || leadText(o.content) || plain(o.content);
    var img = mimg || (o.th ? bigImg(o.th, 1200, 630) : ds.shareImage || '');
    seoPage({ title: e.title.$t, desc: desc, type: 'article', image: img });
    metaTag('property', 'article:published_time', e.published.$t); metaTag('property', 'article:modified_time', e.updated.$t);
    metaTag('property', 'article:section', o.cats[0] || ''); metaTag('property', 'article:author', ds.authorUrl || '');
    o.cats.slice(0, 5).forEach(function (c) { var m = el('meta'); m.setAttribute('property', 'article:tag'); m.setAttribute('content', c); d.head.appendChild(m); });
    return { desc: clip(desc, 158), img: img };
  }
  function codeLd(body) {
    var out = [];
    $$('.cm-win', body).slice(0, 3).forEach(function (w) {
      var lang = (w.getAttribute('data-lang') || (/language-([a-z0-9+#-]+)/i.exec((w.querySelector('code') || {}).className || '') || [])[1] || '').toLowerCase();
      var code = w.querySelector('code'); if (!code || !lang || /^(text|plain|output)$/.test(lang)) return;
      out.push({ '@type': 'SoftwareSourceCode', programmingLanguage: lang, codeSampleType: 'snippet', text: clip(code.textContent, 1200) });
    });
    return out;
  }
  function relatedBlock(art, e, cm) {
    var mine = realLabels((e.category || []).map(function (c) { return c.term; })), url = entryUrl(e).replace(/^https?:/, '');
    if (!mine.length) return;
    getJSON('/feeds/posts/default/-/' + encodeURIComponent(mine[0]) + '?alt=json&max-results=7', function (j) {
      var list = ((j && j.feed && j.feed.entry) || []).filter(function (p) { return entryUrl(p).replace(/^https?:/, '') !== url; }).slice(0, 3);
      if (!list.length) return;
      var s = el('section', 'cm-related'), g = el('div', 'cm-grid'); s.appendChild(el('h2', 'cm-rel-h', 'Related guides on ' + mine[0]));
      list.forEach(function (p) { g.appendChild(cardFromEntry(p)); }); s.appendChild(g);
      var host = $('.cm-nextup') || cm; host.parentNode.insertBefore(s, host);
    });
  }
  function lcpHint(img) { if (!img) return; img.loading = 'eager'; img.setAttribute('fetchpriority', 'high'); img.decoding = 'async'; }
  function sitemapBlock(host) {
    host.textContent = ''; host.appendChild(el('p', 'cm-muted', 'Loading all articles…'));
    getJSON('/feeds/posts/default?alt=json&max-results=500&orderby=published', function (j) {
      var ents = (j && j.feed && j.feed.entry) || [], by = {}; host.textContent = '';
      ents.forEach(function (p) { var ls = realLabels((p.category || []).map(function (c) { return c.term; })); (ls.length ? ls : ['General']).forEach(function (l) { (by[l] = by[l] || []).push(p); }); });
      Object.keys(by).sort().forEach(function (l) {
        var h = el('h2'), a = el('a', '', l); a.href = '/search/label/' + encodeURIComponent(l); h.appendChild(a); host.appendChild(h);
        var ul = el('ul'); by[l].forEach(function (p) { var li = el('li'), x = el('a', '', p.title.$t); x.href = entryUrl(p); li.appendChild(x); li.appendChild(el('small', 'cm-muted', ' ' + fmtDate(p.published.$t))); ul.appendChild(li); }); host.appendChild(ul);
      });
      if (!ents.length) host.appendChild(el('p', 'cm-muted', 'No posts yet.'));
    });
  }
