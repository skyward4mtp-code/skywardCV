const money = value => new Intl.NumberFormat('vi-VN').format(value) + ' ₫';
const el = id => document.getElementById(id);
let busy = false, lastUpdated;
const TARGET = 40000000;
const stages = [[10,'Dựng sàn'],[25,'Dựng vách ngăn'],[40,'Dựng cột 1'],[55,'Dựng cột 2'],[70,'Lắp mái'],[85,'Lắp quầy check-in'],[100,'Hoàn thiện booth']];
function renderBuild(total) {
  const percent = total / TARGET * 100;
  el('percent').textContent = percent.toLocaleString('vi-VN',{maximumFractionDigits:1});
  el('fill').style.width = Math.min(100,percent) + '%';
  el('progress').setAttribute('aria-valuenow',Math.min(100,percent).toFixed(1));
  const next = stages.find(([threshold]) => percent < threshold);
  const completed = stages.filter(([threshold]) => percent >= threshold);
  el('build-state').textContent = completed.length ? '✓ Đã ' + completed.at(-1)[1].toLowerCase() : 'Chờ mở khóa phần sàn';
  el('next-title').textContent = next ? next[1] + ' · ' + next[0] + '%' : 'Booth đã hoàn thiện!';
  el('next-detail').textContent = next ? 'Còn ' + money(TARGET * next[0] / 100 - total) + ' để mở khóa mốc này.' : 'Đã đạt mục tiêu 40 triệu. Cảm ơn mọi đóng góp của Sky!';
  document.querySelectorAll('[data-part]').forEach(part => part.classList.toggle('built',percent >= Number(part.dataset.part)));
  el('milestones').replaceChildren();
  stages.forEach(([threshold,title],index) => {
    const done = percent >= threshold;
    const card = document.createElement('article'); card.className = 'milestone' + (done ? ' done' : next?.[0] === threshold ? ' current' : '');
    for (const [tag,cls,text] of [['span','step','0'+(index+1)],['b','',threshold+'%'],['h3','',title],['p','',money(TARGET*threshold/100)],['span','state',done?'✓ Đã mở khóa':next?.[0]===threshold?'↗ Đang gây quỹ':'○ Chưa mở khóa']]) {
      const node = document.createElement(tag); node.className=cls; node.textContent=text; card.append(node);
    }
    el('milestones').append(card);
  });
}
async function refresh() {
  if (busy) return;
  busy = true; el('refresh').disabled = true;
  try {
    const response = await fetch('/api/donate-progress', { signal: AbortSignal.timeout(90000), cache: 'no-store' });
    if (!response.ok) throw new Error('Không kết nối được Cake');
    const data = await response.json();
    renderBuild(data.total);
    el('total').textContent = money(data.total);
    el('count').textContent = data.count.toLocaleString('vi-VN');
    const today = new Intl.DateTimeFormat('en-CA', {timeZone:'Asia/Ho_Chi_Minh',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
    el('today').textContent = money(data.daily.find(d => d.date === today)?.amount || 0);
    el('rows').replaceChildren();
    for (const tx of data.transactions) {
      const row = document.createElement('tr');
      const date = new Date(tx.time);
      const values = [
        [date.toLocaleTimeString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',hour:'2-digit',minute:'2-digit'}), date.toLocaleDateString('vi-VN',{timeZone:'Asia/Ho_Chi_Minh'})],
        [tx.sender, 'TĂNG · TỪ'],
        ['+' + money(tx.amount), ''],
        [tx.message || 'Không có lời nhắn', 'Nhận tiền']
      ];
      values.forEach(([primary,secondary],index) => {
        const cell=document.createElement('td');
        const text=document.createElement('div'); text.textContent=primary; cell.append(text);
        if(index===2) cell.className='incoming';
        if(secondary) { const detail=document.createElement('span'); detail.className=index===1?'incoming-badge':'tx-secondary'; detail.textContent=secondary; cell.append(detail); }
        row.append(cell);
      });
      el('rows').append(row);
    }
    if (!data.transactions.length) { const row=document.createElement('tr'); const cell=document.createElement('td'); cell.colSpan=4; cell.textContent='Chưa có đóng góp từ ngày 07/09/2026.'; row.append(cell); el('rows').append(row); }
    lastUpdated = new Date(data.updatedAt).toLocaleString('vi-VN', { timeZone:'Asia/Ho_Chi_Minh' });
    el('status').className = ''; el('status').textContent = 'Đã cập nhật ' + lastUpdated;
  } catch (error) {
    el('status').className = 'error';
    el('status').textContent = lastUpdated ? 'Chưa cập nhật được · Đang hiển thị dữ liệu lúc ' + lastUpdated : 'Chưa tải được sao kê Cake. Bấm Cập nhật để thử lại.';

  } finally { busy = false; el('refresh').disabled = false; }
}
el('refresh').addEventListener('click', refresh);
refresh(); setInterval(() => { if (!document.hidden) refresh(); }, 60000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) refresh(); });
