// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const { createTracker } = require('./donate-tracker.cjs');
const getDonations = createTracker(async (cursor) => {
  const response = await axios.get('https://gw.cake.vn/public/user-group-account/statement', {
    params: { encoded_id: '318535339', next_page: cursor }, timeout: 15000
  });
  return response.data;
});
app.get('/api/donate-progress', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  try { res.json(await getDonations()); }
  catch (error) { res.status(502).json({ error: 'Chưa thể cập nhật sao kê Cake. Vui lòng thử lại sau.' }); }
});

/**
 * 👉 THAY CHO ĐÚNG encoded_id CỦA BẠN
 * Ví dụ từ Network bạn thấy:
 * https://gw.cake.vn/public/user-group-account/statement?encoded_id=3185535398&next_page=
 */
const CAKE_API_URL =
  "https://gw.cake.vn/public/user-group-account/statement?encoded_id=3185535398&next_page=";

app.use(cors());
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));

function adminToken() {
  const code = process.env.ADMIN_CODE;
  if (!code) return null;
  return crypto.createHash('sha256').update(`skyward-admin:${code}`).digest('hex');
}
function cookies(req) {
  return Object.fromEntries(String(req.headers.cookie || '').split(';').map(v => v.trim().split('=').map(decodeURIComponent)).filter(v => v.length === 2));
}
function adminAuthorized(req) {
  const expected = adminToken(), received = cookies(req).skyward_admin;
  if (!expected || !received || received.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}
app.get('/admin.html', (req, res, next) => adminAuthorized(req) ? next() : res.redirect('/admin-login.html'));
app.post('/api/admin/login', (req, res) => {
  const expected = process.env.ADMIN_CODE;
  if (!expected) return res.status(503).send('ADMIN_CODE chưa được cấu hình trên máy chủ.');
  const supplied = String(req.body.code || '');
  const valid = supplied.length === expected.length && crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(expected));
  if (!valid) return res.redirect('/admin-login.html?error=1');
  res.setHeader('Set-Cookie', `skyward_admin=${adminToken()}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`);
  return res.redirect('/admin.html');
});
app.post('/api/admin/logout', (req, res) => { res.setHeader('Set-Cookie','skyward_admin=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0'); res.redirect('/admin-login.html'); });
app.use(express.static(path.join(__dirname, "public")));

/**
 * Dò tất cả số trong JSON, trả về số lớn nhất
 * (thường sẽ là số dư hiện tại, vì nó lớn hơn từng giao dịch lẻ)
 */
function findMaxNumberInObject(obj) {
  let max = null;

  function walk(val) {
    if (typeof val === "number" && Number.isFinite(val)) {
      if (max === null || val > max) max = val;
    } else if (Array.isArray(val)) {
      val.forEach(walk);
    } else if (val && typeof val === "object") {
      Object.values(val).forEach(walk);
    }
  }

  walk(obj);
  return max;
}

// API trả số dư cho frontend
// API trả số dư cho frontend
app.get("/api/fund-balance", async (req, res) => {
  try {
    console.log("Gọi đến /api/fund-balance, đang fetch API JSON của Cake...");

    const response = await axios.get(CAKE_API_URL, {
      timeout: 15000
    });

    const data = response.data;

    // ==== LẤY ĐÚNG FIELD BALANCE THEO JSON CỦA CAKE ====
    let balance = null;

    // 1) Ưu tiên data.balance (root)
    if (data && data.balance != null) {
      const n = Number(data.balance);
      if (!Number.isNaN(n)) {
        balance = n;
      }
    }

    // 2) Nếu chưa có, thử data.group_info.balance
    if (
      balance === null &&
      data &&
      data.group_info &&
      data.group_info.balance != null
    ) {
      const n = Number(data.group_info.balance);
      if (!Number.isNaN(n)) {
        balance = n;
      }
    }

    // 3) Nếu vẫn không có, fallback: đoán max number trong JSON
    if (balance === null) {
      const guessed = findMaxNumberInObject(data);
      console.log(
        "Không thấy field balance rõ ràng, đoán theo max number:",
        guessed
      );
      balance = guessed;
    }

    if (typeof balance !== "number" || !Number.isFinite(balance)) {
      console.error(
        "Không tìm được số dư hợp lệ trong JSON:",
        JSON.stringify(data, null, 2)
      );
      return res.status(500).json({
        error:
          "Không tìm được số dư trong JSON Cake. Cần chỉnh lại field đọc balance."
      });
    }

    console.log("Lấy được số dư từ API JSON:", balance);

    return res.json({
      balance,
      currency: "VND",
      raw: balance.toLocaleString("vi-VN") + " đ",
      lastUpdated: new Date().toISOString()
    });
  } catch (err) {
    console.error("Lỗi khi gọi API JSON Cake:", err.message);
    return res.status(500).json({
      error: "Không lấy được dữ liệu từ Cake",
      detail: err.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
