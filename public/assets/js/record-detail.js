(() => {
  const records = window.MOK_RECORDS || {};
  const params = new URLSearchParams(window.location.search);
  const requestedId = params.get('record');
  const recordId = requestedId && records[requestedId] ? requestedId : 'expedition-01';
  if (!records[recordId]) return;
  const record = records[recordId];

  const $ = (sel) => document.querySelector(sel);
  const setText = (sel, value) => { const el = $(sel); if (el && value != null) el.textContent = value; };
  const setHref = (sel, value) => { const el = $(sel); if (el && value) el.setAttribute('href', value); };

  document.title = `Mo Knives | ${record.title}`;
  setText('[data-record-tag]', record.tag);
  setText('[data-record-title]', record.title);
  setText('[data-record-meta]', `${record.world} • ${record.status}`);
  setText('[data-record-note]', record.note);
  setText('[data-record-story]', record.story);
  setText('[data-record-world]', record.world);
  setText('[data-record-status]', record.status);
  setText('[data-record-archive]', record.archiveNote);
  setText('[data-record-request-label]', record.requestLabel || 'Request Entry');
  setHref('[data-record-request-link]', record.requestHref || 'request-entry.html');

  const heroWrap = $('[data-record-hero]');
  if (heroWrap && record.hero) {
    heroWrap.innerHTML = `<img src="${record.hero}" alt="${record.title}">`;
  }

  const gallery = $('[data-record-gallery]');
  if (gallery) {
    gallery.innerHTML = '';
    (record.gallery || []).forEach((src, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'record-page__gallery-item';
      button.setAttribute('data-lightbox-index', String(index));
      button.setAttribute('aria-label', `Open ${record.title} image ${index + 1} fullscreen`);
      button.innerHTML = `<img src="${src}" alt="${record.title} image ${index + 1}">`;
      gallery.appendChild(button);
    });
  }

  const lightbox = $('[data-record-lightbox]');
  const lightboxImg = $('[data-record-lightbox-img]');
  const lightboxCaption = $('[data-record-lightbox-caption]');
  let current = 0;
  const images = record.gallery || [];
  const render = () => {
    if (!lightboxImg || !images.length) return;
    lightboxImg.src = images[current];
    lightboxImg.alt = `${record.title} fullscreen image ${current + 1}`;
    if (lightboxCaption) lightboxCaption.textContent = `${record.title} • image ${current + 1} of ${images.length}`;
  };
  const open = (index) => {
    if (!lightbox || !images.length) return;
    current = index;
    render();
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    if (!lightbox) return;
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };
  const move = (delta) => {
    if (!images.length) return;
    current = (current + delta + images.length) % images.length;
    render();
  };

  document.querySelectorAll('[data-lightbox-index]').forEach((el) => {
    el.addEventListener('click', () => open(Number(el.dataset.lightboxIndex || 0)));
  });
  document.querySelectorAll('[data-record-lightbox-close]').forEach((el) => el.addEventListener('click', close));
  const prev = $('[data-record-lightbox-prev]');
  const next = $('[data-record-lightbox-next]');
  if (prev) prev.addEventListener('click', () => move(-1));
  if (next) next.addEventListener('click', () => move(1));
  if (lightbox) {
    lightbox.addEventListener('click', (event) => { if (event.target === lightbox) close(); });
  }
  document.addEventListener('keydown', (event) => {
    if (!lightbox || !lightbox.classList.contains('open')) return;
    if (event.key === 'Escape') close();
    if (event.key === 'ArrowLeft') move(-1);
    if (event.key === 'ArrowRight') move(1);
  });
})();
