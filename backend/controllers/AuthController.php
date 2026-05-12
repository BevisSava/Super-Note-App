<?php
require_once 'config/Database.php';
require_once 'models/User.php';
require_once 'utils/MailService.php';

class AuthController {
    private $db;
    private $user;

    public function __construct() {
        $database = new Database();
        $this->db = $database->getConnection();
        $this->user = new User($this->db);
    }

    private function generateToken() {
        return bin2hex(random_bytes(32));
    }

    public function register($data) {
        if (empty($data->email) || empty($data->display_name) || empty($data->password) || empty($data->confirm_password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập đủ thông tin."]);
            return;
        }

        if ($data->password !== $data->confirm_password) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Mật khẩu xác nhận không khớp."]);
            return;
        }

        if ($this->user->emailExists($data->email)) {
            http_response_code(409);
            echo json_encode(["status" => "error", "message" => "Email đã được sử dụng."]);
            return;
        }

        $hashed_password = password_hash($data->password, PASSWORD_BCRYPT);
        
        $activation_token = bin2hex(random_bytes(16));

        $new_user_id = $this->user->create($data->email, $data->display_name, $hashed_password, $activation_token);

        if ($new_user_id) {
            
            require_once 'utils/MailService.php'; 
            
            $verify_link = BACKEND_URL . "/index.php?action=verify_email&token=" . $activation_token;
            
            $subject = "Kích hoạt tài khoản Note App của bạn";
            $body = "
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;'>
                    <h2 style='color: #0d6efd; text-align: center;'>Chào mừng {$data->display_name}!</h2>
                    <p>Cảm ơn bạn đã đăng ký sử dụng Note App. Để tài khoản được bảo mật và có thể tạo ghi chú, vui lòng xác thực địa chỉ email này bằng cách bấm vào nút bên dưới:</p>
                    <div style='text-align: center; margin: 30px 0;'>
                        <a href='{$verify_link}' style='display:inline-block; padding:12px 25px; background-color:#0d6efd; color:#ffffff; text-decoration:none; font-weight:bold; border-radius:30px;'>Xác Thực Email Ngay</a>
                    </div>
                    <p style='color: #666; font-size: 14px;'>Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.</p>
                </div>
            ";

            MailService::sendMail($data->email, $subject, $body);

            $access_token = $this->generateToken();
            $this->user->updateAccessToken($new_user_id, $access_token);

            http_response_code(201);
            echo json_encode([
                "status" => "success",
                "message" => "Đăng ký thành công! Vui lòng kiểm tra Email để kích hoạt.",
                "token" => $access_token,
                "user" => ["display_name" => $data->display_name, "is_activated" => 0] 
            ]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi hệ thống."]);
        }
    }
    public function login($data) {
        if (empty($data->email) || empty($data->password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Nhập đủ email và mật khẩu."]);
            return;
        }

        $user_row = $this->user->emailExists($data->email);

        if ($user_row && password_verify($data->password, $user_row['password'])) {
            $access_token = $this->generateToken();
            $this->user->updateAccessToken($user_row['id'], $access_token);

            http_response_code(200);
            echo json_encode([
                "status" => "success",
                "message" => "Đăng nhập thành công.",
                "token" => $access_token,
                "user" => ["id" => $user_row['id'],"display_name" => $user_row['display_name'], "is_activated" => $user_row['is_activated']]
            ]);
        } else {
            http_response_code(401);
            echo json_encode(["status" => "error", "message" => "Sai email hoặc mật khẩu."]);
        }
    }
    // API: Xử lý khi người dùng bấm vào Link trong Email
    public function verifyEmail() {
        $token = isset($_GET['token']) ? $_GET['token'] : '';

        if ($token) {
            $query = "UPDATE users SET is_activated = 1, activation_token = NULL WHERE activation_token = :token";
            $stmt = $this->db->prepare($query);
            $stmt->bindParam(':token', $token);
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                header("Location: " . FRONTEND_URL . "/login?verified=true");
                exit();
            } else {
                echo "<h1>❌ Mã kích hoạt không hợp lệ hoặc tài khoản đã được kích hoạt!</h1>";
            }
        } else {
            echo "<h1>❌ Thiếu mã kích hoạt!</h1>";
        }
    }
    public function forgotPassword($data) {
        if (empty($data->email)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Vui lòng nhập email."]);
            return;
        }

        if (!$this->user->emailExists($data->email)) {
            http_response_code(404);
            echo json_encode(["status" => "error", "message" => "Email không tồn tại trong hệ thống."]);
            return;
        }

        $reset_token = bin2hex(random_bytes(16));
        $expiry_time = date('Y-m-d H:i:s', time() + 900);

        if ($this->user->setResetToken($data->email, $reset_token, $expiry_time)) {
            require_once 'utils/MailService.php';
            $reset_link = FRONTEND_URL . "/reset-password?token=" . $reset_token;
            $subject = "Đặt lại Mật khẩu Note App";
            $body = "
                <div style='font-family: Arial, sans-serif; padding: 20px;'>
                    <h2 style='color: #dc3545;'>Đặt lại Mật khẩu</h2>
                    <p>Bấm vào nút dưới đây để thiết lập mật khẩu mới (Liên kết hết hạn sau 15 phút):</p>
                    <a href='{$reset_link}' style='padding:10px 20px; background-color:#dc3545; color:#fff; text-decoration:none; border-radius:5px;'>Đổi Mật Khẩu Mới</a>
                </div>
            ";

            MailService::sendMail($data->email, $subject, $body);

            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Đã gửi link đặt lại mật khẩu vào email của bạn."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi hệ thống."]);
        }
    }
    public function resetPassword($data) {
        if (empty($data->token) || empty($data->new_password) || empty($data->confirm_password)) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Thiếu thông tin."]);
            return;
        }

        if ($data->new_password !== $data->confirm_password) {
            http_response_code(400);
            echo json_encode(["status" => "error", "message" => "Hai mật khẩu không khớp."]);
            return;
        }

        $user = $this->user->getUserByResetToken($data->token);
        if (!$user) {
            http_response_code(403);
            echo json_encode(["status" => "error", "message" => "Đường dẫn không hợp lệ hoặc đã hết hạn!"]);
            return;
        }

        $hashed_password = password_hash($data->new_password, PASSWORD_BCRYPT);
        if ($this->user->updatePassword($user['id'], $hashed_password)) {
            http_response_code(200);
            echo json_encode(["status" => "success", "message" => "Đổi mật khẩu thành công! Vui lòng đăng nhập lại."]);
        } else {
            http_response_code(500);
            echo json_encode(["status" => "error", "message" => "Lỗi cập nhật mật khẩu."]);
        }
    }
}
?>