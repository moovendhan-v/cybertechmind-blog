# Write posts in Markdown

1. Put a `.md` file in the `posts/` folder (copy `posts/sample.md` to start).
2. Run **one** of these in Terminal from this folder:

```bash
python3 md2blog.py posts/ --watch      # auto-converts every time you save an .md
python3 md2blog.py posts/              # convert once
python3 md2blog.py posts/my-post.md --copy   # convert one file and copy the HTML (macOS)
```

3. Open `posts/my-post.html`, copy everything, and paste it into Blogger (post editor > **HTML view**).
   The title and labels are printed in Terminal for you to type into Blogger.

## Front matter (all optional)

```
---
title: Securing S3 buckets with Terraform
labels: AWS, Security
series: AWS Security from zero      # adds the label "Series: AWS Security from zero"
part: 2
level: Beginner                     # Beginner / Intermediate / Advanced
time: 15 min
tested: 2026-10-01                  # shows "Last tested"; turns amber after 18 months
stack: Terraform 1.9, AWS CLI 2.17
region: us-east-1
prerequisites: An AWS account; AWS CLI installed
build: A private, encrypted S3 bucket with logging.
changelog: 2026-10-01: Added the CVE note | 2026-09-12: Initial publish
---
```

- `level`, `time`, `tested`, `stack`, `region`, `prerequisites` and `build` become a card at the top of the post.
- `series` adds a series banner at the top, a numbered list of all parts and Previous / Next buttons at the end. Type the printed `Series: ...` label into Blogger exactly as shown, and publish parts in order. Series labels are hidden from the category menus.
- A first `# Heading` is used as the title if you skip `title:`. It is not repeated in the body.

## Starter templates

Copy one from `posts/templates/` and fill it in: `tutorial.md`, `security-writeup.md`, `cloud-architecture.md`, `cheatsheet.md`, `series-part.md`, `projects-page.md` (a static page) and `about-page.md`.

## Automatic quality checks

Every conversion prints warnings (and runs `shellcheck` on bash blocks if it is installed) for: AWS keys, private keys, tokens and hard-coded secrets, 12-digit account IDs (use `<ACCOUNT_ID>`), images without alt text or over `http://`, code blocks without a language, and a missing title or labels.

## Automatic on the blog (no markup needed)

- Security notice on posts labelled Security, Hacking, Pentest, Exploit, CTF, Malware and similar (edit the text in the theme variable `securityNotice`).
- Author box with photo, role, bio and profile link (theme variables `authorName`, `authorRole`, `authorBio`, `authorUrl`, `authorImage`).
- `HowTo` structured data from `::: steps` and `FAQPage` data from `::: details`, plus author details in the post's JSON-LD.
- "Ask in the community" button when `communityUrl` is set (Discord or GitHub Discussions).
- In-article ads never land right next to a code window or diagram.

## Cheat sheet

| You write | You get |
|---|---|
| ` ```python title="app.py" ` ... ` ``` ` | macOS code window, closed by default. Add the word `open` or `preview` to change how it starts |
| ` ```mermaid ` ... ` ``` ` | Diagram |
| `::: tabs` + several fenced blocks + `:::` | Tabbed code window |
| `> [!NOTE] text` or `::: warning` ... `:::` | Callout. Types: note, info, tip, important, warning, caution, danger, security, success |
| `![alt](url "Caption")` on its own line | Captioned image with zoom |
| `::: slider autoplay=5000` + image lines + `:::` | Image slider |
| a table, then `{sortable filter sticky}` on the next line | Sortable / searchable / sticky-column table |
| `::: details Question?` ... `:::` | Accordion item |
| `::: steps` + a numbered list + `:::` | Step timeline |
| a YouTube or Vimeo link on its own line | Responsive video |
| `::: download title="Cheat sheet" url=https://...` + a sentence + `:::` | Download card |
| `==text==`, `<kbd>Cmd</kbd>`, `~~text~~`, `` `code` `` | Highlight, key, strike, inline code |

Everything else (headings, bold, italic, links, lists, quotes, `---`) is normal Markdown.
`posts/sample.md` shows every block with real examples.
