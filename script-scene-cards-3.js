const panels = Array.from(document.querySelectorAll('.panel'));
const navLinks = Array.from(document.querySelectorAll('.bottom-nav a'));

const track = document.getElementById('horizontalTrack');

const carWrapper = document.getElementById('carWrapper');
const carImage = document.getElementById('carImage');
// const road = document.querySelector('.page-background'); // não usado

let horizontalScrollTrigger = null;
let mobileObserver = null;
let lastScrollY = window.scrollY;
const carStart = 1.5;
const carEnd = 80;
let scrollStopTimeout = null;
let navScrollTimeout = null;
let lastScrollDirection = 'down';
let isScrolling = false;
let isNavScrolling = false;
let isInitialAnimation = true;
let carScaleX = 1;

function setCarState(state){
  if(!carImage) return;
  
  let imageSrc = './car-on.png';
  let isReversed = false;
  
  if(state === 'scrolling-down') {
    imageSrc = './car-on.gif';
  } else if(state === 'scrolling-up') {
    imageSrc = './car-on.gif';
    isReversed = true;
  } else if(state === 'stopped-reversed') {
    imageSrc = './car-on.png';
    isReversed = true;
  }
  
  carScaleX = isReversed ? -1 : 1;
  if(carWrapper) carWrapper.style.transform=`scaleX(${carScaleX})`;

  const currentSrc = carImage.getAttribute('src') || '';
  if(!currentSrc.endsWith(imageSrc.replace('./',''))){
    carImage.src = `${imageSrc}?v=${Date.now()}`;
  } else {
    carImage.src = imageSrc;
  }
}
function setActive(hash){navLinks.forEach(link=>link.classList.toggle('is-active',link.getAttribute('href')===hash))}
function updateCards(activeId){panels.forEach(panel=>{const card=panel.querySelector('.road-card'); if(!card) return; card.classList.toggle('is-visible', panel.id===activeId)})}
function sync(activeId){setActive(`#${activeId}`); updateCards(activeId)}
function getScrollProgress(){const maxScroll=Math.max(1,document.body.scrollHeight-window.innerHeight); return window.scrollY/maxScroll}
function updateRoadMovement(){}
function updateCarPosition(){if(!carWrapper || isInitialAnimation) return; const progress=getScrollProgress(); const left=carStart + (carEnd-carStart)*progress; window.gsap.to(carWrapper, {left: `${left}vw`, duration: 1.5, ease: 'power2.out'}); carWrapper.style.transform=`scaleX(${carScaleX})`}
function buildHorizontalScroll(){if(!window.gsap||!window.ScrollTrigger||window.innerWidth<=900||!track){if(horizontalScrollTrigger){horizontalScrollTrigger.kill(); horizontalScrollTrigger=null} if(window.gsap && track) window.gsap.set(track,{clearProps:'transform'}); return} window.gsap.registerPlugin(window.ScrollTrigger); if(horizontalScrollTrigger){horizontalScrollTrigger.kill(); horizontalScrollTrigger=null; window.gsap.set(track,{clearProps:'all'})} const scrollDistance=track.scrollWidth-window.innerWidth; if(scrollDistance<=0) return; horizontalScrollTrigger=window.gsap.to(track,{x:-scrollDistance,ease:'none',scrollTrigger:{trigger:'.experience-shell',start:'top top',end:()=>`+=${scrollDistance}`,scrub:1,pin:true,anticipatePin:1,invalidateOnRefresh:true,onUpdate:(self)=>{const index=Math.round(self.progress*(panels.length-1)); const active=panels[index]; if(active?.id) sync(active.id); setCarState(self.direction===-1?'scrolling-up':'scrolling-down'); updateRoadMovement(); updateCarPosition()}}}).scrollTrigger}
function mobileFallback(){if(mobileObserver){mobileObserver.disconnect(); mobileObserver=null} if(window.innerWidth>900) return; mobileObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting&&entry.target.id) sync(entry.target.id)})},{threshold:.4}); panels.forEach(panel=>mobileObserver.observe(panel))}

// ===== Percurso: controlo apenas por clique (sem abrir/fechar por scroll) =====

