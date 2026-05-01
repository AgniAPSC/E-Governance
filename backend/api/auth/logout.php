<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth();
$pdo  = get_db();

$header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
preg_match('/^Bearer\s+(.+)$/i', $header, $m);
$token = $m[1] ?? '';

$pdo->prepare('DELETE FROM user_tokens WHERE token = ?')->execute([$token]);

json_response('success', ['message' => 'Logged out successfully.']);
