<?php
/**
 * Plugin Painel de Chamados - Hook
 * 
 * @version 1.0.0
 * @author Alan Rodrigues - AF Solutions
 */

/**
 * Install plugin
 */
function plugin_painelchamados_install() {
   global $DB;
   
   // Criar tabela de configurações
   $sql = "CREATE TABLE IF NOT EXISTS `glpi_plugin_painelchamados_configs` (
      `id` int unsigned NOT NULL AUTO_INCREMENT,
      `refresh_time` int DEFAULT 30,
      `ticket_status` varchar(255) DEFAULT '1,2,3',
      `tickets_per_page` int DEFAULT 50,
      PRIMARY KEY (`id`)
   ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci";
   
   $DB->query($sql) or die($DB->error());
   
   // Inserir configuração padrão
   $config_sql = "INSERT INTO `glpi_plugin_painelchamados_configs` 
                  (`refresh_time`, `ticket_status`, `tickets_per_page`) 
                  VALUES (30, '1,2,3', 50)";
   $DB->query($config_sql);
   
   return true;
}

/**
 * Uninstall plugin
 */
function plugin_painelchamados_uninstall() {
   global $DB;
   
   // Remover tabela de configurações
   $sql = "DROP TABLE IF EXISTS `glpi_plugin_painelchamados_configs`";
   $DB->query($sql);
   
   return true;
}
