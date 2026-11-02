(() => {
  const variants = { esencial: 'Esencial', indice: 'Índice', sutil: 'Pizarra sutil', local: 'El local' };
  const parameter = new URLSearchParams(location.search).get('variante');
  const selected = Object.hasOwn(variants, parameter) ? parameter : 'esencial';
  document.documentElement.dataset.variante = selected;
  document.title = `Bucaré · ${variants[selected]}`;
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelector(`.variant-nav [data-variante="${selected}"]`).setAttribute('aria-current', 'page');
    if (selected !== 'local') document.querySelector('.hero-photo').remove();
  });
})();