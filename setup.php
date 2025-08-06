<?php
/**
 * Plugin Painel de Chamados
 * 
 * @version 1.0.0
 * @author Alan Rodrigues - AF Solutions
 * @license GPL v3 or later
 */

define('PLUGIN_PAINELCHAMADOS_VERSION', '1.0.0');

/**
 * Init the hooks of the plugins - Needed
 */
function plugin_init_painelchamados() {
   global $PLUGIN_HOOKS;

   $PLUGIN_HOOKS['csrf_compliant']['painelchamados'] = true;
   
   Plugin::registerClass('PluginPainelchamadosConfig');
   Plugin::registerClass('PluginPainelchamadosConfigManager');
   
   if (Session::haveRight('ticket', READ)) {
      $PLUGIN_HOOKS['menu_toadd']['painelchamados']['helpdesk'] = 'PluginPainelchamadosConfig';
   }
   
   $PLUGIN_HOOKS['config_page']['painelchamados'] = 'front/config.php';
   
   // Add CSS and JS
   $PLUGIN_HOOKS['add_css']['painelchamados'] = 'css/painelchamados.css';
   $PLUGIN_HOOKS['add_javascript']['painelchamados'] = 'js/painelchamados.js';
}

/**
 * Get the name and the version of the plugin - Needed
 */
function plugin_version_painelchamados() {
   return [
      'name'           => 'Painel de Chamados',
      'version'        => PLUGIN_PAINELCHAMADOS_VERSION,
      'author'         => 'Alan Rodrigues - AF Solutions',
      'license'        => 'GPL v3+',
      'homepage'       => '',
      'requirements'   => [
         'glpi' => [
            'min' => '10.0',
            'max' => '10.99'
         ]
      ]
   ];
}

/**
 * Optional : check prerequisites before install : may print errors or add to message after redirect
 */
function plugin_painelchamados_check_prerequisites() {
   if (version_compare(GLPI_VERSION, '10.0', 'lt')) {
      echo "Este plugin requer GLPI >= 10.0";
      return false;
   }
   return true;
}

/**
 * Check configuration process for plugin : need to return true if succeeded
 * Can display a message only if failure and $verbose is true
 */
function plugin_painelchamados_check_config($verbose = false) {
   return true;
}
