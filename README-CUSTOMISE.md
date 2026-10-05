# CyberTechMind theme: owner guide

## Install (one file)
1. **Theme > Restore**: upload `template.xml` (choose *Delete widgets* if asked).
2. **Settings > Posts**: *Posts shown on the main page* = 14. **Settings > Mobile**: show the desktop template on mobile.
3. Keep **Settings > Site feed** on *Full* so the theme can read your posts.

The page frame is server-rendered by Blogger. Posts, label/search/archive lists, single posts, pages and comments are drawn from your blog's public feed, so no Blog Posts gadget is needed (the Blog section is locked on purpose).

## What you get pre-filled (Layouts v3 format)
The file is a modern Blogger *Layouts v3* theme (`b:layoutsVersion='3'`), so these gadgets are created on import: Hero (intro text + search box), Sidebar (Popular posts, Topics cloud), Footer 1 (About text), Footer 2 (Categories), Footer 3 (Quick links). Edit or remove them in **Layout** like any gadget.

## Layout areas (Blogger > Layout)
Every area is a normal drag-and-drop gadget area, like a commercial theme:

| Area | Put here | Shows on |
|---|---|---|
| Header logo | Image gadget (height 34px). Replaces the text logo | all pages |
| Main menu | Link List gadget. Replaces the `menuLinks` variable | all pages |
| Header ads - leaderboard | AdSense / HTML gadget | all pages |
| Hero section (3 gadgets) | Image, Text / HTML, Search box. Title becomes the big heading | homepage |
| Featured post | Featured Post gadget | homepage |
| Home ads - below featured posts | HTML / AdSense | homepage |
| Blog posts | filled automatically, do not add anything | all pages |
| Sidebar | Popular Posts, Labels, Search, Follow, etc. Right column on lists; under the ad in the right rail on posts. Hidden when empty | all pages |
| Post ads 1 | HTML / AdSense, before the post body | posts |
| Post ads (inside content) | after paragraph N (`adParagraph`) | posts |
| Post ads 2 | after the post body | posts |
| Post page left / right rail - ads | sticky side ads (wide screens) | posts |
| Post follow by email | Follow by Email gadget, after related posts | posts |
| Footer 1, 2, 3 | up to 3 gadgets each (Labels, Contact Form, Popular Posts ...) | all pages |
| Footer copyright | Text gadget, replaces the default credits line | all pages |
| Footer menu | Link List gadget, replaces the `footerLinks` variable | all pages |
| Footer ads | HTML / AdSense | all pages |

Empty areas take no space, and the defaults (text logo, variable menu, default credits) are used until you add a gadget.

## Other settings (Theme > Customize)
Site name, tagline, logo URL, colors, fonts, width, radius, wallpaper, banner, toggles, newsletter, GA4 and verification codes are theme variables. Social icons use the `socialLinks` variable (`Label|URL;Label|URL`).

## Wallpaper and banner
- `wallpaperImage` (URL): faint fixed background on every page; strength = `wallpaperOpacity`.
- `bannerImage` (URL) + `bannerHeight`: banner above the homepage feature strip.
- Upload images in a post draft or Google Photos and paste the direct URL.

## Homepage
- **Random categories**: `catCount` (0 turns off), `catPosts` (1 to 6 per row), `catExclude` (comma list). Each load shows different labels with their newest posts and a *Read more →* link.
- **Latest articles** panel with *View full articles* (`/search`).
- Feature strip uses your 5 newest posts. Labels are only used by the category panels.

## SEO
- Set a **Search description** per post (post settings) and for the blog (Settings > Meta tags): used for the meta description.
- Open Graph / canonical come from Blogger. `shareImage` is the fallback share image.
- JSON-LD (`BlogPosting`, `BreadcrumbList`) is added on post pages from the post feed.
- Archive and search-result pages are `noindex,follow`.
- Add `gaId`, `googleVerify`, `bingVerify` in the variables.
- Sitemap: `/sitemap.xml` (linked in the footer). Submit it in Search Console.

## Newsletter
Paste your provider's form **action URL** into `newsletterAction` (the field name sent is `EMAIL`, Mailchimp style). Blank = the panel is hidden.

## Rebuilding from source (optional)
`src/theme.css`, `src/theme.js`, `src/skeleton.xml` are the editable sources; run `python3 src/build.py` to regenerate `template.xml` and validate the XML.

## Page layout (all pages)
Three columns on wide screens (1240px and up), one column below:
- **Left sidebar (sticky, collapsible):** brand header, then *Explore*: Home, All articles, *On this page* (posts only; highlights the section you are reading), Categories (expandable, current one highlighted) and your header menu links, then a "Stay updated" block. Click the panel icon at the left of the header (or press **B**) to collapse it to an icon-only rail; the choice is remembered. On tablets and phones it becomes a slide-in drawer from the same button.
- **Centre:** the content. Posts: topic chips, title, byline with share icons, hero image, body, tags, comments, follow-by-email. Home: featured post with a recent list, random category panels (3 cards per row), latest articles.
- **Right rail (sticky):** Recent posts, Recommended posts (same topic on posts), your ad slot, then any Sidebar gadgets.
- Ads in the middle: *Post ads 1* (before the body), *inside content* (after paragraph N), *Post ads 2* (after the body), *Home ads* (below the featured post).
- **Header (two rows, with mega menu):** row 1 has the sidebar toggle, logo, search, theme toggle and a Subscribe button (jumps to the footer form, or the RSS feed if no newsletter URL is set). Row 2 lists your six busiest topics plus "More"; hover or click one to open a panel with the latest posts in that topic, other topics to explore and a featured post card. Your menu links (`menuLinks`) sit at the right of row 2. Below 1240px wide the second row hides and the sidebar drawer does the navigation.
- **Footer:** brand + social + newsletter form, three gadget columns, then copyright, legal links, sitemap, RSS and Back to top.
- **Themes:** dark by default (`defaultTheme`); the toggle remembers the visitor's choice. Light mode is a clean white layout.

## Loading skeletons
While the feed loads, every page shows grey shimmer placeholders in the exact layout (feature + cards on home, card grid on lists, title / byline / hero / text on posts, rows in the right rail, lines in the Categories menu and comments), so nothing jumps when content arrives. Turned off automatically for visitors who prefer reduced motion.

## Mobile and tablet
- **Under 1240px wide** everything stacks to one column: content first, then Recent and Recommended. The second header row hides and the sidebar becomes a slide-in drawer (panel icon, top left) with a dimmed backdrop. Esc or a tap outside closes it.
- **Under 720px** cards go single column, the byline and share icons stack, buttons go full width, the search overlay and footer are compacted, and tap targets are at least 44px on touch screens.
- No horizontal scrolling at 375px, 768px or desktop widths. Wide tables and code blocks scroll inside the post instead of the page.

## Post blocks for tech writing
Code windows (macOS style, closed by default), tabbed code, Mermaid diagrams, callouts, captioned images with a zoom viewer, sliders, sortable / filterable tables, FAQ accordions, numbered steps, responsive video and heading anchors are all built in. Copy-paste snippets for each are in **POST-BLOCKS.md**.

Settings: `codeDefault` (closed, preview or open) and `codeLines` (yes or no). Syntax highlighting (highlight.js from cdnjs) and Mermaid (from jsDelivr) are loaded only on pages that contain code or diagrams.

## Sidebar default
The sidebar starts collapsed (icon rail). A visitor's choice (panel icon or **B**) is remembered.
