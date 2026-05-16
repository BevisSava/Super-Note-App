<?php
require_once __DIR__ . '/../vendor/autoload.php'; 

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class MailService {
    public static function sendMail($to_email, $subject, $body) {
        $mail = new PHPMailer(true);
        $mail->SMTPDebug = 0;
        try {
            $mail->isSMTP();
            $mail->Host       = getenv('MAIL_HOST') ?: 'smtp.gmail.com'; 
            $mail->SMTPAuth   = true;
            $mail->Username   = getenv('MAIL_USER') ?: ''; 
            $mail->Password   = getenv('MAIL_PASS') ?: '';
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; 
            $mail->Port       = getenv('MAIL_PORT') ?: 587;
            $mail->CharSet = 'UTF-8';
            $mail->setFrom(getenv('MAIL_USER') ?: 'admin@example.com', 'Super Note App');
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