<?php
require_once __DIR__ . '/../config/db.php';

set_cors_headers();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    json_response('error', null, 'Method not allowed.', 405);
}

$user = require_auth();

json_response('success', [
    'id'            => (int) $user['id'],
    'name'          => $user['name'],
    'email'         => $user['email'],
    'role'          => $user['role'],
    'department_id' => $user['department_id'] ? (int) $user['department_id'] : null,
]);
