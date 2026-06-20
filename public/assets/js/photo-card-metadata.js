(() => {
  const seen = new WeakSet();

  const cleanPath = (url) => {
    try {
      const clean = new URL(url, window.location.href);
      return decodeURIComponent(clean.pathname.replace(/^\//, '') || url);
    } catch {
      return decodeURIComponent((url || '').split('?')[0] || 'unknown-asset');
    }
  };

  const baseName = (url) => {
    const raw = cleanPath(url).split('/').pop() || 'missing-media';
    return raw
      .replace(/\.[^.]+$/, '')
      .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
      .replace(/[_\s]+/g, '-')
      .replace(/[^a-zA-Z0-9-]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
      .toLowerCase() || 'missing-media';
  };

  const expectedPath = (url) => {
    if (window.MoMediaResolver && typeof window.MoMediaResolver.expectedPath === 'function') {
      return window.MoMediaResolver.expectedPath(url);
    }
    return cleanPath(url).replace(/\.(png|jpe?g|webp|avif)(\?.*)?$/i, '.png');
  };

  const estimateSize = (el) => {
    const rect = el.getBoundingClientRect();
    const w = Math.round(rect.width || el.clientWidth || el.offsetWidth || 390);
    const h = Math.round(rect.height || el.clientHeight || el.offsetHeight || 844);
    return `${w} x ${h}`;
  };

  const shouldIgnore = (el) => {
    if (!el || !(el instanceof Element)) return true;
    return Boolean(
      el.closest(
        '.hero, .hero-video, .academy-hero, .parallax-section, .site-header, header, .announcement-bar, .announcement-track, .mobile-menu, .hero-panel, [data-no-fallback]'
      )
    );
  };

  const placeholderMarkup = (assetUrl, size) => `
    <div class="asset-placeholder__line"><span class="asset-placeholder__label">name:</span> <span class="asset-placeholder__value">${baseName(assetUrl)}</span></div>
    <div class="asset-placeholder__line"><span class="asset-placeholder__label">path:</span> <span class="asset-placeholder__value">${expectedPath(assetUrl)}</span></div>
    <div class="asset-placeholder__line"><span class="asset-placeholder__label">dimensions:</span> <span class="asset-placeholder__value">${size}</span></div>
  `;

  const ensureHostPosition = (el) => {
    const style = window.getComputedStyle(el);
    if (style.position === 'static') {
      el.style.position = 'relative';
    }
    el.classList.add('asset-fallback-host');
  };

  const addOverlayPlaceholder = (host, assetUrl) => {
    if (!host || seen.has(host) || host.querySelector('.asset-placeholder') || shouldIgnore(host)) return;
    seen.add(host);
    ensureHostPosition(host);
    const ph = document.createElement('div');
    ph.className = 'asset-placeholder';
    ph.innerHTML = placeholderMarkup(assetUrl, estimateSize(host));
    host.appendChild(ph);
  };

  const replaceImage = (img) => {
    if (!img || seen.has(img) || shouldIgnore(img)) return;
    seen.add(img);
    const original = img.currentSrc || img.src || img.getAttribute('src') || 'missing-media';
    const ph = document.createElement('div');
    ph.className = 'asset-placeholder asset-placeholder--static';
    ph.innerHTML = placeholderMarkup(original, estimateSize(img));
    ph.style.width = `${Math.max(img.clientWidth || img.width || 390, 160)}px`;
    ph.style.maxWidth = '100%';
    ph.style.minHeight = `${Math.max(img.clientHeight || img.height || 844, 160)}px`;
    if (img.parentNode) img.parentNode.replaceChild(ph, img);
  };

  const testImageUrl = (url, onFail) => {
    if (!url || url.startsWith('data:') || url.startsWith('blob:')) return;
    const probe = new Image();
    probe.onload = () => {};
    probe.onerror = () => onFail();
    probe.src = url;
  };

  const monitorImages = () => {
    document.querySelectorAll('img').forEach((img) => {
      if (shouldIgnore(img)) return;
      const fail = () => replaceImage(img);
      img.addEventListener('error', fail, { once: true });
      if (img.complete && img.naturalWidth === 0) fail();
    });
  };

  const monitorVideos = () => {
    document.querySelectorAll('video').forEach((video) => {
      if (shouldIgnore(video)) return;
      const host = video.parentElement || video;
      if (shouldIgnore(host)) return;
      const src = video.currentSrc || video.getAttribute('src') || (video.querySelector('source') && video.querySelector('source').getAttribute('src')) || video.getAttribute('poster') || 'video';
      const fail = () => {
        video.classList.add('asset-fallback-hidden');
        addOverlayPlaceholder(host, src);
      };
      video.addEventListener('error', fail, { once: true });
      const source = video.querySelector('source');
      if (source) source.addEventListener('error', fail, { once: true });
      if (!src || src === 'video') fail();
    });
  };

  const monitorBackgrounds = () => {
    document.querySelectorAll('section, div, article, aside, figure').forEach((el) => {
      if (shouldIgnore(el)) return;
      const bg = window.getComputedStyle(el).backgroundImage;
      if (!bg || bg === 'none' || !bg.includes('url(')) return;
      const urls = [...bg.matchAll(/url\((?:"|')?(.*?)(?:"|')?\)/g)].map((m) => m[1]).filter(Boolean);
      if (!urls.length) return;
      urls.forEach((url) => testImageUrl(url, () => addOverlayPlaceholder(el, url)));
    });
  };

  const run = () => {
    monitorImages();
    monitorVideos();
    setTimeout(monitorBackgrounds, 150);
  };

  if (document.readyState === 'complete') {
    run();
  } else {
    window.addEventListener('load', run, { once: true });
  }
})();
