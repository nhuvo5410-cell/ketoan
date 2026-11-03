
# KẾ TOÁN PRO CAREER – phiên bản 50 người chơi

## Tính năng
- Phòng chơi online tối đa 50 người.
- Tạo phòng bằng mã 4 ký tự, người chơi tham gia bằng mã.
- Hành trình nghề nghiệp gồm 6 cấp:
  1. Thực tập sinh
  2. Nhân viên kế toán
  3. Kế toán viên chính
  4. Kế toán tổng hợp
  5. Kế toán trưởng
  6. Giám đốc tài chính
- 8 nhiệm vụ trong mỗi lượt chơi, câu hỏi thuộc nhiều bộ phận kế toán.
- Trả lời đúng được 100 điểm và 100 XP; có bảng xếp hạng theo điểm.
- Giao diện pastel dễ thương, tương thích điện thoại và máy tính.

## Chạy thử trên máy
1. Cài Node.js LTS: https://nodejs.org/
2. Giải nén file ZIP.
3. Mở Terminal/Command Prompt trong thư mục game.
4. Chạy `npm install`
5. Chạy `npm start`
6. Mở `http://localhost:3000`

## Đưa game lên Internet
Để người chơi ở nhiều nơi cùng truy cập, cần deploy ứng dụng Node.js này lên máy chủ có hỗ trợ WebSocket/Socket.IO (ví dụ Render, Railway hoặc VPS). Dùng lệnh khởi động `npm start`. Sau khi deploy, gửi URL website cho người chơi.

## Lưu ý kỹ thuật
- Bản này là mã nguồn chạy được, chưa tự động xuất bản thành website công khai.
- Dữ liệu phòng và điểm được lưu trong RAM; khi máy chủ khởi động lại, phòng đang chơi sẽ mất.
- Giới hạn 50 người là giới hạn ứng dụng cho mỗi phòng. Khả năng chịu tải thực tế còn tùy cấu hình máy chủ và kết nối.
- Câu hỏi là nội dung mô phỏng học tập; cần đối chiếu quy định kế toán/thuế hiện hành khi áp dụng vào công việc thật.
