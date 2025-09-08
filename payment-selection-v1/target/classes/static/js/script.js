// Configuração da API
const API_BASE_URL = 'http://localhost:8080';

// Instâncias da API
let api;
let mockApi;

// Gerenciamento de tema
const themeManager = {
    init() {
        this.loadTheme();
        this.setupThemeToggle();
    },
    
    loadTheme() {
        const savedTheme = localStorage.getItem('theme') || 'light';
        this.setTheme(savedTheme);
    },
    
    setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        this.updateThemeToggle(theme);
    },
    
    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        this.setTheme(newTheme);
    },
    
    updateThemeToggle(theme) {
        const toggleBtn = document.getElementById('theme-toggle');
        const icon = toggleBtn.querySelector('i');
        const text = toggleBtn.querySelector('span');
        
        if (theme === 'dark') {
            icon.className = 'fas fa-sun';
            text.textContent = 'Modo Claro';
        } else {
            icon.className = 'fas fa-moon';
            text.textContent = 'Modo Escuro';
        }
    },
    
    setupThemeToggle() {
        const toggleBtn = document.getElementById('theme-toggle');
        toggleBtn.addEventListener('click', () => this.toggleTheme());
    }
};

// Estado da aplicação
let appState = {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    sortColumn: 'id',
    sortDirection: 'asc',
    filters: {
        status: 'A_PAGAR',
        vencimentoAte: '2024-12-31'
    },
    currentSelection: null,
    selectedItems: new Set(),
    allItemsSelected: false,
    payments: [],
    isLoading: false,
    useRealAPI: false
};

// Dados mock para demonstração (simulando API)
const mockPayments = [
    { id: 1, descricao: 'Fatura de Energia Elétrica', valor: 250.75, vencimento: '2024-09-10', status: 'A_PAGAR' },
    { id: 2, descricao: 'Aluguel de Servidores Cloud', valor: 1200.00, vencimento: '2024-09-15', status: 'A_PAGAR' },
    { id: 3, descricao: 'Assinatura Software CRM', valor: 300.00, vencimento: '2024-09-20', status: 'A_PAGAR' },
    { id: 4, descricao: 'Manutenção de Equipamentos', valor: 450.50, vencimento: '2024-09-25', status: 'A_PAGAR' },
    { id: 5, descricao: 'Serviços de Consultoria TI', valor: 2500.00, vencimento: '2024-09-30', status: 'A_PAGAR' },
    { id: 6, descricao: 'Compra de Material de Escritório', valor: 150.20, vencimento: '2024-08-28', status: 'PAID' },
    { id: 7, descricao: 'Licença Antivírus Corporativo', valor: 800.00, vencimento: '2024-10-05', status: 'A_PAGAR' },
    { id: 8, descricao: 'Campanha de Marketing Digital', valor: 1800.00, vencimento: '2024-10-10', status: 'A_PAGAR' },
    { id: 9, descricao: 'Desenvolvimento de Novo Módulo', valor: 3500.00, vencimento: '2024-10-15', status: 'A_PAGAR' },
    { id: 10, descricao: 'Reembolso de Despesas de Viagem', valor: 750.00, vencimento: '2024-08-20', status: 'PAID' },
    { id: 11, descricao: 'Salário Funcionário Setembro', valor: 4000.00, vencimento: '2024-09-05', status: 'A_PAGAR' },
    { id: 12, descricao: 'Impostos Trimestrais', valor: 6000.00, vencimento: '2024-09-28', status: 'A_PAGAR' },
    { id: 13, descricao: 'Serviço de Limpeza Mensal', valor: 300.00, vencimento: '2024-09-01', status: 'A_PAGAR' },
    { id: 14, descricao: 'Assinatura Plataforma E-learning', valor: 500.00, vencimento: '2024-09-12', status: 'A_PAGAR' },
    { id: 15, descricao: 'Compra de Equipamento de Rede', valor: 1500.00, vencimento: '2024-09-22', status: 'A_PAGAR' },
    { id: 16, descricao: 'Consultoria Financeira', valor: 2000.00, vencimento: '2024-10-01', status: 'A_PAGAR' },
    { id: 17, descricao: 'Licença de Banco de Dados', valor: 4500.00, vencimento: '2024-10-08', status: 'A_PAGAR' },
    { id: 18, descricao: 'Treinamento de Cibersegurança', valor: 1200.00, vencimento: '2024-10-18', status: 'A_PAGAR' },
    { id: 19, descricao: 'Renovação de Domínio Web', valor: 80.00, vencimento: '2024-07-01', status: 'CANCELLED' },
    { id: 20, descricao: 'Serviço de Hospedagem Web', valor: 180.00, vencimento: '2024-10-25', status: 'A_PAGAR' }
];

