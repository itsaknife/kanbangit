# GitHub Task Board — Frontend

Giao diện web của đồ án: hệ thống quản lý công việc nhóm phát triển phần mềm, đồng bộ hai chiều với GitHub Issues, có AI hỗ trợ.

**Công nghệ:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · dnd-kit · Recharts · socket.io-client

## Chạy dự án

Cần Node.js 20.9 trở lên.

```bash
npm install
cp .env.example .env.local   # rồi sửa địa chỉ backend nếu cần
npm run dev                  # mở http://localhost:3000
```

Các lệnh khác: `npm run build`, `npm run lint`, `npm run typecheck`, `npm run format`.

## Cấu trúc thư mục

```
src/
├── app/                 # Chỉ chứa route (page, layout). Mỗi page chỉ ghép component, không có logic
│   ├── (auth)/login/            # Trang đăng nhập
│   └── (main)/                  # Nhóm trang yêu cầu đăng nhập (có AuthGuard + AppShell)
│       └── repositories/
│           ├── page.tsx                      # Danh sách repository
│           └── [repoId]/
│               ├── board/                    # Bảng Kanban
│               ├── issues/                   # Danh sách issue
│               ├── issues/[issueNumber]/     # Chi tiết issue
│               └── dashboard/                # Dashboard + báo cáo AI
├── components/          # Giao diện, mỗi module một folder riêng
│   ├── ui/                      # Thành phần dùng chung: Button, Input, Modal, Badge...
│   ├── layout/                  # Header, AppShell, RepoTabs
│   ├── auth/                    # LoginCard, AuthGuard
│   ├── repositories/            # RepositoryList, RepositoryCard
│   ├── issues/                  # IssueList, IssueForm, IssueDetail, DuplicateWarning...
│   ├── board/                   # KanbanBoard, BoardColumn, BoardCard (kéo-thả)
│   ├── dashboard/               # DashboardOverview, các biểu đồ, StatCard
│   └── ai/                      # WeeklySummaryPanel
├── hooks/               # Logic có state: useIssues, useBoard, useDashboard, useAuth...
├── services/            # Gọi API và socket: http.ts, socket.ts, *.service.ts
├── utils/               # Hàm thuần, không phụ thuộc React: formatDate, filterIssues...
├── providers/           # React Context (AuthProvider)
├── types/               # Kiểu dữ liệu TypeScript, chia theo module
├── constants/           # Hằng số: routes, cột Kanban, nhãn chuẩn, tên socket event
└── config/              # Đọc biến môi trường
```

## Luồng dữ liệu

```
page  →  component  →  hook  →  service  →  http / socket  →  backend
```

Mỗi tầng chỉ gọi xuống tầng ngay dưới nó:

- **page** (`app/`): chỉ ghép component, không viết logic.
- **component**: chỉ lo hiển thị, lấy dữ liệu và thao tác qua hook. Không gọi `fetch` trực tiếp.
- **hook**: giữ state, xử lý logic (lọc, optimistic update, nhận dữ liệu realtime). Không có JSX.
- **service**: chỉ gọi API, mỗi module một file, trả về đúng kiểu dữ liệu.
- **utils**: hàm thuần, dễ test.

## Quy ước đặt tên

| Loại            | Quy ước                                  | Ví dụ              |
| --------------- | ---------------------------------------- | ------------------ |
| Component       | `PascalCase.tsx`, một component một file | `IssueForm.tsx`    |
| Hook            | `useXxx.ts`                              | `useIssues.ts`     |
| Service         | `xxx.service.ts`                         | `issue.service.ts` |
| Type            | `xxx.types.ts`                           | `issue.types.ts`   |
| Util / constant | `camelCase.ts` (constants: `kebab-case`) | `formatDate.ts`    |

- Mỗi folder đều có `index.ts` để import gọn: `import { Button } from "@/components/ui"`.
- Dùng alias `@/` trỏ tới `src/`, không dùng đường dẫn tương đối kiểu `../../..`.
- Không viết cứng đường dẫn trang: dùng `ROUTES` trong `constants/routes.ts`.

## Thêm một module mới (ví dụ `comments`)

1. `types/comment.types.ts`: khai báo kiểu dữ liệu, export trong `types/index.ts`.
2. `services/comment.service.ts`: các hàm gọi API, export trong `services/index.ts`.
3. `hooks/useComments.ts`: logic và state, export trong `hooks/index.ts`.
4. `components/comments/`: component + `index.ts`.
5. Thêm route trong `app/` nếu cần trang riêng.

## API backend mà frontend đang gọi

Backend (NestJS) cần cung cấp các endpoint sau. Lỗi trả về dạng `{ "message": "..." }`.

| Method | Đường dẫn                                     | Mục đích                                                               |
| ------ | --------------------------------------------- | ---------------------------------------------------------------------- |
| GET    | `/auth/github`                                | Bắt đầu OAuth GitHub (chuyển hướng), xong thì set cookie               |
| GET    | `/auth/me`                                    | Người dùng hiện tại (401 nếu chưa đăng nhập)                           |
| POST   | `/auth/logout`                                | Đăng xuất                                                              |
| GET    | `/repositories`                               | Repository của người dùng, kèm `isConnected`                           |
| GET    | `/repositories/:repoId`                       | Chi tiết một repository                                                |
| POST   | `/repositories/:repoId/connect`               | Kết nối repository (lấy issue cũ, đăng ký webhook)                     |
| GET    | `/repositories/:repoId/issues`                | Toàn bộ issue của repository                                           |
| GET    | `/repositories/:repoId/issues/:number`        | Chi tiết một issue                                                     |
| POST   | `/repositories/:repoId/issues`                | Tạo issue (tạo trên GitHub rồi lưu bản sao)                            |
| PATCH  | `/repositories/:repoId/issues/:number`        | Sửa tiêu đề, mô tả, nhãn                                               |
| PATCH  | `/repositories/:repoId/issues/:number/status` | Đổi cột Kanban, body `{ "status": "todo" \| "in_progress" \| "done" }` |
| GET    | `/repositories/:repoId/dashboard?weekStart=`  | Thống kê theo tuần                                                     |
| GET    | `/repositories/:repoId/ai/weekly-summary`     | Báo cáo tuần gần nhất (404 nếu chưa có)                                |
| POST   | `/repositories/:repoId/ai/weekly-summary`     | Tạo báo cáo tuần mới bằng LLM                                          |
| POST   | `/repositories/:repoId/ai/duplicate-check`    | Kiểm tra issue trùng, body `{ title, body? }`                          |

Kiểu dữ liệu của request và response nằm trong `src/types/`.

### Socket.io

Client gửi `repo:subscribe` / `repo:unsubscribe` (kèm `repoId`) để vào / rời phòng của repository. Server đẩy xuống:

- `issue:created` và `issue:updated`, dữ liệu `{ repoId, issue }`
- `issue:deleted`, dữ liệu `{ repoId, number }`

Tên sự kiện định nghĩa trong `src/constants/socket-events.ts`.

### Lưu ý khi nối với backend

- Frontend gửi cookie đăng nhập (`credentials: "include"`), nên backend phải bật CORS với `credentials: true` và chỉ định đúng origin của frontend (không dùng `*`). Socket.io cũng cần cấu hình CORS tương tự.
- Sau khi đăng nhập GitHub thành công, backend set cookie `httpOnly` rồi chuyển hướng về `http://localhost:3000/repositories`.
