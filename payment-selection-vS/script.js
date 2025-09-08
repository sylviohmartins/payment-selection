// --- Modelo de Dados e Estado ---
const totalItems = 1000; // Aumentamos o total para simular um grande volume
const itemsPerPage = 10;
const totalPages = Math.ceil(totalItems / itemsPerPage);

// Simulação de um banco de dados de itens
const mockItems = Array.from({ length: totalItems }, (_, i) => ({
    id: `item-${i + 1}`,
    title: `Título do Item ${i + 1}`
}));

// Estado global da aplicação
const state = {
    currentPage: 1,
    selectedIds: new Set(), // IDs selecionados individualmente
    deselectedIds: new Set(), // IDs desmarcados após a seleção global
    isAllSelected: false
};

// --- Referências do DOM ---
const itemTableBody = document.getElementById('item-table-body');
const selectAllOnPageCheckbox = document.getElementById('select-all-on-page');
const selectionStatusSpan = document.getElementById('selection-status');
const selectAllMessage = document.getElementById('select-all-message');
const actionButtonsDiv = document.querySelector('.action-buttons');
const deleteButton = document.getElementById('delete-btn');
const deselectButton = document.getElementById('deselect-btn');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const pageInfoSpan = document.getElementById('page-info');

// --- Funções de Renderização e Atualização ---

function isItemSelected(itemId) {
    if (state.isAllSelected) {
        // Se a seleção global estiver ativa, um item é selecionado a menos que ele tenha sido explicitamente desmarcado
        return !state.deselectedIds.has(itemId);
    } else {
        // Se a seleção global não estiver ativa, a seleção depende apenas dos IDs individuais
        return state.selectedIds.has(itemId);
    }
}

function renderTable() {
    itemTableBody.innerHTML = '';
    const start = (state.currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const itemsToShow = mockItems.slice(start, end);

    itemsToShow.forEach(item => {
        const row = document.createElement('tr');
        const isSelected = isItemSelected(item.id);
        if (isSelected) {
            row.classList.add('selected');
        }

        row.innerHTML = `
            <td><input type="checkbox" class="item-checkbox" data-id="${item.id}" ${isSelected ? 'checked' : ''}></td>
            <td>${item.id}</td>
            <td>${item.title}</td>
        `;
        itemTableBody.appendChild(row);
    });

    updateToolbar();
    updatePaginationControls();
}

function updateToolbar() {
    let totalSelected = 0;
    if (state.isAllSelected) {
        // Se a seleção for global, o total é o total de itens menos os que foram desmarcados
        totalSelected = totalItems - state.deselectedIds.size;
    } else {
        totalSelected = state.selectedIds.size;
    }

    // Gerencia o estado do checkbox "selecionar tudo" da página
    const itemsOnPage = itemTableBody.querySelectorAll('.item-checkbox').length;
    const selectedOnPage = Array.from(itemTableBody.querySelectorAll('.item-checkbox:checked')).length;
    
    selectAllOnPageCheckbox.checked = selectedOnPage > 0 && selectedOnPage === itemsOnPage;
    selectAllOnPageCheckbox.indeterminate = selectedOnPage > 0 && selectedOnPage < itemsOnPage;

    // Atualiza o texto de status e a visibilidade dos botões
    if (state.isAllSelected) {
        selectionStatusSpan.textContent = `${totalSelected} itens selecionados`;
        selectAllMessage.classList.add('hidden'); // Esconde a mensagem quando a seleção é global
    } else if (totalSelected > 0) {
        selectionStatusSpan.textContent = `${totalSelected} itens selecionados`;
    } else {
        selectionStatusSpan.textContent = `Nenhum item selecionado`;
    }

    if (totalSelected > 0) {
        actionButtonsDiv.classList.remove('hidden');
        if (selectedOnPage === itemsOnPage && !state.isAllSelected) {
            selectAllMessage.classList.remove('hidden');
        }
    } else {
        actionButtonsDiv.classList.add('hidden');
    }
}

function updatePaginationControls() {
    prevButton.disabled = state.currentPage === 1;
    nextButton.disabled = state.currentPage === totalPages;
    pageInfoSpan.textContent = `Página ${state.currentPage} de ${totalPages}`;
}

// --- Event Listeners ---

// Lógica de seleção por item individual
itemTableBody.addEventListener('change', (event) => {
    if (event.target.classList.contains('item-checkbox')) {
        const itemId = event.target.dataset.id;
        if (state.isAllSelected) {
            // Se a seleção é global, o clique desmarca o item
            if (event.target.checked) {
                state.deselectedIds.delete(itemId);
            } else {
                state.deselectedIds.add(itemId);
            }
        } else {
            // Se a seleção não é global, o clique marca/desmarca o item
            if (event.target.checked) {
                state.selectedIds.add(itemId);
            } else {
                state.selectedIds.delete(itemId);
            }
        }
        updateToolbar();
    }
});

// Lógica de seleção "todos na página"
selectAllOnPageCheckbox.addEventListener('change', () => {
    const isChecked = selectAllOnPageCheckbox.checked;
    const checkboxes = itemTableBody.querySelectorAll('.item-checkbox');
    
    // Se a seleção global estiver ativa, desativamos
    if (state.isAllSelected && !isChecked) {
      state.isAllSelected = false;
      state.selectedIds.clear();
      state.deselectedIds.clear();
    }

    checkboxes.forEach(checkbox => {
      checkbox.checked = isChecked;
      const itemId = checkbox.dataset.id;
      if (isChecked) {
        state.selectedIds.add(itemId);
      } else {
        state.selectedIds.delete(itemId);
      }
    });

    updateToolbar();
});

// Lógica "selecionar todas as páginas"
selectAllMessage.addEventListener('click', (event) => {
    event.preventDefault();
    state.isAllSelected = true;
    state.deselectedIds.clear();
    state.selectedIds.clear(); // Limpa a seleção individual
    renderTable(); // Recarrega a tabela para atualizar os checkboxes
});

// Lógica do botão "Desmarcar" (Reinicia o estado)
deselectButton.addEventListener('click', () => {
    state.selectedIds.clear();
    state.deselectedIds.clear();
    state.isAllSelected = false;
    renderTable();
});

// Lógica do botão "Deletar" (simulando back-end)
deleteButton.addEventListener('click', () => {
    if (state.isAllSelected) {
        const itemsToExclude = [...state.deselectedIds];
        console.log("Simulando BACK-END: Deletando todos os itens, exceto os seguintes:", itemsToExclude);
        // O payload enviado seria algo como:
        // { "action": "delete", "filter": "all", "exclude_ids": ["item-10", "item-25"] }
    } else {
        const itemsToDelete = [...state.selectedIds];
        console.log("Simulando BACK-END: Deletando os seguintes itens:", itemsToDelete);
        // O payload enviado seria algo como:
        // { "action": "delete", "ids": ["item-1", "item-5"] }
    }
    
    // Resetar o estado da seleção após a ação
    state.selectedIds.clear();
    state.deselectedIds.clear();
    state.isAllSelected = false;
    renderTable();
});

// Lógica dos botões de paginação
prevButton.addEventListener('click', () => {
    if (state.currentPage > 1) {
        state.currentPage--;
        renderTable();
    }
});

nextButton.addEventListener('click', () => {
    if (state.currentPage < totalPages) {
        state.currentPage++;
        renderTable();
    }
});

// --- Iniciar a aplicação ---
document.addEventListener('DOMContentLoaded', () => {
    renderTable();
});