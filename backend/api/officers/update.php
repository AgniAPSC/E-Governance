<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('admin');
$pdo  = get_db();

$body          = get_json_body();
$id            = (int) ($body['id']            ?? 0);
$name          = trim($body['name']            ?? '');
$email         = trim($body['email']           ?? '');
$department_id = (int) ($body['department_id'] ?? 0);
$is_active     = isset($body['is_active']) ? (int) $body['is_active'] : null;
$password      = $body['password'] ?? '';

if (!$id || !$name || !$email || !$department_id) {
    json_response('error', null, 'ID, name, email, and department are required.', 400);
}

$stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'officer'");
$stmt->execute([$id]);
if (!$stmt->fetch()) {
    json_response('error', null, 'Officer not found.', 404);
}

// Check email uniqueness for OTHERS
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ? AND id != ?');
$stmt->execute([$email, $id]);
if ($stmt->fetch()) {
    json_response('error', null, 'Email is already in use.', 409);
}

$updates  = ['name = ?', 'email = ?', 'department_id = ?'];
$params   = [$name, $email, $department_id];

if ($is_active !== null) {
    $updates[] = 'is_active = ?';
    $params[]  = $is_active ? 1 : 0;
}
if ($password && strlen($password) >= 6) {
    $updates[] = 'password_hash = ?';
    $params[]  = password_hash($password, PASSWORD_DEFAULT);
}

$params[] = $id;
$sql = 'UPDATE users SET ' . implode(', ', $updates) . ' WHERE id = ?';
$pdo->prepare($sql)->execute($params);

json_response('success', ['id' => $id, 'name' => $name]);
