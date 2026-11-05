(() => {
  const form = document.querySelector('.search-form');
  if (!form) return;
  const input = form.querySelector('input');
  const status = form.querySelector('[role=status]');
  const empty = document.querySelector('.empty-state');
  const categories = [...document.querySelectorAll('[data-categoria]')];
  const groups = [...document.querySelectorAll('[data-grupo]')];
  const normalize = value => value.normalize('NFD').replace(/\p{M}/gu, '').toLocaleLowerCase('es-AR').trim();
  const products = [...document.querySelectorAll('[data-producto]')].map(element => ({ element, text: normalize(element.textContent) }));
  const navigation = document.querySelector('.category-nav');
  const navigationLinks = [...navigation.querySelectorAll('a')];
  const readingState = navigation.querySelector('.reading-state');
  const progress = navigation.querySelector('.reading-progress');
  const currentSection = navigation.querySelector('[data-current-section]');
  const percent = navigation.querySelector('[data-reading-percent]');
  const mobile = matchMedia('(max-width: 760px)');
  const scrollPadding = Number.parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
  let readingFrame = 0;

  function updateReading() {
    readingFrame = 0;
    const navigationHeight = Math.ceil(navigation.getBoundingClientRect().height);
    const readingLine = (mobile.matches ? navigationHeight + 16 : 24) + scrollPadding + 2;
    const visibleGroups = groups.filter(group => !group.hidden).map(group => ({ element: group, bounds: group.getBoundingClientRect() }));
    document.documentElement.style.setProperty('--menu-navigation-height', `${navigationHeight}px`);
    if (!visibleGroups.length) {
      navigationLinks.forEach(link => link.removeAttribute('aria-current'));
      currentSection.textContent = 'Sin resultados';
      progress.value = 0;
      percent.textContent = '0%';
      return;
    }
    const active = visibleGroups.findLast(group => group.bounds.top <= readingLine + 1) || visibleGroups[0];
    const visibleCategories = [...active.element.querySelectorAll('[data-categoria]')].filter(category => !category.hidden);
    const category = visibleCategories.findLast(section => section.getBoundingClientRect().top <= readingLine + 1) || visibleCategories[0];
    const label = `${active.element.querySelector('h2').textContent} · ${category.querySelector('h3').textContent}`;
    const first = visibleGroups[0].bounds.top;
    const last = visibleGroups[visibleGroups.length - 1].bounds.bottom;
    const range = Math.max(0, last - first - (innerHeight - readingLine));
    const value = range ? Math.round(Math.max(0, Math.min(1, (readingLine - first) / range)) * 100) : 100;
    navigationLinks.forEach(link => {
      if (link.hash === `#${active.element.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (currentSection.textContent !== label) currentSection.textContent = label;
    progress.value = value;
    percent.textContent = `${value}%`;
  }

  function scheduleReading() {
    if (!readingFrame) readingFrame = requestAnimationFrame(updateReading);
  }

  function filter(updateUrl = true) {
    const query = normalize(input.value);
    const words = query.split(/\s+/u).filter(Boolean);
    let visible = 0;
    for (const product of products) {
      product.element.hidden = !words.every(word => product.text.includes(word));
      if (!product.element.hidden) visible += 1;
    }
    for (const category of categories) category.hidden = ![...category.querySelectorAll('[data-producto]')].some(element => !element.hidden);
    for (const group of groups) {
      group.hidden = ![...group.querySelectorAll('[data-categoria]')].some(element => !element.hidden);
      document.querySelector(`.category-nav a[href="#${group.id}"]`).hidden = group.hidden;
    }
    status.textContent = `${visible} ${visible === 1 ? 'producto' : 'productos'}${query ? ' encontrados' : ''}`;
    empty.hidden = visible > 0;
    scheduleReading();
    if (updateUrl) {
      const url = new URL(location.href);
      if (query) url.searchParams.set('buscar', input.value.trim());
      else url.searchParams.delete('buscar');
      history.replaceState(null, '', url);
    }
  }

  input.value = new URLSearchParams(location.search).get('buscar') || '';
  input.addEventListener('input', () => filter());
  form.addEventListener('submit', event => { event.preventDefault(); filter(); });
  form.addEventListener('reset', event => { event.preventDefault(); input.value = ''; filter(); input.focus(); });
  addEventListener('popstate', () => { input.value = new URLSearchParams(location.search).get('buscar') || ''; filter(false); });
  addEventListener('scroll', scheduleReading, { passive: true });
  addEventListener('resize', scheduleReading);
  addEventListener('hashchange', scheduleReading);
  const layoutObserver = new ResizeObserver(scheduleReading);
  layoutObserver.observe(navigation);
  layoutObserver.observe(document.querySelector('.menu-sections'));
  document.fonts.ready.then(scheduleReading);
  readingState.hidden = false;
  form.hidden = false;
  filter(false);
})();