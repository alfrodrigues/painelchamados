<?php
/**
 * Plugin Painel de Chamados - Classe de Configuração
 * 
 * @version 1.0.0
 * @author Alan Rodrigues - AF Solutions
 */

class PluginPainelchamadosConfigManager extends CommonDBTM {
    
    static $rightname = 'config';
    
    /**
     * Get configuration
     */
    static function getConfig() {
        global $DB;
        
        $result = $DB->query("SELECT * FROM glpi_plugin_painelchamados_configs LIMIT 1");
        
        if ($result && $DB->numrows($result) > 0) {
            return $DB->fetchAssoc($result);
        }
        
        // Retornar configuração padrão se não existir
        return [
            'refresh_time' => 30,
            'ticket_status' => '1,2,3',
            'tickets_per_page' => 50
        ];
    }
    
    /**
     * Update configuration
     */
    static function updateConfig($data) {
        global $DB;
        
        $refresh_time = intval($data['refresh_time']);
        $ticket_status = $DB->escape($data['ticket_status']);
        $tickets_per_page = intval($data['tickets_per_page']);
        
        // Verificar se existe configuração
        $result = $DB->query("SELECT id FROM glpi_plugin_painelchamados_configs LIMIT 1");
        
        if ($result && $DB->numrows($result) > 0) {
            // Atualizar existente
            $row = $DB->fetchAssoc($result);
            $sql = "UPDATE glpi_plugin_painelchamados_configs 
                    SET refresh_time = $refresh_time,
                        ticket_status = '$ticket_status',
                        tickets_per_page = $tickets_per_page
                    WHERE id = " . $row['id'];
        } else {
            // Inserir novo
            $sql = "INSERT INTO glpi_plugin_painelchamados_configs 
                    (refresh_time, ticket_status, tickets_per_page) 
                    VALUES ($refresh_time, '$ticket_status', $tickets_per_page)";
        }
        
        return $DB->query($sql);
    }
}
