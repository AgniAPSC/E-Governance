<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth();
$pdo  = get_db();

$stmt = $pdo->prepare('SELECT id, name, description FROM departments WHERE is_active = 1 ORDER BY name ASC');
$stmt->execute();
$departments = $stmt->fetchAll();

json_response('success', ['departments' => $departments]);
