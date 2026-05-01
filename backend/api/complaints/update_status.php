<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth(['officer', 'admin']);
$pdo  = get_db();

$body         = get_json_body();
$complaint_id = (int) ($body['complaint_id'] ?? 0);
$new_status   = $body['new_status']          ?? '';
$remarks      = trim($body['remarks']        ?? '');

$allowed_statuses = ['Submitted','Under Review','In Progress','Resolved','Rejected'];

if (!$complaint_id || !$new_status) {
    json_response('error', null, 'Complaint ID and new_status are required.', 400);
}
if (!in_array($new_status, $allowed_statuses, true)) {
    json_response('error', null, 'Invalid status value.', 400);
}

// Fetch complaint
$stmt = $pdo->prepare('SELECT id, department_id, status FROM complaints WHERE id = ?');
$stmt->execute([$complaint_id]);
$complaint = $stmt->fetch();

if (!$complaint) {
    json_response('error', null, 'Complaint not found.', 404);
}

// Officers can only update their department's complaints
if ($user['role'] === 'officer' && $complaint['department_id'] != $user['department_id']) {
    json_response('error', null, 'Access denied: not your department.', 403);
}

$old_status = $complaint['status'];

// Update complaint status
$pdo->prepare('UPDATE complaints SET status = ?, updated_at = NOW() WHERE id = ?')
    ->execute([$new_status, $complaint_id]);

// Log the update
$pdo->prepare(
    'INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, remarks)
     VALUES (?, ?, ?, ?, ?)'
)->execute([$complaint_id, $user['id'], $old_status, $new_status, $remarks]);

json_response('success', [
    'complaint_id' => $complaint_id,
    'old_status'   => $old_status,
    'new_status'   => $new_status,
]);
