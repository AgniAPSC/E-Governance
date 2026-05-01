<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('admin');
$pdo  = get_db();

$body        = get_json_body();
$name        = trim($body['name']        ?? '');
$description = trim($body['description'] ?? '');

if (!$name) {
    json_response('error', null, 'Department name is required.', 400);
}

// Check duplicate
$stmt = $pdo->prepare('SELECT id FROM departments WHERE name = ?');
$stmt->execute([$name]);
if ($stmt->fetch()) {
    json_response('error', null, 'A department with this name already exists.', 409);
}

$stmt = $pdo->prepare('INSERT INTO departments (name, description) VALUES (?, ?)');
$stmt->execute([$name, $description]);

json_response('success', ['id' => (int) $pdo->lastInsertId(), 'name' => $name], '', 201);
