<?php
echo "Fixing permissions for Laravel storage directories...\n";

$directories = [
    'backend/storage/app',
    'backend/storage/framework/cache',
    'backend/storage/framework/sessions',
    'backend/storage/framework/views',
    'backend/storage/logs',
    'backend/bootstrap/cache'
];

foreach ($directories as $dir) {
    $fullPath = __DIR__ . '/' . $dir;
    
    if (!file_exists($fullPath)) {
        mkdir($fullPath, 0755, true);
        echo "Created directory: $fullPath\n";
    }
    
    if (chmod($fullPath, 0755)) {
        echo "Set permissions for: $fullPath\n";
    } else {
        echo "Failed to set permissions for: $fullPath\n";
    }
}

echo "Done!\n";