window.addEventListener('scroll',()=>{
  const currentScrollY = window.scrollY;
  const deltaY = currentScrollY - lastScrollY;
  
  // Determinar estado do carro com base no scroll
  if(!isNavScrolling){
    if(deltaY > 0) {
      // Scroll down
      setCarState('scrolling-down');
      lastScrollDirection = 'down';
    } else if(deltaY < 0) {
      // Scroll up
      setCarState('scrolling-up');
      lastScrollDirection = 'up';
    }
  }
  
  // Limpar timeout anterior
  if(scrollStopTimeout) clearTimeout(scrollStopTimeout);
  
  // Definir novo timeout para detectar quando o scroll para
  scrollStopTimeout = setTimeout(() => {
    if(isNavScrolling) return;
    const stoppedState = lastScrollDirection === 'up' ? 'stopped-reversed' : 'stopped';
    setCarState(stoppedState);
    isScrolling = false;
  }, 200);
  
  updateCarPosition(); 
  lastScrollY = currentScrollY;
},{passive:true});
window.addEventListener('load',()=>{
  carWrapper.style.opacity='0';
  carWrapper.style.left='-30vw';
  if(carImage) carImage.src='./car-on.gif';
  carScaleX=1;
  buildHorizontalScroll();
  mobileFallback();
  sync('sobre');


  updateRoadMovement();

  window.gsap.fromTo(
    carWrapper,
    {left:'-30vw', opacity:0},
    {left:`${carStart}vw`, opacity:1, duration:2.5, ease:'power2.out', onComplete:()=>{setCarState('stopped'); isInitialAnimation=false;}}
  );
});

window.addEventListener('resize',()=>{buildHorizontalScroll(); mobileFallback(); if(window.ScrollTrigger) window.ScrollTrigger.refresh(); updateRoadMovement(); updateCarPosition()});


/* ===== Navegação da bottom-nav ===== */
function getCurrentPanelId(){
  if(window.innerWidth > 900 && horizontalScrollTrigger && panels.length){
    const progress = horizontalScrollTrigger.progress || 0;
    const index = Math.round(progress * (panels.length - 1));
    return panels[index]?.id || null;
  }

  let bestId = null;
  let bestDistance = Infinity;
  const viewportCenter = window.innerHeight / 2;

  panels.forEach(panel => {
    const rect = panel.getBoundingClientRect();
    const panelCenter = rect.top + (rect.height / 2);
    const distance = Math.abs(panelCenter - viewportCenter);
    if(distance < bestDistance){
      bestDistance = distance;
      bestId = panel.id;
    }
  });

  return bestId;
}

function scrollToPanel(id){
  const panel = document.getElementById(id);
  if(!panel) return;

  const currentPanelId = getCurrentPanelId();
  if(currentPanelId === id){
    const stoppedState = lastScrollDirection === 'up' ? 'stopped-reversed' : 'stopped';
    setCarState(stoppedState);
    return;
  }

  if(window.innerWidth > 900 && track && window.gsap && window.ScrollTrigger && horizontalScrollTrigger){
    const index = panels.findIndex(p => p.id === id);
    if(index < 0) return;
    const st = horizontalScrollTrigger;
    const progress = index / Math.max(1, panels.length - 1);
    const targetScrollY = st.start + ((st.end - st.start) * progress);

    const direction = progress < (st.progress || 0) ? 'scrolling-up' : 'scrolling-down';
    setCarState(direction);
    if(carWrapper) carWrapper.style.transform = `scaleX(${carScaleX})`;
    lastScrollDirection = direction === 'scrolling-up' ? 'up' : 'down';
    isNavScrolling = true;
    if(navScrollTimeout) clearTimeout(navScrollTimeout);

    window.gsap.registerPlugin(window.ScrollToPlugin);
    setTimeout(() => {
      window.gsap.to(window, {
        duration: 1,
        scrollTo: { y: targetScrollY },
        ease: 'power2.inOut',
        onComplete: () => {
          isNavScrolling = false;
          const stoppedState = lastScrollDirection === 'up' ? 'stopped-reversed' : 'stopped';
          setCarState(stoppedState);
        }
      });
    }, 70);
  } else {
    const targetTop = panel.getBoundingClientRect().top;
    const direction = targetTop < 0 ? 'scrolling-up' : 'scrolling-down';
    setCarState(direction);
    if(carWrapper) carWrapper.style.transform = `scaleX(${carScaleX})`;
    lastScrollDirection = direction === 'scrolling-up' ? 'up' : 'down';
    isNavScrolling = true;
    if(navScrollTimeout) clearTimeout(navScrollTimeout);

    setTimeout(() => {
      panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      navScrollTimeout = setTimeout(() => {
        isNavScrolling = false;
        const stoppedState = lastScrollDirection === 'up' ? 'stopped-reversed' : 'stopped';
        setCarState(stoppedState);
      }, 900);
    }, 70);
  }
}




