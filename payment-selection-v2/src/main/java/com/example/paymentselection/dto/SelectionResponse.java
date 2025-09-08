package com.example.paymentselection.dto;

import java.util.UUID;

/**
 * DTO para resposta com informações da sessão de seleção.
 */
public record SelectionResponse(
        UUID selectionId,
        long selectedCount
) {}

