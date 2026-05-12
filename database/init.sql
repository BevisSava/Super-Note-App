-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Máy chủ: 127.0.0.1
-- Thời gian đã tạo: Th5 12, 2026 lúc 10:42 AM
-- Phiên bản máy phục vụ: 10.4.32-MariaDB
-- Phiên bản PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Cơ sở dữ liệu: `note_app`
--

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `labels`
--

CREATE TABLE `labels` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `labels`
--

INSERT INTO `labels` (`id`, `user_id`, `name`, `created_at`) VALUES
(2, 2, 'Label 1 _ Test', '2026-05-04 06:13:52'),
(3, 2, 'Label 2 _ Test', '2026-05-09 08:28:25');

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `notes`
--

CREATE TABLE `notes` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `title` varchar(255) DEFAULT '',
  `content` text DEFAULT '',
  `color` varchar(20) DEFAULT '#ffffff',
  `is_pinned` tinyint(1) DEFAULT 0,
  `password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `image_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `notes`
--

INSERT INTO `notes` (`id`, `user_id`, `title`, `content`, `color`, `is_pinned`, `password`, `created_at`, `updated_at`, `image_url`) VALUES
(11, 2, 'Halo', 'my name is sang\r\n', NULL, 0, NULL, '2026-04-27 15:05:06', '2026-05-09 09:00:17', 'uploads/69feef464a37b.jpg'),
(29, 2, 'Haha', 'test', NULL, 0, NULL, '2026-04-28 08:47:51', '2026-05-09 08:24:26', 'uploads/69f07cb927fb4.png'),
(62, 2, 'Hôm nay tôi đi câu cá', 'bạn đang làm gì vậy ', NULL, 0, NULL, '2026-05-09 07:22:20', '2026-05-09 08:31:57', NULL),
(63, 2, 'Test ', 'halo\r\n', NULL, 0, NULL, '2026-05-09 08:15:18', '2026-05-09 09:00:59', NULL);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `note_labels`
--

CREATE TABLE `note_labels` (
  `note_id` int(11) NOT NULL,
  `label_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `note_labels`
--

INSERT INTO `note_labels` (`note_id`, `label_id`) VALUES
(62, 2),
(63, 3);

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `shares`
--

CREATE TABLE `shares` (
  `id` int(11) NOT NULL,
  `note_id` int(11) NOT NULL,
  `shared_with_email` varchar(255) NOT NULL,
  `permission` enum('read','edit') NOT NULL DEFAULT 'read',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Cấu trúc bảng cho bảng `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `display_name` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `is_activated` tinyint(1) DEFAULT 0,
  `activation_token` varchar(255) DEFAULT NULL,
  `access_token` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expire` datetime DEFAULT NULL,
  `avatar_url` varchar(255) DEFAULT NULL,
  `theme` enum('light','dark') DEFAULT 'light',
  `font_size` enum('small','medium','large') DEFAULT 'medium'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Đang đổ dữ liệu cho bảng `users`
--

INSERT INTO `users` (`id`, `email`, `display_name`, `password`, `is_activated`, `activation_token`, `access_token`, `created_at`, `reset_token`, `reset_token_expire`, `avatar_url`, `theme`, `font_size`) VALUES
(1, 'test1@tdtu.edu.vn', 'Sinh Vien Test', '$2y$10$1qAHqhbO3A.ogDMQsGHF5e7X26sqTVmNPpbCwJzB0QrQXxOcADTg.', 0, '09b793f5441fdb718e54277572014f81', 'df2a2a7d89c629ab421b89bbedb5a23a14b95886aeacf8f352d7d25e4cb7854e', '2026-04-24 14:23:42', NULL, NULL, NULL, 'light', 'medium'),
(2, 'admintest2k6@gmail.com', 'Admin', '$2y$10$RIh.lHg0ecKpY9Ehef2wx.je/hU0QvkWhN6YBtfguVhnPThRL72di', 0, '66169b11322e12373bbc908dd16dc54e', '152c040e2e73f88261ec48a70d07e39080a87085e172eb19927e45b634d689cb', '2026-04-26 18:22:42', '4e13030cb6bcf8d28a404135e39156ac', '2026-04-28 11:17:56', 'uploads/avatars/user_2_1777826881.png', 'light', 'small'),
(3, 'sangc2698@gmail.com', 'Cao sang', '$2y$10$XQoj0nwygu5BFg2RPlHBYOSB7lcn58ICsWskIv3LCfbq/I7iTtejy', 0, '49c5087b9217c49d6ef5623274d0d2d3', '6252d4ccecc78e4cd99c813dc5583a1302b7135e7fe1b04bca5c1d8c3e04a648', '2026-04-27 16:18:13', '99e60fce43be3cda6078e72343d73cce', '2026-04-28 11:19:31', NULL, 'light', 'medium'),
(4, 'nguyenhuunghiaiter@gmail.com', 'Tester1', '$2y$10$8wBBx5p1/SCpx0dNQzQw5OdCB8H8DtWb4tBFRAtIPyXThY6zZ6U3W', 0, 'd738cc06a2668e58f64864552d1f9f12', '45d641100ae18aec9dfb50625578e15dc3d62e10ceefa05573466e171098064c', '2026-04-28 08:57:58', 'b4fa1a49395f0f36234a4e30503ec711', '2026-04-28 11:17:20', NULL, 'light', 'medium');

--
-- Chỉ mục cho các bảng đã đổ
--

--
-- Chỉ mục cho bảng `labels`
--
ALTER TABLE `labels`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `notes`
--
ALTER TABLE `notes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Chỉ mục cho bảng `note_labels`
--
ALTER TABLE `note_labels`
  ADD PRIMARY KEY (`note_id`,`label_id`),
  ADD KEY `label_id` (`label_id`);

--
-- Chỉ mục cho bảng `shares`
--
ALTER TABLE `shares`
  ADD PRIMARY KEY (`id`),
  ADD KEY `note_id` (`note_id`);

--
-- Chỉ mục cho bảng `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT cho các bảng đã đổ
--

--
-- AUTO_INCREMENT cho bảng `labels`
--
ALTER TABLE `labels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT cho bảng `notes`
--
ALTER TABLE `notes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=64;

--
-- AUTO_INCREMENT cho bảng `shares`
--
ALTER TABLE `shares`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT cho bảng `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Các ràng buộc cho các bảng đã đổ
--

--
-- Các ràng buộc cho bảng `labels`
--
ALTER TABLE `labels`
  ADD CONSTRAINT `labels_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `notes`
--
ALTER TABLE `notes`
  ADD CONSTRAINT `notes_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `note_labels`
--
ALTER TABLE `note_labels`
  ADD CONSTRAINT `note_labels_ibfk_1` FOREIGN KEY (`note_id`) REFERENCES `notes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `note_labels_ibfk_2` FOREIGN KEY (`label_id`) REFERENCES `labels` (`id`) ON DELETE CASCADE;

--
-- Các ràng buộc cho bảng `shares`
--
ALTER TABLE `shares`
  ADD CONSTRAINT `shares_ibfk_1` FOREIGN KEY (`note_id`) REFERENCES `notes` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
