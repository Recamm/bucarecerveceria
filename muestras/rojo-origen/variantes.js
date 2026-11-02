(() => {
  const variants = { origen: 'Rojo y roble', barra: 'Barra nocturna', cartel: 'Cartel de barrio', pizarra: 'Tiza y birra', sobremesa: 'Sobremesa' };
  const parameter = new URLSearchParams(location.search).get('variante');
  const selected = Object.hasOwn(variants, parameter) ? parameter : 'origen';
  document.documentElement.dataset.variante = selected;
  document.title = `Bucaré · ${variants[selected]}`;
  document.addEventListener('DOMContentLoaded', () => {
    const active = document.querySelector(`.variant-nav [data-variante="${selected}"]`);
    if (active) active.setAttribute('aria-current', 'page');
  });
})();