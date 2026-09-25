// ===== MỐC THỜI GIAN VÀ NGUỒN SAO KÊ =====
// Cake sử dụng giờ Việt Nam (UTC+7).
const START = Date.parse("2026-09-07T00:00:00+07:00");
const SOURCE = "https://statement.cake.vn/view?encoded_id=318535339";
// Chuyển ngày Cake DD/MM/YYYY, HH:mm sang timestamp.
function transactionTime(value) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2})$/.exec(value);
  if (!m) throw new Error("Định dạng ngày giao dịch Cake đã thay đổi.");
  const iso = `${m[3]}-${m[2]}-${m[1]}T${m[4]}:${m[5]}:00+07:00`;
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) throw new Error("Ngày giao dịch không hợp lệ.");
  return time;
}
// Đọc các trang từ mới đến cũ, chỉ cộng khoản nhận hợp lệ.
async function collectDonations(getPage, now = Date.now()) {
  let cursor = "",
    completed = false;
  const cursors = new Set(),
    transactions = [];
  for (let page = 0; page < 300; page++) {
    const response = await getPage(cursor);
    if (response.code !== 1 || !Array.isArray(response.data?.transactions))
      throw new Error("Cake chưa trả về sao kê hợp lệ.");
    const data = response.data;
    let reachedStart = false;
    for (const tx of data.transactions) {
      const time = transactionTime(tx.time);
      if (time < START) {
        reachedStart = true;
        continue;
      }
      if (time > now || tx.title !== "Nhận tiền" || tx.is_refund === true) continue;
      if (!Number.isSafeInteger(tx.amount) || tx.amount <= 0)
        throw new Error("Số tiền giao dịch không hợp lệ.");
      transactions.push({
        amount: tx.amount,
        time: new Date(time).toISOString(),
        date: tx.time.slice(0, 10),
        sender:
          typeof tx.description === "string"
            ? tx.description.replace(/^Từ\s+/i, "")
            : "Không có tên người gửi",
        message: typeof tx.detail === "string" ? tx.detail : "",
      });
    }
    if (reachedStart || !data.next_page) {
      completed = true;
      break;
    }
    if (cursors.has(data.next_page)) throw new Error("Cake trả về trang giao dịch lặp.");
    cursors.add(data.next_page);
    cursor = data.next_page;
  }
  if (!completed) throw new Error("Chưa đọc đủ sao kê từ ngày bắt đầu.");
  // Gom theo ngày để tính tổng nhận hôm nay và tổng lũy kế.
  const days = {};
  for (const tx of transactions) {
    const key = tx.date.split("/").reverse().join("-");
    days[key] ||= { date: key, amount: 0, count: 0 };
    days[key].amount += tx.amount;
    days[key].count++;
  }
  let cumulative = 0;
  const daily = Object.values(days)
    .sort((a, b) => a.date.localeCompare(b.date))
    .map((d) => ({ ...d, cumulative: (cumulative += d.amount) }));
  transactions.sort((a, b) => b.time.localeCompare(a.time));
  return {
    total: cumulative,
    count: transactions.length,
    daily,
    transactions,
    startDate: "2026-09-07",
    source: SOURCE,
    updatedAt: new Date(now).toISOString(),
  };
}
// Cache 60 giây; các request đồng thời dùng chung một lần đọc Cake.
function createTracker(getPage) {
  let cache, pending;
  return async () => {
    if (cache && Date.now() - Date.parse(cache.updatedAt) < 60000) return cache;
    if (!pending)
      pending = collectDonations(getPage)
        .then((result) => (cache = result))
        .finally(() => {
          pending = null;
        });
    return pending;
  };
}
module.exports = { collectDonations, createTracker, transactionTime };
