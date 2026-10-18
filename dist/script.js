const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.navigation');
const mobileLayout = window.matchMedia('(max-width: 960px)');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const root = document.documentElement;
root.classList.add('js');
const disclosureAnimations = new Map();

function closeMenu() {
  menuButton.setAttribute('aria-expanded', 'false');
  menuButton.textContent = 'Menú';
  navigation.classList.remove('is-open');
}
menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.textContent = isOpen ? 'Menú' : 'Cerrar';
  navigation.classList.toggle('is-open', !isOpen);
});
navigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
mobileLayout.addEventListener('change', closeMenu);
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuButton.focus();
  }
});

// Progressive enhancement: without JavaScript every program is visible and linked.
const experience = document.querySelector('.course-experience');
const tabList = experience.querySelector('.course-tabs');
const courseTabs = [...tabList.querySelectorAll('.course-tab')];
const coursePanels = courseTabs.map((tab) => document.getElementById(tab.hash.slice(1)));
tabList.setAttribute('role', 'tablist');
courseTabs.forEach((tab, index) => {
  tab.setAttribute('role', 'tab');
  tab.setAttribute('aria-controls', coursePanels[index].id);
  coursePanels[index].setAttribute('role', 'tabpanel');
  coursePanels[index].tabIndex = 0;
});
function selectCourse(index, { focus = false, animate = true } = {}) {
  courseTabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
    const panel = coursePanels[tabIndex];
    panel.hidden = !selected;
    panel.classList.remove('is-entering');
  });
  if (animate && !reducedMotion.matches && root.dataset.motion !== 'paused') {
    coursePanels[index].classList.add('is-entering');
  }
  if (focus) courseTabs[index].focus();
  scheduleParallax();
}
courseTabs.forEach((tab, index) => {
  tab.addEventListener('click', (event) => {
    event.preventDefault();
    if (tab.getAttribute('aria-selected') !== 'true') selectCourse(index);
  });
  tab.addEventListener('keydown', (event) => {
    let nextIndex;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % courseTabs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + courseTabs.length) % courseTabs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = courseTabs.length - 1;
    if (event.key === ' ') nextIndex = index;
    if (nextIndex === undefined) return;
    event.preventDefault();
    selectCourse(nextIndex, { focus: true });
  });
});
coursePanels.forEach((panel) => panel.addEventListener('animationend', (event) => {
  if (event.target === panel && event.animationName === 'panel-in') panel.classList.remove('is-entering');
}));
const requestedCourse = coursePanels.findIndex((panel) => '#' + panel.id === location.hash);
// Initialization happens after the motion scheduler has been defined below.

// The only remote photograph is the retained interior of ARTO.
document.querySelectorAll('[data-remote-photo]').forEach((photo) => {
  const frame = photo.parentElement;
  const showFallback = () => {
    photo.hidden = true;
    frame.dataset.photoState = 'unavailable';
    frame.setAttribute('role', 'img');
    frame.setAttribute('aria-label', 'ARTO Café de especialidad. Tucumán 1932, Rosario.');
  };
  const showPhoto = () => {
    photo.hidden = false;
    frame.dataset.photoState = 'loaded';
    frame.removeAttribute('role');
    frame.removeAttribute('aria-label');
  };
  photo.addEventListener('error', showFallback);
  photo.addEventListener('load', showPhoto);
  if (photo.complete) {
    if (photo.naturalWidth > 0) showPhoto();
    else showFallback();
  }
});

// Small, bounded parallax offsets; no scroll interception, pinned sections or animation library.
const motionButton = document.querySelector('.motion-toggle');
const scenes = [...document.querySelectorAll('.motion-scene')];
const parallaxLayers = [...document.querySelectorAll('.parallax-layer')];
let motionPaused = false;
let parallaxFrame = 0;

