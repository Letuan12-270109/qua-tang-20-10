HƯỚNG DẪN — WEBSITE 20/10 ĐÃ GHÉP TELEGRAM VISIT NOTIFIER

ĐÃ GHÉP
- Giữ nguyên source website, hình ảnh, CSS, hiệu ứng và nhạc nền.
- Thêm visit-notify.js và script gọi file này vào index.html.
- Thêm worker.js để triển khai phần gửi Telegram.
- Chat ID được cấu hình trong hướng dẫn: 8272244464.

BẮT BUỘC BẢO MẬT
Token đã gửi trong chat trước đó có thể bị lộ. Vào @BotFather, dùng /revoke
để thu hồi token cũ và tạo token mới. Không sử dụng lại token cũ.
Không đưa token vào JS/HTML/CSS hoặc repository GitHub công khai.

CẦN LÀM MỘT LẦN ĐỂ KÍCH HOẠT
1. Tạo Cloudflare Worker và dán nội dung worker.js rồi Deploy.
2. Trong Worker Settings > Variables and Secrets, thêm:
   TELEGRAM_BOT_TOKEN = token MỚI, lưu dạng Secret
   TELEGRAM_CHAT_ID = 8272244464
   ALLOWED_ORIGIN = https://letuan12-270109.github.io
3. Sao chép URL Worker sau khi Deploy.
4. Mở visit-notify.js và thay WORKER_ENDPOINT bằng URL Worker + /visit.
5. Đưa TOÀN BỘ file/thư mục trong ZIP lên thư mục nguồn GitHub Pages đang dùng.
6. Mở bot Telegram và bấm Start nếu chưa bắt đầu trò chuyện với bot.
7. Cấu hình Cloudflare rate limiting cho endpoint /visit.

THÔNG BÁO SẼ GỒM
- IP kết nối được Cloudflare ghi nhận (có thể là IP VPN/proxy/gateway)
- Loại thiết bị ước lượng, trình duyệt, User-Agent
- Trang truy cập, thời gian, ngôn ngữ và tên miền giới thiệu nếu có

Giới hạn: website không thể đọc tên riêng chính xác của điện thoại/máy tính qua
trình duyệt thông thường. Chỉ xác định gần đúng loại thiết bị/hệ điều hành.

Riêng tư: thông báo việc ghi nhận lượt truy cập trong chính sách riêng tư nếu cần.
Worker chưa được triển khai và cấu hình thì thông báo Telegram chưa hoạt động.
