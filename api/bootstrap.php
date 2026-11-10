<?php
declare(strict_types=1);

session_set_cookie_params([
    'httponly' => true,
    'samesite' => 'Lax',
    'secure' => !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off',
    'path' => '/',
]);
session_start();

header('Content-Type: application/json');

$dataDirectory = dirname(__DIR__) . DIRECTORY_SEPARATOR . 'data';
if (!is_dir($dataDirectory) && !mkdir($dataDirectory, 0750, true) && !is_dir($dataDirectory)) {
    respond(500, ['error' => 'Unable to initialize the data directory.']);
}

try {
    $database = new PDO('sqlite:' . $dataDirectory . DIRECTORY_SEPARATOR . 'users.sqlite');
    $database->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $database->exec('CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT "user",
        created_at TEXT NOT NULL
    )');
    foreach ([
        'role TEXT NOT NULL DEFAULT "user"',
        'student_id TEXT',
        'id_document TEXT',
        'verification_status TEXT NOT NULL DEFAULT "pending"',
        'verification_note TEXT',
        'verified_at TEXT',
    ] as $column) {
        try {
            $database->exec("ALTER TABLE users ADD COLUMN {$column}");
        } catch (Throwable $error) {
            if (!str_contains(strtolower($error->getMessage()), 'duplicate column')) {
                throw $error;
            }
        }
    }
    $database->exec('CREATE TABLE IF NOT EXISTS audit_log (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        action TEXT NOT NULL,
        ip_address TEXT,
        user_agent TEXT,
        created_at TEXT NOT NULL
    )');
    $database->exec('CREATE TABLE IF NOT EXISTS stamp_cards (
        user_id TEXT PRIMARY KEY,
        stamps INTEGER NOT NULL DEFAULT 0,
        reward_redeemed INTEGER NOT NULL DEFAULT 0,
        updated_at TEXT NOT NULL
    )');
    $database->exec('CREATE TABLE IF NOT EXISTS purchase_stamps (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT NOT NULL,
        staff_id TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');
    $database->exec('CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL,
        stock INTEGER NOT NULL DEFAULT 0,
        active INTEGER NOT NULL DEFAULT 1
    )');
    $database->exec('CREATE TABLE IF NOT EXISTS shifts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id TEXT NOT NULL,
        opened_at TEXT NOT NULL,
        closed_at TEXT,
        opening_cash INTEGER NOT NULL DEFAULT 0,
        closing_cash INTEGER
    )');
    $database->exec('CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        staff_id TEXT NOT NULL,
        shift_id INTEGER NOT NULL,
        user_id TEXT,
        subtotal INTEGER NOT NULL,
        discount INTEGER NOT NULL DEFAULT 0,
        total INTEGER NOT NULL,
        payment_method TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT "completed",
        created_at TEXT NOT NULL
    )');
    $database->exec('CREATE TABLE IF NOT EXISTS sale_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price INTEGER NOT NULL
    )');
    $database->exec('CREATE TABLE IF NOT EXISTS refunds (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_id INTEGER NOT NULL,
        staff_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');
    $database->exec('CREATE TABLE IF NOT EXISTS stock_movements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        staff_id TEXT NOT NULL,
        type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        reason TEXT NOT NULL,
        created_at TEXT NOT NULL
    )');
    if ((int)$database->query('SELECT COUNT(*) FROM products')->fetchColumn() === 0) {
        $seed = $database->prepare('INSERT INTO products (name, price, stock) VALUES (?, ?, ?)');
        foreach ([['Muscovado Latte', 140, 100], ['Calamansi Cold Brew', 130, 100], ['Ube Cream Coffee', 150, 100], ['Classic Americano', 110, 100]] as $product) {
            $seed->execute($product);
        }
    }
} catch (Throwable $error) {
    error_log($error->getMessage());
    respond(500, ['error' => 'The database is not available. Enable PHP SQLite in XAMPP.']);
}

function respond(int $status, array $body): never
{
    http_response_code($status);
    echo json_encode($body);
    exit;
}

function request_body(): array
{
    $body = json_decode(file_get_contents('php://input'), true);
    return is_array($body) ? $body : [];
}

function public_user(array $user): array
{
    return [
        'id' => $user['id'],
        'name' => $user['name'],
        'email' => $user['email'],
        'role' => $user['role'] ?? 'user',
        'verification_status' => $user['verification_status'] ?? null,
    ];
}

function current_user(PDO $database): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    $query = $database->prepare('SELECT id, name, email, role, verification_status FROM users WHERE id = :id');
    $query->execute(['id' => $_SESSION['user_id']]);
    $user = $query->fetch(PDO::FETCH_ASSOC);
    return $user ?: null;
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function require_csrf(): void
{
    $provided = $_SERVER['HTTP_X_CSRF_TOKEN'] ?? '';
    if (!$provided || !hash_equals(csrf_token(), $provided)) {
        respond(419, ['error' => 'Your session expired. Refresh the page and try again.']);
    }
}

function audit(PDO $database, ?string $userId, string $action): void
{
    $query = $database->prepare('INSERT INTO audit_log (user_id, action, ip_address, user_agent, created_at) VALUES (:user_id, :action, :ip, :agent, :created_at)');
    $query->execute([
        'user_id' => $userId,
        'action' => $action,
        'ip' => $_SERVER['REMOTE_ADDR'] ?? null,
        'agent' => substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 500),
        'created_at' => gmdate('c'),
    ]);
}

function require_admin(PDO $database): array
{
    $user = current_user($database);
    if (!$user || ($user['role'] ?? 'user') !== 'admin') {
        respond(403, ['error' => 'Administrator access is required.']);
    }
    return $user;
}

function require_staff(PDO $database): array
{
    $user = current_user($database);
    if (!$user || !in_array($user['role'] ?? 'user', ['staff', 'admin'], true)) {
        respond(403, ['error' => 'Staff access is required.']);
    }
    return $user;
}
