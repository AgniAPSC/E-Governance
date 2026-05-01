<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('admin');
$pdo  = get_db();

$body = get_json_body();
$id   = (int) ($body['id'] ?? $_GET['id'] ?? 0);

if (!$id) {
    json_response('error', null, 'Officer ID is required.', 400);
}

$stmt = $pdo->prepare("SELECT id FROM users WHERE id = ? AND role = 'officer'");
$stmt->execute([$id]);
if (!$stmt->fetch()) {
    json_response('error', null, 'Officer not found.', 404);
}

// Soft delete: deactivate
$pdo->prepare('UPDATE users SET is_active = 0 WHERE id = ?')->execute([$id]);

json_response('success', ['message' => 'Officer deactivated successfully.']);
