# CyberTechMind theme: owner guide

## Install (one file)
1. **Theme > Restore**: upload `template.xml` (choose *Delete widgets* if asked).
2. **Settings > Posts**: *Posts shown on the main page* = 14. **Settings > Mobile**: show the desktop template on mobile.
3. Keep **Settings > Site feed** on *Full* so the theme can read your posts.

The page frame is server-rendered by Blogger. Posts, label/search/archive lists, single posts, pages and comments are drawn from your blog's public feed, so no Blog Posts gadget is needed (the Blog section is locked on purpose).

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

## Post page layout (Medium style)
Left rail: sticky *On this page* contents that highlights as you scroll (falls back to an about card when a post has fewer than two headings). Centre: topic chips, large title, author line, share icons, hero image, serif body, tags, comments, more posts. Right rail: your ad slot. Below 1240px wide everything stacks into one column.
