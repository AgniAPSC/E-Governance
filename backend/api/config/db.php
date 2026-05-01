<?php
// ============================================================
// Database Configuration & Shared Helpers
// e-Governance Grievance Redressal & Tracking System
// ============================================================

define('DB_HOST', '127.0.0.1'); // Fixed host for explicit port routing
define('DB_PORT', '3307');
define('DB_NAME', 'egov_grievance');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_CHARSET', 'utf8mb4');

// Token expiry: 24 hours
define('TOKEN_EXPIRY_HOURS', 24);

/**
 * Set standard CORS & Content-Type headers.
 * Call at the very top of every API endpoint.
 */
function set_cors_headers(): void {
    if (headers_sent()) return;
    header('Access-Control-Allow-Origin: http://localhost:5173');
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
    header('Content-Type: application/json; charset=utf-8');

    // Respond to preflight
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(204);
        exit();
    }
}

/**
 * Return a PDO connection. Exits with JSON error on failure.
 */
function get_db(): PDO {
    static $pdo = null;
    if ($pdo === null) {
        $dsn = sprintf(
            'mysql:host=%s;port=%s;dbname=%s;charset=%s',
            DB_HOST, DB_PORT, DB_NAME, DB_CHARSET
        );
        try {
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            json_response('error', null, 'Database connection failed: ' . $e->getMessage(), 500);
        }
    }
    return $pdo;
}

/**
 * Send a JSON response and exit.
 */
function json_response(string $status, $data = null, string $message = '', int $code = 200): void {
    http_response_code($code);
    $body = ['status' => $status];
    if ($status === 'success') {
        $body['data'] = $data;
    } else {
        $body['message'] = $message;
    }
    echo json_encode($body);
    exit();
}

/**
 * Parse and return the JSON request body.
 */
function get_json_body(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    return is_array($data) ? $data : [];
}

/**
 * Validate the Bearer token from the Authorization header.
 * Returns the user row (id, name, email, role, department_id) or calls json_response on failure.
 */
function require_auth(string|array|null $required_role = null): array {
    $pdo = get_db();

    $header = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    
    // Fallback if Apache strips the HTTP_AUTHORIZATION header natively
    if (empty($header) && function_exists('apache_request_headers')) {
        $requestHeaders = apache_request_headers();
        $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
        if (isset($requestHeaders['Authorization'])) {
            $header = trim($requestHeaders['Authorization']);
        }
    }
    if (!$header || !preg_match('/^Bearer\s+(.+)$/i', $header, $m)) {
        json_response('error', null, 'Authentication required.', 401);
    }
    $token = $m[1];

    $stmt = $pdo->prepare(
        'SELECT t.user_id, t.expires_at,
                u.id, u.name, u.email, u.role, u.department_id, u.is_active
         FROM user_tokens t
         JOIN users u ON t.user_id = u.id
         WHERE t.token = ?'
    );
    $stmt->execute([$token]);
    $row = $stmt->fetch();

    if (!$row) {
        json_response('error', null, 'Invalid or expired token.', 401);
    }
    if ($row['is_active'] != 1) {
        json_response('error', null, 'Account is inactive.', 403);
    }
    if (strtotime($row['expires_at']) < time()) {
        json_response('error', null, 'Token has expired. Please log in again.', 401);
    }
    if ($required_role !== null && is_string($required_role)) {
        if ($row['role'] !== $required_role) {
            json_response('error', null, 'Access denied: insufficient role.', 403);
        }
    }
    if ($required_role !== null && is_array($required_role)) {
        if (!in_array($row['role'], $required_role, true)) {
            json_response('error', null, 'Access denied: insufficient role.', 403);
        }
    }

    return $row;
}

/**
 * Generate a unique grievance reference number like GRV-20260001
 */
function generate_reference_number(PDO $pdo): string {
    $year = date('Y');
    $stmt = $pdo->prepare(
        "SELECT COUNT(*) FROM complaints WHERE reference_number LIKE ?"
    );
    $stmt->execute(["GRV-{$year}%"]);
    $count = (int) $stmt->fetchColumn();
    return sprintf('GRV-%s%04d', $year, $count + 1);
}
