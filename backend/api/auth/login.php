<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response('error', null, 'Method not allowed.', 405);
}

$body  = get_json_body();
$email = trim($body['email']    ?? '');
$pass  = $body['password']      ?? '';

if (!$email || !$pass) {
    json_response('error', null, 'Email and password are required.', 400);
}

$pdo = get_db();

$stmt = $pdo->prepare(
    'SELECT id, name, email, password_hash, role, department_id, is_active
     FROM users WHERE email = ?'
);
$stmt->execute([$email]);
$user = $stmt->fetch();

if (!$user || !password_verify($pass, $user['password_hash'])) {
    json_response('error', null, 'Invalid email or password.', 401);
}
if ($user['is_active'] != 1) {
    json_response('error', null, 'Your account has been deactivated. Contact an administrator.', 403);
}

// Generate token
$token      = bin2hex(random_bytes(32)); // 64-char hex
$expires_at = date('Y-m-d H:i:s', time() + TOKEN_EXPIRY_HOURS * 3600);

// Delete old tokens for this user, then insert new one
$pdo->prepare('DELETE FROM user_tokens WHERE user_id = ?')->execute([$user['id']]);
$stmt = $pdo->prepare(
    'INSERT INTO user_tokens (user_id, token, expires_at) VALUES (?, ?, ?)'
);
$stmt->execute([$user['id'], $token, $expires_at]);

json_response('success', [
    'token' => $token,
    'user'  => [
        'id'            => (int) $user['id'],
        'name'          => $user['name'],
        'email'         => $user['email'],
        'role'          => $user['role'],
        'department_id' => $user['department_id'] ? (int) $user['department_id'] : null,
    ],
]);
