<?php
// src/php/auth/login.php
ini_set('session.cookie_samesite', 'Lax');
ini_set('session.cookie_secure', '0');
session_start();
header('Content-Type: application/json');

require_once __DIR__ . '/../connection.php';

// Get POST data
$data = json_decode(file_get_contents('php://input'), true);
$email = isset($data['email']) ? trim($data['email']) : '';
$password = isset($data['password']) ? $data['password'] : '';

if (!$email || !$password) {
    echo json_encode(['success' => false, 'message' => 'Email dan password wajib diisi.']);
    exit;
}

// Prepare statement to prevent SQL injection
$stmt = $conn->prepare('SELECT id, full_name, email, password_hash, role FROM users WHERE email = ? LIMIT 1');
$stmt->bind_param('s', $email);
$stmt->execute();
$result = $stmt->get_result();

if ($user = $result->fetch_assoc()) {
    // Verify password
    if (password_verify($password, $user['password_hash'])) {
        // Set session data
        $_SESSION['user_email'] = $user['email'];
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['user_role'] = $user['role'];
        
        // Remove sensitive info
        unset($user['password_hash']);
        
        echo json_encode([
            'success' => true, 
            'user' => $user,
            'message' => 'Login berhasil'
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Password salah.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Email tidak ditemukan.']);
}

$stmt->close();
$conn->close();
?>