function openPercursoDetail(mode, target){
  const perc = document.getElementById('percurso');
  const detail = document.getElementById('percurso-detail');
  if(!perc || !detail) return;

  perc.classList.remove('is-mode-1','is-mode-2');
  if(mode === 1) perc.classList.add('is-mode-1');
  if(mode === 2) perc.classList.add('is-mode-2');

  // controlado apenas pelo modo + texto do título/subtítulo
  const titleEl = document.querySelector('#percurso .percurso-title');
  const subTitleEl = document.querySelector('#percurso .percurso-subtitle');

  if(target === 'matecanigas'){
    titleEl?.replaceChildren(document.createTextNode('Matecanigás, Lda'));
    subTitleEl?.replaceChildren(document.createTextNode('2008 a 2018'));
  } else if(target === 'toyota'){
    titleEl?.replaceChildren(document.createTextNode('Toyota - Caetano Auto Lisboa'));
    subTitleEl?.replaceChildren(document.createTextNode('2018 a 2021'));
  } else {
    titleEl?.replaceChildren(document.createTextNode('PERCURSO'));
    subTitleEl?.replaceChildren(document.createTextNode('clique nos icones para ver mais detalhes'));
  }

  // O conteúdo do card fica em HTML (não montado por JS)
  // JS apenas marca o estado visual
  detail.setAttribute('data-open-target', target);
  detail.classList.add('is-open');



}



function closePercursoDetail(){
  const perc = document.getElementById('percurso');
  const detail = document.getElementById('percurso-detail');
  if(!perc || !detail) return;

  perc.classList.remove('is-mode-1','is-mode-2');
  detail.classList.remove('is-open');

  // regressar título/subtítulo ao estado inicial
  const titleEl = document.querySelector('#percurso .percurso-title');
  const subTitleEl = document.querySelector('#percurso .percurso-subtitle');
  titleEl?.replaceChildren(document.createTextNode('PERCURSO'));
  subTitleEl?.replaceChildren(document.createTextNode('clique nos icones para ver mais detalhes'));


}



const percurso = document.getElementById('percurso');

const points = Array.from(document.querySelectorAll('#percurso .percurso-point[data-target]'));

// nota: removida a animação/fotografia flutuante (uaFloating) que não estava a dar bom resultado.



points.forEach(point => {
  const target = point.getAttribute('data-target');
  const btn = point.querySelector('button');
  if(!btn || !target) return;

  btn.addEventListener('click', () => {
    // toggle: se clicar novamente no mesmo botão, fecha
    if(target === 'matecanigas') {
      const isOpenMate = document.getElementById('percurso')?.classList.contains('is-mode-1') && document.getElementById('percurso-detail')?.classList.contains('is-open');
      if(isOpenMate) { closePercursoDetail(); return; }
      openPercursoDetail(1,'matecanigas');
      // também desliza o ecrã até ao #percurso
      scrollToPanel('percurso');
      return;
    }

    if(target === 'toyota') {
      const isOpenToyota = document.getElementById('percurso')?.classList.contains('is-mode-2') && document.getElementById('percurso-detail')?.classList.contains('is-open');
      if(isOpenToyota) { closePercursoDetail(); return; }
      openPercursoDetail(2,'toyota');
      // também desliza o ecrã até ao #percurso
      scrollToPanel('percurso');
      return;
    }

    if(target === 'ua') {
      // UA não usa modo (is-mode-1/2), mas deve voltar ao normal se estava escurecido
      // e fechar os cards abertos
      const perc = document.getElementById('percurso');
      perc?.classList.remove('is-mode-1','is-mode-2');
      closePercursoDetail();
      scrollToPanel('projetos');
      return;

    }

  });

});

// clicar fora do card fecha (opcional)
document.getElementById('percurso')?.addEventListener('click', (e)=>{
  const perc = document.getElementById('percurso');
  const detail = document.getElementById('percurso-detail');
  if(!perc || !detail) return;

  // se o clique foi dentro do detail (ou em algum dos botões), não fecha
  if(detail.contains(e.target) || e.target.closest('.percurso-point')) return;

  // caso contrário fecha
  closePercursoDetail();
});

navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const hash = link.getAttribute('href');
    if(hash && hash.startsWith('#')) scrollToPanel(hash.slice(1));
  });
});

/* ===== Projetos: categorias + navegação no card inferior ===== */
const projetoPoints = Array.from(document.querySelectorAll('#projetos .projeto-point[data-projeto-target]'));
let projetoMediaItems = Array.from(document.querySelectorAll('#projetos [data-projeto-content][data-item-index]'));
const projetoDetailItems = Array.from(document.querySelectorAll('#projetos [data-projeto-detail]'));
let projetoSummaryItems = Array.from(document.querySelectorAll('#projetos [data-projeto-summary][data-item-index]'));
let projetoParticularSummaryItems = Array.from(document.querySelectorAll('#projetos [data-projeto-summary][data-item-index]'));
let projetoParticularFotosSummariesWrap = document.getElementById('projeto-particular-summaries');

