<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

$protocol = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on' ? "https" : "http";
$host = $_SERVER['HTTP_HOST'] ?? 'localhost:8080';
define('BACKEND_URL', "$protocol://$host");
define('FRONTEND_URL', getenv('FRONTEND_URL') ?: 'http://localhost');
require_once 'controllers/LabelController.php';
require_once 'controllers/AuthController.php';
require_once 'controllers/NoteController.php';
require_once 'controllers/ShareController.php';
require_once 'controllers/UserController.php';

$action = isset($_GET['action']) ? $_GET['action'] : '';
$data = json_decode(file_get_contents("php://input"));
$authController = new AuthController();
$noteController = new NoteController();
$shareController = new ShareController();
$userController = new UserController();
$labelController = new LabelController();

switch ($action) {
    case 'register':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $authController->register($data);
        break;
    case 'verify_email':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $authController->verifyEmail();
        break;
    case 'login':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $authController->login($data);
        break;
    case 'forgot_password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $authController->forgotPassword($data);
        break;
    case 'reset_password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $authController->resetPassword($data);
        break;
    case 'get_notes':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $noteController->getNotes();
        break;
    case 'create_note':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $noteController->createNote();
        break;
    case 'update_note':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $noteController->updateNote();
        break;
    case 'delete_note':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $noteController->deleteNote();
        break;
    case 'set_password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $noteController->setNotePassword($data);
        break;
    case 'unlock_note':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $noteController->unlockNote($data);
        break;
    case 'toggle_pin':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $noteController->togglePin($data);
        break;
    case 'change_color':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $noteController->changeColor($data);
        break;
    case 'share_note':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $shareController->shareNote($data);
        break;
    case 'get_shares':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $shareController->getShares();
        break;
    case 'update_share':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $shareController->updateShare($data);
        break;
    case 'revoke_share':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $shareController->revokeShare($data);
        break;
    case 'get_profile':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $userController->getProfile();
        break;
    case 'update_profile':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $userController->updateProfile();
        break;
    case 'change_password':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $userController->changePassword();
        break;
    case 'get_labels':
        if ($_SERVER['REQUEST_METHOD'] === 'GET') $labelController->getAll();
        break;
    case 'create_label':
        if ($_SERVER['REQUEST_METHOD'] === 'POST') $labelController->create();
        break;
    case 'update_label':
        if ($_SERVER['REQUEST_METHOD'] === 'PUT') $labelController->update();
        break;
    case 'delete_label':
        if ($_SERVER['REQUEST_METHOD'] === 'DELETE') $labelController->delete();
        break;

    default:
        http_response_code(404);
        echo json_encode(["message" => "Endpoint không tồn tại."]);
        break;
}
?>