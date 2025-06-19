<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database connection settings
$servername = "localhost";
$username = "root"; // Default XAMPP MySQL username
$password = ""; // Default XAMPP MySQL password has no password
$dbname = "lapor_kampus";

echo "<h1>Testing Database Connection</h1>";
echo "<h2>Connection Details:</h2>";
echo "Server: $servername<br>";
echo "Database: $dbname<br>";
echo "Username: $username<br>";

// Create connection
$conn = new mysqli($servername, $username, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    echo "<div style='color: red; font-weight: bold;'>Connection failed: " . $conn->connect_error . "</div>";
    die();
} else {
    echo "<div style='color: green; font-weight: bold;'>Connection successful!</div>";
}

// Set character set
echo "<h2>Setting Character Set:</h2>";
if ($conn->set_charset("utf8mb4")) {
    echo "<div style='color: green;'>Character set set to utf8mb4</div>";
} else {
    echo "<div style='color: red;'>Failed to set character set: " . $conn->error . "</div>";
}

// Test query to program_studi table
echo "<h2>Program Studi Table Test:</h2>";
$sql = "SELECT * FROM program_studi LIMIT 5";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo "<div style='color: green;'>Program studi table exists and has data!</div>";
    echo "First 5 rows:<br>";
    echo "<table border='1' cellpadding='5'>";
    echo "<tr><th>ID</th><th>Code</th><th>Name</th></tr>";
    
    while ($row = $result->fetch_assoc()) {
        echo "<tr>";
        echo "<td>" . $row['id'] . "</td>";
        echo "<td>" . $row['code'] . "</td>";
        echo "<td>" . $row['name'] . "</td>";
        echo "</tr>";
    }
    
    echo "</table>";
} else {
    echo "<div style='color: red;'>Error or no data in program_studi table: " . $conn->error . "</div>";
}

// Test query to users table
echo "<h2>Users Table Test:</h2>";
$sql = "SELECT * FROM users LIMIT 5";
$result = $conn->query($sql);

if ($result !== false) {
    if ($result->num_rows > 0) {
        echo "<div style='color: green;'>Users table exists and has data!</div>";
        echo "First 5 rows:<br>";
        echo "<table border='1' cellpadding='5'>";
        echo "<tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th>Program</th></tr>";
        
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            echo "<td>" . $row['id'] . "</td>";
            echo "<td>" . $row['full_name'] . "</td>";
            echo "<td>" . $row['email'] . "</td>";
            echo "<td>" . $row['role'] . "</td>";
            echo "<td>" . $row['program_studi_code'] . "</td>";
            echo "</tr>";
        }
        
        echo "</table>";
    } else {
        echo "<div style='color: orange;'>Users table exists but has no data yet.</div>";
    }
} else {
    echo "<div style='color: red;'>Error querying users table: " . $conn->error . "</div>";
}

// Close the connection
$conn->close();

echo "<h2>Connection closed</h2>";
?>
