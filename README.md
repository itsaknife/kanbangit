Markdown · tong-quan-do-an.md

## Tên đề tài

**Xây dựng hệ thống quản lý công việc nhóm phát triển phần mềm tích hợp GitHub và AI hỗ trợ**

## Vấn đề

Team dev nhỏ thường quản lý task qua GitHub Issues, nhưng giao diện không trực quan, không có bảng theo dõi tiến độ (Kanban), không có thống kê ai đang làm gì. Nếu dùng thêm Trello/Jira thì phải cập nhật 2 nơi, dễ sai lệch.

## Chức năng chính

Ứng dụng web gồm các chức năng sau:

1. **Đăng nhập và kết nối GitHub:** đăng nhập bằng tài khoản GitHub, chọn repository cần theo dõi.
2. **Quản lý Issue:** xem danh sách, xem chi tiết, tạo mới, chỉnh sửa. Issue tạo hoặc sửa trên app sẽ cập nhật sang GitHub, và ngược lại.
3. **Kanban Board:** kéo-thả thẻ để đổi trạng thái (Cần làm / Đang làm / Xong), lọc theo nhãn, tìm kiếm. Dùng bộ nhãn chuẩn `bug`, `enhancement`, `task`; repo nào chưa có thì app tự tạo.
4. **Đồng bộ với GitHub (2 chiều):** lần đầu kết nối thì lấy toàn bộ issue có sẵn; sau đó issue mới hoặc thay đổi bên GitHub tự cập nhật lên bảng (qua webhook), và thao tác trên app tự cập nhật ngược lại GitHub. Giao diện của mọi người đang mở app cập nhật ngay không cần refresh (Socket.io).
5. **Dashboard:** hiển thị tổng quan, tiến độ theo từng thành viên, và theo thời gian (ví dụ theo tuần) để biết trong tuần nhóm làm được bao nhiêu việc, hiện ai đang làm việc gì.
6. **AI tóm tắt tiến độ** và 7. **AI phát hiện issue trùng** (xem mục dưới).

## Module AI

Dùng **API LLM miễn phí** (Gemini API gói miễn phí, lấy khóa trên Google AI Studio).

**1. AI tóm tắt tiến độ**

Hệ thống lấy dữ liệu từ database (issue đã đóng, issue đang làm, ai phụ trách) → gửi cho LLM → LLM viết thành một đoạn báo cáo ngắn. Ví dụ đầu ra: *"Tuần 12, nhóm đã hoàn thành 3 issue là chức năng đăng nhập, tìm kiếm và giao diện. Hiện có 2 issue đang được thực hiện, trong đó A phụ trách Payment API và B phụ trách Notification."*

**2. AI phát hiện issue trùng**

Làm theo 2 bước kết hợp:

1. **Lọc nhanh bằng embedding:** khi có issue mới, hệ thống gửi nội dung (tiêu đề + mô tả) cho dịch vụ embedding để đổi thành dãy số đại diện cho ý nghĩa. Database (pgvector) so sánh dãy số này với các issue cũ và chọn ra khoảng 3 issue gần giống nhất. Bước này không dùng LLM.
2. **LLM đọc và nhận định:** hệ thống gửi nội dung chữ (không phải dãy số) của issue mới và 3 issue ứng viên cho LLM, hỏi có trùng không và vì sao. Nếu LLM kết luận trùng thì app cảnh báo "có thể trùng với issue #23" kèm lý do.

Bước 1 giúp mỗi lần chỉ gửi vài issue cho LLM, tiết kiệm lượt gọi của gói miễn phí. Bước 2 giúp AI thật sự đọc hiểu mô tả và giải thích được lý do. Dãy số chỉ để database tìm ứng viên, LLM không đọc dãy số.

**Lưu ý khi dùng API miễn phí**

- Gói miễn phí có giới hạn số lần gọi mỗi phút/ngày, nên chỉ gọi AI khi cần: tạo báo cáo khi bấm nút hoặc cuối tuần, kiểm tra trùng khi có issue mới. Giới hạn cụ thể xem trong Google AI Studio, vì thay đổi theo thời gian.
- Theo trang giá của Google, nội dung gửi qua gói miễn phí có thể được dùng để cải thiện sản phẩm của họ. Vì vậy chỉ nên dùng repo demo hoặc repo công khai, không gửi issue của repo riêng tư (ví dụ dự án ở công ty).
- Embedding dùng cho bước lọc trong tính năng phát hiện issue trùng (biến nội dung issue thành dãy số để database so sánh). Chưa xác nhận được gói miễn phí hiện tại của Gemini cho phần này, cần kiểm tra lại khi bắt đầu làm. Phương án dự phòng miễn phí hoàn toàn là chạy một model embedding nhỏ ngay trên server NestJS (ví dụ qua thư viện Transformers.js).

## Công nghệ dự kiến

Toàn bộ dùng TypeScript.

**Giao diện (web)**

- Next.js + Tailwind CSS
- dnd-kit (kéo-thả thẻ trên bảng Kanban)
- Recharts (biểu đồ dashboard)
- socket.io-client (nhận cập nhật realtime)

**Backend**

- NestJS (chia module: Auth, đồng bộ GitHub, Board, AI, Socket Gateway)
- Octokit (`octokit`, `@octokit/webhooks`) để gọi GitHub API và xác thực webhook
- Socket.io để đẩy cập nhật realtime tới các trình duyệt đang mở

**Database**

- PostgreSQL + pgvector (lưu embedding phục vụ phát hiện issue trùng)
- Prisma để tạo bảng và truy vấn; phần so sánh vector viết SQL thô
- Dùng Supabase hoặc Neon chỉ làm nơi chứa database (không dùng làm backend)

**AI**

- LLM: Gemini API gói miễn phí (dòng Flash hoặc Flash-Lite)
- Embedding: embedding của Gemini hoặc model chạy cục bộ (xem lưu ý ở trên)

**Triển khai demo (miễn phí)**

- Giao diện: Vercel
- NestJS: Render hoặc Railway
- Database: Supabase hoặc Neon
- Khi code trên máy: dùng smee.io hoặc ngrok để GitHub gửi webhook về `localhost`

## Kiến thức cần tìm hiểu (theo đề cương)

- Lý thuyết quản lý dự án phát triển phần mềm
- Các khái niệm Git và GitHub (Repository, Issue, GitHub REST API, Webhook, cơ chế đồng bộ dữ liệu 2 chiều)
- Kiến thức phát triển ứng dụng web (Client-Server, RESTful API, HTTP/HTTPS)
- Lý thuyết về Kanban và thiết kế giao diện
- LLM và AI Text Summarization

## Phạm vi

Chỉ làm việc với **Issues** của GitHub, không đụng tới Pull Request/merge code — phù hợp với cách team nhỏ thường làm việc (mỗi người 1 branch, 1 người merge tay).
