# Super Note App 📝

[![React](https://img.shields.io/badge/Frontend-React-61DAFB?logo=react)](https://reactjs.org/)
[![PHP](https://img.shields.io/badge/Backend-PHP-777BB4?logo=php)](https://www.php.net/)
[![MySQL](https://img.shields.io/badge/Database-MySQL-4479A1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Deployment-Docker-2496ED?logo=docker)](https://www.docker.com/)

A modern, feature-rich note-taking application designed for performance, security, and ease of use.

---

## 🌏 Language / Ngôn ngữ
- [English](#english-version)
- [Tiếng Việt](#phiên-bản-tiếng-việt)

---

## English Version

### ✨ Features
- **Modern UI**: Sleek, responsive design with full Light/Dark mode support.
- **Security**: 
  - JWT Authentication & Email Verification.
  - Password-protected individual notes.
- **Rich Content**: Support for images, custom colors, and file attachments.
- **Real-time Collaboration**: WebSocket integration for instant updates.
- **Organization**: Categorize notes using custom labels and pins.
- **Containerized**: Ready-to-use Docker environment.

### 🚀 Getting Started

#### Prerequisites
- Docker & Docker Compose (Recommended)
- OR: PHP 8.2+, MySQL 8.0, Node.js 18+

#### Setup with Docker
1. Clone the repository.
2. Prepare environment variables:
   - Copy `backend/.env.example` to `backend/.env`
   - Copy `frontend/.env.example` to `frontend/.env`
3. Launch the application:
   ```bash
   docker-compose up --build -d
   ```
4. Access at: `http://localhost`

---

## Phiên bản Tiếng Việt

### ✨ Tính năng chính
- **Giao diện hiện đại**: Hỗ trợ đầy đủ chế độ Sáng/Tối (Light/Dark mode).
- **Bảo mật**: 
  - Xác thực người dùng qua Email và JWT.
  - Khóa từng ghi chú bằng mật khẩu riêng.
- **Nội dung phong phú**: Hỗ trợ đính kèm ảnh, chọn màu ghi chú, đính kèm tệp.
- **Thời gian thực**: Cập nhật tức thì qua WebSockets.
- **Quản lý**: Phân loại theo nhãn (Labels) và ghim ghi chú quan trọng.

### 🚀 Hướng dẫn chạy chương trình

#### Yêu cầu hệ thống
- Docker & Docker Compose (Khuyên dùng)

#### Các bước thực hiện
1. Sao chép file cấu hình:
   - Copy `backend/.env.example` -> `backend/.env`
   - Copy `frontend/.env.example` -> `frontend/.env`
2. Khởi động với Docker:
   ```bash
   docker-compose up --build -d
   ```
3. Truy cập tại: `http://localhost`

---

## 📂 Project Structure
- `/frontend`: ReactJS + Vite + Bootstrap.
- `/backend`: PHP Core API + WebSocket Server.
- `/database`: Database schema and initialization.
- `/docker-compose.yml`: Full stack orchestration.

## 🛠 Tech Stack
- **Frontend**: React, Vite, Bootstrap 5.
- **Backend**: PHP, Ratchet (WebSocket), Composer.
- **Database**: MySQL.
- **DevOps**: Docker, Docker Compose.
