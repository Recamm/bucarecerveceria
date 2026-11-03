(() => {
  const button = document.querySelector('[data-print]');
  if (!button) return;
  button.hidden = false;
  button.addEventListener('click', async () => {
    await document.fonts.ready;
    window.print();
  });
})();