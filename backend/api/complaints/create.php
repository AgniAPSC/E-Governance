<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('citizen');
$pdo  = get_db();

$body          = get_json_body();
$department_id = (int) ($body['department_id'] ?? 0);
$title         = trim($body['title']           ?? '');
$description   = trim($body['description']     ?? '');
$priority      = $body['priority']             ?? 'Medium';

// Validation
if (!$department_id || !$title || !$description) {
    json_response('error', null, 'Department, title, and description are required.', 400);
}
if (!in_array($priority, ['Low', 'Medium', 'High'], true)) {
    $priority = 'Medium';
}

// Check department exists
$stmt = $pdo->prepare('SELECT id FROM departments WHERE id = ? AND is_active = 1');
$stmt->execute([$department_id]);
if (!$stmt->fetch()) {
    json_response('error', null, 'Selected department does not exist.', 404);
}

$ref_number = generate_reference_number($pdo);

$stmt = $pdo->prepare(
    'INSERT INTO complaints (citizen_id, department_id, title, description, priority, reference_number)
     VALUES (?, ?, ?, ?, ?, ?)'
);
$stmt->execute([$user['id'], $department_id, $title, $description, $priority, $ref_number]);
$complaint_id = $pdo->lastInsertId();

// Log initial "Submitted" update
$pdo->prepare(
    'INSERT INTO complaint_updates (complaint_id, updated_by, old_status, new_status, remarks)
     VALUES (?, ?, NULL, "Submitted", "Complaint submitted successfully.")'
)->execute([$complaint_id, $user['id']]);

json_response('success', [
    'complaint_id'     => (int) $complaint_id,
    'reference_number' => $ref_number,
], '', 201);
