<?php
// Nạp thư viện và Controller của bạn
require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/controllers/WebSocketHandler.php';

use Ratchet\Server\IoServer;
use Ratchet\Http\HttpServer;
use Ratchet\WebSocket\WsServer;

// Khởi chạy server (Cổng có thể cấu hình qua biến môi trường)
$port = getenv('WS_PORT') ?: 8081;

$server = IoServer::factory(
    new HttpServer(
        new WsServer(
            new WebSocketHandler()
        )
    ),
    $port
);

echo "🚀 WebSocket Server đang chạy tại: ws://localhost:$port\n";
echo "⚠️ CHÚ Ý: Cứ để cửa sổ Terminal này chạy ngầm, đừng tắt nhé!\n";

$server->run();
?>