// Inicialização da aplicação
document.addEventListener('DOMContentLoaded', function() {
    themeManager.init();
    initializeApp();
    setupEventListeners();
    loadPayments();
});

async function initializeApp() {
    // Inicializar APIs
    api = new PaymentSelectionAPI(API_BASE_URL);
    mockApi = new MockPaymentAPI();
    
    // Configurar filtros iniciais
    document.getElementById('status-filter').value = appState.filters.status;
    document.getElementById('vencimento-filter').value = appState.filters.vencimentoAte;
    
    // Verificar conexão com API
    await checkApiConnection();
}

function setupEventListeners() {
    // Filtros
    document.getElementById('apply-filters-btn').addEventListener('click', applyFilters);
    
    // Paginação
    document.getElementById('prev-page').addEventListener('click', () => changePage(appState.currentPage - 1));
    document.getElementById('next-page').addEventListener('click', () => changePage(appState.currentPage + 1));
    
    // Seleção
    document.getElementById('select-all-page').addEventListener('change', toggleSelectAllPage);
    document.getElementById('select-all-btn').addEventListener('click', selectAllItems);
    document.getElementById('deselect-all-btn').addEventListener('click', deselectAllItems);
    document.getElementById('continue-btn').addEventListener('click', showProcessingModal);
    
    // Modal
    document.getElementById('close-modal-btn').addEventListener('click', closeProcessingModal);
    document.getElementById('new-selection-btn').addEventListener('click', startNewSelection);
    
    // Outros
    document.getElementById('refresh-btn').addEventListener('click', loadPayments);
    
    // Ordenação da tabela
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const column = header.dataset.column;
            toggleSort(column);
        });
    });
}

async function checkApiConnection() {
    const statusIndicator = document.getElementById('connection-status');
    
    try {
        const isConnected = await api.checkConnection();
        if (isConnected) {
            statusIndicator.innerHTML = '<i class="fas fa-circle"></i> Conectado à API';
            statusIndicator.className = 'status-indicator';
            appState.useRealAPI = true;
        } else {
            throw new Error('API não disponível');
        }
    } catch (error) {
        statusIndicator.innerHTML = '<i class="fas fa-circle"></i> Modo Demo';
        statusIndicator.className = 'status-indicator disconnected';
        appState.useRealAPI = false;
        showSuccessToast('Executando em modo demonstração com dados simulados');
    }
}

function applyFilters() {
    appState.filters.status = document.getElementById('status-filter').value;
    appState.filters.vencimentoAte = document.getElementById('vencimento-filter').value;
    appState.currentPage = 1;
    
    // Reset seleção
    resetSelection();
    
    loadPayments();
}

async function loadPayments() {
    setLoading(true);
    
    try {
        const currentApi = appState.useRealAPI ? api : mockApi;
        
        // Converter página para índice baseado em 0 (API usa 0-based)
        const pageIndex = appState.currentPage - 1;
        
        // Buscar pagamentos via API
        const response = await currentApi.searchPayments(
            appState.filters,
            pageIndex,
            appState.itemsPerPage,
            appState.sortColumn,
            appState.sortDirection
        );
        
        // Atualizar estado com dados da API
        appState.payments = response.content || [];
        appState.totalItems = response.totalElements || 0;
        appState.totalPages = response.totalPages || 0;
        
        renderTable();
        updatePagination();
        
        // Criar seleção se não existir e há itens
        if (!appState.currentSelection && appState.totalItems > 0) {
            await createSelection();
        }
        
    } catch (error) {
        showErrorToast('Erro ao carregar pagamentos: ' + error.message);
        console.error('Erro detalhado:', error);
    } finally {
        setLoading(false);
    }
}

