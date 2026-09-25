# Skyward Fund (Level2) – Cách chạy

## Trang tracking donate mới

Mở `/donate-tracker.html` sau khi chạy `npm start`. Trang đọc `/api/donate-progress`, cộng giao dịch “Nhận tiền” từ 00:00 ngày 07/09/2026 (UTC+7), loại giao dịch được Cake đánh dấu hoàn tiền. Nguồn là Cake `encoded_id=318535339`; không dùng số dư tổng làm tổng donate. Máy chủ đọc phân trang đến trước ngày bắt đầu và cache kết quả 60 giây. Giao diện cập nhật mỗi phút khi đang mở; lỗi kết nối giữ số liệu cũ và báo thời điểm cập nhật cuối.

Kiểm tra tính toán: `node scripts/test-donate-tracker.cjs`.
Bản Worker độc lập: `node scripts/build-donate-site.cjs` xuất vào `tracker-site/dist/server/index.js`. Bản này chỉ chứa trang tracker, không bao gồm các trang dự án cũ.

## 1) Cài dependencies (bắt buộc)
Mở Terminal/PowerShell tại thư mục dự án (nơi có `package.json`), rồi chạy:

```bash
npm install
```

## 2) Chạy web
```bash
npm start
```

Mặc định chạy ở: http://localhost:3000

> Lý do phải chạy bằng server: các trang dùng `fetch()` để include partials (`partials/topbar.html`, `partials/footer.html`), nên mở file HTML trực tiếp bằng `file://` sẽ dễ lỗi CORS/không load được partials.

## Nếu chỉ muốn chạy nhanh mà không dùng Node
Bạn có thể dùng một server tĩnh bất kỳ:
- Python:
  ```bash
  cd public
  python -m http.server 3000
  ```
- Hoặc:
  ```bash
  npx serve public -l 3000
  ```
