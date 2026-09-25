(() => {
  const chapters = [...document.querySelectorAll('.chapter')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelector('.filters').hidden = false;
  function filter(group) {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === group)));
    chapters.forEach(chapter => {
      chapter.hidden = group !== 'all' && chapter.dataset.group !== group;
      if (chapter.hidden) chapter.querySelectorAll('video').forEach(video => video.pause());
      chapter.classList.remove('reenter');
      if (!chapter.hidden && !reduced.matches) {
        void chapter.offsetWidth;
        chapter.classList.add('reenter');
      }
    });
  }
  filters.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter)));
  chapters.forEach(chapter => chapter.addEventListener('toggle', () => {
    if (!chapter.open) {
      chapter.querySelectorAll('video').forEach(video => video.pause());
      return;
    }
    chapters.forEach(other => { if (other !== chapter) other.open = false; });
  }));
  function openHash() {
    const targetHash = ['#milestone-3h', '#milestone-14h'].includes(location.hash) ? '#milestones' : location.hash;
    const chapter = chapters.find(item => '#' + item.id === targetHash);
    if (!chapter) return;
    filter(chapter.dataset.group);
    chapter.open = true;
    requestAnimationFrame(() => chapter.scrollIntoView({ behavior: reduced.matches ? 'auto' : 'smooth', block: 'start' }));
  }
  window.addEventListener('hashchange', openHash);
  document.querySelectorAll('video').forEach(video => {
    video.addEventListener('play', () => {
      document.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
    });
  });
  openHash();
})();
