/**
 * Page Transition with Car Animation
 * When clicking navigation links, shows a car animation before loading the new page
 */

(function() {
  'use strict';

  // Create the car element
  function createCarElement() {
    const car = document.createElement('div');
    car.id = 'page-transition-car';
    car.style.cssText = `
      position: fixed;
      bottom: calc(var(--nav-h, 70px) + 2px);
      left: -25vw;
      width: 30vw;
      max-width: 160px;
      min-width: 50px;
      height: auto;
      z-index: 9999;
      pointer-events: none;
      opacity: 0;
      transition: none;
    `;

    const img = document.createElement('img');
    img.src = './car-on.gif';
    img.alt = 'Car transition';
    img.style.cssText = `
      width: 100%;
      height: auto;
      display: block;
    `;

    car.appendChild(img);
    return car;
  }

  // Animate the car across the screen.
  // direction: 'forward' => esquerda -> direita (normal)
  // direction: 'backward' => direita -> esquerda (inverte + sai pela esquerda)
  function animateCar(callback, direction = 'forward') {
    let car = document.getElementById('page-transition-car');
    if (!car) {
      car = createCarElement();
      document.body.appendChild(car);
    }

    const img = car.querySelector('img');

    // Forçar reflow
    car.offsetHeight;

    const from = direction === 'backward' ? 'calc(100vw + 120px)' : '-25vw';
    const to = direction === 'backward' ? '-25vw' : 'calc(100vw + 120px)';

    // Inverter visualmente quando é backward
    if (car) {
      car.style.transform = direction === 'backward' ? 'scaleX(-1)' : 'scaleX(1)';
    }

    // Set inicial fora do ecrã + invisível
    car.style.transition = 'opacity 0.0s ease 0s, left 0.0s ease 0s';
    car.style.opacity = '0';
    car.style.left = from;

    // Reflow de confirmação
    car.offsetHeight;

    // Fade in e slide
    car.style.transition = 'opacity 0.2s ease-in, left 0.3s ease-out';
    car.style.opacity = '1';
    car.style.left = '0px';

    setTimeout(() => {
      car.style.transition = 'left 0.8s ease-in';
      car.style.left = to;

      setTimeout(() => {
        car.style.transition = 'opacity 0.2s ease-out';
        car.style.opacity = '0';

        setTimeout(() => {
          if (callback) callback();
        }, 200);
      }, 800);
    }, 300);
  }

  // Ordem das páginas (para inferir se é forward/backward)
  function getPageIndex(path) {
    const clean = (path || '').replace(/\/$/, '');
    const map = {
      '/index.html': 0,
      '/percurso.html': 1,
      '/projetos.html': 2,
      '/contacto.html': 3,
      'index.html': 0,
      'percurso.html': 1,
      'projetos.html': 2,
      'contacto.html': 3,
    };
    return map[clean] ?? map[clean.split('/').pop()] ?? null;
  }

  function getDirectionForNav(href) {
    const currentPath = window.location.pathname;
    const targetPath = new URL(href, window.location.origin).pathname;

    const currentIdx = getPageIndex(currentPath);
    const targetIdx = getPageIndex(targetPath);

    if (currentIdx == null || targetIdx == null) return 'forward';
    return targetIdx >= currentIdx ? 'forward' : 'backward';
  }

  // Handle navigation clicks
  function handleNavClick(e) {
    const link = e.target.closest('a[href]');
    if (!link) return;

    const href = link.getAttribute('href');

    // Skip external links, anchors, mailto, etc.
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') ||
        href.includes('://') || href.startsWith('//')) {
      return;
    }

    // Skip if it's the current page
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const targetPath = new URL(href, window.location.origin).pathname.replace(/\/$/, '');
    if (currentPath === targetPath) return;

    e.preventDefault();

    // Prevent multiple clicks
    if (document.body.classList.contains('transitioning')) return;
    document.body.classList.add('transitioning');

    // Animate and then navigate (forward/backward based on route order)
    const direction = getDirectionForNav(href);
    animateCar(() => {
      window.location.href = href;
    }, direction);
  }

  // Initialize when DOM is ready
  function init() {
    // Add event listener to all navigation links
    document.addEventListener('click', handleNavClick);

    // Remove transitioning class when page loads
    document.body.classList.remove('transitioning');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();