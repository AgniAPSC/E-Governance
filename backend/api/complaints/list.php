<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth();
$pdo  = get_db();

// Filters from query string
$status        = $_GET['status']        ?? '';
$department_id = (int) ($_GET['department_id'] ?? 0);
$page          = max(1, (int) ($_GET['page']   ?? 1));
$limit         = max(1, min(50, (int) ($_GET['limit'] ?? 20)));
$offset        = ($page - 1) * $limit;

$where  = [];
$params = [];

// Role-based filtering
if ($user['role'] === 'citizen') {
    $where[]  = 'c.citizen_id = ?';
    $params[] = $user['id'];
} elseif ($user['role'] === 'officer') {
    $where[]  = 'c.department_id = ?';
    $params[] = $user['department_id'];
}
// Admin sees all

if ($status) {
    $allowed = ['Submitted','Under Review','In Progress','Resolved','Rejected'];
    if (in_array($status, $allowed, true)) {
        $where[]  = 'c.status = ?';
        $params[] = $status;
    }
}
if ($department_id && $user['role'] === 'admin') {
    $where[]  = 'c.department_id = ?';
    $params[] = $department_id;
}

$whereClause = $where ? ('WHERE ' . implode(' AND ', $where)) : '';

// Count total
$countSql = "SELECT COUNT(*) FROM complaints c $whereClause";
$countStmt = $pdo->prepare($countSql);
$countStmt->execute($params);
$total = (int) $countStmt->fetchColumn();

// Fetch page
$sql = "
    SELECT c.id, c.reference_number, c.title, c.status, c.priority,
           c.created_at, c.updated_at,
           d.name AS department_name,
           u.name AS citizen_name
    FROM complaints c
    JOIN departments d ON c.department_id = d.id
    JOIN users u       ON c.citizen_id    = u.id
    $whereClause
    ORDER BY c.created_at DESC
    LIMIT ? OFFSET ?
";
$params[] = $limit;
$params[] = $offset;

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$complaints = $stmt->fetchAll();

json_response('success', [
    'complaints' => $complaints,
    'total'      => $total,
    'page'       => $page,
    'limit'      => $limit,
]);
