<?php
$logPath = __DIR__ . '/backend/storage/logs/laravel.log';

if (file_exists($logPath)) {
    $log = file_get_contents($logPath);
    $logEntries = explode("[", $log);
    
    // Ambil 5 entry error terakhir
    $lastEntries = array_slice($logEntries, -5);
    
    echo "Last 5 Laravel error log entries:\n\n";
    foreach ($lastEntries as $entry) {
        echo "[" . $entry . "\n\n";
    }
} else {
    echo "Log file not found at: $logPath\n";
    echo "Make sure Laravel has write permissions to the storage directory.\n";
}
