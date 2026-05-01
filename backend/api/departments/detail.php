<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('admin');
$pdo  = get_db();

$id = (int) ($_GET['id'] ?? 0);
if (!$id) {
    json_response('error', null, 'Department ID required.', 400);
}

$stmt = $pdo->prepare('SELECT id, name, description, is_active, created_at FROM departments WHERE id = ?');
$stmt->execute([$id]);
$dept = $stmt->fetch();
if (!$dept) {
    json_response('error', null, 'Department not found.', 404);
}

// Officer count
$stmt = $pdo->prepare('SELECT COUNT(*) FROM users WHERE department_id = ? AND role = "officer" AND is_active = 1');
$stmt->execute([$id]);
$dept['officer_count'] = (int) $stmt->fetchColumn();

// Complaint count
$stmt = $pdo->prepare('SELECT COUNT(*) FROM complaints WHERE department_id = ?');
$stmt->execute([$id]);
$dept['complaint_count'] = (int) $stmt->fetchColumn();

json_response('success', $dept);
