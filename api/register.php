<?php
require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Method not allowed.']);
}
require_csrf();

$name = trim((string)($_POST['name'] ?? ''));
$email = strtolower(trim((string)($_POST['email'] ?? '')));
$password = (string)($_POST['password'] ?? '');
$confirmation = (string)($_POST['password_confirmation'] ?? '');
$accountType = ($_POST['account_type'] ?? 'regular') === 'student' ? 'student' : 'regular';
$studentId = trim((string)($_POST['student_id'] ?? ''));
$document = $_FILES['id_document'] ?? null;

if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($password) < 8 || $password !== $confirmation) {
    respond(400, ['error' => 'Enter your name, valid email, and matching password of at least 8 characters.']);
}
$documentName = null;
$verificationStatus = 'approved';
if ($accountType === 'student') {
    if ($studentId === '' || !$document || $document['error'] !== UPLOAD_ERR_OK || $document['size'] > 5 * 1024 * 1024) {
        respond(400, ['error' => 'Student accounts require a school ID and a clear ID image up to 5 MB.']);
    }
    $mime = (new finfo(FILEINFO_MIME_TYPE))->file($document['tmp_name']);
    $allowedMime = ['image/jpeg' => 'jpg', 'image/png' => 'png', 'image/webp' => 'webp'];
    if (!isset($allowedMime[$mime])) {
        respond(400, ['error' => 'ID proof must be a JPG, PNG, or WebP image.']);
    }
    $verificationStatus = 'pending';
}

$check = $database->prepare('SELECT id FROM users WHERE email = :email');
$check->execute(['email' => $email]);
if ($check->fetch()) {
    respond(409, ['error' => 'An account with that email already exists.']);
}

$user = [
    'id' => bin2hex(random_bytes(16)),
    'name' => $name,
    'email' => $email,
    'role' => 'user',
];
if ($accountType === 'student') {
    $documentDirectory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'id_documents';
    if (!is_dir($documentDirectory) && !mkdir($documentDirectory, 0750, true) && !is_dir($documentDirectory)) {
        respond(500, ['error' => 'Unable to store the ID proof.']);
    }
    $documentName = $user['id'] . '.' . $allowedMime[$mime];
    if (!move_uploaded_file($document['tmp_name'], $documentDirectory . DIRECTORY_SEPARATOR . $documentName)) {
        respond(500, ['error' => 'Unable to store the ID proof.']);
    }
}
$insert = $database->prepare('INSERT INTO users (id, name, email, password, role, student_id, id_document, verification_status, created_at) VALUES (:id, :name, :email, :password, :role, :student_id, :id_document, :verification_status, :created_at)');
$insert->execute([
    'id' => $user['id'],
    'name' => $name,
    'email' => $email,
    'password' => password_hash($password, PASSWORD_DEFAULT),
    'role' => 'user',
    'student_id' => $studentId,
    'id_document' => $documentName,
    'verification_status' => $verificationStatus,
    'created_at' => gmdate('c'),
]);
session_regenerate_id(true);
$_SESSION['user_id'] = $user['id'];
audit($database, $user['id'], $accountType === 'student' ? 'student_registration_submitted' : 'registration_success');
respond(201, ['user' => $user + ['verification_status' => $verificationStatus]]);
