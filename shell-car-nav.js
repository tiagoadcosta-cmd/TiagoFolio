(() => {
  const carWrapper = document.getElementById('carWrapper');
  const carImage = document.getElementById('carImage');

  // Ajustar para manter consistência com index.html
  const carStartVw = 1.5; // posição onde fica visível (lado esquerdo)
  const carOffLeftVw = -30; // fora do ecrã, esquerda
  const carTravelRightVw = 110; // fora do ecrã, direita

  let isTransitioning = false;
  let lastDirection = 'down';

  // Só usaremos PNG no fim (congelado). Evita qualquer alteração prematura.
  function setCarState(state) {
    if (!carImage || !carWrapper) return;

    if (state === 'stopped') {
      carWrapper.style.transform = 'scaleX(1)';
      if (!carImage.getAttribute('src')?.includes('car-on.png')) {
        carImage.src = './car-on.png';
      }
      return;
    }

    if (state === 'stopped-reversed') {
      carWrapper.style.transform = 'scaleX(-1)';
      if (!carImage.getAttribute('src')?.includes('car-on.png')) {
        carImage.src = './car-on.png';
      }
      return;
    }

    // estados de movimento: sempre GIF (nunca PNG)
    const isReversed = state === 'scrolling-up';
    carWrapper.style.transform = `scaleX(${isReversed ? -1 : 1})`;

    if (!carImage.getAttribute('src')?.includes('car-on.gif')) {
      carImage.src = './car-on.gif';
    }
  }



  function setCarMoving(direction) {
    // direction: 'left-to-right' | 'right-to-left'
    // Mantém uma semântica próxima do teu script original.
    if (direction === 'left-to-right') {
      lastDirection = 'down';
      setCarState('scrolling-down');
    } else {
      lastDirection = 'up';
      setCarState('scrolling-up');
    }
  }

  function setCarStopped() {
    // Ao final, congela no lado esquerdo na orientação "normal" (sem reverse).
    setCarState('stopped');
  }

  function animateCarTo(xVw, opts = {}) {
    return new Promise((resolve) => {
      if (!carWrapper) return resolve();

      const duration = opts.duration ?? 900;
      const ease = opts.ease ?? 'cubic-bezier(.16,1,.3,1)';

      // Se GSAP existir no browser, usa.
      if (window.gsap && window.gsap.to) {
        window.gsap.to(carWrapper, {
          left: `${xVw}vw`,
          duration: duration / 1000,
          ease,
          onComplete: resolve,
        });
        return;
      }

      // Fallback CSS/JS
      carWrapper.style.transition = `left ${duration}ms ${ease}`;
      carWrapper.style.left = `${xVw}vw`;
      setTimeout(() => resolve(), duration);
    });
  }

  function initCarOnPageLoad() {
    if (!carWrapper) return;

    // estado inicial fora do ecrã (esquerda) - sem opacidade/efeitos
    carWrapper.style.left = `${carOffLeftVw}vw`;

    // garantir que fica já em GIF (visível enquanto entra)
    if (carImage) carImage.src = './car-on.gif';
    // manter orientação normal sem tocar em setCarState
    if (carWrapper) carWrapper.style.transform = 'scaleX(1)';

    // espera ~2s para o user notar a cena, depois começa o movimento para dentro
    // (não mexe em opacity/transform)
    setTimeout(() => {
      animateCarTo(carStartVw, { duration: 2000, ease: 'cubic-bezier(.16,1,.3,1)' }).then(() => {
        setTimeout(() => {
          setCarStopped();
        }, 50);
      });
    }, 2000);
  }

  function initBottomNavTransitions() {
    const nav = document.querySelector('.bottom-nav');
    const links = nav ? Array.from(nav.querySelectorAll('a')) : [];
    if (!links.length) return;

    links.forEach((link) => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (!href || href.startsWith('#')) return; // ignora anchors

        // requisito: só anima quando clicar em percurso.html / percurso
        const shouldAnimate = shouldAnimateForPercursoHref(href);
        if (!shouldAnimate) return;

        if (isTransitioning) {
          e.preventDefault();
          return;
        }

        e.preventDefault();
        isTransitioning = true;

        // animação: carro avança para direita e só depois navega
        setCarMoving('left-to-right');



        (async () => {
          await animateCarTo(carTravelRightVw, { duration: 2000, ease: 'power2.in' });

          // Garantir que pelo menos 1-2 frames foram renderizados antes da troca de página.
          await new Promise((r) => requestAnimationFrame(() => r()));
          await new Promise((r) => setTimeout(r, 50));

          // Carro pode ficar fora, então troca de página.
          window.location.href = href;
        })();


      });
    });

  }

  function setActiveLink() {
    const links = Array.from(document.querySelectorAll('.bottom-nav a'));
    const path = window.location.pathname.split('/').pop();

    // mapeamento por filename
    const map = {
      'sobre.html': '#sobre',
      'percurso.html': '#percurso',
      'projetos.html': '#projetos',
      'contacto.html': '#contacto',
      'index.html': '#sobre',
    };

    const activeHash = map[path] || '#sobre';
    links.forEach((a) => {
      const k = a.getAttribute('data-active') || '';
      a.classList.toggle('is-active', k === activeHash);
    });
  }


  function shouldAnimateForPercursoHref(href) {
    if (!href) return false;
    // requisito: só quando clicar em percurso.html (ou variantes com 'percurso')
    return href.includes('percurso.html') || href.includes('percurso');
  }

  window.addEventListener('load', () => {
    // reset para garantir que cada página começa igual
    if (carWrapper) {
      carWrapper.style.transition = '';
    }

    // requisito: este overlay só aparece/anima como transição quando clicar em percurso
    // então não corremos initCarOnPageLoad() aqui.

    initBottomNavTransitions();
    setActiveLink();
  });
})();


