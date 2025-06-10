<?php
header('Content-Type: application/json');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Access-Control-Allow-Origin: *');

try {
    // 체크할 파일들 목록
    $files = [
        '../js/navigation.js',
        '../js/inquiry-form.js',
        '../js/ai-property-search.js',
        '../js/property-app.js',
        '../js/map-script.js',
        '../css/styles.css',
        '../sw.js',
        '../manifest.json',
        '../index.html',
        '../inquiry.html',
        '../introduction.html',
        '../airtable_map.html',
        '../search-property.html',
        '../map-property.html',
        '../recomm-property.html',
        '../property-detail.html',
        '../category-view.html'
    ];
    
    $latestTime = 0;
    
    foreach ($files as $file) {
        if (file_exists($file)) {
            $fileTime = filemtime($file);
            if ($fileTime > $latestTime) {
                $latestTime = $fileTime;
            }
        }
    }
    
    // 버전과 업데이트 정보 반환
    echo json_encode([
        'version' => $latestTime,
        'formatted_time' => date('Y-m-d H:i:s', $latestTime),
        'status' => 'success'
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'version' => time(),
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>