// wrap do lado direito onde existem textos particulares fixos (video/ia)
const projetoRightSummariesWrap = document.getElementById('projeto-fotos-summaries');
const projetoNavPrev = document.querySelector('#projetos [data-projeto-nav="prev"]');
const projetoNavNext = document.querySelector('#projetos [data-projeto-nav="next"]');


const projetoState = {
  category: 'foto',
  indexByCategory: { foto: 0, video: 0, ia: 0 }
};

function getProjetoItemsByCategory(category){
  return projetoMediaItems
    .filter(item => item.getAttribute('data-projeto-content') === category)
    .sort((a,b)=>Number(a.getAttribute('data-item-index')) - Number(b.getAttribute('data-item-index')));
}

function applyProjetoState(){
  const category = projetoState.category;
  const activeIndex = projetoState.indexByCategory[category] ?? 0;

  // Assegurar que o card direito mostra só o que está aberto
  projetoPoints.forEach(point => {
    point.classList.toggle('is-active', point.getAttribute('data-projeto-target') === category);
  });


  // Texto geral (foto/vídeo/IA) permanece no card do lado esquerdo
  projetoDetailItems.forEach(item => {
    item.classList.toggle('is-active', item.getAttribute('data-projeto-detail') === category);
  });

  let activeIframe = null;

  projetoMediaItems.forEach(item => {
    const sameCategory = item.getAttribute('data-projeto-content') === category;
    const sameIndex = Number(item.getAttribute('data-item-index')) === activeIndex;
    const isActive = sameCategory && sameIndex;

    item.classList.toggle('is-active', isActive);

    // Evitar interação com iframes "tapados": só o ativo deve ter pointer-events.
    if(item.tagName.toLowerCase() !== 'figure'){
      // nada
    }

    if(!isActive){
      const iframe = item.querySelector('iframe');
      if(iframe){
        iframe.style.pointerEvents = 'none';
        iframe.style.opacity = '0';
      }
    }

    // Se for video/ia e este item ficou ativo, guardamos o iframe para re-inicializar
    if(isActive && (category === 'video' || category === 'ia')){
      activeIframe = item.querySelector('iframe');
    }
  });


// Garantir que o card esquerdo (abaixo do texto geral) mostra só o que está aberto
  // Para video/ia: o texto fixo está no card direito (remove-se aqui para evitar ficar tudo visível)
  const isFoto = category === 'foto';
  projetoParticularSummaryItems.forEach(item => {
    // Apenas controlar a lista de foto particular (injetada via manifest)
    // Video/IA são elementos fixos no card direito e serão controlados pelo card direito.
    const isFotoItem = item.getAttribute('data-projeto-summary') === 'foto';

    if(!isFoto) {
      // Se não for foto, nada de 'foto' particular deve aparecer.
      if(isFotoItem) item.classList.remove('is-active');
      return;
    }

    const sameIndex = Number(item.getAttribute('data-item-index')) === activeIndex;
    item.classList.toggle('is-active', isFotoItem && sameIndex);
  });

  // Controlar video/ia no card direito: mostra só 1 de cada vez
  if(projetoRightSummariesWrap){
    projetoSummaryItems.forEach(item => {
      const sameCategory = item.getAttribute('data-projeto-summary') === category;
      const sameIndex = Number(item.getAttribute('data-item-index')) === activeIndex;
      item.classList.toggle('is-active', sameCategory && sameIndex);
    });
  }


  // Garantir que o iframe ativo recebe interação (especialmente após alternar)


  // + força re-inicialização do embed ao voltar para video/ia.
  if(activeIframe){
    activeIframe.setAttribute('tabindex', '0');
    activeIframe.style.pointerEvents = 'auto';
    activeIframe.style.opacity = '1';

    // Garantir que o iframe ativo recebe interação (especialmente para o vídeo 0)
    // (sem reload forçado: focar no problema de embed vs. bloqueio do YouTube)



    // Alguns browsers só aceitam foco depois de um tick
    window.setTimeout(() => {
      try { activeIframe.focus({ preventScroll: true }); } catch (e) {}
    }, 0);
  }
}

function setProjetoCategory(category){
  if(!category) return;
  projetoState.category = category;
  const items = getProjetoItemsByCategory(category);
  const maxIndex = Math.max(0, items.length - 1);
  if((projetoState.indexByCategory[category] ?? 0) > maxIndex){
    projetoState.indexByCategory[category] = 0;
  }
  applyProjetoState();
}

