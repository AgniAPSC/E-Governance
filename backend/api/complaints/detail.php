<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth();
$pdo  = get_db();

$id = (int) ($_GET['id'] ?? 0);
if (!$id) {
    json_response('error', null, 'Complaint ID is required.', 400);
}

// Fetch complaint
$stmt = $pdo->prepare("
    SELECT c.id, c.reference_number, c.title, c.description, c.status, c.priority,
           c.created_at, c.updated_at,
           c.citizen_id, c.department_id,
           d.name AS department_name,
           u.name AS citizen_name, u.email AS citizen_email
    FROM complaints c
    JOIN departments d ON c.department_id = d.id
    JOIN users u       ON c.citizen_id    = u.id
    WHERE c.id = ?
");
$stmt->execute([$id]);
$complaint = $stmt->fetch();

if (!$complaint) {
    json_response('error', null, 'Complaint not found.', 404);
}

// Access control
if ($user['role'] === 'citizen' && $complaint['citizen_id'] != $user['id']) {
    json_response('error', null, 'Access denied.', 403);
}
if ($user['role'] === 'officer' && $complaint['department_id'] != $user['department_id']) {
    json_response('error', null, 'Access denied.', 403);
}

// Fetch updates (history)
$histStmt = $pdo->prepare("
    SELECT cu.id, cu.old_status, cu.new_status, cu.remarks, cu.created_at,
           u.name AS updated_by_name, u.role AS updated_by_role
    FROM complaint_updates cu
    JOIN users u ON cu.updated_by = u.id
    WHERE cu.complaint_id = ?
    ORDER BY cu.created_at ASC
");
$histStmt->execute([$id]);
$updates = $histStmt->fetchAll();

$complaint['updates'] = $updates;

json_response('success', $complaint);
