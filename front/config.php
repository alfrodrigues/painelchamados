<?php
/**
 * Plugin Painel de Chamados - Configuração
 * 
 * @version 1.0.0
 * @author Alan Rodrigues - AF Solutions
 */

include ("../../../inc/includes.php");

// Processar formulário de configuração
if (isset($_POST['update_config'])) {
    // Processar status como array
    $ticket_status = '';
    if (isset($_POST['ticket_status']) && is_array($_POST['ticket_status'])) {
        $ticket_status = implode(',', $_POST['ticket_status']);
    }
    
    $config_data = [
        'refresh_time' => $_POST['refresh_time'],
        'ticket_status' => $ticket_status,
        'tickets_per_page' => $_POST['tickets_per_page']
    ];
    
    if (PluginPainelchamadosConfigManager::updateConfig($config_data)) {
        Session::addMessageAfterRedirect('Configurações salvas com sucesso!', false, INFO);
    } else {
        Session::addMessageAfterRedirect('Erro ao salvar configurações!', false, ERROR);
    }
    Html::redirect($_SERVER['PHP_SELF']);
}

// Carregar configurações atuais
try {
    $config = PluginPainelchamadosConfigManager::getConfig();
} catch (Exception $e) {
    // Se não conseguir carregar configuração, usar padrão
    $config = [
        'refresh_time' => 30,
        'ticket_status' => '1,2,3',
        'tickets_per_page' => 50
    ];
}

Html::header('Configuração - Painel de Chamados', $_SERVER['PHP_SELF'], "config", "plugins");

echo "<div class='container-fluid'>";
echo "<div class='row'>";
echo "<div class='col-12'>";

// Formulário de configuração
echo "<div class='card mb-4'>";
echo "<div class='card-header'>";
echo "<h3><i class='fas fa-cog me-2'></i>Configurações do Painel</h3>";
echo "</div>";
echo "<div class='card-body'>";

echo "<form method='post' action='" . $_SERVER['PHP_SELF'] . "'>";
echo Html::hidden('_glpi_csrf_token', ['value' => Session::getNewCSRFToken()]);

echo "<div class='row'>";

// Tempo de atualização
echo "<div class='col-md-4 mb-3'>";
echo "<label for='refresh_time' class='form-label'>";
echo "<i class='fas fa-sync-alt me-1'></i>Tempo de Atualização (segundos)";
echo "</label>";
echo "<select name='refresh_time' id='refresh_time' class='form-select'>";
$refresh_options = [10 => '10 segundos', 15 => '15 segundos', 30 => '30 segundos', 
                   60 => '1 minuto', 120 => '2 minutos', 300 => '5 minutos'];
foreach ($refresh_options as $value => $label) {
    $selected = ($config['refresh_time'] == $value) ? 'selected' : '';
    echo "<option value='$value' $selected>$label</option>";
}
echo "</select>";
echo "</div>";

// Status de chamados
echo "<div class='col-md-4 mb-3'>";
echo "<label class='form-label'>";
echo "<i class='fas fa-info-circle me-1'></i>Status de Chamados";
echo "</label>";
$current_status = explode(',', $config['ticket_status']);
$status_options = [
    1 => 'Novo',
    2 => 'Em Atendimento (Atribuído)',
    3 => 'Planejado',
    4 => 'Pendente',
    5 => 'Solucionado',
    6 => 'Fechado'
];
foreach ($status_options as $value => $label) {
    $checked = in_array($value, $current_status) ? 'checked' : '';
    echo "<div class='form-check'>";
    echo "<input class='form-check-input' type='checkbox' name='ticket_status[]' value='$value' id='status_$value' $checked>";
    echo "<label class='form-check-label' for='status_$value'>$label</label>";
    echo "</div>";
}
echo "</div>";

