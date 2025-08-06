<?php
/**
 * Plugin Painel de Chamados - Configuração
 * 
 * @version 1.0.0
 * @author Alan Rodrigues - AF Solutions
 */

class PluginPainelchamadosConfig extends CommonGLPI {

   static $rightname = 'ticket';

   /**
    * Get menu name
    */
   static function getMenuName() {
      return __('Painel de Chamados', 'painelchamados');
   }

   /**
    * Get menu content
    */
   static function getMenuContent() {
      $menu = [];
      if (Session::haveRight('ticket', READ)) {
         $menu['title'] = self::getMenuName();
         $menu['page']  = '/plugins/painelchamados/front/painel.php';
         $menu['icon']  = 'fas fa-tachometer-alt';
      }
      return $menu;
   }

   /**
    * Get tab name for item
    */
   function getTabNameForItem(CommonGLPI $item, $withtemplate = 0) {
      return self::getMenuName();
   }

   /**
    * Display tab content for item
    */
   static function displayTabContentForItem(CommonGLPI $item, $tabnum = 1, $withtemplate = 0) {
      return true;
   }
}
