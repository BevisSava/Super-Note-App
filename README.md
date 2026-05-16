# Super Note App 📝

A feature-rich, modern note-taking application with real-time collaboration, user authentication, and multi-device synchronization.

## ✨ Features

- **Modern UI**: Sleek, responsive design with Light/Dark mode support.
- **Authentication**: Secure registration, login, email verification, and password reset.
- **Rich Notes**: Create, edit, delete, and pin notes with custom colors and image attachments.
- **Security**: Protect individual notes with passwords.
- **Sharing**: Share notes with other users with read/edit permissions.
- **Labels**: Organize notes using custom labels.
- **Real-time**: Real-time updates using WebSockets (where applicable).

## 📂 Project Structure

- `/frontend`: React + Vite frontend application.
- `/backend`: PHP backend API.
- `/database`: Database initialization scripts.
- `/docker-compose.yml`: Docker configuration for full-stack deployment.

## 🚀 Getting Started

### Prerequisites

- PHP 7.4+ (for backend)
- MySQL/MariaDB
- Node.js & npm (for frontend)
- Composer (for backend dependencies)
- *Optional*: Docker & Docker Compose

### Setup

#### 1. Backend Setup
```bash
cd backend
cp .env.example .env
# Update .env with your database credentials
composer install
php migrate.php # Initialize database tables
```

#### 2. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Update .env if necessary
npm install
npm run dev
```

### Using Docker (Recommended)
```bash
docker-compose up -d
```
The app will be available at `http://localhost:5173`.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, CSS (Vanilla)
- **Backend**: PHP (Core), Composer
- **Database**: MySQL
- **Containerization**: Docker, Docker Compose

## 📝 License

This project is open-source. Feel free to use and modify.
