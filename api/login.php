<?php
require __DIR__ . '/bootstrap.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Method not allowed.']);
}
require_csrf();

$body = request_body();
$email = strtolower(trim((string)($body['email'] ?? '')));
$query = $database->prepare('SELECT id, name, email, password, role, verification_status FROM users WHERE email = :email');
$query->execute(['email' => $email]);
$user = $query->fetch(PDO::FETCH_ASSOC);

if (!$user || !password_verify((string)($body['password'] ?? ''), $user['password'])) {
    audit($database, $user['id'] ?? null, 'login_failure');
    respond(401, ['error' => 'Email or password is incorrect.']);
}

session_regenerate_id(true);
$_SESSION['user_id'] = $user['id'];
audit($database, $user['id'], 'login_success');
respond(200, ['user' => public_user($user)]);
