<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('admin');
$pdo  = get_db();

$body          = get_json_body();
$name          = trim($body['name']          ?? '');
$email         = trim($body['email']         ?? '');
$password      = $body['password']           ?? '';
$department_id = (int) ($body['department_id'] ?? 0);

if (!$name || !$email || !$password || !$department_id) {
    json_response('error', null, 'Name, email, password, and department are required.', 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response('error', null, 'Invalid email address.', 400);
}
if (strlen($password) < 6) {
    json_response('error', null, 'Password must be at least 6 characters.', 400);
}

// Check email uniqueness
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    json_response('error', null, 'Email is already in use.', 409);
}

// Check department exists
$stmt = $pdo->prepare('SELECT id FROM departments WHERE id = ? AND is_active = 1');
$stmt->execute([$department_id]);
if (!$stmt->fetch()) {
    json_response('error', null, 'Department not found.', 404);
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$stmt = $pdo->prepare(
    'INSERT INTO users (name, email, password_hash, role, department_id) VALUES (?, ?, ?, "officer", ?)'
);
$stmt->execute([$name, $email, $hash, $department_id]);

json_response('success', ['id' => (int) $pdo->lastInsertId(), 'name' => $name], '', 201);
