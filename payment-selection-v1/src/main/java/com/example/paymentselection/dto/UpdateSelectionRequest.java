package com.example.paymentselection.dto;

import com.example.paymentselection.enums.Mode;

import java.util.List;

/**
 * DTO para requisição de atualização de uma sessão de seleção.
 */
public record UpdateSelectionRequest(
        Mode mode,
        List<Long> includeIds,
        List<Long> excludeIds
) {}

