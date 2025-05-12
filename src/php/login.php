<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *'); // Allow requests from any origin (for development)
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

// Handle OPTIONS request (preflight)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Dummy user data
$dummy_users = [
    ['email' => 'user@example.com', 'password' => 'password123', 'name' => 'User Biasa'],
    ['email' => 'admin@example.com', 'password' => 'adminpassword', 'name' => 'Admin Kampus'],
];

$response = ['success' => false, 'message' => 'Invalid request method.'];

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get JSON input from the request body
    $input_data = json_decode(file_get_contents('php://input'), true);

    if (isset($input_data['email']) && isset($input_data['password'])) {
        $email = $input_data['email'];
        $password = $input_data['password'];

        $found_user = null;
        foreach ($dummy_users as $user) {
            if ($user['email'] === $email && $user['password'] === $password) {
                $found_user = $user;
                break;
            }
        }

        if ($found_user) {
            $response = [
                'success' => true,
                'message' => 'Login Berhasil!',
                'user' => [
                    'email' => $found_user['email'],
                    'name' => $found_user['name'],
                ]
            ];
        } else {
            $response = ['success' => false, 'message' => 'Email atau password salah.'];
        }
    } else {
        $response = ['success' => false, 'message' => 'Email dan password diperlukan.'];
    }
}

echo json_encode($response);
?>