// Quantidade por página
echo "<div class='col-md-4 mb-3'>";
echo "<label for='tickets_per_page' class='form-label'>";
echo "<i class='fas fa-list me-1'></i>Chamados por Página";
echo "</label>";
echo "<select name='tickets_per_page' id='tickets_per_page' class='form-select'>";
$page_options = [25 => '25', 50 => '50', 100 => '100', 200 => '200'];
foreach ($page_options as $value => $label) {
    $selected = ($config['tickets_per_page'] == $value) ? 'selected' : '';
    echo "<option value='$value' $selected>$label</option>";
}
echo "</select>";
echo "</div>";

echo "</div>";

echo "<div class='text-center mt-4'>";
echo "<button type='submit' name='update_config' class='btn btn-primary'>";
echo "<i class='fas fa-save me-2'></i>Salvar Configurações";
echo "</button>";
echo "</div>";

echo "</form>";
echo "</div>";
echo "</div>";

// Seção de Configuração de Áudio e Permissões
echo "<div class='card mb-4 border-warning'>";
echo "<div class='card-header bg-warning text-dark'>";
echo "<h3><i class='fas fa-volume-up me-2'></i>⚠️ Configuração Importante - Notificações Sonoras</h3>";
echo "</div>";
echo "<div class='card-body'>";

echo "<div class='alert alert-info d-flex align-items-center mb-4'>";
echo "<i class='fas fa-info-circle fa-2x me-3'></i>";
echo "<div>";
echo "<h5 class='alert-heading mb-2'>Para que as notificações sonoras funcionem corretamente:</h5>";
echo "<p class='mb-0'>É necessário <strong>permitir reprodução automática de áudio</strong> no seu navegador para este site.</p>";
echo "</div>";
echo "</div>";

echo "<div class='row'>";
echo "<div class='col-md-6'>";
echo "<div class='card border-primary'>";
echo "<div class='card-header bg-primary text-white'>";
echo "<h5><i class='fab fa-chrome me-1'></i> Google Chrome / Edge</h5>";
echo "</div>";
echo "<div class='card-body'>";
echo "<ol class='mb-0'>";
echo "<li>Clique no <strong>ícone de cadeado</strong> na barra de endereços</li>";
echo "<li>Procure por <strong>\"Som\"</strong> ou <strong>\"Sound\"</strong></li>";
echo "<li>Altere para <strong>\"Permitir\"</strong> ou <strong>\"Allow\"</strong></li>";
echo "<li>Recarregue a página</li>";
echo "</ol>";
echo "<div class='text-muted mt-2'>";
echo "<small><i class='fas fa-lightbulb me-1'></i> Ou acesse chrome://settings/content/sound</small>";
echo "</div>";
echo "</div>";
echo "</div>";
echo "</div>";

echo "<div class='col-md-6'>";
echo "<div class='card border-info'>";
echo "<div class='card-header bg-info text-white'>";
echo "<h5><i class='fab fa-firefox-browser me-1'></i> Firefox</h5>";
echo "</div>";
echo "<div class='card-body'>";
echo "<ol class='mb-0'>";
echo "<li>Clique no <strong>ícone de escudo</strong> na barra de endereços</li>";
echo "<li>Clique em <strong>\"Configurações de proteção\"</strong></li>";
echo "<li>Procure por <strong>\"Reprodução automática\"</strong></li>";
echo "<li>Selecione <strong>\"Permitir áudio e vídeo\"</strong></li>";
echo "</ol>";
echo "<div class='text-muted mt-2'>";
echo "<small><i class='fas fa-lightbulb me-1'></i> Ou pressione Ctrl+I para informações da página</small>";
echo "</div>";
echo "</div>";
echo "</div>";
echo "</div>";
echo "</div>";

