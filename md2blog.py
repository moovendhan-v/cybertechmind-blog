#!/usr/bin/env python3
"""
md2blog: turn Markdown files into Blogger-ready HTML for the CyberTechMind theme.

  python3 md2blog.py posts/                 convert every posts/*.md  ->  posts/*.html
  python3 md2blog.py posts/ --watch         keep running; re-convert whenever you save an .md
  python3 md2blog.py posts/my-post.md --copy   convert one file and copy the HTML to the clipboard (macOS)

Then paste the .html into Blogger (post editor > HTML view). No dependencies, Python 3.8+.
Syntax guide: posts/sample.md (every block) and MARKDOWN-GUIDE.md.
"""
import html, os, re, shutil, subprocess, sys, time

ALLOWED_INLINE = ('kbd', 'mark', 'br', 'sub', 'sup', 'b', 'i', 'u', 'em', 'strong', 'small', 'abbr')
CALLOUTS = {'note', 'info', 'tip', 'important', 'warning', 'caution', 'danger', 'security', 'success'}


def esc(s):
    return html.escape(s, quote=False)


def attr(s):
    return html.escape(s, quote=True)


# ---------------------------------------------------------------- inline
def inline(text):
    codes = []

    def stash(m):
        codes.append('<code>' + esc(m.group(1)) + '</code>')
        return '\x00%d\x00' % (len(codes) - 1)

    text = re.sub(r'`([^`\n]+)`', stash, text)
    # keep a few safe inline tags, escape everything else
    keep = []

    def keep_tag(m):
        keep.append(m.group(0))
        return '\x01%d\x01' % (len(keep) - 1)

    text = re.sub(r'</?(?:%s)\s*/?>' % '|'.join(ALLOWED_INLINE), keep_tag, text, flags=re.I)
    text = esc(text)
    # images + links
    text = re.sub(r'!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)',
                  lambda m: '<img src="%s" alt="%s"%s>' % (attr(html.unescape(m.group(2))), attr(html.unescape(m.group(1))), (' data-caption="%s"' % attr(html.unescape(m.group(3)))) if m.group(3) else ''), text)
    text = re.sub(r'\[([^\]]+)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)',
                  lambda m: '<a href="%s"%s>%s</a>' % (attr(html.unescape(m.group(2))), ' target="_blank" rel="noopener"' if re.match(r'https?://', html.unescape(m.group(2))) else '', m.group(1)), text)
    text = re.sub(r'(?<![\w"=>])(https?://[^\s<)]+[^\s<).,;:!?])', lambda m: '<a href="%s" target="_blank" rel="noopener">%s</a>' % (m.group(1), m.group(1)), text) if '<a ' not in text else text
    text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
    text = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<em>\1</em>', text)
    text = re.sub(r'(?<![\w_])_(?!\s)(.+?)(?<!\s)_(?![\w_])', r'<em>\1</em>', text)
    text = re.sub(r'~~(.+?)~~', r'<del>\1</del>', text)
    text = re.sub(r'==(.+?)==', r'<mark>\1</mark>', text)
    text = re.sub(r'  \n', '<br>\n', text)
    text = re.sub(r'\x01(\d+)\x01', lambda m: keep[int(m.group(1))], text)
    text = re.sub(r'\x00(\d+)\x00', lambda m: codes[int(m.group(1))], text)
    return text


# ---------------------------------------------------------------- helpers
def video_embed(url):
    m = re.search(r'(?:youtube\.com/watch\?(?:.*&)?v=|youtu\.be/|youtube\.com/embed/|youtube\.com/shorts/)([\w-]{6,})', url)
    if m:
        return 'https://www.youtube.com/embed/' + m.group(1)
    m = re.search(r'vimeo\.com/(?:video/)?(\d+)', url)
    if m:
        return 'https://player.vimeo.com/video/' + m.group(1)
    return None


def fence_info(info):
    """```python title="app.py" open  ->  (lang, {title, state})"""
    info = info.strip()
    m = re.match(r'([\w+#.-]*)\s*(.*)$', info)
    lang, rest = (m.group(1), m.group(2)) if m else ('', '')
    opts = {}
    t = re.search(r'title="([^"]*)"|title=\'([^\']*)\'|title=(\S+)|\[([^\]]+)\]', rest)
    if t:
        opts['title'] = next(g for g in t.groups() if g)
    for word in ('open', 'closed', 'preview'):
        if re.search(r'\b%s\b' % word, rest):
            opts['state'] = word
    return lang.lower(), opts


