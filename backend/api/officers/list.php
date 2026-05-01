<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('admin');
$pdo  = get_db();

$stmt = $pdo->prepare("
    SELECT u.id, u.name, u.email, u.is_active, u.created_at,
           d.id AS department_id, d.name AS department_name
    FROM users u
    LEFT JOIN departments d ON u.department_id = d.id
    WHERE u.role = 'officer'
    ORDER BY u.name ASC
");
$stmt->execute();
$officers = $stmt->fetchAll();

json_response('success', ['officers' => $officers]);