async function createSelection() {
    try {
        const currentApi = appState.useRealAPI ? api : mockApi;
        const response = await currentApi.createSelection(appState.filters, 'NONE');
        
        appState.currentSelection = response;
        
        updateSelectionInfo();
        showActionButtons();
        
    } catch (error) {
        showErrorToast('Erro ao criar seleção: ' + error.message);
    }
}

async function updateSelectionOnServer() {
    if (!appState.currentSelection) return;
    
    try {
        const currentApi = appState.useRealAPI ? api : mockApi;
        
        let updateData = {};
        
        if (appState.allItemsSelected) {
            updateData.mode = 'ALL';
        } else if (appState.selectedItems.size === 0) {
            updateData.mode = 'NONE';
        } else {
            // Enviar IDs selecionados da página atual
            const pageIds = appState.payments.map(p => p.id);
            const selectedPageIds = pageIds.filter(id => appState.selectedItems.has(id));
            
            if (selectedPageIds.length > 0) {
                updateData.includeIds = selectedPageIds;
            }
        }
        
        if (Object.keys(updateData).length > 0) {
            const response = await currentApi.updateSelection(
                appState.currentSelection.selectionId, 
                updateData
            );
            
            // Atualizar contagem baseada na resposta da API
            if (response && typeof response.selectedCount !== 'undefined') {
                appState.currentSelection.selectedCount = response.selectedCount;
            } else {
                // Fallback: calcular localmente
                if (appState.allItemsSelected) {
                    appState.currentSelection.selectedCount = appState.totalItems;
                } else {
                    appState.currentSelection.selectedCount = appState.selectedItems.size;
                }
            }
            
            updateSelectionInfo();
        }
        
    } catch (error) {
        console.error('Erro ao atualizar seleção no servidor:', error);
        showErrorToast('Erro ao sincronizar seleção: ' + error.message);
    }
}

function renderTable() {
    const tbody = document.getElementById('payments-tbody');
    tbody.innerHTML = '';
    
    appState.payments.forEach(payment => {
        const row = createTableRow(payment);
        tbody.appendChild(row);
    });
    
    updateSelectAllPageCheckbox();
}

function createTableRow(payment) {
    const row = document.createElement('tr');
    row.dataset.paymentId = payment.id;
    
    const isSelected = appState.allItemsSelected || appState.selectedItems.has(payment.id);
    if (isSelected) {
        row.classList.add('selected');
    }
    
    row.innerHTML = `
        <td class="checkbox-column">
            <input type="checkbox" ${isSelected ? 'checked' : ''} 
                   onchange="toggleItemSelection(${payment.id})">
        </td>
        <td>${payment.id}</td>
        <td>${payment.descricao}</td>
        <td>R$ ${payment.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td>${formatDate(payment.vencimento)}</td>
        <td>
            <span class="status-badge ${payment.status.toLowerCase().replace('_', '-')}">
                ${getStatusLabel(payment.status)}
            </span>
        </td>
    `;
    
    return row;
}

