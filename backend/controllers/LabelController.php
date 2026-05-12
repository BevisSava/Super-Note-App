<?php
require_once 'models/Label.php';
require_once 'models/User.php';

class LabelController {
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

    public function getAll() {
        $user_id = $this->authenticate();
        $labelModel = new Label($this->db);
        $labels = $labelModel->getAllByUser($user_id);
        
        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $labels]);
    }

    public function create() {
        $user_id = $this->authenticate();
        $data = json_decode(file_get_contents("php://input"));
        $name = isset($data->name) ? trim($data->name) : '';

        if (empty($name)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Tên nhãn không được để trống."]);
            return;
        }

        $labelModel = new Label($this->db);
        $id = $labelModel->create($user_id, $name);
        
        if ($id) {
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Tạo nhãn thành công.", "id" => $id]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi lưu Database."]);
        }
    }

    public function update() {
        $user_id = $this->authenticate();
        $data = json_decode(file_get_contents("php://input"));
        $id = isset($data->id) ? $data->id : null;
        $name = isset($data->name) ? trim($data->name) : '';

        if (!$id || empty($name)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Dữ liệu không hợp lệ."]);
            return;
        }

        $labelModel = new Label($this->db);
        if ($labelModel->update($id, $user_id, $name)) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Cập nhật thành công."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi cập nhật."]);
        }
    }

    public function delete() {
        $user_id = $this->authenticate();
        $data = json_decode(file_get_contents("php://input"));
        $id = isset($data->id) ? $data->id : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Không tìm thấy ID."]);
            return;
        }

        $labelModel = new Label($this->db);
        if ($labelModel->delete($id, $user_id)) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Xóa thành công."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi xóa nhãn."]);
        }
    }
}
?>