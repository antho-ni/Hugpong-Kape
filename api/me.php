<?php
require __DIR__ . '/bootstrap.php';

$user = current_user($database);
if (!$user) {
    respond(401, ['error' => 'Not authenticated.']);
}
respond(200, ['user' => $user]);
