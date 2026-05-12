<?php
require_once 'config/Database.php';
require_once 'models/User.php';

class ShareController {
    private $db;
    private $userModel;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->userModel = new User($this->db);
    }

    private function authenticate() {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $user = $this->userModel->getUserByToken($token);
            if ($user) return $user['id'];
        }
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Không có quyền truy cập."]);
        exit();
    }
    // API: Thực hiện chia sẻ ghi chú
    public function shareNote($data = null) {
        $owner_id = $this->authenticate();

        //Tự động bắt dữ liệu nếu bị index.php bỏ quên
        if (empty($data)) {
            $data = json_decode(file_get_contents("php://input"));
        }

        if (empty($data->note_id) || empty($data->email) || empty($data->permission)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin chia sẻ (ID, Email hoặc Quyền)."]);
            return;
        }
        // Kiểm tra xem email người nhận có tồn tại trong hệ thống 
        $recipient = $this->userModel->emailExists($data->email);
        if (!$recipient) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Email này chưa đăng ký tài khoản trên hệ thống."]);
            return;
        }
        // Kiểm tra xem user này có sở hữu ghi chú
        $check_owner = "SELECT id FROM notes WHERE id = :note_id AND user_id = :user_id";
        $stmt = $this->db->prepare($check_owner);
        $stmt->execute([':note_id' => $data->note_id, ':user_id' => $owner_id]);
        
        if ($stmt->rowCount() === 0) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Bạn không phải chủ sở hữu ghi chú này."]);
            return;
        }
        // Xóa quyền cũ và insert quyền mới
        $del = "DELETE FROM shares WHERE note_id = :note_id AND shared_with_email = :email";
        $stmtDel = $this->db->prepare($del);
        $stmtDel->execute([':note_id' => $data->note_id, ':email' => $data->email]);
        // Thêm quyền mới
        $insert = "INSERT INTO shares (note_id, shared_with_email, permission) VALUES (:note_id, :email, :permission)";
        $stmtInsert = $this->db->prepare($insert);
        
        if ($stmtInsert->execute([':note_id' => $data->note_id, ':email' => $data->email, ':permission' => $data->permission])) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Đã chia sẻ ghi chú thành công!"]);
        }
    }
}
?>