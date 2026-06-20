
(() => {
  const isNativeInteractive = (el) => /^(A|BUTTON|INPUT|SELECT|TEXTAREA|SUMMARY)$/.test(el.tagName);
  const makeContactHref = (el) => {
    const subject = el.dataset.cardContactSubject;
    if (!subject) return null;
    const params = new URLSearchParams();
    params.set('autostart', '1');
    params.set('subject', subject);
    if (el.dataset.cardContactMessage) params.set('message', el.dataset.cardContactMessage);
    return `contact.html?${params.toString()}`;
  };
  const resolveHref = (el) => makeContactHref(el) || el.dataset.cardHref || el.getAttribute('href');
  const go = (href) => {
    if (!href) return;
    if (href.startsWith('#')) {
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    window.location.href = href;
  };

  document.querySelectorAll('[data-card-href], [data-card-contact-subject]').forEach((el) => {
    if (!el.classList.contains('action-card')) el.classList.add('action-card');
    if (!isNativeInteractive(el)) {
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      if (!el.hasAttribute('role')) el.setAttribute('role', 'link');
    }
    const label = el.dataset.cardTitle || el.getAttribute('aria-label') || (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 120);
    if (label && !el.getAttribute('aria-label')) el.setAttribute('aria-label', label);
    const handler = (event) => {
      if (event.target.closest('a, button, input, select, textarea, label') && event.target !== el) return;
      const href = resolveHref(el);
      go(href);
    };
    el.addEventListener('click', handler);
    el.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler(event);
      }
    });
  });
})();
