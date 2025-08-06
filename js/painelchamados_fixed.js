/**
 * Plugin Painel de Chamados - JavaScript (Versão Corrigida)
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
        
        this.init();
    }
    
    init() {
        // Preparar audio para notificação
        this.prepareAudio();
        
        // Configurar event listeners
        this.setupEventListeners();
        
        // Carregar dados iniciais
        this.loadTickets();
    }
    
    prepareAudio() {
        // Criar audio básico para fallback
        this.audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmgUBkuHyO/SlzECAQAA');
    }
    
    setupEventListeners() {
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
            
            // Usar arquivo corrigido temporariamente
            const response = await fetch(`painel_data_fixed.php?page=${page}`);
            
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
            
            // Verificar novos chamados
            if (data.total > this.lastTicketCount && this.lastTicketCount > 0) {
                this.playNotification();
                this.showNotification('Novo chamado foi aberto!');
            }
            
            this.lastTicketCount = data.total;
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
        html += '<th><i class="fas fa-map-marker-alt"></i> Cidade</th>';
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
        let html = '<nav aria-label="Paginação" class="mt-3">';
        html += '<ul class="pagination justify-content-center">';
        
        // Botão anterior
        if (this.currentPage > 1) {
            html += `<li class="page-item">`;
            html += `<a class="page-link" href="#" onclick="painelChamados.loadTickets(${this.currentPage - 1})">`;
            html += '<i class="fas fa-chevron-left"></i> Anterior';
            html += '</a>';
            html += '</li>';
        }
        
        // Páginas
        const startPage = Math.max(1, this.currentPage - 2);
        const endPage = Math.min(data.total_pages, this.currentPage + 2);
        
        for (let i = startPage; i <= endPage; i++) {
            const activeClass = i === this.currentPage ? 'active' : '';
            html += `<li class="page-item ${activeClass}">`;
            html += `<a class="page-link" href="#" onclick="painelChamados.loadTickets(${i})">${i}</a>`;
            html += '</li>';
        }
        
        // Botão próximo
        if (this.currentPage < data.total_pages) {
            html += `<li class="page-item">`;
            html += `<a class="page-link" href="#" onclick="painelChamados.loadTickets(${this.currentPage + 1})">`;
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
    
    playNotification() {
        // Tentar usar Web Speech API
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance('Foi aberto um novo chamado');
            utterance.lang = 'pt-BR';
            utterance.volume = 0.8;
            utterance.rate = 0.9;
            speechSynthesis.speak(utterance);
        } else if (this.audio) {
            // Fallback para som básico
            this.audio.play().catch(e => {
                console.log('Não foi possível reproduzir o som:', e);
            });
        }
    }
    
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
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    window.painelChamados = new PainelChamados();
});
