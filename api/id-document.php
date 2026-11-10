<?php
require __DIR__ . '/bootstrap.php';
require_staff($database);

$studentId = trim((string)($_GET['id'] ?? ''));
$query = $database->prepare("SELECT id_document FROM users WHERE id = :id AND role = 'user'");
$query->execute(['id' => $studentId]);
$document = $query->fetchColumn();
if (!$document) {
    http_response_code(404);
    exit;
}
$path = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data' . DIRECTORY_SEPARATOR . 'id_documents' . DIRECTORY_SEPARATOR . basename($document);
if (!is_file($path)) {
    http_response_code(404);
    exit;
}
$mime = (new finfo(FILEINFO_MIME_TYPE))->file($path);
header('Content-Type: ' . $mime);
header('Content-Disposition: inline; filename="student-id-' . $studentId . '"');
readfile($path);
