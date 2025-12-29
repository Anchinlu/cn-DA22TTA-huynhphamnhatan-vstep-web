<p align="center">
  <img src="https://img.icons8.com/fluency/240/artificial-intelligence.png" width="120"/>
</p>

<h1 align="center">🎓 VSTEP AI SMART PLATFORM 🚀</h1>

<p align="center">
  <b>Hệ thống Luyện thi VSTEP 4 Kỹ năng thông minh tích hợp Trí tuệ nhân tạo (AI)</b>
</p>

<p align="center">
  📝 B1 · B2 · C1 &nbsp;|&nbsp; 🤖 AI Examiner &nbsp;|&nbsp; 🎙️ Smart Listening &nbsp;|&nbsp; ⏱️ Smart Timer
</p>

---

## 📝 1. Giới thiệu dự án

**VSTEP AI SMART PLATFORM** là nền tảng luyện thi chứng chỉ tiếng Anh **VSTEP (B1 – B2 – C1)** tiên phong tích hợp **Trí tuệ nhân tạo (AI)**.

Hệ thống hỗ trợ học viên **tự học hiệu quả**, thông qua:
- Chấm điểm **tức thì**
- Nhận xét **chi tiết, cá nhân hóa**
- Mô phỏng **sát môi trường thi thực tế**

🎯 Mục tiêu: *Giúp người học luyện thi thông minh – tiết kiệm thời gian – nâng cao điểm số.*

---

## 🌟 2. Điểm nhấn công nghệ

🤖 **Giám khảo AI (AI Examiner)**  
- Tự động **chấm điểm Writing**
- Phân tích lỗi sai & gợi ý cải thiện

🎙️ **Hội thoại đa giọng đọc (Man / Woman)**  
- AI phân vai **Nam – Nữ**
- Tăng trải nghiệm luyện **Listening thực tế**

⏱️ **Smart Timer**  
- Đồng hồ **chỉ bắt đầu tính giờ sau khi AI đọc xong hướng dẫn**
- Chuẩn form thi VSTEP

---

## 🛠️ 3. “Nguyên liệu” xây dựng (Dependencies)

### 🖥️ Backend (Máy chủ)

| Thư viện | Công dụng (Dễ hiểu) |
|--------|---------------------|
| `express` | 🧠 “Bộ não” điều phối toàn bộ hệ thống |
| `mysql2` | 🔗 Kết nối & truy xuất dữ liệu đề thi |
| `jsonwebtoken` | 🪪 Xác thực & bảo mật người dùng |
| `bcryptjs` | 🔐 Mã hóa mật khẩu an toàn |
| `cloudinary` | ☁️ Lưu trữ ảnh, audio đề thi |

---

### 🎨 Frontend (Giao diện)

| Thư viện | Công dụng (Dễ hiểu) |
|--------|---------------------|
| `react-router-dom` | 🗺️ Điều hướng mượt mà giữa các trang |
| `lucide-react` | 🎨 Bộ icon hiện đại |
| `react-hot-toast` | 🔔 Thông báo đẹp, nhanh |
| `framer-motion` | ✨ Hiệu ứng chuyển động mượt |
| `tailwindcss` | 🧩 Thiết kế giao diện responsive |

---

## 🚀 4. Hướng dẫn cài đặt 

### 🐳 Cách 1: Chạy nhanh bằng Docker

**Bước 1:** Cài và mở **Docker Desktop**  
**Bước 2:** Mở thư mục dự án → `Open in Terminal`  
**Bước 3:** Chạy lệnh:

```bash
docker-compose up --build
Bước 4: Truy cập:
http://localhost:3000
🏗️ Cách 2: Cài đặt thủ công
🗄️ Database
Tạo database: vstep_db
Import file: FULL_BACKUP_VSTEP.sql
⚙️ Backend
bash
Sao chép mã
cd backend
npm install
npm start
🎨 Frontend
bash
Sao chép mã
cd frontend/vstep-client
npm install
npm start
📂 5. Cấu trúc thư mục (Folder Structure)
plaintext
Sao chép mã
cn-da22tta-huynhphamnhatan-vstep-web
├── backend/              # Xử lý dữ liệu & AI
├── frontend/             # Giao diện React
├── setup/                # FULL_BACKUP_VSTEP.sql
├── progress-report/      # Báo cáo tiến độ
├── thesis/               # PDF, Poster, Slide
└── docker-compose.yml    # Cấu hình Docker

🧑‍💻 7. Thông tin tác giả
👨‍🎓 Học viên: Huỳnh Phạm Nhật An

🆔 MSSV: 110122027

📧 Email: 110122027@st.tvu.edu.vn

🏫 Trường: Đại học Trà Vinh (TVU)
