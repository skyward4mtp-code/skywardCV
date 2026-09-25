// Skyward UI enhancements: smooth reveal + helpers
(function () {
  function initReveal() {
    const items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    // Avoid double-init
    if (window.__skyward_reveal_inited) return;
    window.__skyward_reveal_inited = true;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '80px 0px -80px 0px' }
    );

    items.forEach((el) => io.observe(el));
  }

  // init on normal pages
  document.addEventListener('DOMContentLoaded', initReveal);
  // init after partials injected
  document.addEventListener('partials:loaded', () => {
    window.__skyward_reveal_inited = false;
    initReveal();
  });
})();
