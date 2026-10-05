# Prompt: Production-grade Blogger template for CyberTechMind

## Role
You are a senior front-end engineer and Blogger (Blogspot) template specialist. Rebuild `template.xml` into a production-grade, highly customisable Blogger theme for a **technology blog** (Android apps, tutorials, security, tips). **Design reference: the clean, minimal "Huly Team" Ghost-style blog (dark slate, thin borders, generous whitespace, content-first), re-skinned with CyberTechMind branding.** The earlier "echo" magazine look (floating pill header, glassy panels, glow blobs, gradients) is **dropped**.

## Design direction (applies to every page)
- **Classy, simple, clean.** Flat dark-slate surfaces, 1px hairline borders, no glow, no gradients on surfaces, no blur blobs, no heavy shadows. Motion is limited to subtle hover (image zoom ≤ 1.03, title colour change).
- **Grouped bordered panels:** posts sit inside one large rounded panel (radius ~16px, `1px solid` border at ~8% white) and are separated by thin **vertical and horizontal divider lines**, not by individual boxed cards. Panels have ~16–20px inner padding.
- **Header:** plain bar, no pill. Site name or logo on the left; search icon and theme toggle on the right. Optional 3–5 link menu. Max content width ~1200px.
- **Homepage top panel (3-column feature strip):** left column = 2 stacked small posts (image, 2-line title, date · read time); centre = 1 large featured post (wide image, big title, subtitle, date · read time); right column = 2 stacked small posts. Collapses to one column on mobile.
- **Brand / author panel:** centred logo (round), blog name, post count, one-line tagline, and a row of social icons (X, GitHub, LinkedIn, YouTube, website).
- **Post panels (3 per row):** image, bold title (2 lines max), muted 2-line excerpt, then date · read time. Each card also has a quiet **Read more →** text link. Rows repeat in the same bordered panel; the last row may be partial.
- **Post page:** one centred panel. Centred H1, muted subtitle, "Updated date · N min read" line, full-width rounded hero image, then a narrow reading column (~680px, 17–18px text, 1.7 line height), author chip (avatar, name, role), tag pills at the end, then **Comments** panel, **More from this blog** list (text left, thumbnail right), and the brand/author panel again.
- **Footer:** centred, copyright, links (Archive, Privacy, Terms, Contact), then Sitemap and RSS.
- **Typography:** Inter only (system fallback). Titles weight 600–700, tight tracking; muted text `#9aa3b2`. One accent colour (CyberTechMind purple `#6728FF`) used only for links, focus rings and the primary button.
- **Palette (dark):** page `#14171c`, panel `#1a1e24`, border `rgba(255,255,255,.08)`, text `#e8eaee`. **Light mode:** white page, `#f7f8fa` panels, `#e5e7eb` borders. Both ship; auto-detect with a toggle.
- **Branding:** logo + "CyberTechMind" name, tagline, favicon and accent colour are the only brand touchpoints, all settable in the theme.

## Hard constraints
- Output is a single valid Blogger XML file (`template.xml`) that imports without errors. Validate it as well-formed XML.
- Use only Blogger-supported tags: `b:section`, `b:widget`, `b:includable`, `b:if`/`b:elseif`/`b:else`, `b:loop`, `b:include`, `b:template-skin`, `b:variable`, `data:` and `expr:` attributes. Escape `&`, `<`, `>` correctly; put CSS and JS in CDATA.
- No external frameworks at runtime beyond Google Fonts. Ship hand-written, minified-friendly CSS and vanilla JS (no jQuery, no build step).
- Keep the CyberTechMind brand purple `#6728FF` as the single accent. Use Inter for all text. Drop pink, Montserrat and gradients.
- Do not break existing posts, labels, comments or URLs.
- Keep `template.backup.xml` untouched. Work in `template.xml`.

## 1. Homepage layout (in this order)
1. **Header**: plain bar per the design direction, logo (image or text), optional menu from a `LinkList` widget (supports dropdowns), search overlay, dark/light toggle, mobile drawer.
2. **Feature strip**: the 3-column panel from the design direction (2 small, 1 large, 2 small). Selectable source: latest posts, or posts with the label `Featured`.
3. **Category showcase, replacing "Discover Categories"**. Drop the colour-tile grid completely. Instead:
   - Show **3 random categories** on each page load.
   - Each category is one bordered panel with its name, post count, a **View all** link, and **a row of 3 posts** separated by hairline dividers (same style as the main post panels).
   - Every post has: thumbnail, title, 2-line snippet, date · read time, and a **Read more →** link.
   - Posts per category come from the feed (`/feeds/posts/default/-/LABEL?alt=json&max-results=3`). Show skeleton loaders while loading, and a graceful fallback if the feed fails.
   - Random choice is shuffled client-side from the blog's label list. Cache the label list and feeds in `sessionStorage`.
   - Config: number of categories (default 3), cards per row (default 3), which labels to exclude.
