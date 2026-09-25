(() => {
  const buttons = document.querySelectorAll('.project-filters button');
  const cards = [...document.querySelectorAll('.projects [data-project-year]')];
  const count = document.getElementById('projectCount');
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(other => other.setAttribute('aria-pressed', String(other === button)));
    let visible = 0;
    cards.forEach(card => {
      card.hidden = button.dataset.year !== 'all' && card.dataset.projectYear !== button.dataset.year;
      if (!card.hidden) { visible++; card.classList.add('filtered-in'); }
    });
    count.textContent = `${visible} dự án`;
  }));
})();
