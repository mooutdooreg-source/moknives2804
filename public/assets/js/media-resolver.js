(() => {
  const FALLBACK_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.avif'];
  const MEDIA_EXT_RE = /\.(png|jpe?g|webp|avif)(\?.*)?$/i;
  const cache = new Map();

  const stripQuery = (url) => String(url || '').split('?')[0];
  const isSkippable = (url) => !url || /^(data:|blob:|https?:|#)/i.test(url);

  const toBasePath = (url) => stripQuery(url).replace(MEDIA_EXT_RE, '');
  const basename = (url) => stripQuery(url).split('/').pop() || 'missing-media';
  const expectedPath = (url) => `${toBasePath(url)}.png`;

  const kebabName = (name) => basename(name)
    .replace(/\.[^.]+$/, '')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/[^a-zA-Z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase() || 'missing-media';

  const getSlotSize = (el) => {
    const rect = el && el.getBoundingClientRect ? el.getBoundingClientRect() : { width: 0, height: 0 };
    const w = Math.round(rect.width || el.clientWidth || el.offsetWidth || 390);
    const h = Math.round(rect.height || el.clientHeight || el.offsetHeight || 844);
    return `${w} x ${h}`;
  };

  const assetExists = (url) => {
    if (cache.has(url)) return cache.get(url);
    const probe = new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(url);
      img.onerror = () => resolve(null);
      img.src = url;
    });
    cache.set(url, probe);
    return probe;
  };

  const resolveMediaPath = async (url) => {
    if (isSkippable(url) || !MEDIA_EXT_RE.test(url)) return url;
    const base = toBasePath(url);
    for (const ext of FALLBACK_EXTENSIONS) {
      const candidate = `${base}${ext}`;
      const found = await assetExists(candidate);
      if (found) return found;
    }
    return null;
  };

  const placeholderHTML = (original, el) => `
    <div class="asset-placeholder__line"><span class="asset-placeholder__label">name:</span> <span class="asset-placeholder__value">${kebabName(original)}</span></div>
    <div class="asset-placeholder__line"><span class="asset-placeholder__label">path:</span> <span class="asset-placeholder__value">${expectedPath(original)}</span></div>
    <div class="asset-placeholder__line"><span class="asset-placeholder__label">dimensions:</span> <span class="asset-placeholder__value">${getSlotSize(el)}</span></div>
  `;

  const ensurePlaceholder = (host, original) => {
    if (!host || host.querySelector('.asset-placeholder')) return;
    const current = window.getComputedStyle(host);
    if (current.position === 'static') host.style.position = 'relative';
    host.classList.add('asset-fallback-host');
    const ph = document.createElement('div');
    ph.className = 'asset-placeholder';
    ph.innerHTML = placeholderHTML(original, host);
    host.appendChild(ph);
  };

  const replaceImageWithPlaceholder = (img, original) => {
    const ph = document.createElement('div');
    ph.className = 'asset-placeholder asset-placeholder--static';
    ph.innerHTML = placeholderHTML(original, img);
    ph.style.width = `${Math.max(img.clientWidth || img.width || 390, 160)}px`;
    ph.style.maxWidth = '100%';
    ph.style.minHeight = `${Math.max(img.clientHeight || img.height || 844, 160)}px`;
    img.replaceWith(ph);
  };

  const resolveImages = () => {
    document.querySelectorAll('img[src]').forEach(async (img) => {
      const original = img.getAttribute('src');
      if (isSkippable(original) || !MEDIA_EXT_RE.test(original)) return;
      const resolved = await resolveMediaPath(original);
      if (resolved) {
        if (resolved !== original) img.setAttribute('src', resolved);
        return;
      }
      replaceImageWithPlaceholder(img, original);
    });
  };

  const resolvePosters = () => {
    document.querySelectorAll('video[poster]').forEach(async (video) => {
      const original = video.getAttribute('poster');
      if (isSkippable(original) || !MEDIA_EXT_RE.test(original)) return;
      const resolved = await resolveMediaPath(original);
      if (resolved) video.setAttribute('poster', resolved);
      else ensurePlaceholder(video.parentElement || video, original);
    });
  };

  const resolveInlineBackgrounds = () => {
    document.querySelectorAll('[style*="background-image"], [style*="--hero-mobile-poster"]').forEach((el) => {
      const style = el.getAttribute('style') || '';
      const urls = [...style.matchAll(/url\((['"]?)([^'")]+\.(?:png|jpe?g|webp|avif))(?:\?[^'")]*)?\1\)/ig)];
      urls.forEach(async (match) => {
        const original = match[2];
        const resolved = await resolveMediaPath(original);
        if (resolved) {
          el.setAttribute('style', (el.getAttribute('style') || '').replace(original, resolved));
        } else {
          ensurePlaceholder(el, original);
        }
      });
    });
  };

  const run = () => {
    resolveImages();
    resolvePosters();
    resolveInlineBackgrounds();
  };

  window.MoMediaResolver = { resolveMediaPath, expectedPath, kebabName, ensurePlaceholder };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once: true });
  else run();
})();
