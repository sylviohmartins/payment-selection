package com.example.paymentselection.service;

import com.example.paymentselection.dto.CreateSelectionRequest;
import com.example.paymentselection.dto.SelectionResponse;
import com.example.paymentselection.dto.UpdateSelectionRequest;
import com.example.paymentselection.entity.Selection;
import com.example.paymentselection.enums.Mode;
import com.example.paymentselection.repository.PaymentRepository;
import com.example.paymentselection.repository.SelectionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SelectionServiceTest {

    @Mock
    private SelectionRepository selectionRepository;

    @Mock
    private PaymentRepository paymentRepository;

    @InjectMocks
    private SelectionService selectionService;

    private UUID userId;
    private Map<String, Object> filter;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        filter = Map.of(
            "status", "A_PAGAR",
            "vencimentoAte", "2024-12-31"
        );
    }

    @Test
    void testUpdateSelectionIncludeIds() {
        // Arrange
        UUID selectionId = UUID.randomUUID();
        Selection selection = new Selection(userId, Mode.NONE, "{\"status\":\"A_PAGAR\"}");
        selection.setId(selectionId);
        selection.setIncludeIds("[]");
        
        UpdateSelectionRequest request = new UpdateSelectionRequest(null, List.of(1L, 2L, 3L), null);
        
        when(selectionRepository.findByIdAndUserId(selectionId, userId))
            .thenReturn(Optional.of(selection));
        when(selectionRepository.save(any(Selection.class)))
            .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        SelectionResponse response = selectionService.update(selectionId, userId, request);

        // Assert
        assertNotNull(response);
        assertEquals(selectionId, response.selectionId());
        assertEquals(3L, response.selectedCount());
        assertTrue(selection.getIncludeIds().contains("1"));
        assertTrue(selection.getIncludeIds().contains("2"));
        assertTrue(selection.getIncludeIds().contains("3"));
        verify(selectionRepository).save(selection);
    }

    @Test
    void testUpdateSelectionNotFound() {
        // Arrange
        UUID selectionId = UUID.randomUUID();
        UpdateSelectionRequest request = new UpdateSelectionRequest(Mode.ALL, null, null);
        
        when(selectionRepository.findByIdAndUserId(selectionId, userId))
            .thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            selectionService.update(selectionId, userId, request);
        });
    }
}