def code_block(code, info):
    lang, opts = fence_info(info)
    if lang == 'mermaid':
        return '<pre class="mermaid">%s</pre>' % esc(code)
    a = ''
    if opts.get('title'):
        a += ' data-title="%s"' % attr(opts['title'])
    if lang and lang not in ('text', 'txt', 'plain'):
        a += ' class="language-%s"' % attr(lang)
    if opts.get('state'):
        a += ' data-state="%s"' % opts['state']
    return '<pre%s>%s</pre>' % (a, esc(code))


# ---------------------------------------------------------------- blocks
FENCE = re.compile(r'^(\s*)(`{3,}|~{3,})\s*(.*)$')
HEADING = re.compile(r'^(#{1,6})\s+(.*?)\s*#*\s*$')
HR = re.compile(r'^\s*([-*_])(\s*\1){2,}\s*$')
LIST_ITEM = re.compile(r'^(\s*)([-*+]|\d+[.)])\s+(.*)$')
TABLE_SEP = re.compile(r'^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$')
CONTAINER = re.compile(r'^:::\s*([\w-]+)\s*(.*)$')
IMG_ONLY = re.compile(r'^!\[([^\]]*)\]\(\s*([^)\s]+)(?:\s+"([^"]*)")?\s*\)\s*$')


def split_row(line):
    line = line.strip()
    if line.startswith('|'):
        line = line[1:]
    if line.endswith('|'):
        line = line[:-1]
    return [c.strip() for c in re.split(r'(?<!\\)\|', line)]


def parse_blocks(lines):
    out = []
    i, n = 0, len(lines)
    while i < n:
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        # fenced code
        m = FENCE.match(line)
        if m:
            indent, fence, info = len(m.group(1)), m.group(2), m.group(3)
            body = []
            i += 1
            while i < n and not re.match(r'^\s*%s\s*$' % re.escape(fence[0] * len(fence)), lines[i]):
                body.append(lines[i][indent:] if lines[i][:indent].strip() == '' else lines[i])
                i += 1
            i += 1
            out.append(code_block('\n'.join(body), info))
            continue
        # container  :::name args ... :::
        m = CONTAINER.match(line)
        if m:
            name, args = m.group(1).lower(), m.group(2).strip()
            depth, body = 1, []
            i += 1
            while i < n:
                if CONTAINER.match(lines[i]):
                    depth += 1
                elif lines[i].strip() == ':::':
                    depth -= 1
                    if depth == 0:
                        break
                body.append(lines[i])
                i += 1
            i += 1
            out.append(container(name, args, body))
            continue
        # heading
        m = HEADING.match(line)
        if m:
            lvl = len(m.group(1))
            out.append('<h%d>%s</h%d>' % (lvl, inline(m.group(2)), lvl))
            i += 1
            continue
        if HR.match(line):
            out.append('<hr>')
            i += 1
            continue
        # blockquote (also GitHub callouts: > [!NOTE] text)
        if line.lstrip().startswith('>'):
            q = []
            while i < n and lines[i].lstrip().startswith('>'):
                q.append(re.sub(r'^\s*> ?', '', lines[i]))
                i += 1
            out.append('<blockquote>' + '\n'.join(parse_blocks(q)) + '</blockquote>')
            continue
        # table
        if '|' in line and i + 1 < n and TABLE_SEP.match(lines[i + 1]) and '-' in lines[i + 1]:
            head = split_row(line)
            rows = []
            i += 2
            while i < n and '|' in lines[i] and lines[i].strip():
                rows.append(split_row(lines[i]))
                i += 1
            opts = []
            if i < n and re.match(r'^\{[\w\s-]+\}\s*$', lines[i].strip()):
                opts = lines[i].strip()[1:-1].split()
                i += 1
            out.append(table(head, rows, opts))
            continue
        # list
        if LIST_ITEM.match(line):
            block, i = parse_list(lines, i)
            out.append(block)
            continue
        # raw html block
        if line.lstrip().startswith('<') and not re.match(r'^\s*<(?:%s)\b' % '|'.join(ALLOWED_INLINE), line, re.I):
            h = []
            while i < n and lines[i].strip():
                h.append(lines[i])
                i += 1
            out.append('\n'.join(h))
            continue
        # paragraph (image-only and video-only lines get special treatment)
        para = []
        while i < n and lines[i].strip() and not (FENCE.match(lines[i]) or HEADING.match(lines[i]) or CONTAINER.match(lines[i]) or lines[i].lstrip().startswith('>') or HR.match(lines[i]) or (LIST_ITEM.match(lines[i]) and para and False)):
            para.append(lines[i])
            i += 1
        text = '\n'.join(para)
        im = IMG_ONLY.match(text.strip())
        if im:
            src, alt, cap = im.group(2), im.group(1), im.group(3)
            img = '<img src="%s" alt="%s">' % (attr(src), attr(alt))
            out.append('<figure>\n  %s\n  <figcaption>%s</figcaption>\n</figure>' % (img, inline(cap)) if cap else '<p>%s</p>' % img)
            continue
        v = video_embed(text.strip()) if re.match(r'^https?://\S+$', text.strip()) else None
        if v:
            out.append('<iframe width="560" height="315" src="%s" frameborder="0" allowfullscreen></iframe>' % v)
            continue
        out.append('<p>%s</p>' % inline(text))
    return out


