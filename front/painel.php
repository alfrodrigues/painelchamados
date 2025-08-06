<?php
/**
 * Plugin Painel de Chamados - Front Page
 * 
 * @version 1.0.0
 * @author Alan Rodrigues - AF Solutions
 */

include ("../../../inc/includes.php");

Html::header('Painel de Chamados', $_SERVER['PHP_SELF'], "helpdesk", "PluginPainelchamadosConfig");

echo "<div class='painel-chamados-container'>";
echo "<div class='card'>";
echo "<div class='card-header d-flex justify-content-between align-items-center'>";
echo "<h3><i class='fas fa-tachometer-alt me-2'></i>Painel de Chamados</h3>";
echo "<div class='d-flex align-items-center gap-3'>";
echo "<button class='btn btn-warning btn-sm' id='test-sound-btn' title='Testar som de notificação'>";
echo "<i class='fas fa-volume-up me-1'></i>Testar Som";
echo "</button>";
echo "<button class='btn btn-primary btn-sm' id='refresh-btn'>";
echo "<i class='fas fa-sync-alt me-1'></i>Atualizar";
echo "</button>";
echo "<button class='btn btn-success btn-sm' id='fullscreen-btn'>";
echo "<i class='fas fa-expand me-1'></i>Tela Cheia";
echo "</button>";
echo "</div>";
echo "</div>";

echo "<div class='card-body'>";
echo "<div id='painel-content'>";
echo "<div class='text-center py-5'>";
echo "<div class='spinner-border' role='status'>";
echo "<span class='visually-hidden'>Carregando...</span>";
echo "</div>";
echo "<p class='mt-3 text-muted'>Carregando chamados...</p>";
echo "</div>";
echo "</div>";
echo "</div>";
echo "</div>";
echo "</div>";

// Incluir CSS do plugin
echo "<link rel='stylesheet' href='" . $CFG_GLPI['root_doc'] . "/plugins/painelchamados/css/painelchamados.css'>";

// Link para o arquivo JavaScript externo
echo "<script src='" . $CFG_GLPI['root_doc'] . "/plugins/painelchamados/js/painelchamados.js'></script>";

Html::footer();
?>
