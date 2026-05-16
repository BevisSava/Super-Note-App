<?php
$host = getenv('DB_HOST') ?: "127.0.0.1";
$username = getenv('DB_USER') ?: "root";
$password = getenv('DB_PASS') ?: "";
$db_name = getenv('DB_NAME') ?: "note_app";

try {

    $pdo = new PDO("mysql:host=$host;charset=utf8mb4", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db_name` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $pdo->exec("USE `$db_name`");

    $table_users = "
        CREATE TABLE IF NOT EXISTS `users` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `email` varchar(255) NOT NULL,
            `display_name` varchar(255) NOT NULL,
            `password` varchar(255) NOT NULL,
            `avatar_url` varchar(255) DEFAULT NULL,
            `theme` enum('light','dark') DEFAULT 'light',
            `font_size` enum('small','medium','large') DEFAULT 'medium',
            `is_activated` tinyint(1) DEFAULT 0,
            `activation_token` varchar(255) DEFAULT NULL,
            `access_token` varchar(255) DEFAULT NULL,
            `reset_token` varchar(255) DEFAULT NULL,
            `reset_token_expire` datetime DEFAULT NULL,
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            UNIQUE KEY `email` (`email`)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    $pdo->exec($table_users);
    echo "<h3>🎉 MIGRATION THÀNH CÔNG!</h3>";

    $table_notes = "
        CREATE TABLE IF NOT EXISTS `notes` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `user_id` int(11) NOT NULL,
            `title` varchar(255) DEFAULT '',
            `content` text DEFAULT '',
            `color` varchar(20) DEFAULT '#ffffff',
            `image_url` varchar(255) DEFAULT NULL,
            `is_pinned` tinyint(1) DEFAULT 0,
            `password` varchar(255) DEFAULT NULL,
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            `updated_at` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    $pdo->exec($table_notes);
    echo "<p>✅ Đã tạo bảng: <b>notes</b>.</p>";

    $table_shares = "
        CREATE TABLE IF NOT EXISTS `shares` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `note_id` int(11) NOT NULL,
            `shared_with_email` varchar(255) NOT NULL,
            `permission` enum('read','edit') NOT NULL DEFAULT 'read',
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    $pdo->exec($table_shares);
    echo "<p>✅ Đã tạo bảng: <b>shares</b>.</p>";

    $table_labels = "
        CREATE TABLE IF NOT EXISTS `labels` (
            `id` int(11) NOT NULL AUTO_INCREMENT,
            `user_id` int(11) NOT NULL,
            `name` varchar(255) NOT NULL,
            `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (`id`),
            FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    $pdo->exec($table_labels);
    echo "<p>✅ Đã tạo bảng: <b>labels</b>.</p>";
    
    $table_note_labels = "
        CREATE TABLE IF NOT EXISTS `note_labels` (
            `note_id` int(11) NOT NULL,
            `label_id` int(11) NOT NULL,
            PRIMARY KEY (`note_id`, `label_id`),
            FOREIGN KEY (`note_id`) REFERENCES `notes`(`id`) ON DELETE CASCADE,
            FOREIGN KEY (`label_id`) REFERENCES `labels`(`id`) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    ";
    $pdo->exec($table_note_labels);
    echo "<p>✅ Đã tạo bảng: <b>note_labels</b>.</p>";

    try {
        $pdo->exec("ALTER TABLE `users` ADD `reset_token` varchar(255) DEFAULT NULL");
        echo "<p> Thêm cột <b>reset_token</b> vào bảng users.</p>";
    } catch (PDOException $e) {
        if ($e->errorInfo[1] != 1060) throw $e;
    }
    
    try {
        $pdo->exec("ALTER TABLE `users` ADD `reset_token_expire` datetime DEFAULT NULL");
        echo "<p> Thêm cột <b>reset_token_expire</b> vào bảng users.</p>";
    } catch (PDOException $e) {
        if ($e->errorInfo[1] != 1060) throw $e; 
    }

    try {
        $pdo->exec("ALTER TABLE `notes` ADD `image_url` varchar(255) DEFAULT NULL");
        echo "<p> Thêm cột <b>image_url</b> vào bảng notes.</p>";
    } catch (PDOException $e) {
        if ($e->errorInfo[1] != 1060) throw $e; 
    }

    try {
        $pdo->exec("ALTER TABLE `users` ADD `avatar_url` varchar(255) DEFAULT NULL");
        echo "<p> Thêm cột <b>avatar_url</b> vào bảng users.</p>";
    } catch (PDOException $e) {
        if ($e->errorInfo[1] != 1060) throw $e; 
    }

    try {
        $pdo->exec("ALTER TABLE `users` ADD `theme` enum('light','dark') DEFAULT 'light'");
        echo "<p> Thêm cột <b>theme</b> vào bảng users.</p>";
    } catch (PDOException $e) {
        if ($e->errorInfo[1] != 1060) throw $e; 
    }

    try {
        $pdo->exec("ALTER TABLE `users` ADD `font_size` enum('small','medium','large') DEFAULT 'medium'");
        echo "<p> Thêm cột <b>font_size</b> vào bảng users.</p>";
    } catch (PDOException $e) {
        if ($e->errorInfo[1] != 1060) throw $e; 
    }
    
    echo "<p>Đã tạo/cập nhật Database: <b>$db_name</b> thành công.</p>";

} catch (PDOException $e) {
    die("❌ Lỗi Migration: " . $e->getMessage());
}
?>