echo "<div class='row mt-4'>";
echo "<div class='col-md-12'>";
echo "<div class='card border-success'>";
echo "<div class='card-header bg-success text-white'>";
echo "<h5><i class='fas fa-check-circle me-1'></i> Teste de Áudio</h5>";
echo "</div>";
echo "<div class='card-body'>";
echo "<p>Após configurar as permissões, teste se o áudio está funcionando:</p>";
echo "<div class='d-flex gap-2'>";
echo "<button type='button' class='btn btn-outline-primary' onclick='testAudio()' id='test-audio-btn'>";
echo "<i class='fas fa-play me-1'></i> Testar Som";
echo "</button>";
echo "<button type='button' class='btn btn-outline-info' onclick='checkPermissions()' id='check-permissions-btn'>";
echo "<i class='fas fa-shield-alt me-1'></i> Verificar Permissões";
echo "</button>";
echo "<a href='" . $CFG_GLPI['root_doc'] . "/plugins/painelchamados/front/audio_diagnostic.php' class='btn btn-outline-warning'>";
echo "<i class='fas fa-stethoscope me-1'></i> Diagnóstico Completo";
echo "</a>";
echo "</div>";
echo "<div id='audio-status' class='mt-3'></div>";
echo "</div>";
echo "</div>";
echo "</div>";
echo "</div>";

echo "<div class='alert alert-warning mt-4'>";
echo "<h5><i class='fas fa-exclamation-triangle me-2'></i>Observações Importantes:</h5>";
echo "<ul class='mb-0'>";
echo "<li><strong>Monitores compartilhados:</strong> Configure as permissões uma única vez por navegador</li>";
echo "<li><strong>Rede corporativa:</strong> Pode ser necessário contatar o administrador de TI</li>";
echo "<li><strong>Som não funciona:</strong> O sistema usará notificações visuais como alternativa</li>";
echo "<li><strong>HTTPS recomendado:</strong> Alguns navegadores exigem conexão segura para áudio</li>";
echo "</ul>";
echo "</div>";

echo "</div>";
echo "</div>";

?>

<script>
function testAudio() {
    const statusDiv = document.getElementById('audio-status');
    const testBtn = document.getElementById('test-audio-btn');
    
    testBtn.disabled = true;
    testBtn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Testando...';
    
    statusDiv.innerHTML = '<div class="alert alert-info"><i class="fas fa-volume-up me-2"></i>Testando reprodução de áudio...</div>';
    
    // Tentar reproduzir arquivo de áudio
    const audio = new Audio('<?php echo $CFG_GLPI['root_doc']; ?>/plugins/painelchamados/sound/notification.mp3');
    audio.volume = 0.7;
    
    audio.addEventListener('canplaythrough', function() {
        audio.play().then(function() {
            statusDiv.innerHTML = '<div class="alert alert-success"><i class="fas fa-check-circle me-2"></i><strong>Sucesso!</strong> O áudio está funcionando perfeitamente. As notificações sonoras estarão ativas no painel.</div>';
        }).catch(function(error) {
            statusDiv.innerHTML = '<div class="alert alert-danger"><i class="fas fa-times-circle me-2"></i><strong>Erro:</strong> ' + error.message + '<br><small>Verifique as permissões de áudio do navegador conforme as instruções acima.</small></div>';
        });
        
        testBtn.disabled = false;
        testBtn.innerHTML = '<i class="fas fa-play me-1"></i> Testar Som';
    });
    
    audio.addEventListener('error', function(e) {
        statusDiv.innerHTML = '<div class="alert alert-warning"><i class="fas fa-exclamation-triangle me-2"></i><strong>Aviso:</strong> Não foi possível carregar o arquivo de áudio. O sistema usará sons sintéticos.</div>';
        
        // Fallback para som sintético
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
            gainNode.gain.setValueAtTime(0, audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.3);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.3);
            
            statusDiv.innerHTML = '<div class="alert alert-success"><i class="fas fa-check-circle me-2"></i><strong>Som sintético funcionando!</strong> As notificações usarão beeps gerados pelo navegador.</div>';
            
        } catch (synthError) {
            statusDiv.innerHTML = '<div class="alert alert-danger"><i class="fas fa-times-circle me-2"></i><strong>Erro total de áudio:</strong> Verifique as permissões do navegador ou use outro navegador.</div>';
        }
        
        testBtn.disabled = false;
        testBtn.innerHTML = '<i class="fas fa-play me-1"></i> Testar Som';
    });
}

