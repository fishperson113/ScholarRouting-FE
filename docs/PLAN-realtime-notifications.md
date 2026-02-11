# KẾ HOẠCH - Thông báo Thời gian thực (Real-time Notifications)

## Bối cảnh
- **Mục tiêu**: Triển khai thông báo thời gian thực để thay thế cơ chế "hỏi thăm" (polling) mỗi 60 giây hiện tại.
- **Công nghệ**: FastAPI (Backend), Redis Pub/Sub, React (Frontend), WebSocket.
- **Hiện trạng**:
    - Backend đã có `realtime.py` (WebSocket endpoint) và `pubsub.py` (Quản lý Redis).
    - Frontend đang dùng `use-notifications.ts` với `setInterval` để polling.
    - `application_svc.py` lưu thông báo vào Firestore nhưng chưa bắn sự kiện real-time sang Redis.

## Kiến trúc
1.  **Backend Trigger**: Khi `application_svc.py` tạo một thông báo (trong hàm `handle_application_created` hoặc `handle_deadline_approaching`), nó sẽ đồng thời bắn một tin nhắn vào kênh Redis `user.{uid}.notifications`.
2.  **Redis Pub/Sub**: Service `pubsub.py` sẽ đảm nhận việc bắn tin này.
3.  **WebSocket Server**: Router `realtime.py` lắng nghe Redis và chuyển tiếp tin nhắn đến các WebSocket client đang kết nối.
4.  **Frontend Client**: `use-notifications.ts` thiết lập kết nối WebSocket tới `ws://localhost:8000/api/v1/realtime/ws/updates/user.{uid}.notifications`.
    - Khi nhận được tin nhắn, nó cập nhật state `notifications` và `unreadCount` ngay lập tức.

## Phân chia Công việc

### Giai đoạn 1: Triển khai Backend
- [ ] **Cập nhật `application_svc.py`**:
    - Import service `pubsub`.
    - Trong hàm `handle_application_created`: Gọi `pubsub.publish` ngay sau khi lưu vào Firestore.
    - Trong hàm `handle_deadline_approaching`: Gọi `pubsub.publish` ngay sau khi lưu vào Firestore.
- [ ] **Kiểm tra `realtime.py`**:
    - Đảm bảo nó xử lý đúng mẫu kênh `user.{uid}.notifications`. (Hiện tại nó nhận tham số `channel` chung nên chắc chắn sẽ hoạt động tốt).

### Giai đoạn 2: Triển khai Frontend
- [ ] **Cập nhật `use-notifications.ts`**:
    - Thêm `useEffect` để thiết lập kết nối WebSocket.
    - Xử lý sự kiện `onmessage`: Parse JSON và cập nhật state (thêm thông báo mới vào đầu danh sách, tăng số lượng chưa đọc).
    - Xử lý sự kiện `onclose` và logic kết nối lại (tự động thử lại nếu mất kết nối).
    - Xóa hoặc tăng thời gian `setInterval` polling (giữ lại làm phương án dự phòng với thời gian dài hơn, ví dụ 5 phút).

### Giai đoạn 3: Kiểm thử & Xác nhận
- [ ] **Test Luồng Real-time**:
    - Mở ứng dụng trên Trình duyệt A.
    - Kích hoạt một thông báo (ví dụ: tạo hồ sơ giả hoặc kích hoạt task deadline).
    - Xác nhận thông báo hiện lên ngay lập tức mà không cần tải lại trang.

## Phân công Agent
- **Backend**: `backend-specialist` (Sửa `application_svc.py`).
- **Frontend**: `frontend-specialist` (Sửa `use-notifications.ts`).

## Lưu ý Quan trọng (Technical Notes)
1.  **Tính Nhất quán (Consistency)**:
    - Trong Backend (`application_svc.py`), **TUYỆT ĐỐI KHÔNG hardcode** chuỗi channel string (ví dụ: `f"user.{uid}.notifications"`).
    - **HÃY SỬ DỤNG** helper function có sẵn: `RedisPubSub.channel_user_notifications(user_id)` trong `server/services/pubsub.py` để đảm bảo định dạng channel luôn đồng nhất giữa các service.

2.  **Bảo mật (Security Consideration)**:
    - Endpoint WebSocket hiện tại (`/ws/updates/{channel}`) đang public và chưa có cơ chế xác thực (Authentication). Bất kỳ ai biết user_id đều có thể lắng nghe thông báo của người khác.
    - **Giải pháp tạm thời**: Chấp nhận rủi ro ở giai đoạn MVP để tính năng chạy được.
    - **TODO (Future)**: Cần bổ sung cơ chế gửi Token qua query param hoặc Header khi connect WebSocket để validate ownership của channel.

3.  **Tận dụng Mã Nguồn Cũ (Reuse & Enhance Strategy)**:
    - **Nguyên tắc cốt lõi**: Nâng cấp (Enhance), KHÔNG đập đi xây lại (No Rewrite).
    - Tận dụng tối đa các endpoint và logic hiện có (ví dụ: `realtime.py` endpoint, cấu trúc Pub/Sub hiện tại).
    - Giữ lại các fallback mechanisms (như polling với interval dài hơn) để đảm bảo độ tin cậy của hệ thống nếu WebSocket gặp sự số.