async function initFotosFromManifest(){
  const placeholder = document.getElementById('projeto-fotos-placeholder');
  const summariesWrap = document.getElementById('projeto-fotos-summaries');
  if(!placeholder || !summariesWrap) return;

  const particularWrap = projetoParticularFotosSummariesWrap;
  // particularWrap deve existir para receber descrições específicas (foto aberta)
  // (se não existir, não bloqueia a criação das fotos/figures)
  const canRenderParticular = !!particularWrap;

  try{
    const res = await fetch('./fotos-manifest.json', { cache: 'no-store' });
    if(!res.ok) return;
    const manifest = await res.json();

    const images = Array.isArray(manifest.images) ? manifest.images : [];
    const basePath = manifest.basePath || './fotos/';

    // Normalizar: pode ser lista de strings "1.jpg" ou objetos {file,title,description}
    const normalizedImages = images.map((item) => {
      if(typeof item === 'string'){
        const idx = images.indexOf(item);
        return { file: item, title: `Fotografia ${idx + 1}`, description: '' };
      }
      return item;
    });


    // limpar
    placeholder.replaceChildren();
    summariesWrap.replaceChildren();
    particularWrap.replaceChildren();

    normalizedImages.forEach((item, idx) => {
      const file = item?.file;
      if(!file) return;
      const src = `${basePath}${file}`;

      const figure = document.createElement('figure');
      figure.className = 'projetos-media-item';
      figure.setAttribute('data-projeto-content','foto');
      figure.setAttribute('data-item-index', String(idx));

      const img = document.createElement('img');
      img.src = src;
      const title = item?.title || `Fotografia ${idx + 1}`;
      const description = item?.description || '';
      img.alt = `Projeto de fotografia ${title}`;

      figure.appendChild(img);

      placeholder.appendChild(figure);

      const p = document.createElement('p');
      p.className = 'projetos-item-summary-text';
      p.setAttribute('data-projeto-summary','foto');
      p.setAttribute('data-item-index', String(idx));
      p.innerHTML = '';

      const h2 = document.createElement('h2');
      h2.textContent = title;
      p.appendChild(h2);

      if(description){
        const desc = document.createElement('p');
        desc.textContent = description;
        p.appendChild(desc);
      }

      // descrição particular da foto (lado esquerdo por baixo das descrições gerais)
      if(canRenderParticular) particularWrap.appendChild(p);
    });

    // Recalcular coleções depois de injetar os elements
    projetoMediaItems = Array.from(document.querySelectorAll('#projetos [data-projeto-content][data-item-index]'));
    projetoParticularSummaryItems = Array.from(document.querySelectorAll('#projetos [data-projeto-summary][data-item-index]'));

    // Garantir que o wrap particular só fica com elementos de foto
    // (os textos de video/ia já existem no HTML do lado direito)
    // (se houver, deixamos como está).


    // Garantir que index inicial existe
    if(!getProjetoItemsByCategory(projetoState.category).length){
      projetoState.category = 'foto';
      projetoState.indexByCategory.foto = 0;
    }

    // aplicar estado corrente (para marcar is-active)
    applyProjetoState();
  }catch(e){
    // silencioso: deixa layout original (se existir) ou vazio
  }
}


function navigateProjeto(direction){
  const category = projetoState.category;
  const items = getProjetoItemsByCategory(category);
  if(!items.length) return;
  const maxIndex = items.length - 1;
  let index = projetoState.indexByCategory[category] ?? 0;
  index = direction === 'prev' ? index - 1 : index + 1;
  if(index < 0) index = maxIndex;
  if(index > maxIndex) index = 0;
  projetoState.indexByCategory[category] = index;
  applyProjetoState();
}

projetoPoints.forEach(point => {
  const btn = point.querySelector('button');
  const target = point.getAttribute('data-projeto-target');
  if(!btn || !target) return;
  btn.addEventListener('click', () => {
    setProjetoCategory(target);

    // Garantir que ao clicar em qualquer botão de Projetos, a página vai para o painel central.
    scrollToPanel('projetos');
  });

});


projetoNavPrev?.addEventListener('click', () => navigateProjeto('prev'));
projetoNavNext?.addEventListener('click', () => navigateProjeto('next'));

if(projetoPoints.length){
  const defaultCategory = projetoPoints.find(p => p.classList.contains('is-active'))?.getAttribute('data-projeto-target')
    || projetoPoints[0].getAttribute('data-projeto-target')
    || 'foto';
  projetoState.category = defaultCategory;
  applyProjetoState();

  // Injetar fotos dinamicamente (pelo manifest) para não depender do número fixo.
  initFotosFromManifest();
}


