<?php
require_once 'models/User.php';

class UserController {
    private $db;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
    }

    private function authenticate() {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $userModel = new User($this->db);
            $user = $userModel->getUserByToken($token);
            if ($user) return $user['id'];
        }
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Không có quyền truy cập. Vui lòng đăng nhập."]);
        exit();
    }

    public function getProfile() {
        $user_id = $this->authenticate(); 
        
        $userModel = new User($this->db);
        $profile = $userModel->getUserProfile($user_id);
        
        if ($profile) {
            http_response_code(200);
            echo json_encode(["status" => "success", "data" => $profile]);
        } else {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy người dùng."]);
        }
    }

    public function updateProfile() {
        $user_id = $this->authenticate(); 

        $display_name = isset($_POST['display_name']) ? $_POST['display_name'] : '';
        $theme = isset($_POST['theme']) ? $_POST['theme'] : 'light';
        $font_size = isset($_POST['font_size']) ? $_POST['font_size'] : 'medium';

        $avatar_url = null;
        $has_new_avatar = false;


        if (isset($_FILES['avatar']) && $_FILES['avatar']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = 'uploads/avatars/'; 
            
            if (!is_dir($upload_dir)) {
                mkdir($upload_dir, 0777, true);
            }

            $file_extension = pathinfo($_FILES['avatar']['name'], PATHINFO_EXTENSION);
            $new_filename = 'user_' . $user_id . '_' . time() . '.' . $file_extension;
            $target_file = $upload_dir . $new_filename;

            $allowed_types = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (in_array(strtolower($file_extension), $allowed_types)) {
                if (move_uploaded_file($_FILES['avatar']['tmp_name'], $target_file)) {
                    $avatar_url = $target_file;
                    $has_new_avatar = true;
                }
            }
        }

        $userModel = new User($this->db);
        if ($userModel->updateProfile($user_id, $display_name, $theme, $font_size, $avatar_url, $has_new_avatar)) {
            http_response_code(200);
            $updatedProfile = $userModel->getUserProfile($user_id);
            echo json_encode(["status" => "success", "message" => "Cập nhật thành công.", "data" => $updatedProfile]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi lưu Database."]);
        }
    }
}
?>