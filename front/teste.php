<?php
// Teste simples para verificar se o PHP funciona
echo json_encode([
    'status' => 'success',
    'message' => 'API funcionando',
    'timestamp' => date('Y-m-d H:i:s'),
    'path' => $_SERVER['PHP_SELF']
]);
?>