function checkPermissions() {
    const statusDiv = document.getElementById('audio-status');
    
    let permissionInfo = '<div class="alert alert-primary"><h6><i class="fas fa-info-circle me-2"></i>Status das Permissões:</h6><ul>';
    
    // Verificar suporte a áudio
    const audio = new Audio();
    permissionInfo += '<li><strong>Suporte MP3:</strong> ' + (audio.canPlayType('audio/mpeg') || 'Não suportado') + '</li>';
    permissionInfo += '<li><strong>Suporte OGG:</strong> ' + (audio.canPlayType('audio/ogg') || 'Não suportado') + '</li>';
    permissionInfo += '<li><strong>AudioContext:</strong> ' + (window.AudioContext || window.webkitAudioContext ? 'Disponível' : 'Não disponível') + '</li>';
    
    // Verificar protocolo
    permissionInfo += '<li><strong>Protocolo:</strong> ' + window.location.protocol + ' ' + (window.location.protocol === 'https:' ? '(Recomendado)' : '(HTTP - alguns navegadores podem bloquear)') + '</li>';
    
    // Verificar se é localhost
    const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    permissionInfo += '<li><strong>Ambiente:</strong> ' + (isLocal ? 'Local (OK)' : 'Remoto') + '</li>';
    
    permissionInfo += '</ul></div>';
    
    statusDiv.innerHTML = permissionInfo;
}
</script>

<?php

// Informações do plugin
echo "<div class='card mb-4'>";
echo "<div class='card-header'>";
echo "<h3><i class='fas fa-info-circle me-2'></i>Informações do Plugin</h3>";
echo "</div>";
echo "<div class='card-body'>";

echo "<div class='row'>";
echo "<div class='col-md-6'>";
echo "<p><strong>Nome:</strong> Painel de Chamados</p>";
echo "<p><strong>Versão:</strong> 1.0.0</p>";
echo "<p><strong>Autor:</strong> Alan Rodrigues - AF Solutions</p>";
echo "</div>";
echo "<div class='col-md-6'>";
echo "<p><strong>Compatibilidade:</strong> GLPI 10.x</p>";
echo "<p><strong>Licença:</strong> GPL v3+</p>";
echo "<p><strong>Status:</strong> <span class='badge bg-success'>Ativo</span></p>";
echo "</div>";
echo "</div>";

echo "</div>";
echo "</div>";

// Funcionalidades
echo "<div class='card'>";
echo "<div class='card-header'>";
echo "<h3><i class='fas fa-check-circle me-2'></i>Funcionalidades</h3>";
echo "</div>";
echo "<div class='card-body'>";

echo "<div class='row'>";
echo "<div class='col-md-6'>";
echo "<ul class='list-unstyled'>";
echo "<li><i class='fas fa-check text-success me-2'></i>Visualização em tempo real</li>";
echo "<li><i class='fas fa-check text-success me-2'></i>Cores por prioridade</li>";
echo "<li><i class='fas fa-check text-success me-2'></i>Cálculo automático de SLA</li>";
echo "<li><i class='fas fa-check text-success me-2'></i>Notificação sonora</li>";
echo "</ul>";
echo "</div>";
echo "<div class='col-md-6'>";
echo "<ul class='list-unstyled'>";
echo "<li><i class='fas fa-check text-success me-2'></i>Modo tela cheia</li>";
echo "<li><i class='fas fa-check text-success me-2'></i>Interface responsiva</li>";
echo "<li><i class='fas fa-check text-success me-2'></i>Paginação inteligente</li>";
echo "<li><i class='fas fa-check text-success me-2'></i>Configurações personalizáveis</li>";
echo "</ul>";
echo "</div>";
echo "</div>";

echo "<div class='text-center mt-4'>";
echo "<a href='" . $CFG_GLPI['root_doc'] . "/plugins/painelchamados/front/painel.php' class='btn btn-primary btn-lg'>";
echo "<i class='fas fa-tachometer-alt me-2'></i>Acessar Painel de Chamados";
echo "</a>";
echo "</div>";

echo "</div>";
echo "</div>";

echo "</div>";
echo "</div>";
echo "</div>";

Html::footer();
?>
