// Simple HTML partial include utility for static pages.
//
// Usage:
//   <div data-include="partials/topbar.html"></div>
//   <div data-include="partials/footer.html"></div>
//
// Optional:
//   <meta name="page-title" content="...">
//   <body data-page-title="...">
//   <div id="pageMetaSource">...</div>
//
// Shared layout hooks:
//   [data-role="page-title"]  -> inject page title
//   #pageMeta                -> header meta/chips container

(async function () {
  const includeNodes = Array.from(document.querySelectorAll('[data-include]'));
  if (!includeNodes.length) return;

  // ---- include partials (sequential, safe) ----
  async function inject(el) {
    const url = el.getAttribute('data-include');
    if (!url) return;

    try {
      const res = await fetch(url, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      el.outerHTML = html;
    } catch (e) {
      console.error('[include.js] Include failed:', url, e);
      el.outerHTML = `<!-- include failed: ${url} -->`;
    }
  }

  for (const el of includeNodes) {
    await inject(el);
  }

  // ---- resolve page title (priority-based) ----
  // 1. <meta name="page-title">
  // 2. <body data-page-title="">
  // 3. <title> (strip "SKYWARD •")
  const metaTitle = document
    .querySelector('meta[name="page-title"]')
    ?.getAttribute('content');

  const bodyTitle = document.body?.dataset?.pageTitle;

  const docTitle = (document.title || '')
    .replace(/^SKYWARD\s*•\s*/i, '')
    .trim();

  const finalTitle = (metaTitle || bodyTitle || docTitle || 'Skyward Project').trim();

  document
    .querySelectorAll('[data-role="page-title"]')
    .forEach((el) => {
      el.textContent = finalTitle;
    });

  // ---- move page meta / chips into header if exists ----
  const metaTarget = document.getElementById('pageMeta');
  const metaSource = document.getElementById('pageMetaSource');
  if (metaTarget && metaSource) {
    metaTarget.appendChild(metaSource);
  }

  // ---- set active nav item ----
  const currentPath =
    (location.pathname.split('/').pop() || 'index.html').toLowerCase();

  document.querySelectorAll('a[data-nav]').forEach((a) => {
    const href = (a.getAttribute('href') || '')
      .split('/')
      .pop()
      ?.toLowerCase();

    if (href && href === currentPath) {
      a.classList.add('is-active');
    }
  });
  // notify UI hooks
  document.dispatchEvent(new CustomEvent("partials:loaded"));
})();
