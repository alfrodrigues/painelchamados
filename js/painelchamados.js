/**
 * Plugin Painel de Chamados - JavaScript
 * Versão 1.0.0
 * Autor: Alan Rodrigues - AF Solutions
 */

class PainelChamados {
    constructor() {
        this.lastTicketCount = 0;
        this.currentPage = 1;
        this.isFullscreen = false;
        this.refreshInterval = null;
        this.audio = null;
        this.config = null;
        this.audioReady = false;
        this.userInteracted = false;
        this.isSecureContext = this.checkSecureContext();
        this.pendingAudioTests = [];
        
        this.init();
    }
    
    init() {
        // Verificar contexto de segurança
        this.logSecurityContext();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Preparar audio para notificação
        this.prepareAudio();
        
        // Aguardar primeira interação do usuário para inicializar áudio
        this.setupAudioActivation();
        
        // Carregar dados iniciais
        this.loadTickets();
        
        // Auto-refresh será configurado após carregar a configuração
    }
    
    checkSecureContext() {
        // Verificar se é um contexto seguro
        const isSecure = location.protocol === 'https:' || 
                        location.hostname === 'localhost' || 
                        location.hostname === '127.0.0.1' ||
                        location.hostname.endsWith('.localhost');
        return isSecure;
    }
    
    logSecurityContext() {
        console.log('🔒 === ANÁLISE DO CONTEXTO DE SEGURANÇA ===');
        console.log(`📊 Protocolo: ${location.protocol}`);
        console.log(`📊 Hostname: ${location.hostname}`);
        console.log(`📊 Porta: ${location.port || (location.protocol === 'https:' ? '443' : '80')}`);
        console.log(`📊 Contexto seguro: ${this.isSecureContext ? 'Sim' : 'Não'}`);
        console.log(`📊 Navegador: ${navigator.userAgent.split(' ')[0]}`);
        
        if (!this.isSecureContext) {
            console.warn('⚠️ ATENÇÃO: Contexto HTTP detectado - autoplay pode ser bloqueado');
            console.warn('💡 Solução: Usar HTTPS ou aguardar interação do usuário');
        }
    }
    
    async testAutoplayCapability() {
        console.log('🎵 Testando capacidade de autoplay...');
        
        // Criar áudio de teste silencioso
        const testAudio = new Audio('data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAAwAAEAAQABAAAAAAAAAGRhdGEEAAAAAAA=');
        testAudio.volume = 0.01;
        
        try {
            await testAudio.play();
            console.log('✅ Autoplay: PERMITIDO');
            return true;
        } catch (error) {
            console.log('❌ Autoplay: BLOQUEADO - ' + error.message);
            
            if (error.name === 'NotAllowedError') {
                console.log('💡 Solução: Necessária interação do usuário antes de reproduzir áudio');
            }
            return false;
        }
    }
    
    setupAudioActivation() {
        console.log('🔧 Configurando ativação de áudio...');
        
        // Aguardar primeira interação para ativar áudio (política do navegador)
        const enableAudio = async () => {
            if (this.userInteracted) return;
            
            console.log('👆 Primeira interação do usuário detectada');
            this.userInteracted = true;
            
            // Testar capacidade de autoplay
            await this.testAutoplayCapability();
            
            // Preparar áudio para contextos HTTP
            if (!this.isSecureContext && this.audio) {
                try {
                    console.log('🔧 Preparando áudio para contexto HTTP...');
                    
                    // Reproduzir silenciosamente primeiro para "desbloquear" o áudio
                    this.audio.volume = 0;
                    await this.audio.play();
                    this.audio.pause();
                    this.audio.currentTime = 0;
                    this.audio.volume = 0.7;
                    
                    this.audioReady = true;
                    console.log('✅ Áudio preparado com sucesso para HTTP');
                    
                } catch (error) {
                    console.warn('⚠️ Falha na preparação do áudio:', error.message);
                }
            }
            
            // Ativar AudioContext se suspenso
            if (this.audioContext && this.audioContext.state === 'suspended') {
                try {
                    await this.audioContext.resume();
                    console.log('✅ AudioContext retomado');
                } catch (error) {
                    console.warn('⚠️ Erro ao retomar AudioContext:', error);
                }
            }
            
            // Executar testes pendentes
            this.executePendingAudioTests();
            
            // Remover listeners após primeira ativação
            document.removeEventListener('click', enableAudio);
            document.removeEventListener('keydown', enableAudio);
            document.removeEventListener('touchstart', enableAudio);
        };
        
        // Múltiplos tipos de interação para cobrir todos os casos
        document.addEventListener('click', enableAudio);
        document.addEventListener('keydown', enableAudio);
        document.addEventListener('touchstart', enableAudio);
        
        // Se já está em contexto seguro, testar autoplay imediatamente
        if (this.isSecureContext) {
            setTimeout(() => this.testAutoplayCapability(), 1000);
        }
    }
    
