// Módulo para integração com a API do Selection

class PaymentSelectionAPI {
    constructor(baseUrl = 'http://localhost:8080') {
        this.baseUrl = baseUrl;
        this.isConnected = false;
    }

    async checkConnection() {
        try {
            const response = await fetch(`${this.baseUrl}/actuator/health/ping`);
            this.isConnected = response.ok;
            return this.isConnected;
        } catch (error) {
            this.isConnected = false;
            return false;
        }
    }

    async searchPayments(filters, page = 0, size = 10, sort = 'id', direction = 'asc') {
        if (!this.isConnected) {
            throw new Error('API não está disponível');
        }

        try {
            const params = new URLSearchParams({
                page: page.toString(),
                size: size.toString(),
                sort: `${sort},${direction}`,
                status: filters.status || 'A_PAGAR'
            });

            if (filters.vencimentoAte) {
                params.append('vencimentoAte', filters.vencimentoAte);
            }

            const response = await fetch(`${this.baseUrl}/api/payments/search?${params}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao buscar pagamentos:', error);
            throw error;
        }
    }

    async createSelection(filter, mode = 'NONE') {
        if (!this.isConnected) {
            throw new Error('API não está disponível');
        }

        try {
            const response = await fetch(`${this.baseUrl}/selections`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    filter: filter,
                    mode: mode
                })
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao criar seleção:', error);
            throw error;
        }
    }

    async updateSelection(selectionId, updateData) {
        if (!this.isConnected) {
            throw new Error('API não está disponível');
        }

        try {
            const response = await fetch(`${this.baseUrl}/selections/${selectionId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData)
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar seleção:', error);
            throw error;
        }
    }

    async applySelection(selectionId, action = 'PAY') {
        if (!this.isConnected) {
            throw new Error('API não está disponível');
        }

        try {
            const response = await fetch(`${this.baseUrl}/selections/${selectionId}/apply`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: action
                })
            });

            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            return true;
        } catch (error) {
            console.error('Erro ao aplicar seleção:', error);
            throw error;
        }
    }
}

// Simulador de API para modo demo
class MockPaymentAPI {
    constructor() {
        this.isConnected = true;
        this.selections = new Map();
    }

    async checkConnection() {
        return true;
    }

    async searchPayments(filters, page = 0, size = 10, sort = 'id', direction = 'asc') {
        // Simular delay da rede
        await this.delay(300);

        // Filtrar dados mock baseado nos filtros
        let filteredPayments = mockPayments.filter(payment => {
            const statusMatch = payment.status === (filters.status || 'A_PAGAR');
            const dateMatch = !filters.vencimentoAte || 
                             payment.vencimento <= filters.vencimentoAte;
            return statusMatch && dateMatch;
        });

        // Ordenar
        filteredPayments.sort((a, b) => {
            const aVal = a[sort] || a.id;
            const bVal = b[sort] || b.id;
            
            let comparison = 0;
            if (aVal < bVal) comparison = -1;
            if (aVal > bVal) comparison = 1;
            
            return direction === 'desc' ? -comparison : comparison;
        });

        // Paginação
        const totalElements = filteredPayments.length;
        const totalPages = Math.ceil(totalElements / size);
        const startIndex = page * size;
        const endIndex = startIndex + size;
        const content = filteredPayments.slice(startIndex, endIndex);

        return {
            content: content,
            totalElements: totalElements,
            totalPages: totalPages,
            size: size,
            number: page,
            first: page === 0,
            last: page >= totalPages - 1,
            numberOfElements: content.length
        };
    }

    async createSelection(filter, mode = 'NONE') {
        // Simular delay da rede
        await this.delay(300);

        const selectionId = this.generateUUID();
        const totalCount = this.countFilteredPayments(filter);

        const selection = {
            selectionId: selectionId,
            selectedCount: mode === 'ALL' ? totalCount : 0,
            filter: filter,
            mode: mode,
            includeIds: [],
            excludeIds: []
        };

        this.selections.set(selectionId, selection);

        return {
            selectionId: selectionId,
            selectedCount: selection.selectedCount
        };
    }

    async updateSelection(selectionId, updateData) {
        await this.delay(200);

        const selection = this.selections.get(selectionId);
        if (!selection) {
            throw new Error('Seleção não encontrada');
        }

        // Atualizar modo
        if (updateData.mode) {
            selection.mode = updateData.mode;
            selection.includeIds = [];
            selection.excludeIds = [];
        }

        // Atualizar listas de IDs
        if (updateData.includeIds) {
            if (selection.mode === 'NONE') {
                // Adicionar à lista de inclusão
                updateData.includeIds.forEach(id => {
                    if (!selection.includeIds.includes(id)) {
                        selection.includeIds.push(id);
                    }
                });
            } else if (selection.mode === 'ALL') {
                // Remover da lista de exclusão
                selection.excludeIds = selection.excludeIds.filter(
                    id => !updateData.includeIds.includes(id)
                );
            }
        }

        if (updateData.excludeIds) {
            if (selection.mode === 'ALL') {
                // Adicionar à lista de exclusão
                updateData.excludeIds.forEach(id => {
                    if (!selection.excludeIds.includes(id)) {
                        selection.excludeIds.push(id);
                    }
                });
            } else if (selection.mode === 'NONE') {
                // Remover da lista de inclusão
                selection.includeIds = selection.includeIds.filter(
                    id => !updateData.excludeIds.includes(id)
                );
            }
        }

        // Recalcular contagem
        const totalCount = this.countFilteredPayments(selection.filter);
        if (selection.mode === 'ALL') {
            selection.selectedCount = totalCount - selection.excludeIds.length;
        } else {
            selection.selectedCount = selection.includeIds.length;
        }

        return {
            selectionId: selectionId,
            selectedCount: selection.selectedCount
        };
    }

    async applySelection(selectionId, action = 'PAY') {
        await this.delay(500);

        const selection = this.selections.get(selectionId);
        if (!selection) {
            throw new Error('Seleção não encontrada');
        }

        // Simular aplicação dos pagamentos
        console.log(`Aplicando ação ${action} para seleção ${selectionId}`);
        console.log(`Itens afetados: ${selection.selectedCount}`);

        // Remover seleção após aplicação
        this.selections.delete(selectionId);

        return true;
    }

    countFilteredPayments(filter) {
        // Simular contagem baseada nos dados mock
        // Em uma implementação real, isso seria feito no backend
        return mockPayments.filter(payment => {
            const statusMatch = payment.status === filter.status;
            const dateMatch = !filter.vencimentoAte || 
                             payment.vencimento <= filter.vencimentoAte;
            return statusMatch && dateMatch;
        }).length;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    generateUUID() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }
}

// Exportar para uso global
window.PaymentSelectionAPI = PaymentSelectionAPI;
window.MockPaymentAPI = MockPaymentAPI;

