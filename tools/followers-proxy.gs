/**
 * Followers relay for the theme's "Join our community" section.
 *
 * Browsers can't read blogger.com from your blog's pages, so this tiny Google Apps Script
 * reads the public Blogger followers list (the same page Blogger's Followers gadget shows)
 * and returns it as JSONP: names, avatar URLs and the total count. Nothing private is read.
 *
 * Setup (once, about 2 minutes):
 *   1. Go to https://script.google.com -> New project, paste this file, set BLOG_ID and SITE below.
 *   2. Deploy -> New deployment -> type "Web app"; Execute as "Me"; Who has access "Anyone".
 *   3. Copy the web app URL (ends in /exec) into Theme -> Customise -> followersApi
 *      (or "followersApi" in the Community JSON gadget).
 */
var BLOG_ID = '3815883352697378296';
var SITE = 'https://www.cybertechmind.com';
var CACHE_SECONDS = 3600;

function doGet(e) {
  var cb = String((e && e.parameter && e.parameter.callback) || '');
  var data = followers_();
  var json = JSON.stringify(data);
  if (/^[A-Za-z_$][\w$.]{0,80}$/.test(cb)) {
    return ContentService.createTextOutput(cb + '(' + json + ');').setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function followers_() {
  var cache = CacheService.getScriptCache(), hit = cache.get('followers');
  if (hit) return JSON.parse(hit);
  var url = 'https://www.blogger.com/followers/frame/' + BLOG_ID + '?pageSize=21&hl=en&origin=' + encodeURIComponent(SITE);
  var html = UrlFetchApp.fetch(url, { muteHttpExceptions: true }).getContentText();
  var count = (/Followers \((\d+)\)/.exec(html) || [])[1];
  var users = [], re = /<img[^>]*class="RIppI"[^>]*>/g, m;
  while ((m = re.exec(html))) {
    var src = (/src="([^"]+)"/.exec(m[0]) || [])[1], name = (/title="([^"]*)"/.exec(m[0]) || [])[1] || '';
    if (src) users.push({ name: decode_(name), avatar: src.replace(/=s\d+(-c)?$/, '=s128-c') });
  }
  var data = { count: count ? +count : users.length, users: users, follow: 'https://www.blogger.com/follow-blog.g?blogID=' + BLOG_ID };
  cache.put('followers', JSON.stringify(data), CACHE_SECONDS);
  return data;
}

function decode_(s) {
  return s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}
