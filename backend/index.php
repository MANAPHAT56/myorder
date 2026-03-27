<?php
// API endpoint
header('Content-Type: application/json');

$response = [
    'status' => 'success',
    'message' => 'My Order Blacklist API is running',
    'timestamp' => date('Y-m-d H:i:s')
];

echo json_encode($response);
?>