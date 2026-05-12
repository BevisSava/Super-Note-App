<?php
// Chỉ cần 1 dòng này là đủ gọi toàn bộ thư viện (Do Composer tự động lo)
require_once __DIR__ . '/../vendor/autoload.php'; 

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class MailService {
    public static function sendMail($to_email, $subject, $body) {
        $mail = new PHPMailer(true);
        $mail->SMTPDebug = 2;
        try {
            $mail->isSMTP();
            $mail->Host       = 'smtp.gmail.com'; 
            $mail->SMTPAuth   = true;
            $mail->Username   = 'admintestk6@gmail.com'; 
            $mail->Password   = 'smhq fytw lilo xfel';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; 
            $mail->Port       = 465;
            $mail->CharSet = 'UTF-8';
            $mail->setFrom('admintestk6@gmail.com', 'Hệ thống Note App');
            $mail->addAddress($to_email);
            $mail->isHTML(true); 
            $mail->Subject = $subject;
            $mail->Body    = $body;

            $mail->send();
            return true;
        } catch (Exception $e) {
            return false;
        }
    }
}