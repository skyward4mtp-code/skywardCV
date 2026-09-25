/* Shared archive frame. Move existing nodes so project interactions stay intact. */
(() => {
  const pages = {
    'project-yfest.html': ['Biển xanh.', 'VIETTEL Y-FEST 2025', 'Một biển ánh sáng. Hàng ngàn trái tim cùng hướng về Sơn Tùng M-TP.', 'pr3.jpg', 'Đã tổng kết', 'yfest'],
    'project-sinhnhat-2025.html': ['Mùa sinh nhật.', 'BIRTHDAY PROJECT · 2025', 'Sáu chặng yêu thương, cùng Sky gửi đến một ngày thật đặc biệt.', 'pr1.jpg', 'Hành trình dự án'],
    'project-gift-sh.html': ['Cùng nhau nghe.', 'STATIONHEAD · GIVEAWAY', 'Kết nối qua âm nhạc, lưu giữ niềm vui qua những món quà dành cho Sky.', 'pr2.jpg', 'Thể lệ & hành trình'],
    'project-mtpe.html': ['Chín năm. Một nhà.', 'M-TP ENTERTAINMENT · ANNIVERSARY', 'Những món quà và lời chúc từ Sky, gửi đến đại gia đình M-TP Entertainment.', 'pr4.jpg', 'Hành trình dự án'],
    'project-sky13.html': ['Mười ba năm Sky.', 'SKY COMMUNITY · ANNIVERSARY', 'Một dấu mốc của sự đồng hành. Một lời cảm ơn dành cho đại gia đình Sky.', 'pr5.jpg', 'Hồ sơ hoạt động'],
    'project-streaming-2025.html': ['Âm nhạc kết nối.', 'STREAMING · DIGITAL SUPPORT', 'Cùng đồng hành với âm nhạc của Sơn Tùng M-TP trên các nền tảng số.', 'pr6.jpg', 'Hồ sơ đang cập nhật'],
    'project-le.html': ['Điều nhỏ. Yêu thương lớn.', 'SKYWARD · MINI PROJECTS', 'Những món quà, bó hoa và khoảnh khắc được góp nhặt trên hành trình đồng hành.', 'pr_le.jpg', 'Bộ sưu tập hoạt động'],
    'project-donate.html': ['Cùng Sky góp sức.', 'PROJECT TEMPLATE', 'Trang mẫu cho hoạt động support. Thông tin và tài khoản bên dưới chưa phải thông báo chính thức.', 'pr6.jpg', 'Bản mẫu · Chưa công bố']
  };
  const file = location.pathname.split('/').pop();
  const config = pages[file];
  if (!config) return;
  const [title, label, description, cover, status, report] = config;
  document.body.classList.add('project-frame');
  const header = document.createElement('header');
  header.className = 'pf-header';
  header.innerHTML = '<nav class="pf-wrap" aria-label="Điều hướng dự án"><a href="index.html#projects">← SKYWARD</a><a href="sao-ke.html">TỔNG KẾT & SAO KÊ ↗</a></nav>';
  document.body.prepend(header);
  const hero = document.createElement('section');
  hero.className = 'pf-hero pf-wrap';
  hero.innerHTML = `<div><p class="pf-kicker">${label}</p><span class="pf-status">${status}</span><h1>${title}</h1><p class="pf-sub">${description}</p><a class="pf-button" href="#pf-contents">Khám phá hành trình ↓</a>${report ? `<a class="pf-button" href="sao-ke.html#${report}">Xem tổng kết ↗</a>` : ''}</div><figure class="pf-photo"><img src="images/thumbnail/${cover}" alt="${label}"><figcaption>FROM SKYWARD, WITH LOVE</figcaption></figure>`;
  header.after(hero);
  const sections = [...document.querySelectorAll('section')].filter(s => s !== hero && !s.parentElement.closest('section') && !s.closest('[role="dialog"], #popup, #resultsPopup, #statementPopup'));
  const archive = document.createElement('div');
  archive.className = 'pf-wrap pf-archive';
  archive.id = 'pf-contents';
  archive.innerHTML = '<div class="pf-heading"><p class="pf-kicker">THE PROJECT ARCHIVE</p><h2>Từng chặng đồng hành.</h2><p>Chọn một mục để xem câu chuyện và thông tin chi tiết.</p></div><div class="pf-chapters"></div>';
  hero.after(archive);
  const grid = archive.querySelector('.pf-chapters');
  sections.forEach((section, i) => {
    // Mini-project filters and cards keep their original shared parent.
    if (file === 'project-le.html') return;
    const heading = section.querySelector('h2,h1,h3');
    const text = heading ? heading.textContent.trim() : 'Thông tin & tiến độ';
    const firstParagraph = section.querySelector('p');
    const details = document.createElement('details');
    details.className = 'pf-chapter';
    const summary = document.createElement('summary');
    const number = document.createElement('span');
    number.className = 'pf-number'; number.textContent = String(i + 1).padStart(2, '0');
    const copy = document.createElement('span'); copy.className = 'pf-copy';
    const name = document.createElement('span'); name.className = 'pf-title'; name.textContent = text;
    const excerpt = document.createElement('span'); excerpt.className = 'pf-excerpt';
    excerpt.textContent = firstParagraph ? firstParagraph.textContent.trim() : 'Thông tin chi tiết của hoạt động.';
    const read = document.createElement('span'); read.className = 'pf-read'; read.textContent = 'Xem chi tiết ↗';
    copy.append(name, excerpt, read); summary.append(number, copy);
    details.append(summary); grid.append(details);
    section.classList.add('pf-content'); details.append(section);
    details.addEventListener('toggle', () => {
      if (details.open) grid.querySelectorAll(':scope > details[open]').forEach(other => { if (other !== details) other.open = false; });
      read.textContent = details.open ? 'Thu gọn ↑' : 'Xem chi tiết ↗';
    });
  });
  if (file === 'project-le.html') {
    archive.remove(); hero.querySelector('[href="#pf-contents"]').href = '#list';
    document.querySelector('main > .hero')?.classList.add('pf-old-hero');
  }
  document.querySelectorAll('.stage-card, #gifts .card').forEach((card, index) => {
    const folder = file === 'project-yfest.html' ? 'yfest' : file === 'project-sinhnhat-2025.html' ? 'pr1' : file === 'project-mtpe.html' ? 'mtpe' : null;
    if (!folder) return;
    const img = document.createElement('img'); img.className = 'pf-stage-image'; img.loading = 'lazy';
    img.src = `images/${folder}/${folder === 'mtpe' ? '' : 'stage'}${index + 1}.jpg`;
    img.alt = card.querySelector('h3,.stage-title')?.textContent.trim() || `Chặng ${index + 1}`;
    card.prepend(img);
  });
  const revealHash = () => {
    let target; try { target = document.getElementById(decodeURIComponent(location.hash.slice(1))); } catch { return; }
    const parent = target?.closest('.pf-chapter');
    if (parent) { parent.open = true; requestAnimationFrame(() => target.scrollIntoView({block:'start'})); }
  };
  window.addEventListener('hashchange', revealHash); revealHash();
})();
