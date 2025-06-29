<?php
// Save this file as debug-cors.php in your PHP backend folder

// Enable error reporting for debugging
ini_set('display_errors', 1);
error_reporting(E_ALL);

// Set CORS headers to allow requests from the frontend
header("Access-Control-Allow-Origin: *");  // In production, replace * with your frontend domain
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Check if it's a preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Just return headers for preflight
    exit(0);
}

// Output request details
echo "<h1>CORS Debug Tool</h1>";
echo "<h2>Request Method: " . $_SERVER['REQUEST_METHOD'] . "</h2>";

// Display request headers
echo "<h3>Request Headers:</h3>";
echo "<pre>";
$headers = getallheaders();
print_r($headers);
echo "</pre>";

// Display POST data if any
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    echo "<h3>POST Data:</h3>";
    echo "<pre>";
    print_r($_POST);
    echo "</pre>";
}

// Display FILES data if any
if (!empty($_FILES)) {
    echo "<h3>FILES Data:</h3>";
    echo "<pre>";
    print_r($_FILES);
    echo "</pre>";
    
    // Check if the expected file field exists
    if (isset($_FILES['lampiran'])) {
        echo "<h4>File Upload Details for 'lampiran':</h4>";
        echo "Name: " . $_FILES['lampiran']['name'] . "<br>";
        echo "Type: " . $_FILES['lampiran']['type'] . "<br>";
        echo "Size: " . $_FILES['lampiran']['size'] . " bytes<br>";
        echo "Temp name: " . $_FILES['lampiran']['tmp_name'] . "<br>";
        echo "Error code: " . $_FILES['lampiran']['error'] . "<br>";
        
        // Interpret error code
        if ($_FILES['lampiran']['error'] > 0) {
            echo "<strong>Error explanation:</strong> ";
            switch ($_FILES['lampiran']['error']) {
                case UPLOAD_ERR_INI_SIZE:
                    echo "The uploaded file exceeds the upload_max_filesize directive in php.ini";
                    break;
                case UPLOAD_ERR_FORM_SIZE:
                    echo "The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form";
                    break;
                case UPLOAD_ERR_PARTIAL:
                    echo "The uploaded file was only partially uploaded";
                    break;
                case UPLOAD_ERR_NO_FILE:
                    echo "No file was uploaded";
                    break;
                case UPLOAD_ERR_NO_TMP_DIR:
                    echo "Missing a temporary folder";
                    break;
                case UPLOAD_ERR_CANT_WRITE:
                    echo "Failed to write file to disk";
                    break;
                case UPLOAD_ERR_EXTENSION:
                    echo "A PHP extension stopped the file upload";
                    break;
                default:
                    echo "Unknown upload error";
                    break;
            }
        }
    }
}

// PHP configuration information relevant to file uploads
echo "<h3>PHP Configuration:</h3>";
echo "<pre>";
echo "upload_max_filesize: " . ini_get('upload_max_filesize') . "\n";
echo "post_max_size: " . ini_get('post_max_size') . "\n";
echo "max_execution_time: " . ini_get('max_execution_time') . "\n";
echo "max_input_time: " . ini_get('max_input_time') . "\n";
echo "memory_limit: " . ini_get('memory_limit') . "\n";
echo "upload_tmp_dir: " . ini_get('upload_tmp_dir') . "\n";
echo "file_uploads: " . ini_get('file_uploads') . "\n";
echo "</pre>";

// Return a JSON response to test if the client can parse it
header('Content-Type: application/json');
echo json_encode([
    'status' => 'success',
    'message' => 'Debug information displayed above',
    'time' => date('Y-m-d H:i:s')
]);
