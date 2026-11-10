<?php
require __DIR__ . '/bootstrap.php';

$staff = require_staff($database);
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $search = trim((string)($_GET['q'] ?? ''));
    $like = '%' . $search . '%';
    $query = $database->prepare("SELECT id, name, email, student_id, verification_status, verification_note, created_at
        FROM users
        WHERE role = 'user' AND student_id IS NOT NULL AND student_id <> ''
        AND verification_status = 'pending'
        AND (:search = '' OR name LIKE :like OR email LIKE :like OR student_id LIKE :like)
        ORDER BY CASE verification_status WHEN 'pending' THEN 0 ELSE 1 END, created_at DESC");
    $query->execute(['search' => $search, 'like' => $like]);
    $students = $query->fetchAll(PDO::FETCH_ASSOC);
    $cards = $database->prepare('SELECT u.id, u.name, u.email, u.student_id, c.stamps, c.reward_redeemed
        FROM users u LEFT JOIN stamp_cards c ON c.user_id = u.id
        WHERE u.role = "user" AND u.verification_status = "approved"
        AND (:search = "" OR u.name LIKE :like OR u.email LIKE :like OR u.student_id LIKE :like)
        ORDER BY u.name');
    $cards->execute(['search' => $search, 'like' => $like]);
    respond(200, ['user' => public_user($staff), 'students' => $students, 'members' => $cards->fetchAll(PDO::FETCH_ASSOC)]);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(405, ['error' => 'Method not allowed.']);
}
require_csrf();
$body = request_body();
$studentId = trim((string)($body['student_id'] ?? ''));
$decision = $body['decision'] ?? '';
$note = trim((string)($body['note'] ?? ''));
if (($body['action'] ?? '') === 'delete_user') {
    $memberId = trim((string)($body['user_id'] ?? ''));
    if (!$memberId || $memberId === $staff['id']) {
        respond(400, ['error' => 'Choose a valid student account.']);
    }
    $memberQuery = $database->prepare("SELECT id, id_document FROM users WHERE id = :id AND role = 'user' AND verification_status = 'approved'");
    $memberQuery->execute(['id' => $memberId]);
    $member = $memberQuery->fetch(PDO::FETCH_ASSOC);
    if (!$member) {
        respond(404, ['error' => 'Approved student account not found.']);
    }
    $database->beginTransaction();
    $database->prepare('UPDATE sales SET user_id = NULL WHERE user_id = :id')->execute(['id' => $memberId]);
    $database->prepare('DELETE FROM purchase_stamps WHERE user_id = :id')->execute(['id' => $memberId]);
    $database->prepare('DELETE FROM stamp_cards WHERE user_id = :id')->execute(['id' => $memberId]);
    audit($database, $staff['id'], 'student_account_deleted');
    $database->prepare('DELETE FROM users WHERE id = :id')->execute(['id' => $memberId]);
    $database->commit();
    if (!empty($member['id_document']) && is_file($member['id_document'])) {
        unlink($member['id_document']);
    }
    respond(200, ['ok' => true]);
}
if (($body['action'] ?? '') === 'stamp') {
    $memberId = trim((string)($body['user_id'] ?? ''));
    if (!$memberId) {
        respond(400, ['error' => 'Choose a member first.']);
    }
    try {
        $database->beginTransaction();
        $member = $database->prepare("SELECT id FROM users WHERE id = :id AND role = 'user' AND verification_status = 'approved'");
        $member->execute(['id' => $memberId]);
        if (!$member->fetch()) {
            $database->rollBack();
            respond(404, ['error' => 'Approved student not found.']);
        }
        $card = $database->prepare('SELECT stamps, reward_redeemed FROM stamp_cards WHERE user_id = :id');
        $card->execute(['id' => $memberId]);
        $current = $card->fetch(PDO::FETCH_ASSOC) ?: ['stamps' => 0, 'reward_redeemed' => 0];
        if ((int)$current['stamps'] >= 9) {
            $database->rollBack();
            respond(409, ['error' => 'This card is complete. Redeem the free drink before starting another card.']);
        }
        $next = (int)$current['stamps'] + 1;
        $upsert = $database->prepare('INSERT INTO stamp_cards (user_id, stamps, reward_redeemed, updated_at) VALUES (:id, :stamps, 0, :updated) ON CONFLICT(user_id) DO UPDATE SET stamps = excluded.stamps, reward_redeemed = 0, updated_at = excluded.updated_at');
        $upsert->execute(['id' => $memberId, 'stamps' => $next, 'updated' => gmdate('c')]);
        $purchase = $database->prepare('INSERT INTO purchase_stamps (user_id, staff_id, created_at) VALUES (:user, :staff, :created)');
        $purchase->execute(['user' => $memberId, 'staff' => $staff['id'], 'created' => gmdate('c')]);
        audit($database, $staff['id'], 'stamp_added');
        $database->commit();
        respond(200, ['ok' => true, 'stamps' => $next, 'reward_available' => $next === 9]);
    } catch (Throwable $error) {
        if ($database->inTransaction()) $database->rollBack();
        throw $error;
    }
}
if (($body['action'] ?? '') === 'redeem') {
    $memberId = trim((string)($body['user_id'] ?? ''));
    $redeem = $database->prepare("UPDATE stamp_cards SET stamps = 0, reward_redeemed = 1, updated_at = :updated WHERE user_id = :id AND stamps >= 9 AND reward_redeemed = 0");
    $redeem->execute(['id' => $memberId, 'updated' => gmdate('c')]);
    if ($redeem->rowCount() !== 1) {
        respond(409, ['error' => 'This member does not have an available reward.']);
    }
    audit($database, $staff['id'], 'free_drink_redeemed');
    respond(200, ['ok' => true, 'stamps' => 0]);
}
if (!$studentId || !in_array($decision, ['approve', 'reject'], true)) {
    respond(400, ['error' => 'Choose a student and a valid decision.']);
}
$status = $decision === 'approve' ? 'approved' : 'rejected';
$query = $database->prepare("UPDATE users SET verification_status = :status, verification_note = :note, verified_at = :verified_at WHERE id = :id AND role = 'user'");
$query->execute(['status' => $status, 'note' => $note ?: null, 'verified_at' => gmdate('c'), 'id' => $studentId]);
if ($query->rowCount() !== 1) {
    respond(404, ['error' => 'Student application not found.']);
}
audit($database, $staff['id'], 'student_' . $status);
respond(200, ['ok' => true, 'status' => $status]);
