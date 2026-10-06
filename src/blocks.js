  /* =====================================================================
     POST BLOCKS: macOS code windows, tabs, mermaid, callouts, figures +
     lightbox, sliders, fancy tables, embeds, heading anchors.
     enhanceBody(el) is called on every post / static page body and is also
     exposed as window.cmEnhance for custom use.
     ===================================================================== */
  var CDN = {
    hljs: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js',
    lang: 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/languages/',
    mermaid: 'https://cdn.jsdelivr.net/npm/mermaid@11.4.0/dist/mermaid.min.js'
  };
  function loadScript(src, cb) { var s = d.createElement('script'); s.src = src; s.async = true; s.onload = function () { cb(true); }; s.onerror = function () { cb(false); }; d.head.appendChild(s); }
  var hlState = 0, hlQ = [];
  function withHljs(cb) {
    if (hlState === 2) return cb(window.hljs); if (hlState === 3) return cb(null);
    hlQ.push(cb); if (hlState === 1) return; hlState = 1;
    loadScript(CDN.hljs, function (ok) { hlState = ok && window.hljs ? 2 : 3; hlQ.splice(0).forEach(function (f) { f(hlState === 2 ? window.hljs : null); }); });
  }
  var LANG_ALIAS = { sh: 'bash', shell: 'bash', zsh: 'bash', console: 'bash', terminal: 'bash', js: 'javascript', jsx: 'javascript', ts: 'typescript', tsx: 'typescript', py: 'python', yml: 'yaml', html: 'xml', xhtml: 'xml', tf: 'hcl', terraform: 'hcl', ps1: 'powershell', docker: 'dockerfile', 'c#': 'csharp', cs: 'csharp', 'c++': 'cpp', rs: 'rust', golang: 'go', rb: 'ruby', md: 'markdown', text: '', txt: '', plain: '', plaintext: '' };
  var LANG_NAME = { bash: 'Bash', javascript: 'JavaScript', typescript: 'TypeScript', python: 'Python', json: 'JSON', yaml: 'YAML', hcl: 'Terraform', xml: 'HTML', css: 'CSS', scss: 'SCSS', sql: 'SQL', dockerfile: 'Dockerfile', go: 'Go', java: 'Java', csharp: 'C#', cpp: 'C++', c: 'C', rust: 'Rust', php: 'PHP', ruby: 'Ruby', powershell: 'PowerShell', nginx: 'Nginx', diff: 'Diff', markdown: 'Markdown', kotlin: 'Kotlin', swift: 'Swift', ini: 'INI', toml: 'TOML', graphql: 'GraphQL', mermaid: 'Mermaid' };
  var EXTRA_LANGS = { hcl: 1, dockerfile: 1, nginx: 1, powershell: 1, toml: 1, graphql: 1 };
  function norm(l) { l = (l || '').toLowerCase(); return LANG_ALIAS.hasOwnProperty(l) ? LANG_ALIAS[l] : l; }

  function detectLang(pre, code, text) {
    var cls = (pre.className || '') + ' ' + (code ? code.className || '' : '');
    var m = /(?:language|lang)[-_]([\w+#-]+)/i.exec(cls) || null;
    var l = pre.getAttribute('data-lang') || pre.getAttribute('data-language') || (m && m[1]);
    if (l) return norm(l);
    var t = text.replace(/^\s+/, ''), first = t.split('\n')[0];
    if (/^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|erDiagram|gantt|pie|journey|mindmap|gitGraph)\b/.test(t)) return 'mermaid';
    if (/^#!.*\b(ba|z)?sh\b/.test(first) || /^\$ /.test(first) || /^(sudo|apt(-get)?|npm|npx|yarn|pnpm|pip3?|aws|az|gcloud|git|docker|kubectl|helm|curl|wget|cd|ls|chmod|chown|brew|terraform|export|echo|cat|mkdir|ssh|scp|nmap|sqlmap|msfconsole|systemctl|service)\b/.test(first)) return 'bash';
    if (/^[{[]/.test(t)) { try { JSON.parse(t); return 'json'; } catch (e) {} }
    if (/^<\?xml|^<!doctype html|^<(html|div|span|section|head|body|script|style|p|a|ul)\b/i.test(t)) return 'xml';
    if (/^(resource|provider|variable|module|terraform|data|locals|output)\s+("|\{)/.test(t)) return 'hcl';
    if (/^FROM\s+\S+/m.test(t) && /^(RUN|CMD|COPY|ENTRYPOINT|WORKDIR)\b/m.test(t)) return 'dockerfile';
    if (/^(AWSTemplateFormatVersion|Resources|apiVersion|version|services|name|on|jobs):/m.test(t)) return 'yaml';
    if (/^(select|insert|update|delete|create|alter|with|drop)\s/i.test(t)) return 'sql';
    if (/^(import|from)\s.+\s*import\b|^def\s|^class\s\w+(\(|:)|^print\(|^if __name__/m.test(t)) return 'python';
    if (/^package\s+main|^func\s+\w+\(/m.test(t)) return 'go';
    if (/(^|\n)\s*(public|private|protected)\s+(static\s+)?(class|void|int|String)|System\.out\./.test(t)) return 'java';
    if (/:\s*(string|number|boolean)\b|\binterface\s+\w+\s*\{|\bas\s+const\b/.test(t) && /(const|let|function|import|export|type)\b/.test(t)) return 'typescript';
    if (/^(const|let|var|function|async|import|export|class|module\.exports|require\()/m.test(t) || /=>\s*[{(]/.test(t)) return 'javascript';
    if (/^[.#]?[\w-]+\s*\{[^}]*:[^}]*;/m.test(t)) return 'css';
    if (/^\s*(diff --git|@@ -|\+\+\+ |--- )/m.test(t)) return 'diff';
    return '';
  }
  function srcOf(node) {
    var c = node.cloneNode(true); $$('br', c).forEach(function (b) { b.replaceWith('\n'); });
    return c.textContent.replace(/ /g, ' ').replace(/\n$/, '');
  }
  var ICO = {
    copy: 'M9 9h10v10H9zM5 15V5h10', check: 'M5 13l4 4L19 7', chev: 'M9 6l6 6-6 6', term: 'M4 5h16v14H4zM8 10l3 2-3 2M13 14h3', file: 'M7 3h7l5 5v13H7zM14 3v5h5',
    info: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8h.01M11 12h1v5h1', tip: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z',
    warn: 'M12 3 2 20h20zM12 10v4M12 17h.01', danger: 'M8 3h8l5 5v8l-5 5H8l-5-5V8zM12 8v4M12 16h.01', note: 'M5 4h14v16H5zM8 9h8M8 13h8M8 17h5',
    left: 'M15 6l-6 6 6 6', right: 'M9 6l6 6-6 6', close: 'M6 6l12 12M18 6 6 18', link: 'M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1'
  };
  function bi(p, cls) { return sico(p, cls); }

  /* ---------- macOS code window ---------- */
  var codeId = 0;
  function openState(pre, lines) {
    var a = (pre.getAttribute('data-state') || pre.getAttribute('data-open') || '').toLowerCase();
    if (/^(open|true|expanded)$/.test(a) || /\b(open|expanded)\b/.test(pre.className)) return 'open';
    if (/^(closed|false|collapsed)$/.test(a)) return 'closed';
    if (a === 'preview') return 'preview';
    if (lines <= 3) return 'open';
    var def = (ds.codeDefault || 'open').toLowerCase();
    return def === 'open' || def === 'preview' || def === 'closed' ? def : 'open';
  }
  function buildWindow(panes, opts) {
    /* panes: [{pre, code, text, lang, title}] */
    var id = 'cmw' + (++codeId), first = panes[0], lines = first.text.split('\n').length;
    var win = el('div', 'cm-win'), state = openState(first.pre, lines), isTerm = /^(bash|powershell)$/.test(first.lang);
    if (first.lang) win.setAttribute('data-lang', first.lang);
    win.setAttribute('data-state', state); if (isTerm) win.classList.add('is-term');
    var bar = el('div', 'cm-win-bar'), dots = el('div', 'cm-dots');
    function dot(c, label, st) { var b = el('button', 'd ' + c); b.type = 'button'; b.setAttribute('aria-label', label); b.title = label; b.addEventListener('click', function (e) { e.stopPropagation(); setState(st); }); dots.appendChild(b); }
    dot('r', 'Close (collapse)', 'closed'); dot('y', 'Preview', 'preview'); dot('g', 'Expand', 'open');
    bar.appendChild(dots);
    var ttl = el('button', 'cm-win-title'); ttl.type = 'button'; ttl.setAttribute('aria-controls', id); ttl.setAttribute('aria-expanded', String(state !== 'closed'));
    ttl.appendChild(bi(isTerm ? ICO.term : ICO.file));
    var tspan = el('span', 'cm-win-name', first.title || (LANG_NAME[first.lang] || first.lang || 'code')); ttl.appendChild(tspan);
    var tabs = null;
    if (panes.length > 1) {
      ttl.style.display = 'none'; tabs = el('div', 'cm-win-tabs'); tabs.setAttribute('role', 'tablist');
      panes.forEach(function (p, i) { var t = el('button', 'cm-tab', p.title || LANG_NAME[p.lang] || p.lang || 'Tab ' + (i + 1)); t.type = 'button'; t.setAttribute('role', 'tab'); if (!i) t.className += ' on'; t.addEventListener('click', function (e) { e.stopPropagation(); activate(i); if (win.getAttribute('data-state') === 'closed') setState('open'); }); tabs.appendChild(t); });
      bar.appendChild(tabs);
    }
    bar.appendChild(ttl);
    var meta = el('span', 'cm-win-meta'), lb = el('span', 'cm-win-lang', LANG_NAME[first.lang] || first.lang || ''), lc = el('span', 'cm-win-lines', lines + (lines === 1 ? ' line' : ' lines'));
    if (first.lang) meta.appendChild(lb); meta.appendChild(lc);
    var cp = el('button', 'cm-win-copy'); cp.type = 'button'; cp.title = 'Copy code'; cp.setAttribute('aria-label', 'Copy code'); cp.appendChild(bi(ICO.copy)); cp.appendChild(el('span', '', 'Copy'));
    var chev = bi(ICO.chev, 'cm-win-chev');
    var wp = el('button', 'cm-win-copy cm-win-wrapbtn'); wp.type = 'button'; wp.title = 'Toggle line wrap'; wp.setAttribute('aria-label', 'Toggle line wrap'); wp.textContent = 'Wrap';
    wp.addEventListener('click', function (e) { e.stopPropagation(); win.classList.toggle('wrap'); wp.classList.toggle('ok'); });
    var right = el('div', 'cm-win-right'); right.appendChild(meta); right.appendChild(wp); right.appendChild(cp); right.appendChild(chev); bar.appendChild(right);
    bar.addEventListener('click', function (e) { if (e.target.closest('.d,.cm-win-copy,.cm-tab')) return; setState(win.getAttribute('data-state') === 'closed' ? (state0() ) : 'closed'); });
    function state0() { return state === 'closed' ? 'open' : state; }
    win.appendChild(bar);

    var wrap = el('div', 'cm-win-wrap'); wrap.id = id; var inner = el('div', 'cm-win-inner'), views = [];
    panes.forEach(function (p, i) {
      var v = el('div', 'cm-win-view'); if (i) v.hidden = true;
      var n = p.text.split('\n').length;
      if (ds.codeLines !== 'no' && n > 1) { var g = el('div', 'cm-gutter'); g.setAttribute('aria-hidden', 'true'); var nums = []; for (var k = 1; k <= n; k++) nums.push(k); g.textContent = nums.join('\n'); v.appendChild(g); }
      p.pre.className = 'cm-pre'; p.pre.removeAttribute('data-lang'); v.appendChild(p.pre); inner.appendChild(v); views.push(v);
    });
    wrap.appendChild(inner); win.appendChild(wrap);
    var more = el('button', 'cm-win-more'); more.type = 'button'; more.appendChild(el('span', '', 'Show all ' + lines + ' lines')); more.appendChild(bi(ICO.chev)); more.addEventListener('click', function () { setState('open'); }); win.appendChild(more);

    var active = 0;
    function activate(i) {
      active = i; views.forEach(function (v, k) { v.hidden = k !== i; });
      if (tabs) $$('.cm-tab', tabs).forEach(function (t, k) { t.classList.toggle('on', k === i); });
      var p = panes[i], n = p.text.split('\n').length; lb.textContent = LANG_NAME[p.lang] || p.lang || ''; lb.style.display = p.lang ? '' : 'none'; lc.textContent = n + (n === 1 ? ' line' : ' lines');
    }
    function fit() { var v = views[active]; more.hidden = win.getAttribute('data-state') !== 'preview' || v.scrollHeight <= v.clientHeight + 2; }
    function setState(s) {
      win.setAttribute('data-state', s); ttl.setAttribute('aria-expanded', String(s !== 'closed'));
      if (s !== 'closed') state = s;
      requestAnimationFrame(fit);
    }
    setTimeout(fit, 400);
    ttl.addEventListener('click', function (e) { e.stopPropagation(); setState(win.getAttribute('data-state') === 'closed' ? state0() : 'closed'); });
    cp.addEventListener('click', function (e) {
      e.stopPropagation(); var t = panes[active].text, ls = t.split('\n');
      if (ls.length && ls.filter(function (x) { return x.trim(); }).every(function (x) { return /^\$ /.test(x); })) t = ls.map(function (x) { return x.replace(/^\$ /, ''); }).join('\n');
      var done = function () { cp.classList.add('ok'); cp.lastChild.textContent = 'Copied'; setTimeout(function () { cp.classList.remove('ok'); cp.lastChild.textContent = 'Copy'; }, 1800); };
      if (navigator.clipboard) navigator.clipboard.writeText(t).then(done); else { var ta = el('textarea'); ta.value = t; d.body.appendChild(ta); ta.select(); try { d.execCommand('copy'); done(); } catch (er) {} ta.remove(); }
    });
    /* syntax highlighting (lazy) */
    panes.forEach(function (p) {
      if (!p.lang || p.lang === 'diff' && false) return;
      withHljs(function (h) {
        if (!h) return;
        var run = function () { if (!h.getLanguage(p.lang)) return; try { p.code.innerHTML = h.highlight(p.text, { language: p.lang, ignoreIllegals: true }).value; p.code.classList.add('hljs'); fit(); } catch (e) {} };
        if (h.getLanguage(p.lang) || !EXTRA_LANGS[p.lang]) run(); else loadScript(CDN.lang + p.lang + '.min.js', run);
      });
    });
    return win;
  }
  function codeParts(pre) {
    var code = pre.querySelector('code'), text = srcOf(code || pre);
    if (!code) { code = el('code'); code.textContent = text; pre.textContent = ''; pre.appendChild(code); } else if (code.parentNode !== pre || pre.childNodes.length > 1) { /* keep as is */ }
    var lang = detectLang(pre, code, text), title = pre.getAttribute('data-title') || pre.getAttribute('title') || '';
    var fm = /^\s*(?:\/\/|#|--|\/\*|<!--)\s*(?:file(?:name)?\s*[:=]?\s*)?([\w./\\-]+\.[A-Za-z0-9]{1,8})\s*(?:\*\/|-->)?\s*$/.exec(text.split('\n')[0]);
    if (!title && fm) title = fm[1];
    pre.removeAttribute('title');
    return { pre: pre, code: code, text: text, lang: lang, title: title };
  }

  /* ---------- mermaid ---------- */
  var mmState = 0, mmQ = [], mmNodes = [];
  function withMermaid(cb) {
    if (mmState === 2) return cb(window.mermaid); if (mmState === 3) return cb(null);
    mmQ.push(cb); if (mmState === 1) return; mmState = 1;
    loadScript(CDN.mermaid, function (ok) { mmState = ok && window.mermaid ? 2 : 3; mmQ.splice(0).forEach(function (f) { f(mmState === 2 ? window.mermaid : null); }); });
  }
  var mmSeq = 0;
  function renderMermaid(mm, node) {
    var dark = root.getAttribute('data-theme') !== 'light';
    mm.initialize({ startOnLoad: false, securityLevel: 'strict', theme: dark ? 'dark' : 'neutral', fontFamily: 'inherit' });
    return mm.render('cmmm' + (++mmSeq), node.src).then(function (r) { node.target.innerHTML = r.svg; node.box.classList.remove('err'); }).catch(function () { node.box.classList.add('err'); node.target.textContent = 'Could not render this diagram. Check the Mermaid syntax.'; });
  }
  new MutationObserver(function () { if (mmState === 2) mmNodes.forEach(function (n) { renderMermaid(window.mermaid, n); }); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  function makeMermaid(srcNode) {
    var src = srcOf(srcNode), box = el('figure', 'cm-mermaid'), bar = el('div', 'cm-mm-bar'), target = el('div', 'cm-mm-view');
    bar.appendChild(el('span', '', 'Diagram')); var tg = el('button', 'cm-mm-src', 'View source'); tg.type = 'button'; bar.appendChild(tg);
    var pre = el('pre', 'cm-mm-code'), cd = el('code'); cd.textContent = src; pre.appendChild(cd); pre.hidden = true;
    tg.addEventListener('click', function () { pre.hidden = !pre.hidden; tg.textContent = pre.hidden ? 'View source' : 'Hide source'; });
    box.appendChild(bar); target.appendChild(sk('', '100%', '160px')); box.appendChild(target); box.appendChild(pre);
    var node = { src: src, target: target, box: box }; mmNodes.push(node);
    withMermaid(function (mm) { if (!mm) { box.classList.add('err'); target.textContent = 'Diagram library could not load. Source shown below.'; pre.hidden = false; return; } renderMermaid(mm, node); });
    return box;
  }

  /* ---------- callouts ---------- */
  var CALL = { note: ['Note', ICO.note], info: ['Info', ICO.info], tip: ['Tip', ICO.tip], important: ['Important', ICO.info], warning: ['Warning', ICO.warn], caution: ['Caution', ICO.danger], danger: ['Danger', ICO.danger], security: ['Security', ICO.danger], success: ['Success', ICO.check] };
  function callouts(body) {
    $$('blockquote', body).forEach(function (bq) {
      var m = /^\s*\[!(NOTE|INFO|TIP|IMPORTANT|WARNING|CAUTION|DANGER|SECURITY|SUCCESS)\]\s*/i.exec(bq.textContent); if (!m) return;
      var type = m[1].toLowerCase(), tn = d.createTreeWalker(bq, NodeFilter.SHOW_TEXT, null), n;
      while ((n = tn.nextNode())) { if (/\[!/.test(n.nodeValue)) { n.nodeValue = n.nodeValue.replace(/^\s*\[![A-Z]+\]\s*/i, ''); break; } }
      bq.classList.add('cm-callout', 'cm-' + type); bq.insertBefore(callHead(type), bq.firstChild);
    });
    $$('.note,.tip,.info,.warning,.danger,.caution,.callout', body).forEach(function (n) {
      if (n.classList.contains('cm-callout') || n.tagName === 'TABLE') return;
      var type = ['note', 'info', 'tip', 'warning', 'caution', 'danger'].filter(function (t) { return n.classList.contains(t); })[0] || 'note';
      n.classList.add('cm-callout', 'cm-' + type); n.insertBefore(callHead(type), n.firstChild);
    });
  }
  function callHead(type) { var h = el('div', 'cm-call-h'); h.appendChild(bi(CALL[type][1])); h.appendChild(el('b', '', CALL[type][0])); return h; }

  /* ---------- figures, images, lightbox ---------- */
  var lb = null, lbImgs = [], lbI = 0;
  function lightbox(i) {
    lbI = (i + lbImgs.length) % lbImgs.length;
    if (!lb) {
      lb = el('div', 'cm-lb'); lb.setAttribute('role', 'dialog'); lb.setAttribute('aria-label', 'Image viewer');
      var im = el('img'), cap = el('div', 'cm-lb-cap'), x = el('button', 'cm-lb-x'), pv = el('button', 'cm-lb-n cm-lb-prev'), nx = el('button', 'cm-lb-n cm-lb-next');
      x.type = pv.type = nx.type = 'button'; x.setAttribute('aria-label', 'Close'); pv.setAttribute('aria-label', 'Previous'); nx.setAttribute('aria-label', 'Next');
      x.appendChild(bi(ICO.close)); pv.appendChild(bi(ICO.left)); nx.appendChild(bi(ICO.right));
      lb.appendChild(im); lb.appendChild(cap); lb.appendChild(x); lb.appendChild(pv); lb.appendChild(nx); d.body.appendChild(lb);
      x.addEventListener('click', closeLb); pv.addEventListener('click', function (e) { e.stopPropagation(); lightbox(lbI - 1); }); nx.addEventListener('click', function (e) { e.stopPropagation(); lightbox(lbI + 1); });
      lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
      d.addEventListener('keydown', function (e) { if (!lb.classList.contains('open')) return; if (e.key === 'Escape') closeLb(); if (e.key === 'ArrowLeft') lightbox(lbI - 1); if (e.key === 'ArrowRight') lightbox(lbI + 1); });
    }
    var it = lbImgs[lbI]; $('img', lb).src = it.src; $('img', lb).alt = it.alt; $('.cm-lb-cap', lb).textContent = it.cap; lb.classList.add('open'); lb.classList.toggle('single', lbImgs.length < 2);
  }
  function closeLb() { if (lb) lb.classList.remove('open'); }
  function figures(body) {
    /* Blogger caption tables -> figure */
    $$('table.tr-caption-container', body).forEach(function (t) {
      var img = t.querySelector('img'), cap = t.querySelector('.tr-caption'); if (!img) return;
      var f = el('figure', 'cm-figure'), a = img.closest('a'); f.appendChild(a || img);
      if (cap && cap.textContent.trim()) f.appendChild(el('figcaption', '', cap.textContent.trim()));
      var host = t.closest('.separator') || t; host.replaceWith(f);
    });
    $$('figure', body).forEach(function (f) { f.classList.add('cm-figure'); });
    $$('img', body).forEach(function (img) {
      if (img.closest('.cm-slider,.cm-lb')) return;
      img.loading = 'lazy'; img.decoding = 'async'; img.removeAttribute('height'); img.removeAttribute('width');
      if (!img.parentNode.closest('figure') && img.getAttribute('data-caption')) { var f = el('figure', 'cm-figure'), a = img.closest('a'), t = a || img; t.replaceWith(f); f.appendChild(t); f.appendChild(el('figcaption', '', img.getAttribute('data-caption'))); }
    });
    var imgs = $$('img', body).filter(function (i) { return !i.closest('.cm-slider'); });
    imgs.forEach(function (img) {
      var a = img.closest('a'), big = (a && /\.(png|jpe?g|gif|webp|avif)(\?|$)/i.test(a.href)) ? a.href : (img.currentSrc || img.src);
      var cap = (img.closest('figure') && img.closest('figure').querySelector('figcaption') || {}).textContent || img.alt || '';
      var idx = lbImgs.push({ src: big, alt: img.alt, cap: cap }) - 1;
      img.classList.add('cm-zoom'); img.setAttribute('data-lb', idx);
      var open = function (e) { e.preventDefault(); lightbox(parseInt(img.getAttribute('data-lb'), 10)); };
      if (a) a.addEventListener('click', open); else img.addEventListener('click', open);
    });
  }

  /* ---------- slider ---------- */
  function sliders(body) {
    $$('.cm-slider,[data-slider]', body).forEach(function (s) {
      if (s.getAttribute('data-built')) return; s.setAttribute('data-built', '1'); s.classList.add('cm-slider');
      var items = [].slice.call(s.children).filter(function (c) { return c.tagName !== 'BR'; });
      if (items.length < 2 && s.querySelectorAll('img').length > 1) items = $$('img', s).map(function (i) { return i.closest('a') || i; });
      if (!items.length) return;
      var track = el('div', 'cm-track'); track.tabIndex = 0; track.setAttribute('aria-label', 'Image slider');
      items.forEach(function (it) { var sl = el('div', 'cm-slide'); var fig = it.tagName === 'FIGURE' ? it : null; sl.appendChild(it); if (!fig) { var im = it.querySelector ? it.querySelector('img') : it; var c = im && (im.getAttribute('data-caption') || im.alt); if (c && im.getAttribute('data-caption')) sl.appendChild(el('div', 'cm-slide-cap', c)); } track.appendChild(sl); });
      s.textContent = ''; var vp = el('div', 'cm-slider-vp'); vp.appendChild(track);
      var prev = el('button', 'cm-sl-btn cm-sl-prev'), next = el('button', 'cm-sl-btn cm-sl-next'); prev.type = next.type = 'button'; prev.setAttribute('aria-label', 'Previous slide'); next.setAttribute('aria-label', 'Next slide');
      prev.appendChild(bi(ICO.left)); next.appendChild(bi(ICO.right)); vp.appendChild(prev); vp.appendChild(next); s.appendChild(vp);
      var dots = el('div', 'cm-sl-dots'), n = track.children.length, cur = 0;
      for (var i = 0; i < n; i++) (function (k) { var b = el('button', 'cm-sl-dot'); b.type = 'button'; b.setAttribute('aria-label', 'Go to slide ' + (k + 1)); b.addEventListener('click', function () { go(k); }); dots.appendChild(b); })(i);
      s.appendChild(dots);
      function go(k) { cur = Math.max(0, Math.min(n - 1, k)); track.scrollTo({ left: track.children[cur].offsetLeft - track.offsetLeft, behavior: 'smooth' }); }
      function sync() { var w = track.clientWidth || 1; cur = Math.round(track.scrollLeft / w); $$('.cm-sl-dot', dots).forEach(function (b, k) { b.classList.toggle('on', k === cur); }); prev.disabled = cur === 0; next.disabled = cur === n - 1; }
      track.addEventListener('scroll', function () { clearTimeout(track._t); track._t = setTimeout(sync, 60); }, { passive: true });
      prev.addEventListener('click', function () { go(cur - 1); }); next.addEventListener('click', function () { go(cur + 1); });
      track.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { e.preventDefault(); go(cur - 1); } if (e.key === 'ArrowRight') { e.preventDefault(); go(cur + 1); } });
      var ap = parseInt(s.getAttribute('data-autoplay'), 10);
      if (ap > 1500 && !matchMedia('(prefers-reduced-motion: reduce)').matches) { var t = setInterval(function () { if (!d.body.contains(s)) return clearInterval(t); if (s.matches(':hover,:focus-within')) return; go(cur === n - 1 ? 0 : cur + 1); }, ap); }
      sync();
    });
  }

  /* ---------- tables ---------- */
  function tables(body) {
    $$('table', body).forEach(function (t) {
      if (t.closest('.tr-caption-container,.cm-tablewrap') || t.classList.contains('tr-caption-container')) return;
      var w = el('div', 'cm-tablewrap'), sc = el('div', 'cm-tablescroll'); t.replaceWith(w); w.appendChild(sc); sc.appendChild(t);
      t.removeAttribute('width'); t.removeAttribute('border'); t.removeAttribute('cellpadding'); t.removeAttribute('cellspacing');
      if (!t.querySelector('thead') && t.rows.length > 1 && t.rows[0].querySelector('th')) { var th = el('thead'); th.appendChild(t.rows[0]); t.insertBefore(th, t.firstChild); }
      if (t.hasAttribute('data-filter')) {
        var f = el('input', 'cm-tfilter'); f.type = 'search'; f.placeholder = 'Filter rows…'; f.setAttribute('aria-label', 'Filter table'); w.insertBefore(f, sc);
        f.addEventListener('input', function () { var q = f.value.toLowerCase(); $$('tbody tr', t).forEach(function (r) { r.hidden = q && r.textContent.toLowerCase().indexOf(q) < 0; }); });
      }
      if (t.classList.contains('sortable')) {
        $$('thead th', t).forEach(function (h, i) {
          h.classList.add('sort'); h.tabIndex = 0; h.setAttribute('role', 'button');
          var go = function () {
            var asc = !(h.getAttribute('data-dir') === 'asc'); $$('thead th', t).forEach(function (o) { o.removeAttribute('data-dir'); }); h.setAttribute('data-dir', asc ? 'asc' : 'desc');
            var tb = t.tBodies[0], rows = [].slice.call(tb.rows);
            var val = function (r) { var x = (r.cells[i] || {}).textContent || ''; var n = parseFloat(x.replace(/[^0-9.\-]/g, '')); return isNaN(n) || /[a-z]{3,}/i.test(x) ? x.toLowerCase() : n; };
            rows.sort(function (a, b) { var x = val(a), y = val(b); return (x < y ? -1 : x > y ? 1 : 0) * (asc ? 1 : -1); }).forEach(function (r) { tb.appendChild(r); });
          };
          h.addEventListener('click', go); h.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        });
      }
    });
  }

  /* ---------- embeds + heading anchors ---------- */
  function embeds(body) {
    $$('iframe', body).forEach(function (f) {
      if (f.closest('.cm-embed') || !/youtube(-nocookie)?\.com|youtu\.be|player\.vimeo\.com|bloggerusercontent|loom\.com/i.test(f.src || f.getAttribute('data-src') || '')) return;
      var w = el('div', 'cm-embed'); f.replaceWith(w); w.appendChild(f); f.removeAttribute('width'); f.removeAttribute('height'); f.loading = 'lazy'; f.setAttribute('allowfullscreen', '');
    });
  }
  function anchors(body) {
    $$('h2,h3,h4', body).forEach(function (h) {
      if (!h.id) return; var a = el('a', 'cm-anchor'); a.href = '#' + h.id; a.setAttribute('aria-label', 'Link to this section'); a.appendChild(bi(ICO.link)); h.appendChild(a);
      a.addEventListener('click', function () { if (navigator.clipboard) navigator.clipboard.writeText(location.href.split('#')[0] + '#' + h.id); });
    });
  }

  /* ---------- post info card (level, time, last tested, stack, prerequisites) ---------- */
  function postInfo(body) {
    $$('.cm-pinfo', body).forEach(function (box) {
      var g = function (k) { return box.getAttribute('data-' + k) || ''; }, card = el('aside', 'cm-pinfo-card'), row = el('div', 'cm-pi-badges');
      ['level', 'time', 'tested', 'region', 'stack'].forEach(function (k) { if (g(k)) card.setAttribute('data-' + k, g(k)); });
      function pill(cls, path, text) { var p = el('span', 'cm-pi-pill ' + cls); if (path) p.appendChild(bi(path)); p.appendChild(el('span', '', text)); row.appendChild(p); return p; }
      if (g('level')) pill('lv lv-' + g('level').toLowerCase().replace(/[^a-z]/g, ''), '', g('level'));
      if (g('time')) pill('', 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2', g('time'));
      if (g('tested')) {
        var dt = new Date(g('tested')), old = !isNaN(dt) && (Date.now() - dt.getTime()) > 548 * 864e5, nice = isNaN(dt) ? g('tested') : dt.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        pill(old ? 'stale' : 'ok', old ? ICO.warn : ICO.check, (old ? 'Tested ' : 'Last tested ') + nice + (old ? ' (may be outdated)' : ''));
      }
      if (g('region')) pill('', 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4z', g('region'));
      if (row.children.length) card.appendChild(row);
      if (g('stack')) { var st = el('div', 'cm-pi-stack'); st.appendChild(el('span', 'cm-pi-l', 'Stack')); g('stack').split(',').forEach(function (s) { s = s.trim(); if (s) st.appendChild(el('code', '', s)); }); card.appendChild(st); }
      var pre = box.querySelector('.cm-pi-pre'), bld = box.querySelector('.cm-pi-build');
      if (pre) { var s1 = el('div', 'cm-pi-sec'); s1.appendChild(el('h4', '', 'Prerequisites')); s1.appendChild(pre); card.appendChild(s1); }
      if (bld) { var s2 = el('div', 'cm-pi-sec'); s2.appendChild(el('h4', '', 'What you will build')); s2.appendChild(bld); card.appendChild(s2); }
      box.replaceWith(card);
    });
  }

  /* ---------- changelog (front matter "changelog: 2026-10-01: text | ...") ---------- */
  function changelogs(body) {
    $$('.cm-changelog', body).forEach(function (n) {
      var items = (n.getAttribute('data-items') || '').split('|').map(function (s) { return s.trim(); }).filter(Boolean); if (!items.length) return;
      var det = el('details', 'cm-changelog-box'), sm = el('summary', '', 'Updates (' + items.length + ')'), ul = el('ul');
      items.forEach(function (it) { var m = /^(\d{4}-\d{2}-\d{2})\s*[:\-]\s*(.*)$/.exec(it), li = el('li'); if (m) { li.appendChild(el('time', '', m[1])); li.appendChild(el('span', '', m[2])); } else li.appendChild(el('span', '', it)); ul.appendChild(li); });
      det.appendChild(sm); det.appendChild(ul); n.replaceWith(det);
    });
  }

  function enhanceBody(body) {
    if (!body || body.getAttribute('data-enhanced')) return; body.setAttribute('data-enhanced', '1');
    $$('.cm-sitemap', body).forEach(function (n) { sitemapBlock(n); });
    $$('.cm-authorbanner', body).forEach(function (n) { var x = bannerEl('cm-banner-strip'); if (x) n.replaceWith(x); else n.remove(); });
    postInfo(body); changelogs(body); callouts(body); tables(body); embeds(body); sliders(body); figures(body);
    /* code groups (tabs) first, then single blocks */
    $$('.code-tabs,[data-code-tabs]', body).forEach(function (g) {
      var pres = $$('pre', g); if (!pres.length) return; var panes = pres.map(codeParts);
      var win = buildWindow(panes); g.replaceWith(win);
    });
    $$('pre', body).forEach(function (pre) {
      if (pre.closest('.cm-win,.cm-mermaid')) return;
      var isMm = pre.classList.contains('mermaid') || (pre.querySelector('code') || {}).className && /mermaid/.test(pre.querySelector('code').className);
      if (isMm) { pre.replaceWith(makeMermaid(pre)); return; }
      var p = codeParts(pre);
      if (p.lang === 'mermaid') { pre.replaceWith(makeMermaid(pre)); return; }
      var ph = d.createComment('code'); pre.parentNode.insertBefore(ph, pre);
      ph.replaceWith(buildWindow([p]));
    });
    $$('div.mermaid', body).forEach(function (m) { m.replaceWith(makeMermaid(m)); });
  }
  window.cmEnhance = enhanceBody;
