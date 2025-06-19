<?php
// src/php/auth/logout.php
session_start();
// Unset all session variables
$_SESSION = array();
// Destroy the session.
session_destroy();
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Logout berhasil, session dihapus.']);
?>
