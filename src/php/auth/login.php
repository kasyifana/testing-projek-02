<?php
// src/php/auth/login.php
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
        unset($user['password_hash']); // Remove sensitive info
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Password salah.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Email tidak ditemukan.']);
}
$stmt->close();
$conn->close();
?>
