<?php
echo "<h1>Server Check</h1>";
echo "<p>PHP Version: " . phpversion() . "</p>";
echo "<p>Document Root: " . $_SERVER['DOCUMENT_ROOT'] . "</p>";
echo "<p>Server Software: " . $_SERVER['SERVER_SOFTWARE'] . "</p>";

echo "<h2>PHP Extensions</h2>";
echo "<pre>";
print_r(get_loaded_extensions());
echo "</pre>";

echo "<h2>Laravel Requirements Check</h2>";
$requirements = [
    'PHP >= 8.0' => version_compare(PHP_VERSION, '8.0.0', '>='),
    'BCMath PHP Extension' => extension_loaded('bcmath'),
    'Ctype PHP Extension' => extension_loaded('ctype'),
    'Fileinfo PHP Extension' => extension_loaded('fileinfo'),
    'JSON PHP Extension' => extension_loaded('json'),
    'Mbstring PHP Extension' => extension_loaded('mbstring'),
    'OpenSSL PHP Extension' => extension_loaded('openssl'),
    'PDO PHP Extension' => extension_loaded('pdo'),
    'Tokenizer PHP Extension' => extension_loaded('tokenizer'),
    'XML PHP Extension' => extension_loaded('xml')
];

foreach ($requirements as $requirement => $satisfied) {
    echo $requirement . ': ' . ($satisfied ? '✅ OK' : '❌ Missing') . "<br>";
}