def parse_list(lines, i):
    n = len(lines)
    first = LIST_ITEM.match(lines[i])
    base = len(first.group(1).replace('\t', '    '))
    ordered = first.group(2)[0].isdigit()
    items = []
    while i < n:
        m = LIST_ITEM.match(lines[i])
        if not m or len(m.group(1).replace('\t', '    ')) != base:
            break
        text = [m.group(3)]
        sub = []
        i += 1
        while i < n:
            ln = lines[i]
            if not ln.strip():
                # blank line: continue only if the next line is still indented under this item
                if i + 1 < n and lines[i + 1].startswith(' ' * (base + 1)) and lines[i + 1].strip():
                    sub.append('')
                    i += 1
                    continue
                break
            ind = len(ln) - len(ln.lstrip())
            if ind > base:
                sub.append(ln[base + 2:] if ind >= base + 2 else ln.lstrip())
                i += 1
            elif LIST_ITEM.match(ln):
                break
            else:
                text.append(ln.strip())
                i += 1
        body = inline(' '.join(text))
        if sub:
            body += '\n' + '\n'.join(parse_blocks(sub))
        items.append('  <li>%s</li>' % body)
    tag = 'ol' if ordered else 'ul'
    return '<%s>\n%s\n</%s>' % (tag, '\n'.join(items), tag), i


def table(head, rows, opts):
    cls = []
    if 'sortable' in opts:
        cls.append('sortable')
    if 'sticky' in opts:
        cls.append('sticky-first')
    a = (' class="%s"' % ' '.join(cls)) if cls else ''
    if 'filter' in opts:
        a += ' data-filter="1"'
    h = '<table%s>\n  <thead>\n    <tr>%s</tr>\n  </thead>\n  <tbody>\n' % (a, ''.join('<th>%s</th>' % inline(c) for c in head))
    for r in rows:
        r = (r + [''] * len(head))[:len(head)]
        h += '    <tr>%s</tr>\n' % ''.join('<td>%s</td>' % inline(c) for c in r)
    return h + '  </tbody>\n</table>'


