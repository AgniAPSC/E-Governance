<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('admin');
$pdo  = get_db();

$body        = get_json_body();
$id          = (int) ($body['id']          ?? 0);
$name        = trim($body['name']          ?? '');
$description = trim($body['description']   ?? '');

if (!$id || !$name) {
    json_response('error', null, 'ID and name are required.', 400);
}

// Check exists
$stmt = $pdo->prepare('SELECT id FROM departments WHERE id = ?');
$stmt->execute([$id]);
if (!$stmt->fetch()) {
    json_response('error', null, 'Department not found.', 404);
}

// Check duplicate name for OTHER dept
$stmt = $pdo->prepare('SELECT id FROM departments WHERE name = ? AND id != ?');
$stmt->execute([$name, $id]);
if ($stmt->fetch()) {
    json_response('error', null, 'Another department with this name already exists.', 409);
}

$pdo->prepare('UPDATE departments SET name = ?, description = ? WHERE id = ?')
    ->execute([$name, $description, $id]);

json_response('success', ['id' => $id, 'name' => $name]);
