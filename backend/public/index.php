<?php
// ตั้งค่าให้ส่งกลับเป็น JSON และอนุญาตให้ React (port 3000) ดึงข้อมูลได้ (CORS)
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

// อ่านค่า URL ที่ React ยิงมา
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// จำลองการแยก Route
if ($uri === '/api/shops/featured') {
    
    echo json_encode([
        'status' => 'success',
        'data' => [
            ['id' => 1, 'name' => 'ร้านค้าแนะนำ 1'],
            ['id' => 2, 'name' => 'ร้านค้าแนะนำ 2']
        ]
    ]);

} elseif ($uri === '/api/shops') {
    
    // รับค่าตัวแปรจาก URL เช่น ?q=oko&tier=all
    $search = $_GET['q'] ?? '';
    
    echo json_encode([
        'status' => 'success',
        'message' => 'ค้นหาร้านค้า: ' . $search,
        'data' => []
    ]);

} else {
    // ถ้าเรียก URL อื่นๆ ที่เราไม่ได้เตรียมไว้
    http_response_code(404);
    echo json_encode([
        'status' => 'error',
        'message' => 'API Not Found'
    ]);
}
?>