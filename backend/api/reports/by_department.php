<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('admin');
$pdo  = get_db();

$stmt = $pdo->query("
    SELECT d.id, d.name AS department_name,
           COUNT(c.id)                                          AS total,
           SUM(c.status = 'Submitted')                         AS submitted,
           SUM(c.status = 'Under Review')                      AS under_review,
           SUM(c.status = 'In Progress')                       AS in_progress,
           SUM(c.status = 'Resolved')                          AS resolved,
           SUM(c.status = 'Rejected')                          AS rejected
    FROM departments d
    LEFT JOIN complaints c ON c.department_id = d.id
    WHERE d.is_active = 1
    GROUP BY d.id, d.name
    ORDER BY total DESC
");

json_response('success', ['departments' => $stmt->fetchAll()]);