function toggleItemSelection(paymentId) {
    if (appState.allItemsSelected) {
        // Se estava em modo "todos selecionados", muda para modo individual
        appState.allItemsSelected = false;
        appState.selectedItems.clear();
        
        // Adiciona todos os IDs da página atual exceto o que foi desmarcado
        appState.payments.forEach(payment => {
            if (payment.id !== paymentId) {
                appState.selectedItems.add(payment.id);
            }
        });
    } else {
        // Modo normal de seleção individual
        if (appState.selectedItems.has(paymentId)) {
            appState.selectedItems.delete(paymentId);
        } else {
            appState.selectedItems.add(paymentId);
        }
    }
    
    updateSelectionInfo();
    updateSelectAllPageCheckbox();
    updateContinueButton();
    
    // Atualizar visual da linha
    const row = document.querySelector(`tr[data-payment-id="${paymentId}"]`);
    if (row) {
        const isSelected = appState.allItemsSelected || appState.selectedItems.has(paymentId);
        row.classList.toggle('selected', isSelected);
    }
    
    // Atualizar no servidor (debounced)
    debounce(updateSelectionOnServer, 500)();
}

function toggleSelectAllPage() {
    const checkbox = document.getElementById('select-all-page');
    const pagePaymentIds = appState.payments.map(p => p.id);
    
    if (checkbox.checked) {
        if (appState.allItemsSelected) {
            // Já estava tudo selecionado, não faz nada
            return;
        }
        
        // Marcar todos da página
        pagePaymentIds.forEach(id => appState.selectedItems.add(id));
    } else {
        if (appState.allItemsSelected) {
            // Estava em modo "todos selecionados", agora desmarca a página
            appState.allItemsSelected = false;
            appState.selectedItems.clear();
            
            // Adiciona todos exceto os da página atual
            mockPayments.forEach(payment => {
                if (!pagePaymentIds.includes(payment.id)) {
                    appState.selectedItems.add(payment.id);
                }
            });
        } else {
            // Desmarcar todos da página
            pagePaymentIds.forEach(id => appState.selectedItems.delete(id));
        }
    }
    
    updateSelectionInfo();
    updateContinueButton();
    renderTable(); // Re-render para atualizar checkboxes
    
    // Atualizar no servidor
    debounce(updateSelectionOnServer, 500)();
}

async function selectAllItems() {
    try {
        appState.allItemsSelected = true;
        appState.selectedItems.clear();
        
        // Atualizar no servidor
        const currentApi = appState.useRealAPI ? api : mockApi;
        const response = await currentApi.updateSelection(
            appState.currentSelection.selectionId,
            { mode: 'ALL' }
        );
        
        appState.currentSelection.selectedCount = response.selectedCount;
        
        updateSelectionInfo();
        updateContinueButton();
        renderTable();
        
        showSuccessToast(`Todos os ${appState.totalItems} itens foram selecionados`);
        
    } catch (error) {
        showErrorToast('Erro ao selecionar todos os itens: ' + error.message);
    }
}

async function deselectAllItems() {
    try {
        appState.allItemsSelected = false;
        appState.selectedItems.clear();
        
        // Atualizar no servidor
        const currentApi = appState.useRealAPI ? api : mockApi;
        const response = await currentApi.updateSelection(
            appState.currentSelection.selectionId,
            { mode: 'NONE' }
        );
        
        appState.currentSelection.selectedCount = response.selectedCount;
        
        updateSelectionInfo();
        updateContinueButton();
        renderTable();
        
        showSuccessToast('Todos os itens foram desmarcados');
        
    } catch (error) {
        showErrorToast('Erro ao desmarcar todos os itens: ' + error.message);
    }
}

function updateSelectionInfo() {
    const selectionInfo = document.getElementById('selection-info');
    const selectionCount = document.getElementById('selection-count');
    const currentSelectionId = document.getElementById('current-selection-id');
    
    if (appState.currentSelection) {
        let count;
        
        // Usar contagem da API se disponível, senão calcular localmente
        if (appState.currentSelection.selectedCount !== undefined) {
            count = appState.currentSelection.selectedCount;
        } else if (appState.allItemsSelected) {
            count = appState.totalItems;
        } else {
            count = appState.selectedItems.size;
        }
        
        selectionCount.textContent = `${count} itens selecionados`;
        currentSelectionId.textContent = appState.currentSelection.selectionId;
        selectionInfo.style.display = 'block';
    } else {
        selectionInfo.style.display = 'none';
    }
}