4. **Brand / author panel** (logo, name, post count, tagline, social icons).
5. **Latest Articles**: bordered panel(s) of 3 posts per row (2 tablet, 1 mobile) with a **View Full Articles** button linking to `/search`, and numbered pagination or "Load more".
6. **Newsletter**: a slim, flat panel with the form. Form action configurable (Mailchimp, Substack, Brevo, or custom URL). No fake success message.
7. **Footer**: centred, minimal, per the design direction. Links and social icons come from widgets.
7. **Sidebar** is optional per layout setting (see section 4).

## 2. Other page types
- **Post page**: layout per the design direction, plus breadcrumbs, optional table of contents (auto-built from H2/H3, collapsible), a thin reading progress bar, share buttons (X, Facebook, LinkedIn, WhatsApp, Telegram, copy link), related posts (by label), prev/next, styled comments, in-article ad slots.
- **Label / search / archive page**: heading, description, post count, card grid, pagination.
- **Static pages** (About, Contact, Privacy, Terms): clean readable layout.
- **404 page**: friendly message, search box and popular posts.

## 3. SEO (all configurable)
- Correct `<title>` patterns and unique meta descriptions per page type, with an override from the post's search description.
- Canonical URL, `robots` meta (noindex on search/label-with-query/archive duplicates), `hreflang` ready.
- Open Graph and Twitter Card tags with a configurable default share image.
- JSON-LD structured data: `Organization`, `WebSite` + `SearchAction`, `BlogPosting`/`Article` (headline, image, datePublished, dateModified, author, publisher), `BreadcrumbList`, and `FAQPage` when a post contains a marked FAQ block.
- One H1 per page, semantic landmarks (`header`, `nav`, `main`, `article`, `aside`, `footer`), `alt` text on every image, descriptive link text.
- Performance and Core Web Vitals: `fetchpriority` on the hero image, `loading="lazy"` elsewhere, explicit `width`/`height` or `aspect-ratio` to prevent layout shift, responsive `srcset` via Blogger `resizeImage`, preconnect for fonts, defer non-critical JS, no render-blocking scripts.
- Google Analytics 4, Search Console verification and Bing verification fields.
- Accessibility to WCAG AA: contrast, focus states, skip link, keyboard-operable menus, `prefers-reduced-motion`.

## 4. Customisation (no code editing needed)
Expose everything through **Theme Designer variables (`b:variable`)** and **widget settings**, so the owner changes it from Blogger's Theme > Customise screen:
- **Brand**: logo image or text, favicon, accent colours (primary, secondary), fonts (pick from a list of 6 Google font pairs), border radius, card style (flat / glass / bordered).
- **Wallpapers and banners**: homepage hero background image or video-less gradient, header banner image, per-page banner image, overlay darkness slider, blur and parallax toggle.
- **Layout switches**: container width, sidebar left / right / none, hero style (split / full-width / slider), card style (vertical / horizontal), number of columns, posts per page.
- **Dark / light / auto** theme with a toggle that remembers the choice.
- **Section toggles**: show or hide hero, Top Stories, category showcase, latest, newsletter, popular posts, social links. Order of sections is adjustable.
- **Text**: hero heading, subheading, button labels, newsletter copy, footer text, all editable.
- **Social links** and a configurable contact link set.
- A built-in **"Theme Settings" JSON block** at the top of the file (one clearly commented config object) as a fallback for anyone editing the XML directly.

## 5. Ads and monetisation
- Dedicated **ad slots** as `b:section`s that accept an AdSense or any HTML/JS widget: header leaderboard, below hero, between cards (every N posts, configurable), sidebar top / sticky, in-article (after paragraph N, configurable), end-of-post, footer.
- Each slot can be switched off. Reserve space (`min-height`) so ads cause no layout shift. Label them "Advertisement".
- AdSense auto-ads-safe and ads.txt note. No ads on the 404 or static pages by default.
- Lazy-load ad slots when they scroll into view.
- Cookie / consent banner hook (configurable text, accepts a CMP script).

## 6. Production quality
- Mobile-first, tested at 360, 768, 1024, 1440 px. No horizontal scroll.
- Lighthouse targets: Performance ≥ 90, Accessibility ≥ 95, SEO 100, Best Practices ≥ 95 on mobile.
- Graceful degradation with JavaScript off (posts, links and navigation still work).
- No `eval`, no inline event handlers, no insecure `http://` assets; escape all dynamic text inserted via JS (`textContent`, never unsanitised `innerHTML`).
- Comment the XML in clear sections (`<!-- ===== HEADER ===== -->`) and CSS with a table of contents.

## 7. Deliverables
1. `template.xml` (final theme).
2. `README-CUSTOMISE.md`: a plain-English guide for the owner covering every setting, ad slot, SEO field and how to change the banner and wallpaper, with where to click in Blogger.
3. `CHANGELOG.md`: what changed from `template.backup.xml`.
4. A test checklist covering XML validity, each page type, mobile, and the Lighthouse scores.

## Process
First propose the section map and the variable list for approval. Then build in stages (core layout → category showcase → post page → SEO → customisation → ads), and validate the XML after each stage. State any assumption that you make.