def container(name, args, body):
    if name in CALLOUTS:
        inner = '\n'.join(parse_blocks(body))
        return '<blockquote>[!%s] %s</blockquote>' % (name.upper(), inner)
    if name == 'tabs':
        panes = []
        j = 0
        while j < len(body):
            m = FENCE.match(body[j])
            if m:
                fence, info = m.group(2), m.group(3)
                j += 1
                code = []
                while j < len(body) and not re.match(r'^\s*%s\s*$' % re.escape(fence[0] * len(fence)), body[j]):
                    code.append(body[j])
                    j += 1
                j += 1
                panes.append(code_block('\n'.join(code), info))
            else:
                j += 1
        return '<div class="code-tabs">\n' + '\n'.join(panes) + '\n</div>'
    if name == 'slider':
        imgs = []
        for ln in body:
            m = IMG_ONLY.match(ln.strip())
            if m:
                imgs.append('  <img src="%s" alt="%s"%s>' % (attr(m.group(2)), attr(m.group(1)), (' data-caption="%s"' % attr(m.group(3))) if m.group(3) else ''))
        ap = re.search(r'autoplay=(\d+)', args)
        return '<div class="cm-slider"%s>\n%s\n</div>' % ((' data-autoplay="%s"' % ap.group(1)) if ap else '', '\n'.join(imgs))
    if name in ('details', 'accordion', 'faq'):
        return '<details>\n  <summary>%s</summary>\n%s\n</details>' % (inline(args or 'Details'), '\n'.join('  ' + b for b in parse_blocks(body)))
    if name == 'steps':
        blocks = '\n'.join(parse_blocks(body))
        return re.sub(r'^<ol>', '<ol class="steps">', blocks, count=1) if blocks.startswith('<ol>') else '<ol class="steps">\n%s\n</ol>' % blocks
    if name == 'video':
        v = video_embed(args.strip()) or args.strip()
        return '<iframe width="560" height="315" src="%s" frameborder="0" allowfullscreen></iframe>' % attr(v)
    if name == 'download':
        url = re.search(r'url=(\S+)', args)
        title = re.search(r'title="([^"]*)"', args)
        desc = ' '.join(l.strip() for l in body if l.strip())
        return '<a class="cm-download" href="%s" target="_blank" rel="noopener"><strong>%s</strong><span>%s</span><em>Download</em></a>' % (attr(url.group(1) if url else '#'), esc(title.group(1) if title else 'Download'), inline(desc))
    if name == 'raw' or name == 'html':
        return '\n'.join(body)
    return '\n'.join(parse_blocks(body))


# ---------------------------------------------------------------- document
def info_box(meta):
    """Front matter -> <div class="cm-pinfo"> (rendered as a card by the theme)."""
    keys = {'level': 'data-level', 'time': 'data-time', 'tested': 'data-tested', 'stack': 'data-stack', 'region': 'data-region'}
    attrs = ''.join(' %s="%s"' % (v, attr(meta[k])) for k, v in keys.items() if meta.get(k))
    pre = [p.strip() for p in re.split(r'[;|]', meta.get('prerequisites', '')) if p.strip()]
    build = meta.get('build', '').strip()
    if not (attrs or pre or build):
        return ''
    h = '<div class="cm-pinfo"%s>' % attrs
    if pre:
        h += '\n  <ul class="cm-pi-pre">\n' + '\n'.join('    <li>%s</li>' % inline(p) for p in pre) + '\n  </ul>'
    if build:
        h += '\n  <p class="cm-pi-build">%s</p>' % inline(build)
    return h + '\n</div>\n\n'


SECRET_PATTERNS = [
    (r'AKIA[0-9A-Z]{16}', 'looks like an AWS access key ID'),
    (r'(?i)aws_secret_access_key\s*[=:]\s*["\']?[A-Za-z0-9/+=]{30,}', 'looks like an AWS secret key'),
    (r'-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----', 'contains a private key'),
    (r'(?i)(?:password|passwd|secret|token|api[_-]?key)\s*[=:]\s*["\'][^"\'\s]{8,}["\']', 'looks like a hard-coded secret'),
    (r'gh[pousr]_[A-Za-z0-9]{30,}', 'looks like a GitHub token'),
    (r'xox[baprs]-[A-Za-z0-9-]{10,}', 'looks like a Slack token'),
    (r'\b\d{12}\b(?=[:/"\s])', 'a 12-digit number (AWS account ID?). Use <ACCOUNT_ID>'),
]


