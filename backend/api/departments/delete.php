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
    json_response('error', null, 'Department ID is required.', 400);
}

$stmt = $pdo->prepare('SELECT id FROM departments WHERE id = ?');
$stmt->execute([$id]);
if (!$stmt->fetch()) {
    json_response('error', null, 'Department not found.', 404);
}

// Soft delete
$pdo->prepare('UPDATE departments SET is_active = 0 WHERE id = ?')->execute([$id]);

json_response('success', ['message' => 'Department deactivated successfully.']);
