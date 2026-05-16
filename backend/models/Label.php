<?php
class Label {
    private $conn;
    private $table = "labels";

    public function __construct($db) {
        $this->conn = $db;
    }

    // 1. Lấy danh sách tất cả nhãn của người dùng
    public function getAllByUser($user_id) {
        $query = "SELECT id, name FROM " . $this->table . " WHERE user_id = :user_id ORDER BY name ASC";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // 2. Tạo nhãn mới
    public function create($user_id, $name) {
        $query = "INSERT INTO " . $this->table . " (user_id, name) VALUES (:user_id, :name)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':name', $name);
        if ($stmt->execute()) return $this->conn->lastInsertId();
        return false;
    }

    // 3. Đổi tên nhãn (Tự động cập nhật trên mọi ghi chú)
    public function update($id, $user_id, $name) {
        $query = "UPDATE " . $this->table . " SET name = :name WHERE id = :id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $user_id);
        return $stmt->execute();
    }

    // 4. Xóa nhãn (Không làm mất ghi chú nhờ cấu trúc ON DELETE CASCADE)
    public function delete($id, $user_id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $user_id);
        return $stmt->execute();
    }


    // Lấy danh sách ID nhãn của 1 ghi chú
    public function getLabelsByNote($note_id) {
        $query = "SELECT label_id FROM note_labels WHERE note_id = :note_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':note_id', $note_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_COLUMN);
    }

    // Cập nhật nhãn cho ghi chú (Xóa cũ, gắn mới)
    public function syncNoteLabels($note_id, $label_ids) {
        // Xóa hết nhãn cũ của ghi chú này
        $queryDelete = "DELETE FROM note_labels WHERE note_id = :note_id";
        $stmtDel = $this->conn->prepare($queryDelete);
        $stmtDel->bindParam(':note_id', $note_id);
        $stmtDel->execute();

        // Nếu mảng rỗng thì dừng (nghĩa là người dùng gỡ hết nhãn khỏi ghi chú)
        if (empty($label_ids)) return true;

        // Thêm lại các nhãn mới
        $queryInsert = "INSERT INTO note_labels (note_id, label_id) VALUES (:note_id, :label_id)";
        $stmtIns = $this->conn->prepare($queryInsert);
        foreach ($label_ids as $label_id) {
            $stmtIns->bindParam(':note_id', $note_id);
            $stmtIns->bindParam(':label_id', $label_id);
            $stmtIns->execute();
        }
        return true;
    }
}
?>