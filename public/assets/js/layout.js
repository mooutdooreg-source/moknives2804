(function () {
  if (window.__moLayoutLoaded) return;
  window.__moLayoutLoaded = true;

  var PARTIALS = {
    header: 'partials/header.html',
    footer: 'partials/footer.html'
  };

  var PAGE_BY_FILE = {
    'index.html': 'home',
    'the-vault.html': 'vault',
    'why-mo.html': 'why-mo',
    'limited-drop.html': 'limited-drop',
    'edge-academy.html': 'edge-academy',
    'mo-gear.html': 'mo-gear',
    'contact.html': 'contact',
    'request-entry.html': 'request-entry',
    'request-a-blade.html': 'request-entry',
    'vanguard-request.html': 'vanguard-request',
    'record-detail.html': 'vault',
    'culinary.html': 'vault',
    'expedition.html': 'vault',
    'singularis.html': 'vault',
    'vanguard.html': 'vault'
  };

  function loadPartial(path) {
    return fetch(path, { cache: 'no-store' })
      .then(function (response) {
        if (!response.ok) {
          throw new Error('HTTP ' + response.status);
        }
        return response.text();
      })
      .catch(function (error) {
        console.error('Failed to load partial:', path, error);
        return '';
      });
  }

  function renderLucideIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }

  function resolvePageKey() {
    if (document.body && document.body.dataset.page) {
      return document.body.dataset.page;
    }

    var fileName = window.location.pathname.split('/').pop().toLowerCase();
    return PAGE_BY_FILE[fileName] || '';
  }

  function setActiveNav() {
    var page = resolvePageKey();
    if (!page) return;

    document.querySelectorAll('[data-nav], [data-nav-request]').forEach(function (link) {
      link.classList.remove('active', 'is-active');
      link.removeAttribute('aria-current');
    });

    document.querySelectorAll('[data-nav="' + page + '"]').forEach(function (link) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    });

    if (page === 'request-entry' || page === 'request-a-blade' || page === 'vanguard-request') {
      document.querySelectorAll('[data-nav-request]').forEach(function (link) {
        link.classList.add('is-active');
        link.setAttribute('aria-current', 'page');
      });
    }
  }

  function syncCurrentYear() {
    var year = String(new Date().getFullYear());
    document.querySelectorAll('#current-year').forEach(function (node) {
      node.textContent = year;
    });
  }

  function syncHeaderOffset() {
    var announcement = document.querySelector('.announcement-bar');
    var header = document.querySelector('.site-header');
    var offset = 0;

    if (announcement) {
      offset += announcement.getBoundingClientRect().height;
    }

    if (header) {
      offset += header.getBoundingClientRect().height;
    }

    document.documentElement.style.setProperty('--site-header-offset', Math.round(offset) + 'px');
  }

  function initMobileMenu() {
    var menuButton = document.getElementById('mobile-menu-button');
    var mobileMenu = document.getElementById('mobile-menu');

    if (!menuButton || !mobileMenu || menuButton.dataset.layoutBound === 'true') {
      return;
    }

    menuButton.dataset.layoutBound = 'true';

    var isOpen = false;
    var previousBodyOverflow = document.body.style.overflow || '';

    function updateIcon(iconName) {
      menuButton.innerHTML = '<i data-lucide="' + iconName + '" class="w-6 h-6"></i>';
      renderLucideIcons();
    }

    function setMenuState(nextOpen) {
      isOpen = Boolean(nextOpen);
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      mobileMenu.classList.toggle('hidden', !isOpen);

      if (isOpen) {
        previousBodyOverflow = document.body.style.overflow || '';
        document.body.style.overflow = 'hidden';
        updateIcon('x');
        return;
      }

      document.body.style.overflow = previousBodyOverflow;
      updateIcon('menu');
    }

    menuButton.addEventListener('click', function () {
      setMenuState(!isOpen);
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (isOpen) {
          setMenuState(false);
        }
      });
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen) {
        setMenuState(false);
      }
    });

    window.addEventListener('resize', function () {
      syncHeaderOffset();
      if (window.matchMedia('(min-width: 768px)').matches && isOpen) {
        setMenuState(false);
      }
    });
  }

  function injectPartial(targetId, html) {
    var target = document.getElementById(targetId);
    if (!target || target.dataset.loaded === 'true' || !html) return;

    target.innerHTML = html;
    target.dataset.loaded = 'true';
  }

  function initLayout() {
    var tasks = [];

    if (document.getElementById('site-header')) {
      tasks.push(
        loadPartial(PARTIALS.header).then(function (html) {
          injectPartial('site-header', html);
        })
      );
    }

    if (document.getElementById('site-footer')) {
      tasks.push(
        loadPartial(PARTIALS.footer).then(function (html) {
          injectPartial('site-footer', html);
        })
      );
    }

    Promise.all(tasks).catch(function (err) {
      console.error('[mo:layout] Partial load failed:', err);
    }).finally(function () {
      setActiveNav();
      syncCurrentYear();
      syncHeaderOffset();
      initMobileMenu();
      renderLucideIcons();
      document.dispatchEvent(new CustomEvent('mo:layout-ready'));
    });

    window.addEventListener('load', syncHeaderOffset, { once: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLayout, { once: true });
    return;
  }

  initLayout();
})();
