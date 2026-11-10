<?php
require __DIR__ . '/bootstrap.php';

$admin = require_admin($database);
$query = $database->query('SELECT id, user_id, action, ip_address, user_agent, created_at FROM audit_log ORDER BY id DESC LIMIT 100');
respond(200, ['user' => public_user($admin), 'audit' => $query->fetchAll(PDO::FETCH_ASSOC)]);
