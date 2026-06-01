/* ============================================================
   LA CASONA DEL CERDO — script.js
   ============================================================ */

(function () {
  'use strict';

  /* ── Navbar scroll ── */
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;

  window.addEventListener('scroll', () => {
    const current = window.scrollY;
    navbar.classList.toggle('scrolled', current > 60);

    // Hide nav on rapid scroll down, show on scroll up (mobile UX)
    if (current > lastScroll + 8 && current > 200) {
      navbar.style.transform = 'translateY(-100%)';
    } else if (lastScroll - current > 4) {
      navbar.style.transform = '';
    }
    lastScroll = current;
  }, { passive: true });

  /* ── Hamburger menu ── */
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');

  hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('open');
    navLinks.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close menu when any link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinks.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  /* ── Smooth scroll for all anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = parseInt(getComputedStyle(document.documentElement)
        .getPropertyValue('--nav-h'), 10) || 74;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── Reveal on scroll (IntersectionObserver) ── */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (!entry.isIntersecting) return;
      // Stagger sibling reveals
      const siblings = entry.target.parentElement
        ? [...entry.target.parentElement.querySelectorAll('.reveal')]
        : [];
      const idx = siblings.indexOf(entry.target);
      const delay = idx >= 0 ? idx * 80 : 0;
      setTimeout(() => {
        entry.target.classList.add('visible');
      }, delay);
      revealObserver.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── Active nav link based on scroll position ── */
  const sections = document.querySelectorAll('section[id]');

  function updateActiveLink() {
    const offset = 120;
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - offset) {
        current = section.getAttribute('id');
      }
    });
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();

  /* ── Menú: Filtros por categoría ── */
  const filterBtns  = document.querySelectorAll('.filter-btn');
  const menuSections = document.querySelectorAll('.menu-section');
  const menuEmpty   = document.getElementById('menu-empty');
  const searchInput = document.getElementById('menu-search');
  const searchTerm  = document.getElementById('search-term');

  function applyFilter(cat) {
    let visible = 0;
    menuSections.forEach(section => {
      const match = cat === 'all' || section.dataset.cat === cat;
      section.classList.toggle('hidden', !match);
      if (match) visible++;
    });
    menuEmpty.style.display = visible === 0 ? 'block' : 'none';
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      searchInput.value = '';
      searchTerm.textContent = '';
      applyFilter(btn.dataset.cat);
    });
  });

  /* ── Menú: Buscador de platos ── */
  function normalise(str) {
    return str
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }

  searchInput.addEventListener('input', () => {
    const query = normalise(searchInput.value.trim());

    if (!query) {
      // Reset: show active filter
      const activeCat = document.querySelector('.filter-btn.active')?.dataset.cat || 'all';
      applyFilter(activeCat);
      menuEmpty.style.display = 'none';
      return;
    }

    // Set all filter btns to inactive when searching
    filterBtns.forEach(b => b.classList.remove('active'));

    let totalVisible = 0;

    menuSections.forEach(section => {
      const items   = section.querySelectorAll('.menu-item');
      let sectionHit = false;

      items.forEach(item => {
        const name = normalise(item.dataset.name || item.querySelector('.item-name')?.textContent || '');
        const match = name.includes(query);
        item.classList.toggle('hidden', !match);
        item.classList.toggle('highlight', match);
        if (match) sectionHit = true;
      });

      section.classList.toggle('hidden', !sectionHit);
      if (sectionHit) totalVisible++;
    });

    if (totalVisible === 0) {
      menuEmpty.style.display = 'block';
      searchTerm.textContent = searchInput.value.trim();
    } else {
      menuEmpty.style.display = 'none';
    }
  });

  /* ── WhatsApp float: show after 3s ── */
  const waFloat = document.querySelector('.whatsapp-float');
  if (waFloat) {
    waFloat.style.opacity = '0';
    waFloat.style.transform = 'scale(0.6)';
    waFloat.style.transition = 'opacity 0.4s ease, transform 0.4s ease, box-shadow 0.25s';
    setTimeout(() => {
      waFloat.style.opacity = '1';
      waFloat.style.transform = 'scale(1)';
    }, 3000);
  }

  /* ── Galería: lightbox básico ── */
  const galeriaItems = document.querySelectorAll('.galeria-item');

  galeriaItems.forEach(item => {
    item.addEventListener('click', () => {
      const label = item.querySelector('.galeria-overlay span')?.textContent || '';
      showLightbox(label);
    });
    item.style.cursor = 'pointer';
  });

  function showLightbox(label) {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed; inset: 0; z-index: 9999;
      background: rgba(0,0,0,0.92);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      cursor: zoom-out;
      animation: fadeIn 0.25s ease;
    `;

    const inner = document.createElement('div');
    inner.style.cssText = `
      display: flex; flex-direction: column;
      align-items: center; gap: 1.5rem;
      padding: 2rem;
    `;

    const icon = document.createElement('div');
    icon.style.cssText = 'font-size: 6rem; line-height: 1;';
    icon.textContent = '🍽️';

    const title = document.createElement('p');
    title.style.cssText = `
      font-family: 'Cinzel', serif;
      font-size: 1rem;
      color: #c9932a;
      letter-spacing: 0.15em;
      text-transform: uppercase;
    `;
    title.textContent = label;

    const close = document.createElement('p');
    close.style.cssText = 'font-size: 0.75rem; color: #8a7a64; letter-spacing: 0.2em;';
    close.textContent = 'ESC o clic para cerrar';

    inner.append(icon, title, close);
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    function closeLightbox() {
      overlay.remove();
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
    }

    function onKeyDown(e) {
      if (e.key === 'Escape') closeLightbox();
    }

    overlay.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', onKeyDown);
  }

  /* ── Inject CSS keyframe for lightbox ── */
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
    .menu-item.hidden { display: none; }
    .nav-links a.active { color: var(--gold); }
    .nav-links a.active::after { transform: scaleX(1); }
  `;
  document.head.appendChild(style);

  /* ── Parallax subtle on hero ── */
  const hero = document.getElementById('hero');
  const heroContent = hero?.querySelector('.hero-content');

  if (heroContent && window.innerWidth > 768) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      if (scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.18}px)`;
        heroContent.style.opacity = 1 - (scrolled / (window.innerHeight * 0.85));
      }
    }, { passive: true });
  }

  /* ── Estabilizador de mapa ── */
  // Fix Google Maps iframe brightness on load
  const mapIframe = document.querySelector('.map-embed iframe');
  if (mapIframe) {
    mapIframe.addEventListener('load', () => {
      mapIframe.style.opacity = '1';
    });
  }

})();