function updateSelectAllPageCheckbox() {
    const checkbox = document.getElementById('select-all-page');
    const pagePaymentIds = appState.payments.map(p => p.id);
    
    if (appState.allItemsSelected) {
        checkbox.checked = true;
        checkbox.indeterminate = false;
    } else {
        const selectedOnPage = pagePaymentIds.filter(id => appState.selectedItems.has(id));
        
        if (selectedOnPage.length === 0) {
            checkbox.checked = false;
            checkbox.indeterminate = false;
        } else if (selectedOnPage.length === pagePaymentIds.length) {
            checkbox.checked = true;
            checkbox.indeterminate = false;
        } else {
            checkbox.checked = false;
            checkbox.indeterminate = true;
        }
    }
}

function updateContinueButton() {
    const continueBtn = document.getElementById('continue-btn');
    const hasSelection = appState.allItemsSelected || appState.selectedItems.size > 0;
    
    continueBtn.disabled = !hasSelection;
}

function showActionButtons() {
    document.getElementById('action-buttons').style.display = 'block';
}

function updatePagination() {
    // Atualizar informações
    const paginationInfo = document.getElementById('pagination-info');
    const startItem = (appState.currentPage - 1) * appState.itemsPerPage + 1;
    const endItem = Math.min(appState.currentPage * appState.itemsPerPage, appState.totalItems);
    
    paginationInfo.textContent = `Mostrando ${startItem}-${endItem} de ${appState.totalItems} itens`;
    
    // Atualizar botões
    document.getElementById('prev-page').disabled = appState.currentPage <= 1;
    document.getElementById('next-page').disabled = appState.currentPage >= appState.totalPages;
    
    // Atualizar números das páginas
    renderPageNumbers();
}

function renderPageNumbers() {
    const pageNumbers = document.getElementById('page-numbers');
    pageNumbers.innerHTML = '';
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, appState.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(appState.totalPages, startPage + maxVisiblePages - 1);
    
    // Ajustar se não há páginas suficientes no final
    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.className = `page-number ${i === appState.currentPage ? 'active' : ''}`;
        pageBtn.textContent = i;
        pageBtn.onclick = () => changePage(i);
        pageNumbers.appendChild(pageBtn);
    }
}

function changePage(page) {
    if (page < 1 || page > appState.totalPages || page === appState.currentPage) {
        return;
    }
    
    appState.currentPage = page;
    loadPayments();
}

function toggleSort(column) {
    if (appState.sortColumn === column) {
        appState.sortDirection = appState.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        appState.sortColumn = column;
        appState.sortDirection = 'asc';
    }
    
    updateSortHeaders();
    loadPayments();
}

function updateSortHeaders() {
    document.querySelectorAll('.sortable').forEach(header => {
        header.classList.remove('sorted-asc', 'sorted-desc');
        
        if (header.dataset.column === appState.sortColumn) {
            header.classList.add(`sorted-${appState.sortDirection}`);
        }
    });
}

function showProcessingModal() {
    const modal = document.getElementById('processing-modal');
    const processingCount = document.getElementById('processing-count');
    
    let count;
    
    // Usar contagem da API se disponível
    if (appState.currentSelection && appState.currentSelection.selectedCount !== undefined) {
        count = appState.currentSelection.selectedCount;
    } else if (appState.allItemsSelected) {
        count = appState.totalItems;
    } else {
        count = appState.selectedItems.size;
    }
    
    processingCount.textContent = count;
    
    modal.classList.add('show');
    
    // Iniciar simulação de processamento
    simulateProcessing(count);
}