    executePendingAudioTests() {
        if (this.pendingAudioTests.length > 0) {
            console.log(`🎵 Executando ${this.pendingAudioTests.length} testes de áudio pendentes...`);
            
            this.pendingAudioTests.forEach(testFn => {
                try {
                    testFn();
                } catch (error) {
                    console.warn('⚠️ Erro em teste pendente:', error);
                }
            });
            
            this.pendingAudioTests = [];
        }
    }
    
    prepareAudio() {
        try {
            // Criar elemento audio com múltiplos formatos (como o GLPI faz)
            this.audio = new Audio();
            
            // Usar caminhos absolutos a partir da raiz do plugin
            const pluginPath = window.location.pathname.replace('/front/painel.php', '');
            
            // Verificar suporte a diferentes formatos
            if (this.audio.canPlayType('audio/ogg; codecs="vorbis"')) {
                this.audio.src = pluginPath + '/sound/notification.ogg';
                console.log('🔊 Carregando notification.ogg (formato preferencial)...');
                console.log('📁 Caminho completo:', this.audio.src);
            } else if (this.audio.canPlayType('audio/mpeg')) {
                this.audio.src = pluginPath + '/sound/notification.mp3';
                console.log('🔊 Carregando notification.mp3 (fallback)...');
                console.log('📁 Caminho completo:', this.audio.src);
            } else {
                console.warn('⚠️ Navegador não suporta áudio, usando som sintético');
                this.audio = null;
                this.initSyntheticAudio();
                return;
            }
            
            this.audio.volume = 0.7;
            this.audio.preload = 'auto';
            
            // Criar contexto de áudio para som sintético como fallback
            this.audioContext = null;
            
            // Verificar se o áudio pode ser carregado
            this.audio.addEventListener('canplaythrough', () => {
                console.log('✅ Arquivo de áudio carregado com sucesso!');
            });
            
            this.audio.addEventListener('error', (e) => {
                console.warn('❌ Erro ao carregar arquivo de áudio, usando som sintético');
                console.warn('🔍 Detalhes do erro:', e.target.error);
                console.warn('📁 Caminho tentado:', this.audio.src);
                this.audio = null;
                this.initSyntheticAudio();
            });
            
            this.audio.addEventListener('loadstart', () => {
                console.log('🔄 Iniciando carregamento do arquivo de áudio...');
            });
            
        } catch (error) {
            console.error('Erro ao preparar áudio:', error);
            this.audio = null;
            this.initSyntheticAudio();
        }
    }
    
    initSyntheticAudio() {
        try {
            // Inicializar Web Audio API para som sintético
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.error('Web Audio API não suportada:', error);
        }
    }
    
    playSyntheticSound() {
        console.log('🎹 === REPRODUÇÃO DE SOM SINTÉTICO ===');
        
        if (!this.audioContext) {
            console.log('🔧 Inicializando AudioContext...');
            try {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                console.log('✅ AudioContext criado com sucesso');
            } catch (error) {
                console.error('❌ Erro ao criar AudioContext:', error);
                return;
            }
        }
        
        // Se o contexto estiver suspenso, tentar reativar
        if (this.audioContext.state === 'suspended') {
            console.log('🔄 AudioContext suspenso, tentando reativar...');
            this.audioContext.resume().then(() => {
                console.log('✅ AudioContext retomado');
                this.generateBeep();
            }).catch(error => {
                console.error('❌ Erro ao retomar AudioContext:', error);
            });
        } else {
            this.generateBeep();
        }
    }
    
