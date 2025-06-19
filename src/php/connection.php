<?php
// Enable error reporting for development - comment out in production
// ini_set('display_errors', 1);
// ini_set('display_startup_errors', 1);
// error_reporting(E_ALL);

// Database connection settings
$servername = "localhost";
$username = "root"; // Default XAMPP MySQL username
$password = ""; // Default XAMPP MySQL password has no password
$dbname = "lapor_kampus";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    // For API responses:
    if (strpos($_SERVER['REQUEST_URI'], '.php') !== false) {
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Database connection failed: ' . $conn->connect_error]);
        exit;
    } else {
        // For direct PHP execution:
        die("Connection failed: " . $conn->connect_error);
    }
}

// Set character set to utf8mb4
$conn->set_charset("utf8mb4");

// Log connections for debugging (comment out in production)
// $log_file = dirname(__FILE__) . '/db_connection.log';
// $log_message = date('Y-m-d H:i:s') . ' - Connection from ' . $_SERVER['REMOTE_ADDR'] . ' to ' . $_SERVER['REQUEST_URI'] . PHP_EOL;
// file_put_contents($log_file, $log_message, FILE_APPEND);
?>
