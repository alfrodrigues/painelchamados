<?php
/**
 * Plugin Painel de Chamados - Dados AJAX
 * 
 * @version 1.0.0
 * @author Alan Rodrigues - AF Solutions
 */

// Inicializar buffer de saída para controlar a resposta
ob_start();

// Incluir arquivos do GLPI
include ("../../../inc/includes.php");

// Limpar qualquer output anterior e definir headers
ob_clean();
header('Content-Type: application/json; charset=utf-8');

try {
    global $DB;
    
    // Configuração padrão
    $config = [
        'refresh_time' => 30,
        'ticket_status' => '1,2,3',
        'tickets_per_page' => 50
    ];
    
    // Carregar configuração do banco se existir
    $config_query = "SELECT * FROM glpi_plugin_painelchamados_configs LIMIT 1";
    $config_result = $DB->query($config_query);
    
    if ($config_result && $DB->numrows($config_result) > 0) {
        $config_data = $DB->fetchAssoc($config_result);
        $config = [
            'refresh_time' => (int)$config_data['refresh_time'],
            'ticket_status' => $config_data['ticket_status'],
            'tickets_per_page' => (int)$config_data['tickets_per_page']
        ];
    }
    
    // Parâmetros de paginação
    $page = isset($_GET['page']) ? max(1, intval($_GET['page'])) : 1;
    $limit = $config['tickets_per_page'];
    $offset = ($page - 1) * $limit;
    
    // Status de chamados
    $status_list = $config['ticket_status'];
    
    // Query para buscar chamados
    $query = "SELECT 
        t.id,
        t.date,
        t.status,
        t.priority,
        t.urgency,
        t.impact,
        t.time_to_resolve,
        t.date_creation,
        COALESCE(l.completename, 'Não definida') as location,
        COALESCE(CONCAT(u.firstname, ' ', u.realname), 'Sistema') as requester,
        COALESCE(tc.completename, 'Sem categoria') as category
    FROM glpi_tickets t
    LEFT JOIN glpi_locations l ON t.locations_id = l.id
    LEFT JOIN glpi_users u ON t.users_id_recipient = u.id
    LEFT JOIN glpi_itilcategories tc ON t.itilcategories_id = tc.id
    WHERE t.status IN ($status_list)
        AND t.is_deleted = 0
    ORDER BY t.date DESC, t.priority DESC
    LIMIT $limit OFFSET $offset";
    
    $result = $DB->query($query);
    $tickets = [];
    
    if ($result) {
        while ($row = $DB->fetchAssoc($result)) {
            $slaTime = calculateSlaTime($row);
            
            $tickets[] = [
                'id' => $row['id'],
                'date' => date('d/m/Y H:i', strtotime($row['date'])),
                'status' => $row['status'],
                'priority' => $row['priority'],
                'location' => $row['location'],
                'requester' => $row['requester'],
                'category' => $row['category'],
                'sla_time' => $slaTime
            ];
        }
    }
    
    // Contar total
    $countQuery = "SELECT COUNT(*) as total 
                   FROM glpi_tickets 
                   WHERE status IN ($status_list) AND is_deleted = 0";
    $countResult = $DB->query($countQuery);
    $totalCount = 0;
    
    if ($countResult) {
        $countRow = $DB->fetchAssoc($countResult);
        $totalCount = $countRow['total'];
    }
    
    $totalPages = ceil($totalCount / $limit);
    
    // Resposta final
    $response = [
        'tickets' => $tickets,
        'total' => $totalCount,
        'current_page' => $page,
        'total_pages' => $totalPages,
        'per_page' => $limit,
        'config' => $config
    ];
    
    // Enviar resposta JSON
    echo json_encode($response, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    // Em caso de erro, retornar JSON de erro
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor',
        'tickets' => [],
        'total' => 0,
        'current_page' => 1,
        'total_pages' => 1,
        'per_page' => 50
    ], JSON_UNESCAPED_UNICODE);
}

/**
 * Calcula o tempo restante para resolver o chamado baseado na SLA
 */
function calculateSlaTime($ticket) {
    if (empty($ticket['time_to_resolve'])) {
        return '<span class="text-muted"><i class="fas fa-clock"></i> Sem SLA definida</span>';
    }
    
    $now = time();
    $resolveTime = strtotime($ticket['time_to_resolve']);
    $creationTime = strtotime($ticket['date_creation']);
    
    if ($resolveTime <= $now) {
        $overdue = $now - $resolveTime;
        return '<span class="text-danger"><i class="fas fa-exclamation-triangle"></i> Atrasado ' . formatDuration($overdue) . '</span>';
    }
    
    $remaining = $resolveTime - $now;
    $total = $resolveTime - $creationTime;
    
    if ($total > 0) {
        $elapsed = $now - $creationTime;
        $percentage = ($elapsed / $total) * 100;
        
        if ($percentage >= 90) {
            $class = 'text-danger';
            $icon = 'fas fa-exclamation-triangle';
        } elseif ($percentage >= 70) {
            $class = 'text-warning';
            $icon = 'fas fa-clock';
        } else {
            $class = 'text-success';
            $icon = 'fas fa-check-circle';
        }
    } else {
        $class = 'text-success';
        $icon = 'fas fa-check-circle';
    }
    
    return '<span class="' . $class . '"><i class="' . $icon . '"></i> ' . formatDuration($remaining) . '</span>';
}

/**
 * Formatar duração em formato legível
 */
function formatDuration($seconds) {
    if ($seconds < 60) {
        return $seconds . ' seg';
    } elseif ($seconds < 3600) {
        return floor($seconds / 60) . ' min';
    } elseif ($seconds < 86400) {
        return floor($seconds / 3600) . 'h ' . floor(($seconds % 3600) / 60) . 'min';
    } else {
        $days = floor($seconds / 86400);
        $hours = floor(($seconds % 86400) / 3600);
        return $days . 'd ' . $hours . 'h';
    }
}

// Finalizar buffer e enviar
ob_end_flush();
?>
