# Edu flow
### Ứng dụng quản lý sinh viên và theo dõi đóng góp của sinh viên trong nhóm với giao diện Kanban trực quan

## Tính năng
- 🔐 Xác thực người dùng (đăng nhập/đăng ký, tự động refresh token)
- 👥 Quản lý nhóm (Groups)
- ✅ Quản lý công việc (Tasks) theo mô hình Kanban: `Todo` → `In Progress` → `Test` → `Done`
- 📊 Dashboard trực quan: thẻ thống kê, biểu đồ, activity feed
- 🖱️ Kéo thả (Drag & Drop) task giữa các cột
- 📥 Import người dùng — nhập danh sách người dùng hàng loạt từ file (CSV/Excel)
- 📤 Export đóng góp — xuất báo cáo đóng góp/công việc của thành viên ra file
- 🤖 Hỗ trợ AI — tích hợp AI hỗ trợ gợi ý, phân tích trong quá trình làm việc
- 🔗 Đóng góp qua GitHub API — theo dõi và ghi nhận đóng góp của thành viên thông qua commit trên GitHub

## Công nghệ sử dụng
- **Backend:** ASP.NET Core 8, SQL Server
- **Frontend:** Reactjs
- **Containerization:** Docker, Docker Compose


## Yêu cầu hệ thống
- Docker & Docker Compose
- .NET SDK 8.0
- Visual Studio 2022
- SQL Server

## Cài đặt & Chạy dự án

### Sử dụng Docker (khuyến nghị)

\`\`\` bash
git clone https://github.com/nnkongh/FINAL_PROJECT
cd FINAL_PROJECT

docker compose up --build
\`\`\`

### Chạy thủ công 

**Backend (ASP.NET Core)**
\`\`\`bash
cd backend
dotnet restore
dotnet ef database update   # nếu dùng Entity Framework migrations
dotnet run

**Kiến trúc hệ thống
\`\`\<img width="2250" height="2814" alt="40cb8f80-601f-4364-a5a0-a34db7a96c26_2250x2814" src="https://github.com/user-attachments/assets/ed9fdea9-bf69-4bb1-8a2c-892fe3e5ef5d" />

