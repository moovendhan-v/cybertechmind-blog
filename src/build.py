#!/usr/bin/env python3
"""Assemble ../template.xml from src/ parts. Run: python3 src/build.py"""
import os, sys, xml.dom.minidom as m
here = os.path.dirname(os.path.abspath(__file__)); root = os.path.dirname(here)
rd = lambda p: open(os.path.join(here, p), encoding='utf-8').read()

# (name, description, type, default)
VARS = [
 ("Brand", [
  ("brandName","Site name","string","CyberTechMind"),
  ("tagline","Tagline (brand panel)","string","Practical guides on apps, Android, security and technology."),
  ("logoImage","Logo image URL (blank = text logo)","string",""),
  ("footerText","Footer text","string","All rights reserved."),
 ]),
 ("Colors & type", [
  ("accentColor","Accent color","color","#6728FF"),
  ("darkBg","Dark: page background","color","#14171c"),
  ("darkPanel","Dark: panel background","color","#1a1e24"),
  ("darkText","Dark: text","color","#e8eaee"),
  ("darkMuted","Dark: muted text","color","#9aa3b2"),
  ("darkLine","Dark: border","color","#2a2f38"),
  ("lightBg","Light: page background","color","#ffffff"),
  ("lightPanel","Light: panel background","color","#f7f8fa"),
  ("lightText","Light: text","color","#14171c"),
  ("lightMuted","Light: muted text","color","#5b6472"),
  ("lightLine","Light: border","color","#e5e7eb"),
  ("bodyFont","Body font","font","normal normal 16px Inter, system-ui, -apple-system, 'Segoe UI', sans-serif"),
  ("defaultTheme","Default theme (dark / light / auto)","string","dark"),
 ]),
 ("Layout", [
  ("contentWidth","Content width","length","1200px"),
  ("cornerRadius","Corner radius","length","16px"),
  ("wallpaperImage","Wallpaper image URL (blank = none)","string",""),
  ("wallpaperOpacity","Wallpaper opacity (0 to 1)","string","0.18"),
  ("bannerImage","Homepage banner image URL (blank = none)","string",""),
  ("bannerHeight","Homepage banner height","string","220px"),
 ]),
 ("Homepage & posts", [
  ("catCount","Random category panels on homepage (0 = off)","string","3"),
  ("catPosts","Posts per category panel (1 to 6)","string","3"),
  ("catExclude","Labels to exclude (comma separated)","string",""),
  ("showSubtitle","Post: show subtitle (yes / no)","string","yes"),
  ("showHeroImage","Post: show hero image (yes / no)","string","yes"),
  ("showToc","Post: table of contents (yes / no)","string","yes"),
 ]),
 ("Links (Label|URL; separate links with a semicolon)", [
  ("menuLinks","Header menu","string","Articles|/search;About|/p/about.html;Contact|/p/contact.html"),
  ("socialLinks","Social icons (name X / GitHub / LinkedIn / YouTube / Facebook / Instagram / Telegram / Website)","string","X|https://x.com/;GitHub|https://github.com/;YouTube|https://www.youtube.com/"),
  ("footerLinks","Footer links","string","Archive|/search;Privacy|/p/privacy.html;Terms|/p/terms.html;Contact|/p/contact.html"),
 ]),
 ("Newsletter", [
  ("showNewsletter","Show newsletter panel (yes / no)","string","yes"),
  ("newsletterAction","Form action URL (Mailchimp / Brevo / etc; blank = hidden)","string",""),
  ("newsletterTitle","Newsletter title","string","Get new posts in your inbox"),
  ("newsletterText","Newsletter text","string","Tutorials, app guides and security tips. No spam."),
 ]),
 ("Ads", [
  ("adParagraph","In-article ad: after paragraph number","string","3"),
 ]),
 ("SEO & analytics", [
  ("shareImage","Default share image URL (Open Graph)","string",""),
  ("gaId","Google Analytics 4 ID (G-XXXXXXX)","string",""),
  ("googleVerify","Google Search Console verification code","string",""),
  ("bingVerify","Bing Webmaster verification code","string",""),
 ]),
]
import re
def desc(v): return re.sub(r'\s+',' ',re.sub(r'[^A-Za-z0-9 ]',' ',v)).strip()
def esc(v): return v.replace('&','&amp;').replace('"','&quot;').replace('<','&lt;')
out = ["/*\n"]
for g, items in VARS:
    out.append('<Group description="%s">\n' % desc(g))
    for n, d, t, v in items:
        out.append('<Variable name="%s" description="%s" type="%s" default="%s" value="%s"/>\n' % (n, desc(d), t, esc(v), esc(v)))
    out.append('</Group>\n')
out.append("*/")
s = rd('skeleton.xml')
s = s.replace('/*@@VARS@@*/', ''.join(out)).replace('/*@@CSS@@*/', rd('theme.css'))
s = s.replace('/*@@JS@@*/', rd('theme.js'))
inc = open(os.path.join(here, 'blog-includables.xml'), encoding='utf-8').read()
w = rd('blog-widget.tpl.xml').replace('<!--@@INCLUDABLES@@-->', inc)
open(os.path.join(here, 'blog-widget.optional.xml'), 'w', encoding='utf-8').write(w)
m.parseString('<r xmlns:b="b" xmlns:data="d" xmlns:expr="e">' + w + '</r>')
open(os.path.join(root, 'template.xml'), 'w', encoding='utf-8').write(s)
try:
    m.parse(os.path.join(root, 'template.xml')); print('template.xml built, XML OK,', len(s)//1024, 'KB')
except Exception as e:
    print('XML ERROR', e); sys.exit(1)
