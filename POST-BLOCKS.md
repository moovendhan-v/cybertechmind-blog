# Writing posts for CyberTechMind: blocks cheat sheet

In the Blogger post editor, switch to **HTML view** and paste these. Everything is styled automatically.
Code windows, tables, images and callouts are detected on their own, so ordinary content already works.

## 1. Code window (macOS style)
Any `<pre>` becomes a Mac window with red / yellow / green dots, a title, language badge, line count, line numbers and a Copy button.

```html
<pre data-title="main.tf" class="language-hcl">resource "aws_s3_bucket" "logs" {
  bucket = "my-logs"
}</pre>
```

- **Closed by default.** Click the title bar or the green dot to open, yellow for a preview, red to close. Blocks of 3 lines or fewer start open (one-liner commands).
- Language: `class="language-bash"` (or `lang-js`, `data-lang="python"`). It is auto-detected when you leave it out (bash, JSON, YAML, Terraform, Dockerfile, SQL, Python, JS/TS, HTML, CSS, Go, Java).
- Title: `data-title="filename.ext"`, or put `// file: app.js` / `# main.py` as the first line.
- Start open: `data-state="open"`. Start as a preview: `data-state="preview"`. Start closed: `data-state="closed"`.
- Terminal commands: lines starting with `$ ` are copied without the `$ `.
- Site-wide default: Theme variable `codeDefault` (closed, preview or open) and `codeLines` (yes or no).

## 2. Tabbed code (several languages in one window)
```html
<div class="code-tabs">
  <pre data-title="Node.js" class="language-javascript">console.log("hi")</pre>
  <pre data-title="Python" class="language-python">print("hi")</pre>
  <pre data-title="Bash" class="language-bash">echo hi</pre>
</div>
```

## 3. Mermaid diagrams
```html
<pre class="mermaid">graph LR
  A[Client] --> B(API Gateway)
  B --> C{Lambda}
  C --> D[(DynamoDB)]</pre>
```
Also works with `<div class="mermaid">` or a code block whose language is `mermaid`. It follows the dark / light theme, and has a **View source** toggle.

## 4. Callouts
```html
<blockquote>[!NOTE] A neutral note.</blockquote>
<blockquote>[!TIP] A helpful tip.</blockquote>
<blockquote>[!IMPORTANT] Something to remember.</blockquote>
<blockquote>[!WARNING] Be careful here.</blockquote>
<blockquote>[!DANGER] Destructive or insecure.</blockquote>
<blockquote>[!SECURITY] A security consideration.</blockquote>
<blockquote>[!SUCCESS] It worked.</blockquote>
```
Or `<div class="warning">Text</div>` (also `note`, `tip`, `info`, `danger`, `caution`).

## 5. Images, captions and lightbox
```html
<figure>
  <img src="IMAGE_URL" alt="Describe the image">
  <figcaption>Figure 1: caption text</figcaption>
</figure>
```
Blogger's own image captions are converted automatically. Every image opens in a zoom viewer (arrow keys move between images). Shortcut: `<img data-caption="My caption" src="...">`.

## 6. Image slider
```html
<div class="cm-slider">
  <img src="URL_1" data-caption="Step 1">
  <img src="URL_2" data-caption="Step 2">
  <img src="URL_3" data-caption="Step 3">
</div>
```
Swipe, arrows, dots and the keyboard all work. Add `data-autoplay="4000"` to auto-advance. Slides can also be `<figure>` elements.

## 7. Fancy tables
Plain `<table>` is styled and scrolls sideways on phones. Add features with classes:
```html
<table class="sortable" data-filter="1">
  <thead><tr><th>Service</th><th>Latency</th></tr></thead>
  <tbody><tr><td>Lambda</td><td>45</td></tr></tbody>
</table>
```
`sortable` makes headers clickable. `data-filter="1"` adds a search box. `sticky-first` pins the first column.

## 8. Accordion (FAQ)
```html
<details><summary>What is least privilege?</summary><p>Only the permissions a job needs.</p></details>
```

## 9. Numbered steps
```html
<ol class="steps"><li>Create the bucket</li><li>Block public access</li><li>Enable logging</li></ol>
```

## 10. Extras
- Video: paste a YouTube or Vimeo `<iframe>`. It becomes a responsive 16:9 player.
- `<kbd>Cmd</kbd> + <kbd>K</kbd>` for keys, `<mark>highlight</mark>`, `<hr>` for a divider.
- Headings `<h2>`/`<h3>` automatically feed the sidebar "On this page" list and get a copy-link icon.
