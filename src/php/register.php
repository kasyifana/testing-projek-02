<?php
// Enable CORS to allow requests from frontend
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

// If it's a preflight OPTIONS request, return only the headers and exit
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include the database connection file
require_once "connection.php";

// Get JSON data from the request
$json = file_get_contents('php://input');
$data = json_decode($json, true);

// Verify that all required fields are present
if (!isset($data['name']) || !isset($data['email']) || !isset($data['password']) || !isset($data['role'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Extract data from JSON
$name = $conn->real_escape_string($data['name']);
$email = $conn->real_escape_string($data['email']);
$password = $data['password'];
$role = $conn->real_escape_string($data['role']);
$programStudy = isset($data['programStudy']) ? $conn->real_escape_string($data['programStudy']) : null;

// Basic validation
if (empty($name) || empty($email) || empty($password) || empty($role)) {
    echo json_encode(['success' => false, 'message' => 'All fields are required']);
    exit;
}

// Validate email
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(['success' => false, 'message' => 'Invalid email format']);
    exit;
}

// Check if the role is mahasiswa and programStudy is missing
if ($role === 'mahasiswa' && empty($programStudy)) {
    echo json_encode(['success' => false, 'message' => 'Program study is required for students']);
    exit;
}

// Check if email already exists
$checkEmailSql = "SELECT id FROM users WHERE email = '$email'";
$result = $conn->query($checkEmailSql);

if ($result && $result->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Email sudah terdaftar! Silahkan gunakan email lain.']);
    exit;
}

// Hash password (this is a MUST for security!)
$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

// Insert user data into the users table
$sql = "INSERT INTO users (full_name, email, password_hash, role, program_studi_code) 
        VALUES ('$name', '$email', '$hashedPassword', '$role', " . ($programStudy ? "'$programStudy'" : "NULL") . ")";

if ($conn->query($sql) === TRUE) {
    echo json_encode([
        'success' => true, 
        'message' => 'Registration successful', 
        'userData' => [
            'name' => $name,
            'email' => $email,
            'role' => $role,
            'programStudy' => $programStudy
        ]
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'Database error: ' . $conn->error
    ]);
}

// Close the connection
$conn->close();
?>