async function simulateProcessing(totalCount) {
    const progressFill = document.getElementById('progress-fill');
    const progressPercentage = document.getElementById('progress-percentage');
    const progressStatus = document.getElementById('progress-status');
    const processingResults = document.getElementById('processing-results');
    const processedCount = document.getElementById('processed-count');
    const processingTime = document.getElementById('processing-time');
    const closeBtn = document.getElementById('close-modal-btn');
    const newSelectionBtn = document.getElementById('new-selection-btn');
    
    let currentProgress = 0;
    const startTime = Date.now();
    
    // Simular processamento em etapas
    const interval = setInterval(() => {
        currentProgress += Math.random() * 15 + 5; // Progresso aleatório entre 5-20%
        
        if (currentProgress >= 100) {
            currentProgress = 100;
            clearInterval(interval);
            
            // Mostrar resultados
            setTimeout(async () => {
                const endTime = Date.now();
                const duration = ((endTime - startTime) / 1000).toFixed(1);
                
                processingResults.style.display = 'block';
                processedCount.textContent = totalCount;
                processingTime.textContent = `${duration}s`;
                
                closeBtn.style.display = 'inline-flex';
                newSelectionBtn.style.display = 'inline-flex';
                
                // Aplicar pagamentos na API
                await applyPayments();
                
            }, 500);
        }
        
        progressFill.style.width = `${currentProgress}%`;
        progressPercentage.textContent = `${Math.round(currentProgress)}%`;
        
        if (currentProgress < 30) {
            progressStatus.textContent = 'Validando seleções...';
        } else if (currentProgress < 60) {
            progressStatus.textContent = 'Processando pagamentos...';
        } else if (currentProgress < 90) {
            progressStatus.textContent = 'Atualizando registros...';
        } else {
            progressStatus.textContent = 'Finalizando...';
        }
    }, 200);
}

async function applyPayments() {
    try {
        if (appState.currentSelection) {
            const currentApi = appState.useRealAPI ? api : mockApi;
            await currentApi.applySelection(appState.currentSelection.selectionId, 'PAY');
            
            showSuccessToast('Pagamentos processados com sucesso!');
        }
    } catch (error) {
        showErrorToast('Erro ao aplicar pagamentos: ' + error.message);
    }
}

function closeProcessingModal() {
    const modal = document.getElementById('processing-modal');
    modal.classList.remove('show');
    
    // Reset modal state
    setTimeout(() => {
        document.getElementById('progress-fill').style.width = '0%';
        document.getElementById('progress-percentage').textContent = '0%';
        document.getElementById('progress-status').textContent = 'Iniciando processamento...';
        document.getElementById('processing-results').style.display = 'none';
        document.getElementById('close-modal-btn').style.display = 'none';
        document.getElementById('new-selection-btn').style.display = 'none';
    }, 300);
}

function startNewSelection() {
    closeProcessingModal();
    resetSelection();
    loadPayments();
}

function resetSelection() {
    appState.currentSelection = null;
    appState.selectedItems.clear();
    appState.allItemsSelected = false;
    
    document.getElementById('selection-info').style.display = 'none';
    document.getElementById('action-buttons').style.display = 'none';
}

function setLoading(loading) {
    appState.isLoading = loading;
    
    const loadingState = document.getElementById('loading-state');
    const tableContainer = document.getElementById('table-container');
    
    if (loading) {
        loadingState.style.display = 'block';
        tableContainer.style.display = 'none';
    } else {
        loadingState.style.display = 'none';
        tableContainer.style.display = 'block';
    }
}

// Funções utilitárias
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
}

function getStatusLabel(status) {
    const labels = {
        'A_PAGAR': 'A Pagar',
        'PAID': 'Pago',
        'CANCELLED': 'Cancelado'
    };
    return labels[status] || status;
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Funções de notificação
function showErrorToast(message) {
    const toast = document.getElementById('error-toast');
    const messageElement = document.getElementById('error-message');
    
    messageElement.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 5000);
}

function showSuccessToast(message) {
    const toast = document.getElementById('success-toast');
    const messageElement = document.getElementById('success-message');
    
    messageElement.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

function hideErrorToast() {
    document.getElementById('error-toast').classList.remove('show');
}

function hideSuccessToast() {
    document.getElementById('success-toast').classList.remove('show');
}

