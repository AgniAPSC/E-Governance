<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response('error', null, 'Method not allowed.', 405);
}

$body = get_json_body();
$name  = trim($body['name']  ?? '');
$email = trim($body['email'] ?? '');
$pass  = $body['password']   ?? '';

// Validation
if (!$name || !$email || !$pass) {
    json_response('error', null, 'Name, email, and password are required.', 400);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    json_response('error', null, 'Invalid email address.', 400);
}
if (strlen($pass) < 6) {
    json_response('error', null, 'Password must be at least 6 characters.', 400);
}

$pdo = get_db();

// Check duplicate email
$stmt = $pdo->prepare('SELECT id FROM users WHERE email = ?');
$stmt->execute([$email]);
if ($stmt->fetch()) {
    json_response('error', null, 'Email is already registered.', 409);
}

$hash = password_hash($pass, PASSWORD_DEFAULT);

$stmt = $pdo->prepare(
    'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, "citizen")'
);
$stmt->execute([$name, $email, $hash]);
$user_id = $pdo->lastInsertId();

json_response('success', [
    'user_id' => (int) $user_id,
    'name'    => $name,
    'role'    => 'citizen',
]);