    generateBeep() {
        try {
            console.log('🎵 Gerando som sintético...');
            
            // Criar oscilador para som sintético
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Configurar som de notificação (dois beeps distintivos)
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.1);
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.2);
            
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.01);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.1);
            gainNode.gain.linearRampToValueAtTime(0.3, this.audioContext.currentTime + 0.2);
            gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + 0.3);
            
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.4);
            
            console.log('✅ Som sintético reproduzido com sucesso');
            
        } catch (error) {
            console.error('❌ Erro ao reproduzir som sintético:', error);
        }
    }
    
    setupEventListeners() {
        // Botão de teste de som
        const testSoundBtn = document.getElementById('test-sound-btn');
        if (testSoundBtn) {
            testSoundBtn.addEventListener('click', () => {
                this.playNotification();
                this.showNotification('Teste de som - Se você ouviu o som, as notificações estão funcionando!');
            });
        }
        
        // Botão de refresh
        const refreshBtn = document.getElementById('refresh-btn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.loadTickets(this.currentPage);
            });
        }
        
        // Botão de tela cheia
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                this.toggleFullscreen();
            });
        }
        
        // Tecla Escape para sair da tela cheia
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isFullscreen) {
                this.toggleFullscreen();
            }
        });
        
        // Pause auto-refresh quando a página não está visível
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopAutoRefresh();
            } else {
                this.startAutoRefresh();
            }
        });
    }
    
    async loadTickets(page = 1) {
        try {
            this.showLoading(true);
            
            // Usar caminho absoluto que funciona independente do contexto de navegação
            const protocol = window.location.protocol;
            const host = window.location.host;
            
            // Detectar a base do GLPI a partir da URL atual
            let glpiBase = '';
            const currentPath = window.location.pathname;
            
            if (currentPath.includes('/glpi/')) {
                // Extrair parte até /glpi/
                glpiBase = currentPath.substring(0, currentPath.indexOf('/glpi/') + 5);
            } else if (currentPath.includes('/plugins/')) {
                // Se não tem /glpi/, assumir que está na raiz
                glpiBase = currentPath.substring(0, currentPath.indexOf('/plugins/'));
            } else {
                // Fallback para raiz
                glpiBase = '';
            }
            
            const apiUrl = `${protocol}//${host}${glpiBase}/plugins/painelchamados/front/painel_data.php`;
            
            console.log('DEBUG - API URL:', apiUrl); // Log para debug
            
            const response = await fetch(`${apiUrl}?page=${page}`);
            
            // Verificar se a resposta é válida
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            // Verificar se o content-type é JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Resposta não é JSON:', text);
                throw new Error('Resposta do servidor não é JSON válido');
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            console.log('Debug - Dados recebidos:', data.debug);
            
            this.updateTable(data);
            
            // Armazenar configuração
            if (data.config) {
                this.config = data.config;
                
                // Configurar auto-refresh baseado na configuração
                if (!this.refreshInterval) {
                    this.startAutoRefresh();
                }
            }
            
            // Verificar novos chamados (apenas após a primeira carga)
            if (this.lastTicketCount > 0 && data.total > this.lastTicketCount) {
                const newTickets = data.total - this.lastTicketCount;
                const message = newTickets === 1 ? 
                    'Um novo chamado foi aberto!' : 
                    `${newTickets} novos chamados foram abertos!`;
                
                console.log('Novos chamados detectados:', newTickets);
                this.playNotification();
                this.showNotification(message);
            }
            
            // Atualizar contador apenas se houver dados válidos
            if (data.total >= 0) {
                this.lastTicketCount = data.total;
            }
            this.currentPage = page;
            
        } catch (error) {
            console.error('Erro ao carregar chamados:', error);
            this.showError('Erro ao carregar dados: ' + error.message);
        } finally {
            this.showLoading(false);
        }
    }
    
    updateTable(data) {
        const container = document.getElementById('painel-content');
        if (!container) return;
        
        let html = '<div class="table-responsive">';
        html += '<table class="table table-striped table-hover">';
        html += '<thead class="table-dark">';
        html += '<tr>';
        html += '<th><i class="fas fa-hashtag"></i> ID</th>';
        html += '<th><i class="fas fa-calendar"></i> Data Abertura</th>';
        html += '<th><i class="fas fa-info-circle"></i> Status</th>';
        html += '<th><i class="fas fa-map-marker-alt"></i> Localização</th>';
        html += '<th><i class="fas fa-exclamation-triangle"></i> Prioridade</th>';
        html += '<th><i class="fas fa-user"></i> Requerente</th>';
        html += '<th><i class="fas fa-tags"></i> Categoria</th>';
        html += '<th><i class="fas fa-clock"></i> Tempo SLA</th>';
        html += '</tr>';
        html += '</thead>';
        html += '<tbody>';
        
        if (data.tickets && data.tickets.length > 0) {
            data.tickets.forEach(ticket => {
                const priorityClass = `ticket-priority-${ticket.priority}`;
                const statusBadge = this.getStatusBadge(ticket.status);
                
                html += `<tr class="${priorityClass}">`;
                html += `<td><strong>${ticket.id}</strong></td>`;
                html += `<td>${ticket.date}</td>`;
                html += `<td>${statusBadge}</td>`;
                html += `<td>${ticket.location}</td>`;
                html += `<td>${this.getPriorityBadge(ticket.priority)}</td>`;
                html += `<td>${ticket.requester}</td>`;
                html += `<td>${ticket.category}</td>`;
                html += `<td>${ticket.sla_time}</td>`;
                html += '</tr>';
            });
        } else {
            html += '<tr>';
            html += '<td colspan="8" class="text-center text-muted">';
            html += '<i class="fas fa-inbox"></i> Nenhum chamado encontrado';
            if (data.debug) {
                html += '<br><small>Debug: Status=' + data.debug.query_status + ', Total BD=' + data.debug.db_total + '</small>';
            }
            html += '</td>';
            html += '</tr>';
        }
        
        html += '</tbody>';
        html += '</table>';
        html += '</div>';
        
        // Paginação
        if (data.total_pages > 1) {
            html += this.buildPagination(data);
        }
        
        // Informações do painel
        html += this.buildPanelInfo(data);
        
        container.innerHTML = html;
    }
    
    buildPagination(data) {
        let html = '<nav aria-label="Paginação do Painel" class="mt-3">';
        html += '<ul class="pagination justify-content-center painel-pagination">';
        
        // Botão anterior
        if (this.currentPage > 1) {
            html += `<li class="page-item painel-page-item">`;
            html += `<a class="page-link painel-page-link" href="#" onclick="painelChamados.loadTickets(${this.currentPage - 1}); return false;">`;
            html += '<i class="fas fa-chevron-left"></i> Anterior';
            html += '</a>';
            html += '</li>';
        }
        
        // Páginas
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(data.total_pages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? 'active painel-active' : '';
            html += `<li class="page-item painel-page-item ${activeClass}">`;
            html += `<a class="page-link painel-page-link" href="#" onclick="painelChamados.loadTickets(${i}); return false;">${i}</a>`;
            html += '</li>';
        }
        
        // Botão próximo
        if (this.currentPage < data.total_pages) {
            html += `<li class="page-item painel-page-item">`;
            html += `<a class="page-link painel-page-link" href="#" onclick="painelChamados.loadTickets(${this.currentPage + 1}); return false;">`;
            html += 'Próximo <i class="fas fa-chevron-right"></i>';
            html += '</a>';
            html += '</li>';
        }
        
        html += '</ul>';
        html += '</nav>';
        
        return html;
    }
    
    buildPanelInfo(data) {
        let html = '<div class="row mt-3">';
        html += '<div class="col-md-6">';
        html += `<small class="text-muted">Total de chamados: <strong>${data.total}</strong></small>`;
        html += '</div>';
        html += '<div class="col-md-6 text-end">';
        html += `<small class="text-muted">Última atualização: <strong>${new Date().toLocaleString('pt-BR')}</strong></small>`;
        html += '</div>';
        html += '</div>';
        
        return html;
    }
    
    getStatusBadge(status) {
        const statusMap = {
            1: '<span class="badge badge-status-1">Novo</span>',
            2: '<span class="badge badge-status-2">Em Atendimento</span>',
            3: '<span class="badge badge-status-3">Planejado</span>',
            4: '<span class="badge bg-warning text-dark">Pendente</span>',
            5: '<span class="badge bg-success">Solucionado</span>',
            6: '<span class="badge bg-secondary">Fechado</span>'
        };
        return statusMap[status] || '<span class="badge bg-secondary">Desconhecido</span>';
    }
    
    getPriorityBadge(priority) {
        const priorityMap = {
            1: '<span class="badge bg-success">Muito Baixa</span>',
            2: '<span class="badge bg-info">Baixa</span>',
            3: '<span class="badge bg-warning text-dark">Média</span>',
            4: '<span class="badge bg-danger">Alta</span>',
            5: '<span class="badge bg-dark">Muito Alta</span>',
            6: '<span class="badge bg-primary">Crítica</span>'
        };
        return priorityMap[priority] || '<span class="badge bg-secondary">Normal</span>';
    }
    
    // Função removida - duplicada mais abaixo
    
    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'alert alert-success sound-notification';
        notification.innerHTML = `<i class="fas fa-bell me-2"></i>${message}`;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
    
    showError(message) {
        const error = document.createElement('div');
        error.className = 'alert alert-danger sound-notification';
        error.innerHTML = `<i class="fas fa-exclamation-triangle me-2"></i>${message}`;
        document.body.appendChild(error);
        
        setTimeout(() => {
            if (error.parentNode) {
                error.parentNode.removeChild(error);
            }
        }, 8000);
    }
    
    showLoading(show) {
        const refreshBtn = document.getElementById('refresh-btn');
        if (!refreshBtn) return;
        
        if (show) {
            refreshBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status"></span>Carregando...';
            refreshBtn.disabled = true;
        } else {
            refreshBtn.innerHTML = '<i class="fas fa-sync-alt me-1"></i>Atualizar';
            refreshBtn.disabled = false;
        }
    }
    
    toggleFullscreen() {
        const container = document.querySelector('.painel-chamados-container').parentElement;
        const btn = document.getElementById('fullscreen-btn');
        
        if (!this.isFullscreen) {
            container.classList.add('fullscreen');
            btn.innerHTML = '<i class="fas fa-compress me-1"></i>Sair Tela Cheia';
            this.isFullscreen = true;
        } else {
            container.classList.remove('fullscreen');
            btn.innerHTML = '<i class="fas fa-expand me-1"></i>Tela Cheia';
            this.isFullscreen = false;
        }
    }
    
    startAutoRefresh() {
        this.stopAutoRefresh(); // Limpar interval anterior
        
        // Usar tempo de refresh da configuração ou padrão de 30 segundos
        const refreshTime = (this.config && this.config.refresh_time) ? 
                           parseInt(this.config.refresh_time) * 1000 : 30000;
        
        this.refreshInterval = setInterval(() => {
            this.loadTickets(this.currentPage);
        }, refreshTime);
    }
    
    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
    
    playNotification() {
        console.log('🔊 === TENTATIVA DE REPRODUÇÃO DE ÁUDIO ===');
        console.log(`📊 Contexto seguro: ${this.isSecureContext}`);
        console.log(`📊 Usuário interagiu: ${this.userInteracted}`);
        console.log(`📊 Áudio preparado: ${this.audioReady}`);
        
        // Se não é contexto seguro e usuário não interagiu, adicionar à fila
        if (!this.isSecureContext && !this.userInteracted) {
            console.warn('⚠️ Contexto HTTP + sem interação = áudio será reproduzido após primeiro clique');
            this.pendingAudioTests.push(() => this.playNotification());
            
            // Mostrar aviso visual
            this.showNotification('🔊 Clique em qualquer lugar para ativar o som das notificações');
            return;
        }
        
        try {
            // Tentar reproduzir arquivo de áudio primeiro
            if (this.audio) {
                console.log('🎵 Usando arquivo de áudio carregado...');
                console.log('📊 Estado do áudio:');
                console.log('   - Src:', this.audio.src);
                console.log('   - Ready State:', this.audio.readyState);
                console.log('   - Network State:', this.audio.networkState);
                console.log('   - Volume:', this.audio.volume);
                console.log('   - Muted:', this.audio.muted);
                console.log('   - Duration:', this.audio.duration);
                
                // Para contextos HTTP, verificar se áudio foi preparado
                if (!this.isSecureContext && !this.audioReady) {
                    console.log('🔧 Preparando áudio para HTTP antes da reprodução...');
                    
                    this.audio.volume = 0;
                    this.audio.play().then(() => {
                        this.audio.pause();
                        this.audio.currentTime = 0;
                        this.audio.volume = 0.7;
                        this.audioReady = true;
                        
                        console.log('✅ Áudio preparado, tentando reproduzir...');
                        this.attemptAudioPlayback();
                    }).catch(error => {
                        console.warn('⚠️ Falha na preparação, usando som sintético...');
                        this.playSyntheticSound();
                    });
                } else {
                    // Áudio já preparado ou contexto seguro
                    this.attemptAudioPlayback();
                }
            } else {
                // Se não há arquivo de áudio, usar som sintético
                console.log('🎹 Arquivo de áudio não disponível, usando som sintético...');
                this.playSyntheticSound();
            }
        } catch (error) {
            console.error('❌ ERRO GERAL na reprodução de áudio:');
            console.error('   - Tipo:', error.name);
            console.error('   - Mensagem:', error.message);
            console.error('   - Stack:', error.stack);
            // Fallback: tentar som sintético
            this.playSyntheticSound();
        }
        
        console.log('🔊 === FIM DA TENTATIVA DE REPRODUÇÃO ===');
    }
    
    attemptAudioPlayback() {
        // Resetar posição
        this.audio.currentTime = 0;
        
        const playPromise = this.audio.play();
        
        if (playPromise !== undefined) {
            playPromise.then(() => {
                console.log('✅ SUCESSO: Notificação sonora (arquivo) reproduzida!');
            }).catch(error => {
                console.warn('⚠️ ERRO ao reproduzir arquivo de áudio:');
                console.warn('   - Tipo:', error.name);
                console.warn('   - Mensagem:', error.message);
                console.warn('   - Código:', error.code || 'N/A');
                
                if (error.name === 'NotAllowedError') {
                    console.warn('💡 Erro de permissão - precisa de interação do usuário');
                }
                
                console.log('🎹 Tentando fallback (som sintético)...');
                this.playSyntheticSound();
            });
        } else {
            console.warn('⚠️ Play() retornou undefined, tentando som sintético...');
            this.playSyntheticSound();
        }
    }
    
    showNotification(message) {
        // Notificação visual na tela
        const notification = document.createElement('div');
        notification.className = 'alert alert-info alert-dismissible fade show position-fixed';
        notification.style.top = '20px';
        notification.style.right = '20px';
        notification.style.zIndex = '9999';
        notification.style.minWidth = '300px';
        
        notification.innerHTML = `
            <i class="fas fa-bell me-2"></i>
            <strong>Notificação:</strong> ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(notification);
        
        // Remover automaticamente após 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
        
        // Tentar notificação do navegador também
        this.showBrowserNotification(message);
    }
    
    showBrowserNotification(message) {
        // Verificar se o navegador suporta notificações
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification('Painel de Chamados GLPI', {
                    body: message,
                    icon: '../plugins/painelchamados/pics/icon.png',
                    tag: 'glpi-ticket-notification'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification('Painel de Chamados GLPI', {
                            body: message,
                            icon: '../plugins/painelchamados/pics/icon.png',
                            tag: 'glpi-ticket-notification'
                        });
                    }
                });
            }
        }
    }
    
    requestAudioPermission() {
        // Criar botão temporário para ativação de áudio
        const audioBtn = document.createElement('button');
        audioBtn.className = 'btn btn-warning position-fixed';
        audioBtn.style.top = '20px';
        audioBtn.style.left = '20px';
        audioBtn.style.zIndex = '9999';
        audioBtn.innerHTML = '<i class="fas fa-volume-up me-1"></i>Ativar Som';
        
        audioBtn.onclick = () => {
            if (this.audio) {
                this.audio.play().then(() => {
                    console.log('Áudio ativado com sucesso');
                    document.body.removeChild(audioBtn);
                }).catch(error => {
                    console.error('Erro ao ativar áudio:', error);
                });
            }
        };
        
        document.body.appendChild(audioBtn);
        
        // Remover botão automaticamente após 10 segundos
        setTimeout(() => {
            if (audioBtn.parentNode) {
                audioBtn.parentNode.removeChild(audioBtn);
            }
        }, 10000);
    }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.painelChamados = new PainelChamados();
});
