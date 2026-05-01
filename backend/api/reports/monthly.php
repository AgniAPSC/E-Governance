<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth('admin');
$pdo  = get_db();

// Last 12 months
$stmt = $pdo->query("
    SELECT
        DATE_FORMAT(created_at, '%Y-%m') AS month,
        COUNT(*)                          AS total,
        SUM(status = 'Resolved')          AS resolved,
        SUM(status = 'Rejected')          AS rejected,
        SUM(status NOT IN ('Resolved','Rejected')) AS pending
    FROM complaints
    WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
    GROUP BY month
    ORDER BY month ASC
");

json_response('success', ['monthly' => $stmt->fetchAll()]);
