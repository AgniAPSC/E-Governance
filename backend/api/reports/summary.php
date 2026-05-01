<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('admin');
$pdo  = get_db();

// Total complaints
$total = (int) $pdo->query('SELECT COUNT(*) FROM complaints')->fetchColumn();

// By status
$statusStmt = $pdo->query(
    'SELECT status, COUNT(*) AS count FROM complaints GROUP BY status'
);
$byStatus = [];
foreach ($statusStmt->fetchAll() as $row) {
    $byStatus[$row['status']] = (int) $row['count'];
}

// By role counts
$citizenCount = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role='citizen' AND is_active=1")->fetchColumn();
$officerCount = (int) $pdo->query("SELECT COUNT(*) FROM users WHERE role='officer' AND is_active=1")->fetchColumn();
$deptCount    = (int) $pdo->query("SELECT COUNT(*) FROM departments WHERE is_active=1")->fetchColumn();

// Recent complaints (last 5)
$recent = $pdo->query("
    SELECT c.id, c.reference_number, c.title, c.status, c.priority, c.created_at,
           d.name AS department_name, u.name AS citizen_name
    FROM complaints c
    JOIN departments d ON c.department_id = d.id
    JOIN users u ON c.citizen_id = u.id
    ORDER BY c.created_at DESC
    LIMIT 5
")->fetchAll();

json_response('success', [
    'total_complaints' => $total,
    'by_status'        => $byStatus,
    'citizen_count'    => $citizenCount,
    'officer_count'    => $officerCount,
    'department_count' => $deptCount,
    'recent_complaints'=> $recent,
]);
