<?php
// Bắt buộc phải có dòng này để lấy thư viện
require_once dirname(__DIR__) . '/vendor/autoload.php';

use Ratchet\MessageComponentInterface;
use Ratchet\ConnectionInterface;

class WebSocketHandler implements MessageComponentInterface {
    protected $clients;
    protected $subscriptions; // Lưu thông tin: Trình duyệt nào đang xem Note ID nào

    public function __construct() {
        $this->clients = new \SplObjectStorage;
        $this->subscriptions = [];
        echo "📡 Trạm phát sóng WebSocket đã khởi động...\n";
    }

    public function onOpen(ConnectionInterface $conn) {
        $this->clients->attach($conn);
        echo "Mới có người kết nối! (ID: {$conn->resourceId})\n";
    }

    public function onMessage(ConnectionInterface $from, $msg) {
        $data = json_decode($msg, true);

        // Kịch bản 1: User gửi lệnh "join" khi vừa mở màn hình ghi chú
        if (isset($data['action']) && $data['action'] === 'join') {
            $note_id = $data['note_id'];
            $this->subscriptions[$from->resourceId] = $note_id;
            echo "User {$from->resourceId} vừa tham gia xem Note ID: $note_id\n";
            return;
        }

        // Kịch bản 2: User gửi lệnh "edit" khi đang gõ phím
        if (isset($data['action']) && $data['action'] === 'edit') {
            $note_id = $data['note_id'];
            
            // Phát sóng cho TẤT CẢ những người đang xem CÙNG ghi chú này (trừ người vừa gửi)
            foreach ($this->clients as $client) {
                if ($from !== $client) {
                    if (isset($this->subscriptions[$client->resourceId]) && $this->subscriptions[$client->resourceId] == $note_id) {
                        $client->send(json_encode([
                            'action' => 'update',
                            'note_id' => $note_id,
                            'title' => $data['title'],
                            'content' => $data['content']
                        ]));
                    }
                }
            }
        }
    }

    public function onClose(ConnectionInterface $conn) {
        $this->clients->detach($conn);
        unset($this->subscriptions[$conn->resourceId]); // Xóa phòng khi họ thoát
        echo "Người dùng {$conn->resourceId} đã thoát\n";
    }

    public function onError(ConnectionInterface $conn, \Exception $e) {
        echo "Lỗi: {$e->getMessage()}\n";
        $conn->close();
    }
}
?>