def lint(md, meta, out_html):
    warn = []
    for pat, msg in SECRET_PATTERNS:
        for m in re.finditer(pat, md):
            line = md[:m.start()].count('\n') + 1
            warn.append('line %d: %s' % (line, msg))
            break
    for m in re.finditer(r'!\[\s*\]\(', md):
        warn.append('line %d: image without alt text (hurts SEO and accessibility)' % (md[:m.start()].count('\n') + 1))
    for m in re.finditer(r'!\[[^\]]*\]\(http://', md):
        warn.append('line %d: image over http:// (use https://)' % (md[:m.start()].count('\n') + 1))
    for m in re.finditer(r'^```\s*$', md, re.M):
        pass
    fences = re.findall(r'^(`{3,})([^\n`]*)$', md, re.M)
    opens = [f for i, f in enumerate(fences) if i % 2 == 0]
    if any(not f[1].strip() for f in opens):
        warn.append('a code block has no language (add e.g. ```bash) so it is highlighted')
    if not meta.get('title'):
        warn.append('no title (add "title:" front matter or a first # heading)')
    if not (meta.get('labels') or meta.get('tags')):
        warn.append('no labels (add "labels: AWS, Security")')
    if re.search(r'(?i)security|hack|pentest|exploit', meta.get('labels', '') + meta.get('tags', '')) and not (meta.get('tested') or meta.get('level')):
        warn.append('security post: consider adding level / tested / stack front matter')
    if meta.get('tested') == '' and meta.get('level') and 'tested' not in meta:
        warn.append('add "tested: YYYY-MM-DD" so readers know the commands are current')
    if shutil.which('shellcheck'):
        for i, blk in enumerate(re.findall(r'```(?:bash|sh|shell)[^\n]*\n(.*?)```', md, re.S)):
            code = '\n'.join(l[2:] if l.startswith('$ ') else l for l in blk.split('\n'))
            r = subprocess.run(['shellcheck', '-s', 'bash', '-'], input=code, capture_output=True, text=True)
            if r.returncode != 0 and r.stdout.strip():
                warn.append('shellcheck (bash block %d): %s' % (i + 1, r.stdout.strip().split('\n')[0]))
    return warn


def convert(md):
    md = md.replace('\r\n', '\n').replace('\t', '    ')
    meta = {}
    m = re.match(r'^---\n(.*?)\n---\n', md, re.S)
    if m:
        for ln in m.group(1).split('\n'):
            k, _, v = ln.partition(':')
            if _:
                meta[k.strip().lower()] = v.strip().strip('"\'')
        md = md[m.end():]
    lines = md.split('\n')
    for idx, ln in enumerate(lines):          # a leading "# Title" is the post title, not body content
        if ln.strip():
            h = HEADING.match(ln)
            if h and len(h.group(1)) == 1:
                meta.setdefault('title', h.group(2))
                del lines[idx]
            break
    body = '\n\n'.join(parse_blocks(lines)) + '\n'
    return info_box(meta) + body, meta


def convert_file(path, copy=False):
    with open(path, encoding='utf-8') as f:
        md = f.read()
    out, meta = convert(md)
    dst = os.path.splitext(path)[0] + '.html'
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(out)
    labels = [l.strip() for l in (meta.get('labels') or meta.get('tags') or '').split(',') if l.strip()]
    if meta.get('series'):
        labels.append('Series: ' + meta['series'])
    info = ['%s  ->  %s' % (os.path.basename(path), os.path.basename(dst))]
    if meta.get('title'):
        info.append('   title : ' + meta['title'])
    if labels:
        info.append('   labels: ' + ', '.join(labels))
    if meta.get('series'):
        info.append('   series: %s%s  (the "Series: ..." label above builds the series box; publish parts in order)' % (meta['series'], ' - part ' + meta['part'] if meta.get('part') else ''))
    print('\n'.join(info))
    for w in lint(md, meta, out):
        print('   WARNING: ' + w)
    if copy and sys.platform == 'darwin':
        subprocess.run(['pbcopy'], input=out.encode('utf-8'))
        print('   copied to clipboard')
    return dst


def md_files(target):
    if os.path.isdir(target):
        return sorted(os.path.join(target, f) for f in os.listdir(target) if f.lower().endswith('.md'))
    return [target]


def main(argv):
    args = [a for a in argv if not a.startswith('--')]
    flags = {a for a in argv if a.startswith('--')}
    target = args[0] if args else 'posts'
    if not os.path.exists(target):
        print('Not found:', target)
        return 1
    copy = '--copy' in flags
    if '--watch' in flags:
        seen = {}
        print('Watching %s (Ctrl+C to stop)' % target)
        while True:
            for p in md_files(target):
                try:
                    mt = os.path.getmtime(p)
                except OSError:
                    continue
                if seen.get(p) != mt:
                    seen[p] = mt
                    try:
                        convert_file(p, copy)
                    except Exception as e:  # keep watching on errors
                        print('ERROR in', p, e)
            time.sleep(1)
    files = md_files(target)
    if not files:
        print('No .md files in', target)
        return 1
    for p in files:
        convert_file(p, copy and len(files) == 1)
    return 0


if __name__ == '__main__':
    try:
        sys.exit(main(sys.argv[1:]))
    except KeyboardInterrupt:
        pass
