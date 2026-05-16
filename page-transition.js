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
      bottom: calc(var(--nav-h, 80px) + 2px);
      left: -25vw;
      width: 12vw;
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

  // Animate the car across the screen
  function animateCar(callback) {
    let car = document.getElementById('page-transition-car');
    if (!car) {
      car = createCarElement();
      document.body.appendChild(car);
    }

    // Force reflow
    car.offsetHeight;

    // Fade in and slide in from left
    car.style.transition = 'opacity 0.2s ease-in, left 0.3s ease-out';
    car.style.opacity = '1';
    car.style.left = '0px';

    // After entering, slide across to the right
    setTimeout(() => {
      car.style.transition = 'left 0.8s ease-in';
      car.style.left = 'calc(100vw + 120px)';

      // After exiting, fade out and call callback
      setTimeout(() => {
        car.style.transition = 'opacity 0.2s ease-out';
        car.style.opacity = '0';

        setTimeout(() => {
          if (callback) callback();
        }, 200);
      }, 800);
    }, 300);
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

    // Animate and then navigate
    animateCar(() => {
      window.location.href = href;
    });
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