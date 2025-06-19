<?php
header("Content-Type: application/json; charset=UTF-8");

// For debugging purposes
$debug = false;
$debugInfo = [];

if ($debug) {
    // Show all errors
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);
    $debugInfo['php_version'] = phpversion();
}

// Include the database connection file
require_once "connection.php";

if ($debug) {
    $debugInfo['connection_status'] = $conn->connect_error ? 'Failed: ' . $conn->connect_error : 'Success';
}

// Function to categorize program studies based on their code prefixes
function categorizePrograms($programs) {
    $categorized = [
        "PROGRAM STUDI DIPLOMA (D3)" => [],
        "PROGRAM STUDI SARJANA TERAPAN" => [],
        "PROGRAM STUDI SARJANA (S1)" => [],
        "PROGRAM STUDI MAGISTER (S2)" => [],
        "PROGRAM STUDI DOKTOR (S3)" => [],
        "PROGRAM PROFESI" => []
    ];
    
    foreach ($programs as $program) {
        $code = $program['code'];
        $name = $program['name'];
        
        if (strpos($code, 'd3_') === 0) {
            $categorized["PROGRAM STUDI DIPLOMA (D3)"][] = [
                'value' => $program['code'], 
                'label' => $name
            ];
        } elseif (strpos($code, 'st_') === 0) {
            $categorized["PROGRAM STUDI SARJANA TERAPAN"][] = [
                'value' => $program['code'], 
                'label' => $name
            ];
        } elseif (strpos($code, 's1_') === 0) {
            $categorized["PROGRAM STUDI SARJANA (S1)"][] = [
                'value' => $program['code'], 
                'label' => $name
            ];
        } elseif (strpos($code, 's2_') === 0) {
            $categorized["PROGRAM STUDI MAGISTER (S2)"][] = [
                'value' => $program['code'], 
                'label' => $name
            ];
        } elseif (strpos($code, 's3_') === 0) {
            $categorized["PROGRAM STUDI DOKTOR (S3)"][] = [
                'value' => $program['code'], 
                'label' => $name
            ];
        } elseif (strpos($code, 'prof_') === 0) {
            $categorized["PROGRAM PROFESI"][] = [
                'value' => $program['code'], 
                'label' => $name
            ];
        }
    }
    
    // Remove empty categories
    foreach ($categorized as $key => $items) {
        if (empty($items)) {
            unset($categorized[$key]);
        }
    }
    
    // Convert to the expected format for the frontend
    $result = [];
    foreach ($categorized as $category => $items) {
        $result[] = [
            'category' => $category,
            'items' => $items
        ];
    }
    
    return $result;
}

// Get all program studies from database
$sql = "SELECT * FROM program_studi ORDER BY name";
$result = $conn->query($sql);

if ($result) {
    $programs = [];
    while ($row = $result->fetch_assoc()) {
        $programs[] = [
            'id' => $row['id'],
            'code' => $row['code'],
            'name' => $row['name']
        ];
    }
    
    if ($debug) {
        $debugInfo['query'] = $sql;
        $debugInfo['rows_found'] = count($programs);
        $debugInfo['first_row'] = !empty($programs) ? $programs[0] : null;
    }
    
    // Categorize programs and output as JSON
    $categorizedPrograms = categorizePrograms($programs);
    
    if ($debug) {
        // Output debug info along with data
        echo json_encode(['debug' => $debugInfo, 'data' => $categorizedPrograms]);
    } else {
        // Normal output
        echo json_encode($categorizedPrograms);
    }
} else {
    // Handle error
    if ($debug) {
        $debugInfo['query_error'] = $conn->error;
        echo json_encode(['debug' => $debugInfo, 'error' => 'Failed to fetch program studies']);
    } else {
        echo json_encode(['error' => 'Failed to fetch program studies']);
    }
}

// Close the connection
$conn->close();
?>
