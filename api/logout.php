<?php
require __DIR__ . '/bootstrap.php';

require_csrf();
audit($database, $_SESSION['user_id'] ?? null, 'logout');
$_SESSION = [];
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', time() - 42000, $params['path'], '', $params['secure'], $params['httponly']);
}
session_destroy();
respond(200, ['ok' => true]);