function updateParallax() {
  parallaxFrame = 0;
  if (motionPaused || reducedMotion.matches || document.hidden) return;
  const viewport = window.innerHeight;
  const mobileFactor = window.innerWidth <= 760 ? .45 : 1;
  scenes.filter((scene) => scene.classList.contains('is-in-view')).forEach((scene) => {
    const rect = scene.getBoundingClientRect();
    const progress = Math.max(-1, Math.min(1, (viewport / 2 - rect.top - rect.height / 2) / ((viewport + rect.height) / 2)));
    scene.querySelectorAll('.parallax-layer').forEach((layer) => {
      const offset = progress * Number(layer.dataset.depth || 0) * mobileFactor;
      layer.style.setProperty('--parallax-y', offset.toFixed(2) + 'px');
    });
  });
}
function scheduleParallax() {
  if (!parallaxFrame && !motionPaused && !reducedMotion.matches && !document.hidden) {
    parallaxFrame = requestAnimationFrame(updateParallax);
  }
}
function resetParallax() {
  if (parallaxFrame) cancelAnimationFrame(parallaxFrame);
  parallaxFrame = 0;
  parallaxLayers.forEach((layer) => layer.style.removeProperty('--parallax-y'));
}
motionButton.addEventListener('click', () => {
  motionPaused = !motionPaused;
  root.dataset.motion = motionPaused ? 'paused' : 'running';
  motionButton.setAttribute('aria-pressed', String(motionPaused));
  motionButton.querySelector('.motion-toggle-label').textContent = motionPaused ? 'Activar movimiento' : 'Pausar movimiento';
  if (motionPaused) {
    resetParallax();
    document.getAnimations().filter((animation) => animation.effect?.getTiming().iterations !== Infinity).forEach((animation) => animation.finish());
  } else scheduleParallax();
});
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => entry.target.classList.toggle('is-in-view', entry.isIntersecting));
    scheduleParallax();
  }, { rootMargin: '60px', threshold: 0 });
  scenes.forEach((scene) => observer.observe(scene));
} else scenes.forEach((scene) => scene.classList.add('is-in-view'));
window.addEventListener('scroll', scheduleParallax, { passive: true });
window.addEventListener('resize', scheduleParallax, { passive: true });
document.addEventListener('visibilitychange', () => {
  root.dataset.pageHidden = String(document.hidden);
  if (document.hidden) resetParallax();
  else scheduleParallax();
});
reducedMotion.addEventListener('change', () => {
  if (reducedMotion.matches) {
    resetParallax();
    disclosureAnimations.forEach(({ animation }) => animation.finish());
  } else scheduleParallax();
});
experience.classList.add('is-enhanced');
selectCourse(requestedCourse < 0 ? 0 : requestedCourse, { animate: false });
window.addEventListener('hashchange', () => {
  const index = coursePanels.findIndex((panel) => '#' + panel.id === location.hash);
  if (index >= 0) selectCourse(index, { animate: false });
});

// Native FAQ disclosures remain usable without JavaScript and with reduced motion.
document.querySelectorAll('.questions-list details').forEach((details) => {
  const summary = details.querySelector('summary');
  summary.addEventListener('click', (event) => {
    if (reducedMotion.matches || motionPaused || typeof details.animate !== 'function') return;
    event.preventDefault();
    const previous = disclosureAnimations.get(details);
    const expanded = previous ? !previous.expanded : !details.open;
    const startHeight = details.getBoundingClientRect().height;
    previous?.animation.cancel();
    details.classList.toggle('is-closing', !expanded);
    if (expanded) details.open = true;
    const styles = getComputedStyle(details);
    const borderHeight = parseFloat(styles.borderTopWidth) + parseFloat(styles.borderBottomWidth);
    const endHeight = expanded ? details.getBoundingClientRect().height : summary.getBoundingClientRect().height + borderHeight;
    details.style.overflow = 'hidden';
    const animation = details.animate(
      [{ height: startHeight + 'px' }, { height: endHeight + 'px' }],
      { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' }
    );
    disclosureAnimations.set(details, { animation, expanded });
    animation.onfinish = () => {
      if (disclosureAnimations.get(details)?.animation !== animation) return;
      details.open = expanded;
      details.style.overflow = '';
      details.classList.remove('is-closing');
      disclosureAnimations.delete(details);
    };
  });
  details.addEventListener('toggle', () => {
    details.querySelector('.question-action-label').textContent = details.open ? 'Cerrar respuesta' : 'Leer respuesta';
  });
});
