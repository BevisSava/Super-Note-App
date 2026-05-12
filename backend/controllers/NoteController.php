<?php
require_once 'config/Database.php';
require_once 'models/User.php';
require_once 'models/Note.php';
require_once 'models/Label.php';
class NoteController {
    private $db;
    private $userModel;
    private $noteModel;
    private $labelModel;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->userModel = new User($this->db);
        $this->noteModel = new Note($this->db);
        $this->labelModel = new Label($this->db);
    }

    // Hàm dùng chung để kiểm tra Token từ Header của React gửi lên
    private function authenticate() {
        $headers = apache_request_headers();
        if (isset($headers['Authorization'])) {
            $token = str_replace('Bearer ', '', $headers['Authorization']);
            $user = $this->userModel->getUserByToken($token);
            if ($user) return $user['id'];
        }
        
        http_response_code(401);
        echo json_encode(["status" => "error", "message" => "Không có quyền truy cập. Vui lòng đăng nhập."]);
        exit();
    }

    // API: Lấy danh sách ghi chú (Bảo mật: Giấu nội dung nếu có mật khẩu)
    public function getNotes() {
        $user_id = $this->authenticate();
        $notes = $this->noteModel->getAllByUser($user_id);
        
        $processed_notes = [];
        foreach ($notes as $note) {
            if (!empty($note['password'])) {
                $note['is_locked'] = true;  
                $note['content'] = '********'; 
            } else {
                $note['is_locked'] = false; 
            }
            unset($note['password']); 
            
            $processed_notes[] = $note;
        }
        
        http_response_code(200);
        echo json_encode(["status" => "success", "data" => $processed_notes]);
    }

    // API: Tạo ghi chú
   public function createNote() {
        $user_id = $this->authenticate();
        $title = isset($_POST['title']) ? $_POST['title'] : '';
        $content = isset($_POST['content']) ? $_POST['content'] : '';
        $color = isset($_POST['color']) ? $_POST['color'] : '#ffffff';
        $image_url = null;

        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = 'uploads/';
            $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $new_filename = uniqid() . '.' . $file_extension;
            $target_file = $upload_dir . $new_filename;

            $allowed_types = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (in_array(strtolower($file_extension), $allowed_types)) {
                if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
                    $image_url = $target_file;
                }
            }
        }
        $note_id = $this->noteModel->create($user_id, $title, $content, $color, $image_url);
        
        if ($note_id) {
            if (isset($_POST['label_ids'])) {
                $label_ids = json_decode($_POST['label_ids'], true);
                if (is_array($label_ids) && !empty($label_ids)) {
                    $this->labelModel->syncNoteLabels($note_id, $label_ids);
                }
            }
            http_response_code(201);
            echo json_encode(["status" => "success", "message" => "Đã tạo ghi chú.", "note_id" => $note_id]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi lưu vào CSDL."]);
        }
    }

    // API: Xóa ghi chú 
    public function deleteNote() {
        $user_id = $this->authenticate(); 
        
        $data = json_decode(file_get_contents("php://input"));
        $note_id = isset($data->id) ? $data->id : (isset($data->note_id) ? $data->note_id : null);

        if ($note_id) {
            // Chặn xóa nếu ghi chú có mật khẩu
            $note = $this->noteModel->getNoteById($note_id, $user_id);
            if (!empty($note['password'])) {
                http_response_code(403);
                echo json_encode(["status" => "error", "message" => "Ghi chú đang bị khóa, không thể xóa!"]);
                return;
            }

            $result = $this->noteModel->delete($note_id, $user_id);
            if ($result) {
                echo json_encode(["status" => "success", "message" => "Xóa thành công!"]);
            } else {
                http_response_code(500);
                echo json_encode(["status" => "error", "message" => "Lỗi khi xóa trong Database"]);
            }
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID ghi chú"]);
        }
    }

    // API: Cập nhật ghi chú (Bảo mật: Chặn sửa nếu đang bị khóa)
    public function updateNote() {
        $user_id = $this->authenticate(); // Hoặc hàm check token của bạn

        $id = isset($_POST['id']) ? $_POST['id'] : null;
        $title = isset($_POST['title']) ? $_POST['title'] : '';
        $content = isset($_POST['content']) ? $_POST['content'] : '';
        $color = isset($_POST['color']) ? $_POST['color'] : null;

        if (!$id) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID ghi chú."]);
            return;
        }
        $image_url = null;
        $has_new_image = false;

        if (isset($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
            $upload_dir = 'uploads/';
            $file_extension = pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION);
            $new_filename = uniqid() . '.' . $file_extension;
            $target_file = $upload_dir . $new_filename;

            $allowed_types = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            if (in_array(strtolower($file_extension), $allowed_types)) {
                if (move_uploaded_file($_FILES['image']['tmp_name'], $target_file)) {
                    $image_url = $target_file;
                    $has_new_image = true; 
                }
            }
        }
        if ($this->noteModel->update($id, $user_id, $title, $content, $color, $image_url, $has_new_image)) {
            if (isset($_POST['label_ids'])) {
                $label_ids = json_decode($_POST['label_ids'], true);
                if (is_array($label_ids)) {
                    $this->labelModel->syncNoteLabels($id, $label_ids);
                }
            }
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Cập nhật thành công."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi CSDL."]);
        }
    }

    // API: Đặt mật khẩu hoặc Gỡ mật khẩu cho 1 ghi chú
    public function setNotePassword($data) {
        $user_id = $this->authenticate();
        if (empty($data->note_id)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID ghi chú"]);
            return;
        }
        // Nếu client gửi password trống -> Gỡ mật khẩu
        $password = !empty($data->password) ? password_hash($data->password, PASSWORD_BCRYPT) : null;

        $query = "UPDATE notes SET password = :password WHERE id = :id AND user_id = :user_id";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':password', $password);
        $stmt->bindParam(':id', $data->note_id);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($stmt->execute()) {
            http_response_code(200);
            $msg = $password ? "Đã khóa ghi chú thành công!" : "Đã gỡ khóa ghi chú!";
            echo json_encode(["status" => "success", "message" => $msg]);
        }
    }

    // API: Mở khóa ghi chú để xem 
    public function unlockNote($data) {
        $user_id = $this->authenticate();

        if (empty($data->note_id) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập mật khẩu"]);
            return;
        }
        
        // Cần Lấy cả password VÀ content từ DB
        $query = "SELECT password, content FROM notes WHERE id = :id AND user_id = :user_id LIMIT 1";
        $stmt = $this->db->prepare($query);
        $stmt->bindParam(':id', $data->note_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        $note = $stmt->fetch();

        if ($note && $note['password'] && password_verify($data->password, $note['password'])) {
            http_response_code(200);
            echo json_encode([
                "status" => "success", 
                "message" => "Mở khóa thành công!",
                "data" => ["content" => $note['content']]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Mật khẩu ghi chú không đúng!"]);
        }
    }
    //  API Đổi màu
    public function changeColor($data) {
        $user_id = $this->authenticate();
        $id = isset($data->id) ? $data->id : null;
        $color = isset($data->color) ? $data->color : '#ffffff';

        if ($id) {
            $this->noteModel->updateColor($id, $user_id, $color);
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Đã đổi màu"]);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID"]);
        }
    }

    // API Ghim / Bỏ ghim
    public function togglePin($data) {
        $user_id = $this->authenticate();
        $id = isset($data->id) ? $data->id : null;
        $is_pinned = isset($data->is_pinned) ? $data->is_pinned : 0; 
        if ($id) {
            $this->noteModel->togglePin($id, $user_id, $is_pinned);
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Đã cập nhật ghim"]);
        } else {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu ID"]);
        }
    } 
}
?>