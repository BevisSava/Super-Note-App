<?php
class Note {
    private $conn;
    private $table = "notes";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function getAllByUser($user_id) {
        $query = "SELECT n.id, n.title, n.content, n.color, n.image_url, n.file_url, n.is_pinned, n.created_at, n.updated_at, n.password,
                         CASE WHEN n.user_id = :user_id THEN 1 ELSE 0 END AS is_owner,
                         MAX(s.permission) AS permission, MAX(s.created_at) AS shared_at,
                         MAX(owner.display_name) AS owner_name, MAX(owner.email) AS owner_email,
                         GROUP_CONCAT(DISTINCT l.id) AS label_ids,
                         GROUP_CONCAT(DISTINCT l.name) AS label_names
                  FROM " . $this->table . " n
                  LEFT JOIN shares s ON n.id = s.note_id AND s.shared_with_email = (SELECT email FROM users WHERE id = :user_id)
                  LEFT JOIN users u ON s.shared_with_email = u.email
                  LEFT JOIN users owner ON n.user_id = owner.id
                  LEFT JOIN note_labels nl ON n.id = nl.note_id
                  LEFT JOIN labels l ON nl.label_id = l.id
                  WHERE n.user_id = :user_id OR u.id = :user_id
                  GROUP BY n.id
                  ORDER BY n.is_pinned DESC, n.updated_at DESC";
                  
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function create($user_id, $title, $content, $color, $image_url, $file_url = null) {
       $query = "INSERT INTO " . $this->table . " 
                  (user_id, title, content, color, image_url, file_url) 
                  VALUES (:user_id, :title, :content, :color, :image_url, :file_url)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':color', $color);
        $stmt->bindParam(':image_url', $image_url);
        $stmt->bindParam(':file_url', $file_url);
        
        if($stmt->execute()) return $this->conn->lastInsertId();
        return false;
    }

    public function delete($id, $user_id) {
        $query = "DELETE FROM " . $this->table . " WHERE id = :id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $id = htmlspecialchars(strip_tags($id));
        $user_id = htmlspecialchars(strip_tags($user_id));
        $stmt->bindParam(":id", $id);
        $stmt->bindParam(":user_id", $user_id);
        return $stmt->execute();
    }

    public function update($id, $user_id, $title, $content, $color, $image_url = null, $has_new_image = false, $file_url = null, $has_new_file = false, $remove_image = false, $remove_file = false) {
        $setParts = ["title = :title", "content = :content", "color = :color"];
        if ($has_new_image) $setParts[] = "image_url = :image_url";
        else if ($remove_image) $setParts[] = "image_url = NULL";

        if ($has_new_file) $setParts[] = "file_url = :file_url";
        else if ($remove_file) $setParts[] = "file_url = NULL";
        
        $query = "UPDATE notes SET " . implode(", ", $setParts) . " 
                  WHERE id = :id AND (
                      user_id = :user_id 
                      OR EXISTS (
                          SELECT 1 FROM shares s 
                          JOIN users u ON s.shared_with_email = u.email 
                          WHERE s.note_id = notes.id AND u.id = :user_id AND s.permission = 'edit'
                      )
                  )";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':color', $color);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $user_id);
        if ($has_new_image) {
            $stmt->bindParam(':image_url', $image_url);
        }
        if ($has_new_file) {
            $stmt->bindParam(':file_url', $file_url);
        }

        return $stmt->execute();
    }

    public function getNoteById($id, $user_id) {
        $query = "SELECT * FROM " . $this->table . " WHERE id = :id AND user_id = :user_id LIMIT 1";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function setPassword($id, $user_id, $password_hash) {
        $query = "UPDATE " . $this->table . " SET password = :password WHERE id = :id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':password', $password_hash);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $user_id);
        return $stmt->execute();
    }

    public function updateColor($id, $user_id, $color) {
        $query = "UPDATE " . $this->table . " SET color = :color WHERE id = :id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':color', $color);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $user_id);
        return $stmt->execute();
    }

    public function togglePin($id, $user_id, $is_pinned) {
        $query = "UPDATE " . $this->table . " SET is_pinned = :is_pinned WHERE id = :id AND user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':is_pinned', $is_pinned);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $user_id);
        return $stmt->execute();
    }

    public function share($note_id, $email) {
        $query = "INSERT INTO shares (note_id, shared_with_email) VALUES (:note_id, :email)";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':note_id', $note_id);
        $stmt->bindParam(':email', $email);
        return $stmt->execute();
    }
}
?>