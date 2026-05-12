<?php
class User {
    private $conn;
    private $table = "users";

    public function __construct($db) {
        $this->conn = $db;
    }
    public function emailExists($email) {
        $query = "SELECT id, display_name, password, is_activated FROM " . $this->table . " WHERE email = :email LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->execute();
        return $stmt->fetch();
    }

    public function create($email, $display_name, $password, $activation_token) {
        $query = "INSERT INTO " . $this->table . " (email, display_name, password, activation_token) VALUES (:email, :display_name, :password, :token)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':display_name', $display_name);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':token', $activation_token);

        if($stmt->execute()) return $this->conn->lastInsertId();
        return false;
    }

    public function updateAccessToken($id, $token) {
        $query = "UPDATE " . $this->table . " SET access_token = :token WHERE id = :id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->bindParam(':id', $id);
        return $stmt->execute();
    }
    public function getUserByToken($token) {
        $query = "SELECT id, email, display_name FROM " . $this->table . " WHERE access_token = :token LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':token', $token);
        $stmt->execute();
        return $stmt->fetch();
    }

    // Lưu mã Reset Password và thời gian hết hạn (15 phút) vào DB
    public function setResetToken($email, $token, $expiry) {
        $query = "UPDATE " . $this->table . " SET reset_token = :token, reset_token_expire = :expiry WHERE email = :email";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':token' => $token, ':expiry' => $expiry, ':email' => $email]);
    }

    // Lấy User dựa vào mã Token (Đảm bảo mã chưa quá hạn)
    public function getUserByResetToken($token) {
        $query = "SELECT * FROM " . $this->table . " WHERE reset_token = :token AND reset_token_expire > NOW()";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([':token' => $token]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Cập nhật Pass mới và xóa sạch Token cũ đi
    public function updatePassword($user_id, $hashed_password) {
        $query = "UPDATE " . $this->table . " SET password = :password, reset_token = NULL, reset_token_expire = NULL WHERE id = :user_id";
        $stmt = $this->conn->prepare($query);
        return $stmt->execute([':password' => $hashed_password, ':user_id' => $user_id]);
    }
    public function getUserProfile($user_id) {
        $query = "SELECT id, email, display_name, avatar_url, theme, font_size, created_at 
                  FROM " . $this->table . " WHERE id = :id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $user_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    // Cập nhật Profile & Cài đặt hiển thị
    public function updateProfile($user_id, $display_name, $theme, $font_size, $avatar_url = null, $has_new_avatar = false) {
        if ($has_new_avatar) {
            $query = "UPDATE " . $this->table . " 
                      SET display_name = :display_name, theme = :theme, font_size = :font_size, avatar_url = :avatar_url 
                      WHERE id = :id";
        } else {
            $query = "UPDATE " . $this->table . " 
                      SET display_name = :display_name, theme = :theme, font_size = :font_size 
                      WHERE id = :id";
        }

        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':display_name', $display_name);
        $stmt->bindParam(':theme', $theme);
        $stmt->bindParam(':font_size', $font_size);
        $stmt->bindParam(':id', $user_id);
        
        if ($has_new_avatar) {
            $stmt->bindParam(':avatar_url', $avatar_url);
        }

        return $stmt->execute();
    }
}
?>