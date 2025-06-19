<?php
session_start();
header("Content-Type: application/json; charset=UTF-8");

require_once "connection.php";

// Check for email from multiple sources
$email = null;

// Check for session first (most secure)
if (isset($_SESSION['user_email'])) {
    $email = $_SESSION['user_email'];
}
// Check for GET parameters (fallback)
else if (isset($_GET['email'])) {
    $email = $_GET['email'];
}
// Check for JSON POST data (another fallback)
else {
    $input = json_decode(file_get_contents('php://input'), true);
    if (isset($input['email'])) {
        $email = $input['email'];
    }
}

// If no email found, return error
if (!$email) {
    echo json_encode([
        "success" => false,
        "message" => "User belum login"
    ]);
    exit();
}

// Fetch user data from the database
$sql = "SELECT id, full_name, email, role, program_studi_code FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result && $result->num_rows > 0) {
    $user = $result->fetch_assoc();
    
    // Return user data as JSON
    echo json_encode([
        "success" => true,
        "user" => [
            "id" => $user['id'],
            "full_name" => $user['full_name'],
            "email" => $user['email'],
            "role" => $user['role'],
            "program_studi_code" => $user['program_studi_code']
        ]
    ]);
} else {
    echo json_encode([
        "success" => false,
        "message" => "Data user tidak ditemukan"
    ]);
}

$stmt->close();
$conn->close();
?>
